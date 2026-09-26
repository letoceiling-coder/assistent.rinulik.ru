#!/usr/bin/env python3
import socket
for host, port in [('10.78.0.2', 1081), ('127.0.0.1', 1080), ('127.0.0.1', 8888)]:
    try:
        s = socket.socket()
        s.settimeout(3)
        s.connect((host, port))
        print(f"{host}:{port} OPEN")
        s.close()
    except Exception as e:
        print(f"{host}:{port} CLOSED ({e})")
