from fastapi import APIRouter, Depends, HTTPException
from database.db import get_supabase
from routes.auth_routes import get_current_user
from models.models import Order, OrderItem, OrderRequest
from typing import List

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/")
async def create_order(request: OrderRequest, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    try:
        items = request.items
        # Calculate total
        total = sum(item.price * item.quantity for item in items)
        
        order_data = {
            "user_id": str(current_user.id),
            "total_price": total,
            "status": "pending"
        }
        
        # Insert order
        order_res = supabase.table("orders").insert(order_data).execute()
        if not order_res.data:
            print(f"Supabase Order Insert Error: {order_res}")
            raise HTTPException(status_code=500, detail="Failed to create order in Supabase")
        
        order = order_res.data[0]
        
        # Insert order items and update inventory
        order_items = []
        for item in items:
            # Check product exists
            product_res = supabase.table("products").select("name, price").eq("id", item.product_id).execute()
            if not product_res.data:
                continue
                
            p = product_res.data[0]
            order_items.append({
                "order_id": order["id"],
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": p["price"]
            })
            
            # Update inventory
            try:
                inv_res = supabase.table("inventory").select("stock_quantity").eq("product_id", item.product_id).execute()
                if inv_res.data:
                    new_stock = max(0, inv_res.data[0]["stock_quantity"] - item.quantity)
                    supabase.table("inventory").update({"stock_quantity": new_stock}).eq("product_id", item.product_id).execute()
            except Exception as e:
                print(f"Inventory update failed: {e}")
        
        if order_items:
            supabase.table("order_items").insert(order_items).execute()
        
        return order
    except Exception as e:
        import traceback
        print(f"CRITICAL ORDER ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

@router.get("/")
async def list_orders(current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    query = supabase.table("orders").select("*, order_items(*)")
    if current_user.role != "admin":
        query = query.eq("user_id", str(current_user.id))
    
    res = query.execute()
    return res.data

@router.get("/{order_id}")
async def get_order(order_id: str, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    res = supabase.table("orders").select("*, order_items(*)").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = res.data[0]
    if current_user.role != "admin" and str(order["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return order
