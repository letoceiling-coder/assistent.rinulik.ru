#!/usr/bin/env python3
import subprocess, json, sys

BASE = "https://assistent.rinulik.ru"
cookies = "/tmp/ptest.txt"

def api(path, method="GET", data=None):
    args = ["curl", "-s", "-b", cookies, "-c", cookies]
    if method == "POST":
        args += ["-X", "POST"]
    if data:
        args += ["-H", "Content-Type: application/json"]
        args += ["-H", "X-CSRF-TOKEN: " + csrf]
        args += ["-d", json.dumps(data)]
    args += [BASE + "/api/v1/" + path]
    r = subprocess.run(args, capture_output=True)
    return json.loads(r.stdout)

# Step 1: get CSRF
csrf = json.loads(subprocess.run(["curl", "-s", "-c", cookies, BASE + "/api/v1/csrf"], capture_output=True).stdout)["token"]
print("CSRF:", csrf)

# Step 2: register with 8-char password
r = api("register", "POST", {
    "name": "Test8",
    "email": "test8@example.com",
    "password": "Abcdef12",
    "password_confirmation": "Abcdef12"
})
print("REGISTER:", json.dumps(r, indent=2, ensure_ascii=False))

if r.get("user"):
    print("SUCCESS: password validation with 8 chars works!")
else:
    print("ERROR:", r)
    sys.exit(1)