"""
Operations Agent — handles delivery tracking and logistics insights.
"""
import json
from openai import OpenAI
from config import get_settings
from agents.tools import TOOL_DEFINITIONS, execute_tool
from schemas import UserOut


SYSTEM_PROMPT = """You are an AI Operations Agent for a commerce logistics platform.
Your role is to provide delivery tracking, delay detection, and logistics insights.

Capabilities:
- Track delivery status for specific orders
- Identify delayed deliveries and their causes
- Provide logistics performance metrics
- Suggest operational improvements

Use the provided tools to fetch real-time data.
Be precise with delivery timelines and statuses.
Flag delays clearly and suggest remediation steps."""


async def handle(message: str, user: UserOut, chat_history: list[dict] = None) -> str:
    """Handle operations/delivery queries."""
    settings = get_settings()

    system = SYSTEM_PROMPT + f"\n\nBusiness ID: {user.business_id}\nUser: {user.name} ({user.role})"
    if user.role == "customer":
        system += f"\nCustomer ID: {user.id}"

    messages = [{"role": "system", "content": system}]
    if chat_history:
        messages.extend(chat_history[-10:])
    messages.append({"role": "user", "content": message})

    if not settings.XAI_API_KEY:
        return await _fallback(message, user)

    try:
        client = OpenAI(api_key=settings.XAI_API_KEY, base_url=settings.XAI_BASE_URL)

        ops_tools = [
            t for t in TOOL_DEFINITIONS
            if t["function"]["name"] in (
                "get_delivery_status", "get_delivery_delays", "get_order_status",
                "get_orders_by_customer",
            )
        ]

        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=messages,
            tools=ops_tools,
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
                if "customer_id" not in args and user.role == "customer":
                    args["customer_id"] = user.id
                result = await execute_tool(tc.function.name, args)
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})

            final = client.chat.completions.create(
                model=settings.XAI_MODEL, messages=messages, max_tokens=1024
            )
            return final.choices[0].message.content

        return msg.content or "I can help with delivery tracking and logistics. What would you like to know?"

    except Exception as e:
        print(f"[Operations Agent Error] {e}")
        return await _fallback(message, user)


async def _fallback(message: str, user: UserOut) -> str:
    """Keyword-based fallback."""
    from services.delivery_service import list_deliveries, get_delayed_deliveries
    deliveries = await list_deliveries(user.business_id)
    if deliveries:
        delayed = [d for d in deliveries if d.delivery_status == "delayed"]
        in_transit = [d for d in deliveries if d.delivery_status in ("in_transit", "dispatched")]
        lines = [
            f"🚚 **Delivery Overview**",
            f"• Total: {len(deliveries)}",
            f"• In Transit: {len(in_transit)}",
            f"• Delayed: {len(delayed)}",
        ]
        if delayed:
            lines.append("\n⚠️ **Delayed Deliveries:**")
            for d in delayed:
                lines.append(f"• Order {d.order_id} — {d.delay_reason or 'No reason specified'}")
        return "\n".join(lines)
    return "🚚 No delivery data available yet."
