#!/usr/bin/env python3
import subprocess, json, uuid, time

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

def csrf_tok(cfile):
    r = json.loads(curl(["curl", "-s", "-b", cfile, "-c", cfile, BASE + "/api/v1/csrf"]))
    return r["token"]

# Login as test8
r = json.loads(curl(["curl", "-s", "-c", "/tmp/t8h.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8h.txt", "-c", "/tmp/t8h.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test8@example.com","password":"Abcdef12"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

t = csrf_tok("/tmp/t8h.txt")
r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8h.txt", "-c", "/tmp/t8h.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", '{}', BASE + "/api/v1/assistants/6/test"]))
conv_id = r.get("id")
print("Conversation created:", conv_id)

def send(content):
    t = csrf_tok("/tmp/t8h.txt")
    curl(["curl", "-s", "-b", "/tmp/t8h.txt", "-c", "/tmp/t8h.txt", "-X", "POST",
      "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
      "-d", json.dumps({"content": content, "request_id": str(uuid.uuid4())}, ensure_ascii=False),
      BASE + "/api/v1/conversations/" + str(conv_id) + "/messages"])

def get_last_assistant():
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/t8h.txt", "-c", "/tmp/t8h.txt", BASE + "/api/v1/conversations/" + str(conv_id)]))
    msgs = [m for m in r.get("messages", []) if m["role"] == "assistant"]
    return msgs[-1]["content"] if msgs else None

def wait_reply():
    for i in range(25):
        time.sleep(3)
        content = get_last_assistant()
        # count assistant messages to ensure a new one
        return content

# Turn 1
send("Мне нужен рекламный ролик для кофейни")
time.sleep(12)
print("=== TURN 1 ===")
print(wait_reply()[:400])

# Turn 2 - reference previous context
send("Хорошо, а можно ли в этом же ролике заменить моё лицо?")
time.sleep(12)
print("\n=== TURN 2 (should reference coffee shop) ===")
print(wait_reply()[:400])
