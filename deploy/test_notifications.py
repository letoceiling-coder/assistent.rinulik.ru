#!/usr/bin/env python3
import subprocess, json

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Get CSRF and login
r = json.loads(curl(["curl", "-s", "-c", "/tmp/ntc.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]

r = json.loads(curl(["curl", "-s", "-b", "/tmp/ntc.txt", "-c", "/tmp/ntc.txt", "-X", "POST",
  "-H", "Content-Type: application/json",
  "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test9@example.com","password":"Abcdef12"}',
  BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"))

if not r.get("user"):
    exit(1)

# Get fresh CSRF and connect
r = json.loads(curl(["curl", "-s", "-b", "/tmp/ntc.txt", BASE + "/api/v1/csrf"]))
csrf2 = r["token"]

r2 = json.loads(curl(["curl", "-s", "-b", "/tmp/ntc.txt", "-X", "POST",
  "-H", "X-CSRF-TOKEN: " + csrf2,
  BASE + "/api/v1/notifications/connect"]))
print("Connect:", json.dumps(r2, indent=2, ensure_ascii=False))

if r2.get("url") and "t.me/" in r2["url"]:
    print("\nSUCCESS! Telegram:", r2["url"])
print("Connect:", json.dumps(r2, indent=2, ensure_ascii=False))

if "url" in r2 and "t.me/" in r2["url"]:
    print("\nSUCCESS: Notification bot configured!")
    print("Open this link in Telegram:", r2["url"])
else:
    print("\nFAILED:", r2)