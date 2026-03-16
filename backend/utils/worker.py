import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import get_supabase
from agents.alert_agent import AlertMonitoringAgent

load_dotenv()

async def monitor_loop():
    supabase = get_supabase()
    alert_agent = AlertMonitoringAgent(supabase)
    
    print("🚀 Monitoring worker started...")
    
    while True:
        try:
            print("🔍 Checking system status...")
            alerts = await alert_agent.check_all()
            if alerts:
                print(f"🔔 Generated {len(alerts)} alerts.")
            else:
                print("✅ System healthy. No new alerts.")
        except Exception as e:
            print(f"❌ Error in worker: {e}")
            
        await asyncio.sleep(120) # Check every 2 minutes

if __name__ == "__main__":
    asyncio.run(monitor_loop())
