#!/usr/bin/env python3
import subprocess, json, uuid, time

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Login as admin (dsc-23@yandex.ru / 123123123)
r = json.loads(curl(["curl", "-s", "-c", "/tmp/tca.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tca.txt", "-c", "/tmp/tca.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"dsc-23@yandex.ru","password":"123123123"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

# Create a fresh conversation for assistant 5 (has KB 7)
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tca.txt", "-c", "/tmp/tca.txt", BASE + "/api/v1/csrf"]))
csrf2 = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tca.txt", "-c", "/tmp/tca.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf2,
  "-d", '{}', BASE + "/api/v1/assistants/5/test"]))
conv_id = r.get("id")
print("Conversation created:", conv_id)

# Send a message relevant to the KB
r = json.loads(curl(["curl", "-s", "-b", "/tmp/tca.txt", "-c", "/tmp/tca.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf2,
  "-d", json.dumps({"content": "Можно заменить моё лицо в готовом видео? Что для этого нужно?", "request_id": str(uuid.uuid4())}, ensure_ascii=False),
  BASE + "/api/v1/conversations/" + str(conv_id) + "/messages"]))
print("Message sent:", r.get("status"))

for i in range(25):
    time.sleep(3)
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/tca.txt", "-c", "/tmp/tca.txt", BASE + "/api/v1/conversations/" + str(conv_id)]))
    msgs = r.get("messages", [])
    assistant_msgs = [m for m in msgs if m["role"] == "assistant"]
    if assistant_msgs:
        last = assistant_msgs[-1]
        print("\nASSISTANT REPLY:", last["content"][:900])
        meta = last.get("metadata") or {}
        print("\nchunks used:", len(meta.get("chunks", [])))
        for ch in meta.get("chunks", []):
            print("  -", (ch.get("text") or "")[:60])
        break
    if i == 24:
        print("No assistant reply. Messages:", [(m["role"], m["status"]) for m in msgs])
