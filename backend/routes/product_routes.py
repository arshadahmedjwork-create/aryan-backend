from fastapi import APIRouter, Depends, HTTPException, status
from database.db import get_supabase
from routes.auth_routes import get_current_user
from typing import Optional
from models.models import Product, ProductBase

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
async def list_products(category: Optional[str] = None, supabase = Depends(get_supabase)):
    query = supabase.table("products").select("*")
    if category:
        query = query.eq("category", category)
    
    res = query.execute()
    return res.data

@router.get("/{product_id}")
async def get_product(product_id: str, supabase = Depends(get_supabase)):
    res = supabase.table("products").select("*").eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data[0]

@router.post("/")
async def create_product(product_data: ProductBase, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    res = supabase.table("products").insert(product_data.dict()).execute()
    return res.data[0]

@router.put("/{product_id}")
async def update_product(product_id: str, product_data: ProductBase, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    res = supabase.table("products").update(product_data.dict()).eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data[0]

@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    res = supabase.table("products").delete().eq("id", product_id).execute()
    return {"message": "Product deleted"}
