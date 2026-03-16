import os
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://openrouter.ai/api/v1")
XAI_MODEL = os.getenv("XAI_MODEL", "meta-llama/llama-3.3-70b-instruct")

SYSTEM_PROMPT = """
You are the Conversation Agent for AutonomIQ Commerce AI.
Your task is to extract the user's intent and relevant entities from their message.

Supported Intents:
- order_status: Checking status of an order. Requires order_id.
- product_search: Finding products. Requires search_query or category.
- recommend_products: Asking for advice or recommendations.
- refund_request: Asking for a refund. Requires order_id.
- delivery_eta: Asking when an order will arrive. Requires order_id.
- sales_summary: (Admin only) Asking for revenue/sales data.
- greeting: General greetings.

Return ONLY a JSON object:
{
  "intent": "intent_name",
  "entities": {
    "order_id": "123",
    "search_query": "burger",
    "category": "food"
  }
}
"""

class ConversationAgent:
    async def analyze_query(self, message: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{XAI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {XAI_API_KEY}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "AutonomIQ Commerce"
                    },
                    json={
                        "model": XAI_MODEL,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": message}
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

    async def generate_response(self, user_query: str, data: Any, intent: str) -> str:
        prompt = f"""
        You are AutonomIQ Assistant, a helpful AI character in a futuristic e-commerce setting.
        The user asked: "{user_query}"
        The detected intent was: "{intent}"
        The relevant data from our systems is: {data}
        
        Rules:
        1. Be concise, futuristic, and helpful.
        2. Use the data provided to answer the user accurately.
        3. If no products are found, suggest they check back soon for restocks.
        4. If it's a delivery query, mention the specific status and ETA if available.
        5. DO NOT mention you are an AI or LLM. Stay in character.
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{XAI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {XAI_API_KEY}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "AutonomIQ Commerce"
                    },
                    json={
                        "model": XAI_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are a helpful commerce assistant."},
                            {"role": "user", "content": prompt}
                        ]
                    },
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    return f"System error: {response.text}"
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"I'm having trouble syncing with my core modules right now. Error: {e}"
