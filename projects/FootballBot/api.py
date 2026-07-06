import os
import requests
from datetime import datetime, timedelta

API_HOST = "v3.football.api-sports.io"
BASE_URL = f"https://{API_HOST}"
# Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, South African PSL
TOP_LEAGUES = {39, 140, 135, 78, 61, 2, 3, 41, 288}

def get_headers():
    return {
        "x-apisports-key": os.getenv("FOOTBALL_API_KEY", "").strip(),
        "x-apisports-host": API_HOST
    }

def get_today_fixtures():
    today = datetime.now().strftime("%Y-%m-%d")
    url = f"{BASE_URL}/fixtures?date={today}"
    fixtures = []
    
    try:
        response = requests.get(url, headers=get_headers())
        data = response.json()
        if "response" in data:
            for f in data["response"]:
                if f["league"]["id"] in TOP_LEAGUES:
                    home = f["teams"]["home"]["name"]
                    away = f["teams"]["away"]["name"]
                    # parse time nicely
                    time_str = datetime.fromisoformat(f["fixture"]["date"]).strftime("%H:%M")
                    status = f["fixture"]["status"]["short"]
                    fixtures.append({"home": home, "away": away, "time": time_str, "status": status, "league": f["league"]["name"]})
    except Exception as e:
        print(f"Error fetching today fixtures: {e}")
            
    return fixtures

def get_yesterday_results():
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    url = f"{BASE_URL}/fixtures?date={yesterday}"
    results = []
    
    try:
        response = requests.get(url, headers=get_headers())
        data = response.json()
        if "response" in data:
            for f in data["response"]:
                if f["league"]["id"] in TOP_LEAGUES:
                    home = f["teams"]["home"]["name"]
                    away = f["teams"]["away"]["name"]
                    home_score = f["goals"]["home"]
                    away_score = f["goals"]["away"]
                    status = f["fixture"]["status"]["short"]
                    
                    if status in ["FT", "AET", "PEN"]:
                        results.append({
                            "home": home, 
                            "away": away, 
                            "home_score": home_score, 
                            "away_score": away_score,
                            "league": f["league"]["name"]
                        })
    except Exception as e:
        print(f"Error fetching yesterday results: {e}")
            
    return results

def format_fixtures(fixtures):
    if not fixtures:
        return "No notable fixtures today."
    
    msg = "📅 <b>Today's Fixtures</b>\n\n"
    
    by_league = {}
    for f in fixtures:
        by_league.setdefault(f["league"], []).append(f)
        
    for league, matches in by_league.items():
        msg += f"<b>{league}</b>\n"
        for m in matches:
            msg += f"⚽ {m['home']} vs {m['away']} 🕒 {m['time']} ({m['status']})\n"
        msg += "\n"
        
    return msg

def format_results(results):
    if not results:
        return "No notable results from yesterday."

    msg = "🏆 <b>Yesterday's Results</b>\n\n"
    
    by_league = {}
    for r in results:
        by_league.setdefault(r["league"], []).append(r)
        
    for league, matches in by_league.items():
        msg += f"<b>{league}</b>\n"
        for m in matches:
            msg += f"✅ {m['home']} {m['home_score']} - {m['away_score']} {m['away']}\n"
        msg += "\n"
        
    return msg
