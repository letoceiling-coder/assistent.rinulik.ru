#!/usr/bin/env python3
import subprocess, json, os

BASE = "https://assistent.rinulik.ru"
CK = "/tmp/am2.txt"

def curl(method, path, data=None):
    out = subprocess.run(["curl", "-s", "-b", CK, "-c", CK, "-X", method,
      "-H", "Content-Type: application/json", BASE + "/api/v1/" + path,
      *(("-d", json.dumps(data)) if data else [])], capture_output=True).stdout
    return json.loads(out) if out else {}

def csrf():
    subprocess.run(["curl", "-s", "-c", CK, BASE + "/api/v1/csrf"], capture_output=True)
    r = json.loads(subprocess.run(["curl", "-s", "-b", CK, BASE + "/api/v1/csrf"], capture_output=True).stdout)
    return r["token"]

r = curl("POST", "login", {"email":"dsc-23@yandex.ru","password":"AdminPass123"})
print("Admin:", r.get("user",{}).get("email","FAIL"))
if not r.get("user"): exit(1)

assignments = {
    "conversation": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.3,"max_tokens":2000,"timeout":60,"retry_count":1,"enabled":True},
    "embedding": {"model":"text-embedding-3-small","temperature":0,"max_tokens":256,"timeout":30,"retry_count":1,"enabled":True},
    "knowledge_processing": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.1,"max_tokens":4000,"timeout":90,"retry_count":1,"enabled":True},
    "knowledge_generator": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.3,"max_tokens":4000,"timeout":90,"retry_count":1,"enabled":True},
    "assistant_generator": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.4,"max_tokens":4000,"timeout":90,"retry_count":1,"enabled":True},
    "lead_detection": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.1,"max_tokens":1000,"timeout":30,"retry_count":1,"enabled":True},
    "summary": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.2,"max_tokens":2000,"timeout":60,"retry_count":1,"enabled":True},
    "grounding": {"model":"google/gemini-2.0-flash-lite-preview-02-05:free","temperature":0.1,"max_tokens":500,"timeout":30,"retry_count":1,"enabled":True},
}
for p,c in assignments.items():
    r = curl("PUT", "admin/assignments/" + p, c)
    print(f"  {p}: {r.get('ok', r.get('message','ERROR'))}")

s = curl("GET", "admin/settings")
for a in s.get("assignments",[]):
    print(f"  {a['purpose']}: {a['model']} enabled={a['enabled']}")
print("DONE")