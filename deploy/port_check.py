#!/usr/bin/env python3
import socket

host = "31.207.5.233"
ports = [22, 80, 443, 3128, 3129, 8080, 8888, 1080, 9090, 3000, 8443, 8081, 81, 8000, 9000, 3127, 3130]

for port in ports:
    s = socket.socket()
    s.settimeout(2)
    try:
        s.connect((host, port))
        print(f"PORT {port} OPEN")
    except Exception as e:
        pass
    finally:
        s.close()
print("SCAN COMPLETE")