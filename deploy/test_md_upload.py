#!/usr/bin/env python3
import subprocess, json

BASE = "https://assistent.rinulik.ru"
CK = "/tmp/mdu2.txt"
SAMPLE = "/tmp/test_kb.md"

with open(SAMPLE, "w") as f:
    f.write("# Тестовая база знаний\n\n## Услуги\n- Консультация: 1000 руб\n- Диагностика: 2000 руб\n\n## Контакты\nТелефон: +7-999-123-45-67")

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Step-by-step with shared cookie jar
t = json.loads(curl(["curl", "-s", "-c", CK, BASE + "/api/v1/csrf"]))["token"]
r = json.loads(curl(["curl", "-s", "-b", CK, "-c", CK, "-X", "POST",
  "-H", "Content-Type: application/json",
  "-H", "X-CSRF-TOKEN: " + t,
  "-d", '{"email":"test9@example.com","password":"Abcdef12"}',
  BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAIL"))
if not r.get("user"): exit(1)

t2 = json.loads(curl(["curl", "-s", "-b", CK, BASE + "/api/v1/csrf"]))["token"]
r2 = json.loads(curl(["curl", "-s", "-b", CK, "-c", CK, "-X", "POST",
  "-H", "Content-Type: application/json",
  "-H", "X-CSRF-TOKEN: " + t2,
  "-d", '{"name":"MD Test","description":"Testing .md"}',
  BASE + "/api/v1/knowledge"]))
kb_id = r2.get("id")
if not kb_id:
    print("KB create failed:", r2)
    exit(1)
print(f"KB: {kb_id}")

t3 = json.loads(curl(["curl", "-s", "-b", CK, BASE + "/api/v1/csrf"]))["token"]
r3 = json.loads(curl(["curl", "-s", "-b", CK, "-X", "POST",
  "-H", "X-CSRF-TOKEN: " + t3,
  "-F", "file=@" + SAMPLE,
  BASE + f"/api/v1/knowledge/{kb_id}/upload"]))
print("Upload .md:", json.dumps(r3, indent=2, ensure_ascii=False))
if r3.get("status") == "pending" or r3.get("id"):
    print("\nSUCCESS: .md file accepted!")
else:
    print("\nFAILED:", r3)