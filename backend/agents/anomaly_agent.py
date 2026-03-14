"""
Anomaly Detection Agent — detects and reports business anomalies.
"""
import json
from openai import OpenAI
from config import get_settings
from agents.tools import TOOL_DEFINITIONS, execute_tool
from schemas import UserOut


SYSTEM_PROMPT = """You are an AI Anomaly Detection Agent for a commerce platform.
Your role is to detect and explain business anomalies including:
- Revenue drops or unusual spikes
- Delivery delay patterns
- Inventory shortages
- Negative customer feedback trends

When reporting anomalies:
- Clearly state what is abnormal
- Provide potential root causes
- Suggest corrective actions

Use the provided tools to fetch current data and compare against patterns."""


async def handle(message: str, user: UserOut, chat_history: list[dict] = None) -> str:
    """Handle anomaly detection queries."""
    settings = get_settings()

    system = SYSTEM_PROMPT + f"\n\nBusiness ID: {user.business_id}\nUser: {user.name}"
    messages = [{"role": "system", "content": system}]
    if chat_history:
        messages.extend(chat_history[-10:])
    messages.append({"role": "user", "content": message})

    if not settings.XAI_API_KEY:
        return await _fallback(user)

    try:
        client = OpenAI(api_key=settings.XAI_API_KEY, base_url=settings.XAI_BASE_URL)

        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,  # Access all tools
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

        return msg.content or "I can analyze your business for anomalies. What area concerns you?"

    except Exception as e:
        print(f"[Anomaly Agent Error] {e}")
        return await _fallback(user)


async def _fallback(user: UserOut) -> str:
    """Keyword-based fallback anomaly check."""
    from services.product_service import get_low_inventory
    from services.delivery_service import get_delayed_deliveries
    from services.analytics_service import get_revenue_metrics

    bid = user.business_id or ""
    lines = ["🔍 **Anomaly Detection Report**\n"]

    # Check low inventory
    low = await get_low_inventory(bid)
    if low:
        lines.append(f"⚠️ **Low Inventory** ({len(low)} products):")
        for p in low:
            lines.append(f"  • {p.name}: {p.stock_quantity} units")

    # Check delivery delays
    delays = await get_delayed_deliveries(bid)
    if delays:
        lines.append(f"\n🚨 **Delayed Deliveries** ({len(delays)}):")
        for d in delays:
            lines.append(f"  • Order {d.order_id}: {d.delay_reason or 'No reason'}")

    # Check revenue trend
    metrics = await get_revenue_metrics(bid, 7)
    if len(metrics) >= 2:
        latest = metrics[-1].total_revenue
        prev = metrics[-2].total_revenue
        if latest < prev * 0.85:
            drop_pct = round((1 - latest / prev) * 100)
            lines.append(f"\n📉 **Revenue Drop**: {drop_pct}% decline from {metrics[-2].date} to {metrics[-1].date}")

    if len(lines) == 1:
        lines.append("✅ No anomalies detected. Everything looks healthy!")

    return "\n".join(lines)
