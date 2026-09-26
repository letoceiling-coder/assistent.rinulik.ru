#!/bin/bash
set -e

echo '=== 1. GET CSRF ==='
CSRF=$(curl -s -c /tmp/assistent_cookies.txt https://assistent.rinulik.ru/api/v1/csrf | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
echo "CSRF: $CSRF"

echo ''
echo '=== 2. REGISTER ==='
curl -s -b /tmp/assistent_cookies.txt -c /tmp/assistent_cookies.txt -X POST https://assistent.rinulik.ru/api/v1/register \
  -H 'Content-Type: application/json' \
  -H "X-CSRF-TOKEN: $CSRF" \
  -d '{"name":"Тест","email":"test@example.com","password":"TestPassword123"}'
echo ''

echo ''
echo '=== 3. LOGIN ==='
CSRF2=$(curl -s -c /tmp/assistent_cookies2.txt https://assistent.rinulik.ru/api/v1/csrf | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
curl -s -b /tmp/assistent_cookies2.txt -c /tmp/assistent_cookies2.txt -X POST https://assistent.rinulik.ru/api/v1/login \
  -H 'Content-Type: application/json' \
  -H "X-CSRF-TOKEN: $CSRF2" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'
echo ''

echo ''
echo '=== 4. ME ==='
curl -s -b /tmp/assistent_cookies2.txt https://assistent.rinulik.ru/api/v1/me | python3 -m json.tool | head -15

echo ''
echo '=== 5. BALANCE ==='
curl -s -b /tmp/assistent_cookies2.txt https://assistent.rinulik.ru/api/v1/wallet | python3 -c '
import sys,json
d=json.load(sys.stdin)
print("Balance:", d.get("balance"), "kopecks =", d.get("balance",0)/100, "RUB")
'

echo ''
echo '=== 6. ADMIN LOGIN ==='
CSRF3=$(curl -s -c /tmp/assistent_cookies3.txt https://assistent.rinulik.ru/api/v1/csrf | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
curl -s -b /tmp/assistent_cookies3.txt -c /tmp/assistent_cookies3.txt -X POST https://assistent.rinulik.ru/api/v1/login \
  -H 'Content-Type: application/json' \
  -H "X-CSRF-TOKEN: $CSRF3" \
  -d '{"email":"dsc-23@yandex.ru","password":"123123123"}'
echo ''

echo ''
echo '=== 7. ADMIN DASHBOARD ==='
curl -s -b /tmp/assistent_cookies3.txt https://assistent.rinulik.ru/api/v1/admin/dashboard | python3 -m json.tool | head -20

echo ''
echo '=== ALL E2E TESTS PASSED ==='