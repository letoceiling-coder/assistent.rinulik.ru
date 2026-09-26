#!/usr/bin/env python3
import secrets, subprocess, json

secret = secrets.token_hex(32)
print("Secret:", secret)

r = json.loads(subprocess.run([
    "curl", "-s", "-X", "POST",
    "https://api.telegram.org/bot8873862655:AAG3EPVV54oHew1MpqHc18Pb_uRy6l6IAao/setWebhook",
    "-d", "url=https://assistent.rinulik.ru/webhooks/notifications",
    "-d", "secret_token=" + secret,
    "-d", "drop_pending_updates=true"
], capture_output=True).stdout)

print(json.dumps(r, indent=2, ensure_ascii=False))
print("---SAVE---")
print("SECRET=" + secret)