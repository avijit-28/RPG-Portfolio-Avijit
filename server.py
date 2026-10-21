#!/usr/bin/env python3
"""
========================================================
AVIJIT AI LABS - LOCAL MULTIPLAYER & DATABASE SERVER
========================================================
Zero-dependency Python server that powers:
1. Static Game & Web Assets Serving (HTML/CSS/JS/Images)
2. Real-Time Multiplayer Presence Sync (Multi-Tab & Cross-Device)
3. Strict 1-Email = 1-User Registration & Persistence (visitors_db.json)
4. Admin Lead Portal (Protected by PIN: 9410)
========================================================
Usage:
    python server.py
    python server.py 8080
"""

import sys
import os
import json
import time
from urllib.parse import urlparse, parse_qs
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ADMIN_PIN = os.environ.get("ADMIN_PIN", "9410")
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "visitors_db.json")

# In-Memory Cache for rapid multiplayer updates
live_players = {}  # player_id -> { id, name, room, x, y, facing, moving, walkCycle, lastSeen }

def load_db():
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[DB ERROR] Error reading {DB_FILE}: {e}")
        return []

def save_db(data):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[DB ERROR] Error writing {DB_FILE}: {e}")

class AvijitServerHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local cross-origin/multi-tab development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # Route: /api/visitors
        if parsed.path == "/api/visitors":
            query = parse_qs(parsed.query)
            action = query.get("action", [""])[0]
            admin_key = query.get("adminKey", [""])[0]

            # 1. Live Presence Poll
            if action == "presence":
                now = time.time()
                # Prune inactive players (> 8 seconds)
                stale = [pid for pid, p in live_players.items() if now - p.get("lastSeen", 0) > 8.0]
                for pid in stale:
                    del live_players[pid]

                self.send_json(200, {
                    "success": True,
                    "liveCount": len(live_players),
                    "players": list(live_players.values())
                })
                return

            # 2. Admin Verification (PIN: 9410)
            visitors = load_db()
            if admin_key == ADMIN_PIN:
                self.send_json(200, {
                    "success": True,
                    "isAdmin": True,
                    "totalVisitors": len(visitors),
                    "visitors": visitors
                })
                return

            # 3. Public Visitor Info (Privacy Protected)
            self.send_json(200, {
                "success": True,
                "isAdmin": False,
                "totalVisitors": len(visitors),
                "message": "Admin authentication required to view visitor database."
            })
            return

        # Default: Serve static files
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        # Route: /api/visitors
        if parsed.path == "/api/visitors":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            try:
                body = json.loads(raw_body.decode("utf-8"))
            except Exception:
                body = {}

            action = body.get("action")

            # ----------------------------------------------------
            # ACTION A: Real-Time Multiplayer Presence Heartbeat
            # ----------------------------------------------------
            if action == "presence":
                player = body.get("player", {})
                pid = player.get("id")
                now = time.time()

                if pid:
                    live_players[pid] = {
                        **player,
                        "lastSeen": now
                    }

                # Prune inactive players (> 8 seconds)
                stale = [p_id for p_id, p in live_players.items() if now - p.get("lastSeen", 0) > 8.0]
                for p_id in stale:
                    del live_players[p_id]

                self.send_json(200, {
                    "success": True,
                    "liveCount": len(live_players),
                    "players": list(live_players.values())
                })
                return

            # ----------------------------------------------------
            # ACTION B: Strict 1-Email = 1-User Registration Engine
            # ----------------------------------------------------
            name = (body.get("name") or "").strip()
            location = (body.get("location") or "").strip()
            email = (body.get("email") or "").strip()
            badge_id = body.get("badgeId")

            # Basic Validation
            if len(name) < 2:
                self.send_json(400, {
                    "success": False,
                    "error": "Name must be at least 2 characters long."
                })
                return
            if len(location) < 2:
                self.send_json(400, {
                    "success": False,
                    "error": "Location must be at least 2 characters long."
                })
                return
            if "@" not in email or "." not in email:
                self.send_json(400, {
                    "success": False,
                    "error": "Please enter a valid email address."
                })
                return

            norm_email = email.lower()
            norm_name = name

            visitors = load_db()

            # STRICT RULE 1: If email already exists, Name MUST match registered user's name!
            existing_email_record = next((v for v in visitors if v.get("email", "").lower() == norm_email), None)
            if existing_email_record:
                existing_registered_name = existing_email_record.get("name", "")
                if existing_registered_name.lower() != norm_name.lower():
                    print(f"[ACCESS DENIED] Duplicate email attempt! '{norm_name}' tried to use email '{norm_email}' owned by '{existing_registered_name}'")
                    self.send_json(409, {
                        "success": False,
                        "code": "EMAIL_NAME_MISMATCH",
                        "error": f"⚠️ Yeh email pehle se '{existing_registered_name}' ke naam par registered hai! Ek email se sirf wahi user enter kar sakta hai. Kripya apna alag (unique) email use karein."
                    })
                    return

                # Verified Existing User! Update timestamp & location
                existing_email_record["location"] = location
                existing_email_record["lastActiveAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                save_db(visitors)

                print(f"[LOGIN] Existing user verified: {norm_name} ({norm_email})")
                self.send_json(200, {
                    "success": True,
                    "isExistingUser": True,
                    "message": f"Welcome back, {existing_registered_name}! Security pass verified.",
                    "visitor": existing_email_record
                })
                return

            # STRICT RULE 2: Existing registered Name cannot use a different email
            existing_name_record = next((v for v in visitors if v.get("name", "").lower() == norm_name.lower()), None)
            if existing_name_record:
                registered_email = existing_name_record.get("email", "")
                print(f"[ACCESS DENIED] Duplicate name attempt! Name '{norm_name}' is already bound to '{registered_email}'")
                self.send_json(409, {
                    "success": False,
                    "code": "NAME_EMAIL_MISMATCH",
                    "error": f"⚠️ '{existing_name_record.get('name')}' naam se pehle hi ek account registered hai! Kripya apna registered email enter karein, ya apna poora alag naam likhein."
                })
                return

            # RULE 3: New Unique Member Registration
            new_badge = badge_id or f"AP-VIS-{int(time.time()) % 9000 + 1000}"
            visitor_record = {
                "badgeId": new_badge,
                "name": norm_name,
                "location": location,
                "email": norm_email,
                "registeredAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }

            visitors.insert(0, visitor_record)
            save_db(visitors)

            print(f"[NEW VISITOR] Successfully registered: {norm_name} from {location} ({norm_email}) [Badge: #{new_badge}]")
            self.send_json(200, {
                "success": True,
                "isExistingUser": False,
                "message": "Visitor successfully registered in database.",
                "visitor": visitor_record
            })
            return

        self.send_json(404, {"success": False, "error": "Not found"})

    def send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(('0.0.0.0', PORT), AvijitServerHandler)
    print("=" * 65)
    print("[SERVER] AVIJIT AI LABS - MULTIPLAYER & DATABASE SERVER RUNNING")
    print(f"[SERVER] Local URL:   http://localhost:{PORT}")
    print(f"[SERVER] Admin PIN:   {ADMIN_PIN} (Owner Lead Access)")
    print(f"[SERVER] Database:    {DB_FILE}")
    print("[SERVER] Multiplayer: Real-time multi-tab & cross-device presence enabled")
    print("[SERVER] Validation:  Strict 1-Email = 1-User policy actively enforced")
    print("=" * 65)
    print("[SERVER] Press Ctrl+C to stop the server\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Server stopped safely.")

if __name__ == "__main__":
    run()
