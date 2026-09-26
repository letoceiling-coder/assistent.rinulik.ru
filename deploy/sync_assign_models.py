#!/usr/bin/env python3
import subprocess, json

BASE = "https://assistent.rinulik.ru"
proxy = "http://31.207.5.233:3128"

# Step 1: Login as admin
def curl(args):
    return subprocess.run(args, capture_output=True).stdout

r = json.loads(curl(["curl", "-s", "-c", "/tmp/ap2.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]

r = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-c", "/tmp/ap2.txt", "-X", "POST",
  "-H", "Content-Type: application/json",
  "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test9@example.com","password":"Abcdef12"}',
  BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

# Step 2: Sync models via admin API (this is what will use the proxy)
r = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-c", "/tmp/ap2.txt", BASE + "/api/v1/csrf"]))
csrf2 = r["token"]

print("Syncing models from OpenRouter via proxy...")
r2 = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-c", "/tmp/ap2.txt", "-X", "POST",
  "-H", "X-CSRF-TOKEN: " + csrf2,
  BASE + "/api/v1/admin/models/sync"]))
print("Result:", json.dumps(r2, indent=2, ensure_ascii=False))

if r2.get("count"):
    print(f"\nSUCCESS: {r2['count']} models synced via proxy!")

    # Step 3: Assign a conversation model
    r3 = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-c", "/tmp/ap2.txt", BASE + "/api/v1/csrf"]))
    csrf3 = r3["token"]
    r3 = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-X", "PUT",
      "-H", "Content-Type: application/json",
      "-H", "X-CSRF-TOKEN: " + csrf3,
      "-d", '{"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.3,"max_tokens":2000,"timeout":60,"retry_count":1,"enabled":true}',
      BASE + "/api/v1/admin/assignments/conversation"]))
    print("Assignment:", r3)

    # Assign embedding model
    r3b = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-c", "/tmp/ap2.txt", BASE + "/api/v1/csrf"]))
    csrf3b = r3b["token"]
    r3b = json.loads(curl(["curl", "-s", "-b", "/tmp/ap2.txt", "-X", "PUT",
      "-H", "Content-Type: application/json",
      "-H", "X-CSRF-TOKEN: " + csrf3b,
      "-d", '{"model":"text-embedding-3-small","temperature":0,"max_tokens":256,"timeout":30,"retry_count":1,"enabled":true}',
      BASE + "/api/v1/admin/assignments/embedding"]))
    print("Embedding assignment:", r3b)
else:
    print("Failed to sync models:", r2)