#!/bin/bash
# Run on proxy server (neeklo) via SSH tunnel
echo "=== Listening ports ==="
ss -tlnp 2>/dev/null | grep -E '3128|1080|8080|8888|9050' || netstat -tlnp 2>/dev/null | grep -E '3128|1080|8080|8888|9050'
echo "=== Proxy processes ==="
ps aux | grep -iE 'proxy|squid|3proxy|dante|privoxy|tinyproxy|microsocks|gost' | grep -v grep
echo "=== All listening (top) ==="
ss -tlnp 2>/dev/null | head -30
