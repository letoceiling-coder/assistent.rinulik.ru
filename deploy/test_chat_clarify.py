#!/usr/bin/env python3
import subprocess, json, uuid, time

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

def csrf_tok(cfile):
    r = json.loads(curl(["curl", "-s", "-b", cfile, "-c", cfile, BASE + "/api/v1/csrf"]))
    return r["token"]

# Login as test8
r = json.loads(curl(["curl", "-s", "-c", "/tmp/t8b.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8b.txt", "-c", "/tmp/t8b.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test8@example.com","password":"Abcdef12"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

# Create conversation for assistant 6
t = csrf_tok("/tmp/t8b.txt")
r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8b.txt", "-c", "/tmp/t8b.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", '{}', BASE + "/api/v1/assistants/6/test"]))
conv_id = r.get("id")
print("Conversation created:", conv_id)

# Ask a vague question not fully in KB - should trigger clarification
question = "Хочу видео для рекламы, но не знаю какой формат подойдёт"
t = csrf_tok("/tmp/t8b.txt")
r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8b.txt", "-c", "/tmp/t8b.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", json.dumps({"content": question, "request_id": str(uuid.uuid4())}, ensure_ascii=False),
  BASE + "/api/v1/conversations/" + str(conv_id) + "/messages"]))
print("Message sent:", r.get("status"))

for i in range(25):
    time.sleep(3)
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8b.txt", "-c", "/tmp/t8b.txt", BASE + "/api/v1/conversations/" + str(conv_id)]))
    msgs = r.get("messages", [])
    assistant_msgs = [m for m in msgs if m["role"] == "assistant"]
    if assistant_msgs:
        last = assistant_msgs[-1]
        print("\n=== ASSISTANT REPLY ===")
        print(last["content"][:900])
        break
    if i == 24:
        print("No assistant reply. Messages:", [(m["role"], m["status"]) for m in msgs])
