"""
Products Router — CRUD for product management.
"""
from fastapi import APIRouter, HTTPException, Depends
from schemas import ProductOut, ProductCreate, ProductUpdate, UserOut
from services import product_service
from routers.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
async def list_products(current_user: UserOut = Depends(get_current_user)):
    """List all products for the user's business."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await product_service.list_products(current_user.business_id)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, current_user: UserOut = Depends(get_current_user)):
    """Get a single product."""
    product = await product_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut)
async def create_product(body: ProductCreate, current_user: UserOut = Depends(get_current_user)):
    """Create a new product (owner only)."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners can create products")
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await product_service.create_product(current_user.business_id, body)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, body: ProductUpdate, current_user: UserOut = Depends(get_current_user)):
    """Update a product (owner only)."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners can update products")
    return await product_service.update_product(product_id, body)


@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user: UserOut = Depends(get_current_user)):
    """Delete a product (owner only)."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners can delete products")
    await product_service.delete_product(product_id)
    return {"status": "deleted"}
