import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_HOST = "v3.football.api-sports.io"
BASE_URL = f"https://{API_HOST}"
headers = {
    "x-apisports-key": os.getenv("FOOTBALL_API_KEY", "").strip(),
    "x-apisports-host": API_HOST
}

url = f"{BASE_URL}/leagues?search=South Africa"
response = requests.get(url, headers=headers)
data = response.json()

if "response" in data:
    for f in data["response"]:
        l_id = f["league"]["id"]
        l_name = f["league"]["name"]
        print(f"ID: {l_id} - {l_name}")
else:
    print("Error:", data)
