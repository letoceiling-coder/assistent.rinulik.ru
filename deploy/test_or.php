<?php
$key = getenv('OPENROUTER_API_KEY') ?: 'REPLACE_WITH_YOUR_KEY';

echo "Testing OpenRouter API with key: " . substr($key, 0, 15) . "...\n";

$ch = curl_init('https://openrouter.ai/api/v1/models');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false,
]);
$r = curl_exec($ch);
$info = curl_getinfo($ch);
$err = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $info['http_code'] . "\n";
echo "Error: " . $err . "\n";
echo "Response: " . substr($r ?: '(empty)', 0, 300) . "\n";