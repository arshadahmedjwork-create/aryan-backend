"""
LLM Tool definitions — functions that agents can call to query the database.
These tools are exposed to the LLM via function calling.
"""
from database import get_supabase_admin
from services import (
    product_service,
    order_service,
    delivery_service,
    analytics_service,
    nps_service,
    alerts_service,
)
from schemas import AIAlertCreate, AlertType, Severity


# ── Tool definitions for LLM function calling ─────────────────────────────

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Get the current status of a specific order by its order ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "The order ID (e.g., ORD-1001)"}
                },
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_delivery_status",
            "description": "Get the delivery status for a specific order",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "The order ID to check delivery for"}
                },
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_products",
            "description": "Get the top selling products for a business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"},
                    "limit": {"type": "integer", "description": "Number of top products to return", "default": 5},
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_revenue_trends",
            "description": "Get revenue trend data for a business over a date range",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"},
                    "days": {"type": "integer", "description": "Number of days to look back", "default": 7},
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_low_inventory_products",
            "description": "Get products with low inventory (stock below threshold)",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"},
                    "threshold": {"type": "integer", "description": "Stock threshold", "default": 20},
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_delivery_delays",
            "description": "Get all delayed deliveries for a business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"}
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_nps_score",
            "description": "Get the aggregate Net Promoter Score for a business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"}
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_orders_by_customer",
            "description": "Get all orders placed by a specific customer",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string", "description": "The customer's user ID"}
                },
                "required": ["customer_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_products",
            "description": "Get all products available in a business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"}
                },
                "required": ["business_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_orders",
            "description": "Get all recent orders for a business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The business ID"}
                },
                "required": ["business_id"],
            },
        },
    },
]


# ── Tool execution ─────────────────────────────────────────────────────────

async def execute_tool(tool_name: str, arguments: dict) -> str:
    """Execute a tool call and return a string result."""
    import json

    try:
        if tool_name == "get_order_status":
            order = await order_service.get_order(arguments["order_id"])
            if order:
                return json.dumps(order.model_dump(), default=str)
            return json.dumps({"error": "Order not found"})

        elif tool_name == "get_delivery_status":
            delivery = await delivery_service.get_delivery_by_order(arguments["order_id"])
            if delivery:
                return json.dumps(delivery.model_dump(), default=str)
            return json.dumps({"error": "Delivery not found for this order"})

        elif tool_name == "get_top_products":
            products = await product_service.get_top_products(
                arguments["business_id"], arguments.get("limit", 5)
            )
            return json.dumps(products, default=str)

        elif tool_name == "get_revenue_trends":
            metrics = await analytics_service.get_revenue_metrics(
                arguments["business_id"], arguments.get("days", 7)
            )
            return json.dumps([m.model_dump() for m in metrics], default=str)

        elif tool_name == "get_low_inventory_products":
            products = await product_service.get_low_inventory(
                arguments["business_id"], arguments.get("threshold", 20)
            )
            return json.dumps([p.model_dump() for p in products], default=str)

        elif tool_name == "get_delivery_delays":
            delays = await delivery_service.get_delayed_deliveries(arguments["business_id"])
            return json.dumps([d.model_dump() for d in delays], default=str)

        elif tool_name == "get_nps_score":
            score = await nps_service.get_nps_score(arguments["business_id"])
            return json.dumps(score, default=str)

        elif tool_name == "get_orders_by_customer":
            orders = await order_service.list_orders(customer_id=arguments["customer_id"])
            return json.dumps([o.model_dump() for o in orders], default=str)

        elif tool_name == "get_all_products":
            products = await product_service.list_products(arguments["business_id"])
            return json.dumps([p.model_dump() for p in products], default=str)

        elif tool_name == "get_all_orders":
            orders = await order_service.list_orders(business_id=arguments["business_id"])
            return json.dumps([o.model_dump() for o in orders], default=str)

        else:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    except Exception as e:
        return json.dumps({"error": str(e)})
