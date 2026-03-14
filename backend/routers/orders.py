"""
Orders Router — order management endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from schemas import OrderOut, OrderCreate, OrderStatusUpdate, UserOut
from services import order_service
from routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderOut])
async def list_orders(current_user: UserOut = Depends(get_current_user)):
    """List orders. Customers see their own; owners/ops see business orders."""
    if current_user.role == "customer":
        return await order_service.list_orders(customer_id=current_user.id)
    elif current_user.business_id:
        return await order_service.list_orders(business_id=current_user.business_id)
    return []


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, current_user: UserOut = Depends(get_current_user)):
    """Get a single order with items."""
    order = await order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Check access
    if current_user.role == "customer" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.post("", response_model=OrderOut)
async def create_order(body: OrderCreate, current_user: UserOut = Depends(get_current_user)):
    """Place a new order (customer only)."""
    try:
        return await order_service.create_order(current_user.id, body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_status(order_id: str, body: OrderStatusUpdate, current_user: UserOut = Depends(get_current_user)):
    """Update order status (owner/ops only)."""
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Customers cannot update order status")
    return await order_service.update_order_status(order_id, body.order_status)
