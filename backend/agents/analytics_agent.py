"""
Analytics Agent — provides revenue insights and product performance analysis.
"""
import json
from openai import OpenAI
from config import get_settings
from agents.tools import TOOL_DEFINITIONS, execute_tool
from schemas import UserOut


SYSTEM_PROMPT = """You are an AI Analytics Agent for a commerce business.
Your role is to provide detailed revenue insights, product performance analysis, and business intelligence.

Capabilities:
- Analyze revenue trends and identify patterns
- Compare periods and highlight growth/decline
- Identify top selling products
- Detect revenue anomalies and explain root causes
- Provide actionable business recommendations

Use the provided tools to fetch real-time data.
Format currency in ₹ (Indian Rupees).
Be analytical and data-driven. Use **bold** for key metrics.
Always provide context and actionable insights, not just raw numbers."""


async def handle(message: str, user: UserOut, chat_history: list[dict] = None) -> str:
    """Handle analytics queries."""
    settings = get_settings()

    system = SYSTEM_PROMPT + f"\n\nBusiness ID: {user.business_id}\nUser: {user.name}"

    messages = [{"role": "system", "content": system}]
    if chat_history:
        messages.extend(chat_history[-10:])
    messages.append({"role": "user", "content": message})

    if not settings.XAI_API_KEY:
        return await _fallback(message, user)

    try:
        client = OpenAI(api_key=settings.XAI_API_KEY, base_url=settings.XAI_BASE_URL)

        # Use analytics-relevant tools
        analytics_tools = [
            t for t in TOOL_DEFINITIONS
            if t["function"]["name"] in (
                "get_revenue_trends", "get_top_products", "get_all_orders",
                "get_all_products", "get_low_inventory_products",
            )
        ]

        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=messages,
            tools=analytics_tools,
            tool_choice="auto",
            max_tokens=1024,
        )

        msg = response.choices[0].message
        if msg.tool_calls:
            messages.append(msg)
            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments)
                if "business_id" not in args and user.business_id:
                    args["business_id"] = user.business_id
                result = await execute_tool(tc.function.name, args)
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})

            final = client.chat.completions.create(
                model=settings.XAI_MODEL, messages=messages, max_tokens=1024
            )
            return final.choices[0].message.content

        return msg.content or "I can help with revenue and product analytics. What would you like to analyze?"

    except Exception as e:
        print(f"[Analytics Agent Error] {e}")
        return await _fallback(message, user)


async def _fallback(message: str, user: UserOut) -> str:
    """Keyword-based fallback."""
    from services.analytics_service import get_revenue_metrics
    metrics = await get_revenue_metrics(user.business_id or "", 7)
    if metrics:
        total_rev = sum(m.total_revenue for m in metrics)
        total_ord = sum(m.total_orders for m in metrics)
        avg = total_rev / total_ord if total_ord else 0
        best_day = max(metrics, key=lambda m: m.total_revenue)
        return (
            f"📊 **Revenue Summary (Last 7 Days)**\n"
            f"• Total Revenue: ₹{total_rev:,.0f}\n"
            f"• Total Orders: {total_ord}\n"
            f"• Avg Order Value: ₹{avg:,.0f}\n"
            f"• Best Day: {best_day.date} (₹{best_day.total_revenue:,.0f})"
        )
    return "📊 No revenue data available yet. Start by enabling the simulation or placing orders."
