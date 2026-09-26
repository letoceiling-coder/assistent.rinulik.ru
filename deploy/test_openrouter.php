<?php
require '/var/www/html/vendor/autoload.php';

$key = getenv('OPENROUTER_API_KEY');
echo "Key exists: " . ($key ? 'YES (' . substr($key, 0, 20) . '...)' : 'NO') . "\n";

$ctx = stream_context_create(['http' => ['header' => "Authorization: Bearer $key\r\n", 'timeout' => 15]]);
$result = @file_get_contents('https://openrouter.ai/api/v1/models', false, $ctx);
if ($result) {
    $data = json_decode($result, true);
    echo "OpenRouter OK: " . count($data['data'] ?? []) . " models available\n";
    foreach (array_slice($data['data'] ?? [], 0, 5) as $m) {
        echo "  - {$m['id']}: {$m['name']}\n";
    }
} else {
    echo "OpenRouter FAIL: " . error_get_last()['message'] . "\n";
    
    // Try curl instead
    $ch = curl_init('https://openrouter.ai/api/v1/models');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $key]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $result2 = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    echo "Curl result: HTTP $httpCode, error: $error\n";
    if ($result2) {
        $data = json_decode($result2, true);
        echo "Models via curl: " . count($data['data'] ?? []) . "\n";
    }
}