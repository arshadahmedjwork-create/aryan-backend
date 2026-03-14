"""
Product Service — CRUD operations for the products table.
"""
from database import get_supabase_admin
from schemas import ProductOut, ProductCreate, ProductUpdate


async def list_products(business_id: str) -> list[ProductOut]:
    """List all products for a business."""
    admin = get_supabase_admin()
    result = admin.table("products").select("*").eq("business_id", business_id).execute()
    return [ProductOut(**p) for p in result.data]


async def get_product(product_id: str) -> ProductOut | None:
    """Get a single product by ID."""
    admin = get_supabase_admin()
    result = admin.table("products").select("*").eq("id", product_id).maybe_single().execute()
    if result.data:
        return ProductOut(**result.data)
    return None


async def create_product(business_id: str, data: ProductCreate) -> ProductOut:
    """Create a new product."""
    admin = get_supabase_admin()
    payload = {"business_id": business_id, **data.model_dump(exclude_none=True)}
    result = admin.table("products").insert(payload).execute()
    return ProductOut(**result.data[0])


async def update_product(product_id: str, data: ProductUpdate) -> ProductOut:
    """Update a product."""
    admin = get_supabase_admin()
    payload = data.model_dump(exclude_none=True)
    result = (
        admin.table("products")
        .update(payload)
        .eq("id", product_id)
        .execute()
    )
    return ProductOut(**result.data[0])


async def delete_product(product_id: str):
    """Delete a product."""
    admin = get_supabase_admin()
    admin.table("products").delete().eq("id", product_id).execute()


async def get_low_inventory(business_id: str, threshold: int = 20) -> list[ProductOut]:
    """Get products with stock below threshold."""
    admin = get_supabase_admin()
    result = (
        admin.table("products")
        .select("*")
        .eq("business_id", business_id)
        .lt("stock_quantity", threshold)
        .execute()
    )
    return [ProductOut(**p) for p in result.data]


async def get_top_products(business_id: str, limit: int = 5) -> list[dict]:
    """Get top selling products by aggregating order items."""
    admin = get_supabase_admin()
    # Get all orders for this business
    orders = admin.table("orders").select("id").eq("business_id", business_id).execute()
    if not orders.data:
        return []

    order_ids = [o["id"] for o in orders.data]

    # Get order items and aggregate
    items = admin.table("order_items").select("product_id, quantity").in_("order_id", order_ids).execute()

    # Aggregate by product
    product_sales: dict[str, int] = {}
    for item in items.data:
        pid = item["product_id"]
        product_sales[pid] = product_sales.get(pid, 0) + item["quantity"]

    # Sort and get top N
    sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:limit]

    # Fetch product details
    results = []
    for pid, qty in sorted_products:
        product = await get_product(pid)
        if product:
            results.append({"product": product.model_dump(), "total_sold": qty})

    return results
