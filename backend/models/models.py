from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID, uuid4
from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    role: str = "customer" # customer, admin, driver
    full_name: Optional[str] = None
    phone: Optional[str] = None

class User(UserBase):
    id: UUID
    created_at: Optional[datetime] = None

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float
    image_url: Optional[str] = None

class Product(ProductBase):
    id: UUID
    created_at: Optional[datetime] = None

class OrderBase(BaseModel):
    user_id: UUID
    address_id: Optional[UUID] = None
    status: str = "pending" # pending, paid, processing, shipped, delivered, cancelled
    total_price: float

class Order(OrderBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class OrderItem(BaseModel):
    id: UUID
    order_id: UUID
    product_id: UUID
    quantity: int
    price_at_purchase: float

class Delivery(BaseModel):
    id: UUID
    order_id: UUID
    driver_id: Optional[UUID] = None
    status: str = "preparing" # preparing, assigned, out_for_delivery, delivered
    eta: Optional[datetime] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    updated_at: Optional[datetime] = None

class Alert(BaseModel):
    id: UUID
    type: str # inventory, delivery, revenue
    severity: str # low, medium, high, critical
    message: str
    acknowledged: bool = False
    created_at: Optional[datetime] = None

class Message(BaseModel):
    id: UUID
    user_id: UUID
    role: str # user, assistant, system
    content: str
    created_at: Optional[datetime] = None

class OrderRequestItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class OrderRequest(BaseModel):
    items: List[OrderRequestItem]

class Inventory(BaseModel):
    id: UUID
    product_id: UUID
    stock_quantity: int = 0
    updated_at: Optional[datetime] = None

class Address(BaseModel):
    id: UUID
    user_id: UUID
    address_line1: str
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None

class DeliveryUpdate(BaseModel):
    lat: float
    lng: float
    status: Optional[str] = None
