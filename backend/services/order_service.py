"""
Order Service — CRUD operations for orders and order items.
"""
from database import get_supabase_admin
from schemas import OrderOut, OrderItemOut, OrderCreate, OrderStatus
from services import product_service
from events.emitter import emit_event


async def list_orders(business_id: str | None = None, customer_id: str | None = None) -> list[OrderOut]:
    """List orders filtered by business or customer."""
    admin = get_supabase_admin()
    query = admin.table("orders").select("*")

    if business_id:
        query = query.eq("business_id", business_id)
    if customer_id:
        query = query.eq("customer_id", customer_id)

    result = query.order("created_at", desc=True).execute()
    orders = []
    for o in result.data:
        items = await get_order_items(o["id"])
        # Fetch customer name
        customer_name = ""
        if o.get("customer_id"):
            user_result = admin.table("users").select("name").eq("id", o["customer_id"]).maybe_single().execute()
            if user_result.data:
                customer_name = user_result.data["name"]

        orders.append(
            OrderOut(
                id=o["id"],
                business_id=o.get("business_id"),
                customer_id=o["customer_id"],
                customer_name=customer_name,
                order_status=o["order_status"],
                total_amount=o["total_amount"],
                items=items,
                created_at=o.get("created_at"),
            )
        )
    return orders


async def get_order(order_id: str) -> OrderOut | None:
    """Get a single order with items."""
    admin = get_supabase_admin()
    result = admin.table("orders").select("*").eq("id", order_id).maybe_single().execute()
    if not result.data:
        return None

    o = result.data
    items = await get_order_items(order_id)
    customer_name = ""
    if o.get("customer_id"):
        user_result = admin.table("users").select("name").eq("id", o["customer_id"]).maybe_single().execute()
        if user_result.data:
            customer_name = user_result.data["name"]

    return OrderOut(
        id=o["id"],
        business_id=o.get("business_id"),
        customer_id=o["customer_id"],
        customer_name=customer_name,
        order_status=o["order_status"],
        total_amount=o["total_amount"],
        items=items,
        created_at=o.get("created_at"),
    )


async def get_order_items(order_id: str) -> list[OrderItemOut]:
    """Get items for an order with product names."""
    admin = get_supabase_admin()
    result = admin.table("order_items").select("*").eq("order_id", order_id).execute()
    items = []
    for item in result.data:
        product_name = ""
        if item.get("product_id"):
            prod = admin.table("products").select("name").eq("id", item["product_id"]).maybe_single().execute()
            if prod.data:
                product_name = prod.data["name"]
        items.append(
            OrderItemOut(
                id=item.get("id"),
                order_id=item.get("order_id"),
                product_id=item["product_id"],
                product_name=product_name,
                quantity=item["quantity"],
                price=item["price"],
            )
        )
    return items


async def create_order(customer_id: str, data: OrderCreate) -> OrderOut:
    """Place a new order."""
    admin = get_supabase_admin()

    # Calculate total from product prices
    total = 0.0
    order_items_data = []
    for item in data.items:
        product = await product_service.get_product(item.product_id)
        if not product:
            raise Exception(f"Product {item.product_id} not found")
        line_total = product.price * item.quantity
        total += line_total
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price,
        })

    # Create order
    order_payload = {
        "business_id": data.business_id,
        "customer_id": customer_id,
        "order_status": "pending",
        "total_amount": total,
    }
    order_result = admin.table("orders").insert(order_payload).execute()
    order_id = order_result.data[0]["id"]

    # Create order items
    for item_data in order_items_data:
        item_data["order_id"] = order_id
    admin.table("order_items").insert(order_items_data).execute()

    # Update stock
    for item in data.items:
        product = await product_service.get_product(item.product_id)
        if product:
            new_qty = max(0, product.stock_quantity - item.quantity)
            await product_service.update_product(
                item.product_id,
                product_service.ProductUpdate(stock_quantity=new_qty),
            )

    # Emit event
    await emit_event("order_created", {"order_id": order_id, "business_id": data.business_id})

    return await get_order(order_id)


async def update_order_status(order_id: str, status: OrderStatus) -> OrderOut:
    """Update order status."""
    admin = get_supabase_admin()
    admin.table("orders").update({"order_status": status.value}).eq("id", order_id).execute()
    return await get_order(order_id)
