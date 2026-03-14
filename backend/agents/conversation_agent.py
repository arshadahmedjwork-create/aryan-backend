"""
Conversation Agent — handles general customer and owner conversations.
Uses xAI Grok API with tool calling for data-backed responses.
"""
import json
from openai import OpenAI
from config import get_settings
from agents.tools import TOOL_DEFINITIONS, execute_tool
from schemas import UserOut


CUSTOMER_SYSTEM_PROMPT = """You are a friendly and helpful AI shopping assistant for an e-commerce platform.
You help customers with:
- Checking order status and delivery tracking
- Product recommendations and information
- General shopping queries

Use the provided tools to fetch real-time data from the system.
Format prices in ₹ (Indian Rupees).
Be concise, use emojis where appropriate, and be genuinely helpful.
When showing order information, format it clearly with bullet points."""

OWNER_SYSTEM_PROMPT = """You are an AI Business Copilot for a commerce platform owner.
You provide:
- Revenue analysis and business insights
- Product performance analytics
- Inventory management recommendations
- Delivery and operations overview
- NPS and customer satisfaction analysis

Use the provided tools to fetch real-time data.
Format currency in ₹ (Indian Rupees).
Be analytical, provide actionable insights, and highlight anomalies or concerns.
Use **bold** for key metrics and bullet points for clarity."""


async def handle(message: str, user: UserOut, chat_history: list[dict] = None) -> str:
    """Handle a conversation message using xAI Grok with tool calling."""
    settings = get_settings()

    # Select system prompt based on role
    system_prompt = CUSTOMER_SYSTEM_PROMPT if user.role == "customer" else OWNER_SYSTEM_PROMPT

    # Add user context
    system_prompt += f"\n\nCurrent user: {user.name} (role: {user.role})"
    if user.business_id:
        system_prompt += f"\nBusiness ID: {user.business_id}"
    system_prompt += f"\nUser ID: {user.id}"

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        messages.extend(chat_history[-10:])  # Last 10 messages for context
    messages.append({"role": "user", "content": message})

    # If no API key, use keyword fallback
    if not settings.XAI_API_KEY:
        return await _keyword_fallback(message, user)

    try:
        client = OpenAI(api_key=settings.XAI_API_KEY, base_url=settings.XAI_BASE_URL)

        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            max_tokens=1024,
        )

        assistant_message = response.choices[0].message

        # Handle tool calls
        if assistant_message.tool_calls:
            messages.append(assistant_message)

            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Auto-inject business_id and customer_id if needed
                if "business_id" in arguments or "business_id" in str(TOOL_DEFINITIONS):
                    if "business_id" not in arguments and user.business_id:
                        arguments["business_id"] = user.business_id
                if "customer_id" not in arguments and user.role == "customer":
                    if "customer_id" in str(tool_call.function.name):
                        arguments["customer_id"] = user.id

                result = await execute_tool(tool_name, arguments)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })

            # Get final response with tool results
            final_response = client.chat.completions.create(
                model=settings.XAI_MODEL,
                messages=messages,
                max_tokens=1024,
            )
            return final_response.choices[0].message.content

        return assistant_message.content or "I'm here to help! What would you like to know?"

    except Exception as e:
        print(f"[Conversation Agent Error] {e}")
        return await _keyword_fallback(message, user)


async def _keyword_fallback(message: str, user: UserOut) -> str:
    """Keyword-based fallback when LLM is unavailable."""
    lower = message.lower()

    if user.role == "customer":
        if any(w in lower for w in ["order", "status"]):
            from services.order_service import list_orders
            orders = await list_orders(customer_id=user.id)
            if orders:
                lines = ["📦 Your recent orders:"]
                for o in orders[:5]:
                    lines.append(f"• **{o.id}** — {o.order_status.replace('_', ' ').title()} | ₹{o.total_amount:,.0f}")
                return "\n".join(lines)
            return "You don't have any orders yet!"

        if any(w in lower for w in ["product", "recommend", "buy", "shop"]):
            from services.product_service import list_products
            products = await list_products(user.business_id or "")
            if products:
                lines = ["🛍️ Our top picks:"]
                for p in products[:5]:
                    lines.append(f"• **{p.name}** — ₹{p.price:,.0f}")
                return "\n".join(lines)

        if any(w in lower for w in ["deliver", "track", "ship"]):
            return "🚚 I can help you track your delivery! Please share your order ID and I'll look it up."

    else:  # owner
        if any(w in lower for w in ["revenue", "sales"]):
            from services.analytics_service import get_revenue_metrics
            metrics = await get_revenue_metrics(user.business_id or "", 7)
            if metrics:
                total = sum(m.total_revenue for m in metrics)
                total_orders = sum(m.total_orders for m in metrics)
                return f"📊 This week's revenue: ₹{total:,.0f} across {total_orders} orders."
            return "No revenue data available yet."

        if any(w in lower for w in ["product", "top", "best", "sold"]):
            from services.product_service import get_low_inventory
            low = await get_low_inventory(user.business_id or "")
            if low:
                lines = ["⚠️ Low inventory products:"]
                for p in low:
                    lines.append(f"• **{p.name}** — {p.stock_quantity} units left")
                return "\n".join(lines)

    return "👋 Hi! I'm your AI assistant. I can help you with orders, products, deliveries, and more. What would you like to know?"
