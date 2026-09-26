#!/usr/bin/env python3
import subprocess, json, uuid, time

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Login as test8
r = json.loads(curl(["curl", "-s", "-c", "/tmp/tck.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test8@example.com","password":"Abcdef12"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

# Create a fresh test conversation for the assistant that HAS a KB (find assistant with kb)
# Get assistants to find the one with knowledge_bases
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", BASE + "/api/v1/assistants"]))
assts = r.get("data", [])
target = None
for a in assts:
    if a.get("knowledge_bases") and len(a["knowledge_bases"]) > 0:
        target = a
        break
if not target:
    print("No assistant with KB found. Assistants:", [(a["name"], len(a.get("knowledge_bases", []))) for a in assts])
    exit(1)
print("Target assistant:", target["name"], "kbs:", [b["id"] for b in target["knowledge_bases"]])

# Get CSRF
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", BASE + "/api/v1/csrf"]))
csrf2 = r["token"]

# Create conversation
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf2,
  "-d", '{}', BASE + "/api/v1/assistants/" + str(target["id"]) + "/test"]))
conv_id = r.get("id")
print("Conversation created:", conv_id, "status:", r.get("status"))

# Send a message
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf2,
  "-d", json.dumps({"content": "Какие услуги вы предоставляете? Расскажите подробнее.", "request_id": str(uuid.uuid4())}, ensure_ascii=False),
  BASE + "/api/v1/conversations/" + str(conv_id) + "/messages"]))
print("Message sent:", r.get("status"))

# Poll for assistant reply
for i in range(20):
    time.sleep(3)
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/tck.txt", "-c", "/tmp/tck.txt", BASE + "/api/v1/conversations/" + str(conv_id)]))
    msgs = r.get("messages", [])
    assistant_msgs = [m for m in msgs if m["role"] == "assistant"]
    if assistant_msgs:
        last = assistant_msgs[-1]
        print("ASSISTANT REPLY:", last["content"][:800])
        meta = last.get("metadata") or {}
        print("chunks used:", len(meta.get("chunks", [])))
        break
    if i == 19:
        print("No assistant reply after timeout. Messages:", [(m["role"], m["status"]) for m in msgs])
