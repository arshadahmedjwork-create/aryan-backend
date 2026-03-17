from fastapi import APIRouter, Depends, HTTPException
from database.db import get_supabase
from routes.auth_routes import get_current_user
from datetime import datetime
from typing import Optional
from models.models import DeliveryUpdate

router = APIRouter(prefix="/delivery", tags=["delivery"])

@router.post("/assign/{order_id}")
async def assign_delivery(order_id: str, driver_id: str, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check order
    order_res = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check driver
    driver_res = supabase.table("users").select("*").eq("id", driver_id).eq("role", "driver").execute()
    if not driver_res.data:
        raise HTTPException(status_code=400, detail="Invalid driver")
        
    delivery_data = {
        "order_id": order_id,
        "driver_id": driver_id,
        "status": "preparing"
    }
    
    # Update order status
    supabase.table("orders").update({"status": "shipped"}).eq("id", order_id).execute()
    
    # Insert delivery
    res = supabase.table("deliveries").insert(delivery_data).execute()
    return res.data[0]

@router.put("/update/{delivery_id}/")
async def update_delivery(delivery_id: str, data: DeliveryUpdate, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "driver" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {
        "current_lat": data.lat,
        "current_lng": data.lng,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if data.status:
        update_data["status"] = data.status
    
    res = supabase.table("deliveries").update(update_data).eq("id", delivery_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Delivery not found")
        
    if data.status == "delivered":
        delivery = res.data[0]
        supabase.table("orders").update({"status": "delivered"}).eq("id", delivery["order_id"]).execute()
            
    return res.data[0]

@router.get("/my")
async def list_my_deliveries(current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "driver" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = supabase.table("deliveries").select("*, orders(*)")
    if current_user.role == "driver":
        query = query.eq("driver_id", str(current_user.id))
    
    res = query.execute()
    return res.data

@router.get("/track/{order_id}")
async def track_delivery(order_id: str, supabase = Depends(get_supabase)):
    res = supabase.table("deliveries").select("*").eq("order_id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Delivery tracking not found for this order")
    return res.data[0]
