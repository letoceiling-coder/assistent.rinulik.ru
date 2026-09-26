#!/usr/bin/env python3
import subprocess, json, uuid

BASE = "https://assistent.rinulik.ru"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Login as test8
r = json.loads(curl(["curl", "-s", "-c", "/tmp/ga.txt", BASE + "/api/v1/csrf"]))
csrf = r["token"]
r = json.loads(curl(["curl", "-s", "-b", "/tmp/ga.txt", "-c", "/tmp/ga.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf,
  "-d", '{"email":"test8@example.com","password":"Abcdef12"}', BASE + "/api/v1/login"]))
print("Login:", r.get("user", {}).get("email", "FAILED"), r.get("message", ""))
if not r.get("user"):
    exit(1)

# Get fresh CSRF
r = json.loads(curl(["curl", "-s", "-b", "/tmp/ga.txt", "-c", "/tmp/ga.txt", BASE + "/api/v1/csrf"]))
csrf2 = r["token"]

# Call assistants/generate
payload = {
    "description": "Мы — автосалон «АвтоМир» в Москве, продаём автомобили с пробегом. Помогаем с подбором машины, обменом (trade-in), оформлением кредита и рассрочки, выкупаем авто. Клиенты ищут готовый автомобиль с сайта: спрашивают про конкретные машины, цену, состояние, возможность кредита. Агент должен отвечать на вопросы по автомобилям, уточнять потребности клиента (бюджет, тип авто, способ оплаты, есть ли авто на обмен), формировать доверие к салону и главное — получать номер телефона и приглашать клиента на визит в салон. Точные условия по кредиту не называть — это уточняют менеджер при звонке. Тон — живой и дружелюбный, как настоящий менеджер продаж.",
    "name": "Консультант автосалона",
    "business_type": "auto",
    "request_id": str(uuid.uuid4()),
}
r2 = json.loads(curl(["curl", "-s", "-b", "/tmp/ga.txt", "-c", "/tmp/ga.txt", "-X", "POST",
  "-H", "Content-Type: application/json", "-H", "X-CSRF-TOKEN: " + csrf2,
  "-d", json.dumps(payload, ensure_ascii=False), BASE + "/api/v1/assistants/generate"]))
print("Generate result:", json.dumps(r2, indent=2, ensure_ascii=False))
