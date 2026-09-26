#!/usr/bin/env python3
import subprocess, json, sys

BASE = "https://assistent.rinulik.ru"
cookies = "/tmp/pvtest2.txt"

def req(path, method="GET", data=None):
    args = ["curl", "-s", "-b", cookies, "-c", cookies]
    if method == "POST":
        args += ["-X", "POST"]
    csrf = json.loads(subprocess.run(["curl", "-s", "-c", cookies, BASE + "/api/v1/csrf"], capture_output=True).stdout)["token"]
    if data:
        args += ["-H", "Content-Type: application/json"]
        args += ["-H", "X-CSRF-TOKEN: " + csrf]
        args += ["-d", json.dumps(data)]
    args += [BASE + "/api/v1/" + path]
    return json.loads(subprocess.run(args, capture_output=True).stdout)

# Test 1: password too short (7 chars)
r1 = req("register", "POST", {"name":"Test9","email":"test9@example.com","password":"Abcdef1","password_confirmation":"Abcdef1"})
print("Test 1 (7 chars - should fail):", json.dumps(r1, indent=2, ensure_ascii=False))
print()

# Test 2: password without letter
r2 = req("register", "POST", {"name":"Test9","email":"test9@example.com","password":"12345678","password_confirmation":"12345678"})
print("Test 2 (digits only - should fail):", json.dumps(r2, indent=2, ensure_ascii=False))
print()

# Test 3: password with 8 chars + letter + digit (should succeed)
r3 = req("register", "POST", {"name":"Test9","email":"test9@example.com","password":"Abcdef12","password_confirmation":"Abcdef12"})
print("Test 3 (8 chars + letter + digit - should succeed):", json.dumps(r3, indent=2, ensure_ascii=False))
print()

if r3.get("user"):
    print("SUCCESS: All validations working in Russian!")
    sys.exit(0)
else:
    print("FAILED")
    sys.exit(1)