import os
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://openrouter.ai/api/v1")
XAI_MODEL = os.getenv("XAI_MODEL", "meta-llama/llama-3.3-70b-instruct")

SYSTEM_PROMPT = """
You are the Intelligence Core for QueryNexis.
Analyze the user's message and the PROVIDED USER ROLE to extract intent and entities.

User Roles:
- admin: High-level command. Focus on revenue, fleet efficiency, and system health.
- driver: Tactical unit. Focus on mission routes, delivery timing, and coordination.
- customer: Service user. Focus on order tracking, product discovery, and issue resolution.

Supported Intents:
- order_status: Checking status of an order. Requires order_id.
- product_search: Finding products. Requires search_query.
- recommend_products: Asking for advice or recommendations.
- refund_request: Asking for a refund. Requires order_id.
- cancel_order: Asking to cancel an order. Requires order_id (Autonomous action).
- delivery_eta: Asking when an order will arrive. Requires order_id.
- sales_summary: Asking for revenue/sales data (Focus for Admin).
- fleet_status: Asking about drivers/units (Focus for Admin).
- greeting: General greetings.

Return ONLY a JSON object:
{
  "role_context": "perceived_role",
  "intent": "intent_name",
  "entities": {
    "order_id": "123",
    "search_query": "burger"
  }
}
"""

class ConversationAgent:
    async def analyze_query(self, message: str, role: str = "customer") -> Dict[str, Any]:
        prompt = f"USER ROLE: {role}\nUSER MESSAGE: {message}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{XAI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {XAI_API_KEY}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "QueryNexis Intelligence"
                    },
                    json={
                        "model": XAI_MODEL,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"}
                    },
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    print(f"AI API Error: {response.text}")
                    return {"intent": "general_query", "entities": {}}
                
                result = response.json()
                import json
                content = result["choices"][0]["message"]["content"]
                return json.loads(content)
            except Exception as e:
                print(f"AI Error: {e}")
                return {"intent": "general_query", "entities": {}}

    async def generate_response(self, user_query: str, data: Any, intent: str, role: str = "customer") -> str:
        personas = {
            "admin": "You are 'Command Intelligence'. Your tone is analytical, strategic, and concise. You provide data-driven insights for business operations.",
            "driver": "You are 'Tactical Coordination'. Your tone is efficient, direct, and mission-oriented. Focus on logistics and coordination.",
            "customer": "You are 'QueryNexis Concierge'. Your tone is helpful, empathetic, and professional. Focus on service excellence."
        }
        
        system_persona = personas.get(role, personas["customer"])
        
        prompt = f"""
        User Message: "{user_query}"
        Detected Intent: "{intent}"
        System Context/Data: {data}
        
        Operational Directives:
        1. Be futuristic and high-tech in your language (QueryNexis Noir aesthetic).
        2. Use the system context provided to answer accurately.
        3. If confirming a cancellation request (intent 'cancel_verification'):
           - Explicitly list the items found in the order ({data.get('items')}).
           - Keep it BRIEF. Ask for confirmation and a reason in a single tactical sentence.
        4. If you just performed an action (like canceling an order), confirm it is COMPLETE and mention the reason recorded. Mention 'Mission Successful' if appropriate.
        5. If the data indicates a delay or issue, apologize professionally and provide the current status.
        6. DO NOT mention you are an AI or LLM. Be concise; avoid redundant pleasantries.
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{XAI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {XAI_API_KEY}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "QueryNexis Intelligence"
                    },
                    json={
                        "model": XAI_MODEL,
                        "messages": [
                            {"role": "system", "content": system_persona},
                            {"role": "user", "content": prompt}
                        ]
                    },
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    return f"Neural link failure: {response.text}"
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"Sync error in intelligence modules: {e}"
