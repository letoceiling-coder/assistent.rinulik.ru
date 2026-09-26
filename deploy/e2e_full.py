#!/usr/bin/env python3
import subprocess, json, sys, time

BASE = "https://assistent.rinulik.ru"
COOKIE = "/tmp/e2e3.txt"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

def api(method, path, data=None):
    csrf = json.loads(curl(["curl", "-s", "-b", COOKIE, BASE + "/api/v1/csrf"]))["token"]
    args = ["curl", "-s", "-b", COOKIE, "-c", COOKIE, "-X", method,
      "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf]
    if data:
        args += ["-d", json.dumps(data)]
    args += [BASE + "/api/v1/" + path]
    return json.loads(subprocess.run(args, capture_output=True).stdout)

# Login
r = api("POST", "login", {"email": "test9@example.com", "password": "Abcdef12"})
if not r.get("user"):
    print("Login FAILED:", r)
    sys.exit(1)
print(f"Login: {r['user']['name']}")

# 1. Create KB
r = api("POST", "knowledge", {"name": "Test KB", "description": "test"})
kb_id = r["id"]
print(f"1. KB: {kb_id}")

# 2. Add text
r = api("POST", f"knowledge/{kb_id}/text", {
    "name": "services.txt", "text": "Косметический ремонт от 5000 руб/м2. Капитальный ремонт от 15000 руб/м2. Телефон +7-495-123-45-67.", "draft": False})
print(f"2. Text doc: {r.get('status')}")

# 3. Upload file
with open("/tmp/e2e_test.txt", "w") as f:
    f.write("Дизайн-проект 3000 руб/м2. Гарантия 12 месяцев.")
csrf = json.loads(curl(["curl", "-s", "-b", COOKIE, BASE + "/api/v1/csrf"]))["token"]
r = json.loads(curl(["curl", "-s", "-b", COOKIE, "-c", COOKIE, "-X", "POST",
  "-H", "X-CSRF-TOKEN: " + csrf, "-F", "file=@/tmp/e2e_test.txt",
  BASE + f"/api/v1/knowledge/{kb_id}/upload"]))
print(f"3. File upload: ID={r.get('id')} status={r.get('status')}")

# 4. Create assistant
r = api("POST", "assistants", {
    "name": "Test Asst", "goal": "test",
    "settings": {"style": "Дружелюбно", "greeting": "Привет!", "context_messages": 10, "max_length": 2000},
    "knowledge_base_ids": [kb_id]})
asst_id = r["id"]
print(f"4. Assistant: {asst_id}")

# 5. Wait for processing
print("5. Processing...")
for i in range(20):
    time.sleep(3)
    r = api("GET", f"knowledge/{kb_id}")
    st = r["status"]
    rd = sum(1 for d in r.get("documents",[]) if d["status"]=="ready")
    fl = sum(1 for d in r.get("documents",[]) if d["status"]=="failed")
    print(f"   KB: {st}, ready: {rd}, failed: {fl}")
    if fl: print(f"   ERR: {[d.get('error') for d in r['documents'] if d['status']=='failed']}"); sys.exit(1)
    if st=="ready" or st=="failed": break

# 6. Conversation
r = api("POST", f"assistants/{asst_id}/test")
conv_id = r["id"]
api("POST", f"conversations/{conv_id}/messages", {"content":"Сколько стоит капитальный ремонт?","request_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"})
print(f"6. Q sent, waiting for AI...")

for i in range(30):
    time.sleep(2)
    r = json.loads(curl(["curl", "-s", "-b", COOKIE, BASE + f"/api/v1/conversations/{conv_id}"]))
    ai = [m for m in r.get("messages",[]) if m["role"]=="assistant" and m["status"]=="processed"]
    if ai:
        resp = ai[-1]
        print(f"\n7. AI Response: {resp['content'][:200]}")
        meta = resp.get("metadata") or {}
        chunks = meta.get("chunks", [])
        print(f"   Model: {meta.get('model','?')}")
        print(f"   Chunks: {len(chunks)}")
        for c in chunks:
            print(f"     - Doc #{c.get('document_id')} ({float(c.get('similarity',0))*100:.0f}% match)")
        break
    if i == 29:
        print("   No response received")

print("\n=== E2E COMPLETE ===")