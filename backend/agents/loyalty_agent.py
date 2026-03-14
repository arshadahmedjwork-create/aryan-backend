"""
Loyalty Agent — NPS analysis and customer satisfaction insights.
"""
import json
from openai import OpenAI
from config import get_settings
from agents.tools import TOOL_DEFINITIONS, execute_tool
from schemas import UserOut


SYSTEM_PROMPT = """You are an AI Loyalty & NPS Agent for a commerce platform.
Your role is to analyze customer satisfaction, NPS scores, and feedback trends.

Capabilities:
- Calculate and explain NPS scores
- Identify feedback trends and patterns
- Detect customer satisfaction issues
- Recommend actions to improve loyalty

Use the provided tools to fetch real-time data.
Explain NPS in simple terms: Promoters (9-10), Passives (7-8), Detractors (0-6).
NPS = %Promoters - %Detractors, ranges from -100 to +100."""


async def handle(message: str, user: UserOut, chat_history: list[dict] = None) -> str:
    """Handle NPS and loyalty queries."""
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

        loyalty_tools = [
            t for t in TOOL_DEFINITIONS
            if t["function"]["name"] in ("get_nps_score",)
        ]

        response = client.chat.completions.create(
            model=settings.XAI_MODEL,
            messages=messages,
            tools=loyalty_tools,
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

        return msg.content or "I can help with NPS and customer satisfaction analysis."

    except Exception as e:
        print(f"[Loyalty Agent Error] {e}")
        return await _fallback(user)


async def _fallback(user: UserOut) -> str:
    """Keyword-based fallback."""
    from services.nps_service import get_nps_score
    score_data = await get_nps_score(user.business_id or "")
    return (
        f"📊 **NPS Summary**\n"
        f"• Score: {score_data['score']}\n"
        f"• Total Responses: {score_data['total_responses']}\n"
        f"• Promoters: {score_data['promoters']}\n"
        f"• Passives: {score_data['passives']}\n"
        f"• Detractors: {score_data['detractors']}"
    )
