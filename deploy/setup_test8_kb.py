#!/usr/bin/env python3
import subprocess, json, uuid, time

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Login as test8
r = json.loads(curl(["curl", "-s", "-c", "/tmp/s8.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test8@example.com","password":"Abcdef12"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

def csrf_tok():
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", BASE + "/api/v1/csrf"]))
    return r["token"]

# 1. Create knowledge base
t = csrf_tok()
kb_payload = {"name": "Студия видео", "description": "Услуги студии генерации видео"}
r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", json.dumps(kb_payload, ensure_ascii=False), BASE + "/api/v1/knowledge"]))
kb_id = r.get("id")
print("KB created:", kb_id, r.get("name"))

# 2. Add text document
t = csrf_tok()
doc_payload = {
  "name": "Услуги и цены",
  "text": "Студия генерации видео «ВидоМир». Услуги: рекламные ролики от 15000 руб, обучающие видео от 12000 руб, анимация от 20000 руб, монтаж от 5000 руб, контент для соцсетей от 3000 руб. Сроки: рекламный ролик 3-5 дней, обучающее видео 5-7 дней. Замена лица в видео — от 8000 руб. Для заказа нужен сценарий или референс. Работаем по всей России, оплата после согласования. Контакты: +7 (900) 123-45-67, info@videomir.ru."
}
r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", json.dumps(doc_payload, ensure_ascii=False), BASE + "/api/v1/knowledge/" + str(kb_id) + "/text"]))
print("Doc added:", r.get("status"))

# 3. Attach KB to assistant 6
t = csrf_tok()
asst_payload = {"name": "Помощник по видео", "knowledge_base_ids": [kb_id]}
r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", "-X", "PUT",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + t,
  "-d", json.dumps(asst_payload, ensure_ascii=False), BASE + "/api/v1/assistants/6"]))
print("Assistant 6 updated, kbs:", [b["id"] for b in r.get("knowledge_bases", [])])

# 4. Wait for indexing (processing -> ready)
print("Waiting for indexing...")
for i in range(30):
    time.sleep(4)
    r = json.loads(curl(["curl", "-s", "-b", "/tmp/s8.txt", "-c", "/tmp/s8.txt", BASE + "/api/v1/knowledge/" + str(kb_id)]))
    status = r.get("status")
    docs = r.get("documents", [])
    doc_status = docs[0]["status"] if docs else "?"
    print(f"  kb={status} doc={doc_status}")
    if status == "ready" and doc_status == "ready":
        break
print("KB ready. Proceeding to chat test.")
