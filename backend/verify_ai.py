import requests
import json

BASE_URL = "https://aryan-backend-xpnr.onrender.com"

def safe_json(res):
    try:
        return res.json()
    except:
        print(f"FAILED TO PARSE JSON. Status: {res.status_code}")
        print(f"RAW CONTENT: {res.text[:500]}")
        return {}

def test_role_awareness():
    print("--- Testing Role Awareness: Admin ---")
    login_data = {"username": "admin@autonomiq.ai", "password": "admin123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    login_json = safe_json(login_res)
    if not login_json: return
    token = login_json.get("access_token")
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_req = {"message": "How much revenue did we make today?"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    chat_json = safe_json(chat_res)
    print("Admin Response:", chat_json.get("response"))
    print("Intent:", chat_json.get("intent"))

    print("\n--- Testing Role Awareness: Customer ---")
    login_data = {"username": "customer@gmail.com", "password": "cust123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    login_json = safe_json(login_res)
    if not login_json: return
    token = login_json.get("access_token")
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_req = {"message": "How much revenue did we make today?"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    chat_json = safe_json(chat_res)
    print("Customer Response:", chat_json.get("response"))

    print("\n--- Testing Autonomous Action: Cancel Order ---")
    chat_req = {"message": "Please cancel my latest order"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    chat_json = safe_json(chat_res)
    print("Cancel Response:", chat_json.get("response"))

    print("\n--- Testing Proactive Pulse: Admin ---")
    login_data = {"username": "admin@autonomiq.ai", "password": "admin123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    login_json = safe_json(login_res)
    if not login_json: return
    token = login_json.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    pulse_res = requests.get(f"{BASE_URL}/ai/pulse", headers=headers)
    print("Pulse Data:", json.dumps(safe_json(pulse_res), indent=2))

if __name__ == "__main__":
    try:
        test_role_awareness()
    except Exception as e:
        print(f"Verification Script Failed: {e}")
