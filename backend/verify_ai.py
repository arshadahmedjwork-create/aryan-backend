import requests
import json

BASE_URL = "http://localhost:8000"

def test_role_awareness():
    print("--- Testing Role Awareness: Admin ---")
    login_data = {"username": "admin@autonomiq.ai", "password": "admin123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_req = {"message": "How much revenue did we make today?"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    print("Admin Response:", chat_res.json()["response"])
    print("Intent:", chat_res.json()["intent"])

    print("\n--- Testing Role Awareness: Customer ---")
    login_data = {"username": "customer@gmail.com", "password": "cust123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_req = {"message": "How much revenue did we make today?"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    print("Customer Response:", chat_res.json()["response"])

    print("\n--- Testing Autonomous Action: Cancel Order ---")
    chat_req = {"message": "Please cancel my latest order"}
    chat_res = requests.post(f"{BASE_URL}/chat", headers=headers, json=chat_req)
    print("Cancel Response:", chat_res.json()["response"])

    print("\n--- Testing Proactive Pulse: Admin ---")
    login_data = {"username": "admin@autonomiq.ai", "password": "admin123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    pulse_res = requests.get(f"{BASE_URL}/ai/pulse", headers=headers)
    print("Pulse Data:", json.dumps(pulse_res.json(), indent=2))

if __name__ == "__main__":
    try:
        test_role_awareness()
    except Exception as e:
        print(f"Verification Script Failed: {e}")
