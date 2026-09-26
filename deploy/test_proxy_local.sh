#!/bin/bash
# Run on proxy server (neeklo)
KEY="${OPENROUTER_API_KEY:-REPLACE_WITH_YOUR_KEY}"
echo "=== tinyproxy 127.0.0.1:8888 ==="
curl -s -x http://127.0.0.1:8888 -o /dev/null -w "HTTP status: %{http_code}\n" \
  -H "Authorization: Bearer $KEY" https://openrouter.ai/api/v1/models
echo "=== microsocks 127.0.0.1:1080 ==="
curl -s -x socks5://127.0.0.1:1080 -o /dev/null -w "HTTP status: %{http_code}\n" \
  -H "Authorization: Bearer $KEY" https://openrouter.ai/api/v1/models
echo "=== gost 10.78.0.2:1081 (auth) ==="
curl -s -x socks5://tgbridge:686171289ad5566b158dc6e8580f9666@10.78.0.2:1081 -o /dev/null -w "HTTP status: %{http_code}\n" \
  -H "Authorization: Bearer $KEY" https://openrouter.ai/api/v1/models
