"""
Pydantic schemas for request/response validation.
Matches the frontend TypeScript interfaces defined in mock-data.ts.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────


class UserRole(str, Enum):
    customer = "customer"
    owner = "owner"
    operations_manager = "operations_manager"
    admin = "admin"


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class DeliveryStatus(str, Enum):
    pending = "pending"
    dispatched = "dispatched"
    in_transit = "in_transit"
    delivered = "delivered"
    delayed = "delayed"


class AlertType(str, Enum):
    delivery_delay = "delivery_delay"
    revenue_drop = "revenue_drop"
    inventory_low = "inventory_low"
    negative_feedback = "negative_feedback"


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# ── Auth ───────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole = UserRole.customer
    business_id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── Users ──────────────────────────────────────────────────────────────────


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    business_id: Optional[str] = None


# ── Businesses ─────────────────────────────────────────────────────────────


class BusinessOut(BaseModel):
    id: str
    name: str
    owner_id: str
    created_at: Optional[str] = None


class BusinessCreate(BaseModel):
    name: str


# ── Products ───────────────────────────────────────────────────────────────


class ProductOut(BaseModel):
    id: str
    business_id: Optional[str] = None
    name: str
    description: str
    price: float
    category: str
    stock_quantity: int
    image: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock_quantity: int
    image: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None
    image: Optional[str] = None


# ── Orders ─────────────────────────────────────────────────────────────────


class OrderItemOut(BaseModel):
    id: Optional[str] = None
    order_id: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    quantity: int
    price: float


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int


class OrderOut(BaseModel):
    id: str
    business_id: Optional[str] = None
    customer_id: str
    customer_name: Optional[str] = None
    order_status: OrderStatus
    total_amount: float
    items: list[OrderItemOut] = []
    created_at: Optional[str] = None


class OrderCreate(BaseModel):
    business_id: str
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    order_status: OrderStatus


# ── Deliveries ─────────────────────────────────────────────────────────────


class DeliveryOut(BaseModel):
    id: str
    order_id: str
    delivery_status: DeliveryStatus
    assigned_driver: str
    estimated_delivery_time: Optional[str] = None
    actual_delivery_time: Optional[str] = None
    delay_reason: Optional[str] = None


class DeliveryCreate(BaseModel):
    order_id: str
    assigned_driver: str = "Unassigned"
    estimated_delivery_time: Optional[str] = None


class DeliveryUpdate(BaseModel):
    delivery_status: Optional[DeliveryStatus] = None
    assigned_driver: Optional[str] = None
    estimated_delivery_time: Optional[str] = None
    actual_delivery_time: Optional[str] = None
    delay_reason: Optional[str] = None


# ── Revenue Metrics ────────────────────────────────────────────────────────


class RevenueMetricOut(BaseModel):
    id: Optional[str] = None
    business_id: Optional[str] = None
    date: str
    total_orders: int
    total_revenue: float
    avg_order_value: float


# ── NPS Feedback ───────────────────────────────────────────────────────────


class NpsFeedbackOut(BaseModel):
    id: str
    customer_id: str
    order_id: Optional[str] = None
    score: int
    feedback_text: Optional[str] = None
    created_at: Optional[str] = None


class NpsFeedbackCreate(BaseModel):
    order_id: Optional[str] = None
    score: int = Field(ge=0, le=10)
    feedback_text: Optional[str] = None


# ── AI Alerts ──────────────────────────────────────────────────────────────


class AIAlertOut(BaseModel):
    id: str
    business_id: Optional[str] = None
    alert_type: AlertType
    description: str
    severity: Severity
    created_at: Optional[str] = None
    resolved: bool = False


class AIAlertCreate(BaseModel):
    alert_type: AlertType
    description: str
    severity: Severity = Severity.medium


# ── Chat ───────────────────────────────────────────────────────────────────


class ChatMessageOut(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    message: str
    role: str  # 'user' or 'assistant'
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    agent: Optional[str] = None  # which agent handled the request
