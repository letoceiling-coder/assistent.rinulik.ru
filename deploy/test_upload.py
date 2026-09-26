#!/usr/bin/env python3
import subprocess, json, sys

BASE = "https://assistent.rinulik.ru"
CK = "/tmp/utest2.txt"

def curl(args):
    return subprocess.run(args, capture_output=True).stdout

# Login
t = json.loads(curl(["curl","-s","-c",CK,BASE+"/api/v1/csrf"]))["token"]
r = json.loads(curl(["curl","-s","-b",CK,"-c",CK,"-X","POST",
  "-H","Content-Type: application/json",
  "-H","X-CSRF-TOKEN: "+t,
  "-d",'{"email":"test9@example.com","password":"Abcdef12"}',
  BASE+"/api/v1/login"]))
print("Login:", r.get("user",{}).get("email","FAIL"))
if not r.get("user"): sys.exit(1)

# Create KB
t2 = json.loads(curl(["curl","-s","-b",CK,BASE+"/api/v1/csrf"]))["token"]
r2 = json.loads(curl(["curl","-s","-b",CK,"-c",CK,"-X","POST",
  "-H","Content-Type: application/json",
  "-H","X-CSRF-TOKEN: "+t2,
  "-d",'{"name":"UploadTest","description":"test"}',
  BASE+"/api/v1/knowledge"]))
kb = r2.get("id")
print("KB:", kb)
if not kb: sys.exit(1)

# Upload file with files[]
t3 = json.loads(curl(["curl","-s","-b",CK,BASE+"/api/v1/csrf"]))["token"]
r3 = json.loads(curl(["curl","-s","-b",CK,"-X","POST",
  "-H","X-CSRF-TOKEN: "+t3,
  "-F","files[]=@/tmp/test_upload.txt",
  BASE+f"/api/v1/knowledge/{kb}/upload"]))
print("Upload:", json.dumps(r3, indent=2, ensure_ascii=False))

if r3.get("documents"):
    print("\nSUCCESS: files[] upload works!")
else:
    print("\nFAILED:", r3)