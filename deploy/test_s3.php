<?php
require '/var/www/html/vendor/autoload.php';
try {
    $s3 = new Aws\S3\S3Client([
        "version" => "latest",
        "region" => "ru-3",
        "endpoint" => "https://s3.ru-3.storage.selcloud.ru",
        "credentials" => ["key" => "b9e9a8fdd0b34221897bc7be8c79e78b", "secret" => "d32b540bda084917aeea2354f5718399"],
        "use_path_style_endpoint" => true,
        "http" => ["verify" => false]
    ]);
    $buckets = $s3->listBuckets();
    echo "Buckets: " . json_encode(array_column($buckets["Buckets"], "Name")) . "\n";
    
    // Try to upload a test file
    $s3->putObject([
        "Bucket" => "assisrent",
        "Key" => "_test_connection.txt",
        "Body" => "ASSISTENT connection test",
        "ContentType" => "text/plain"
    ]);
    echo "Test file uploaded\n";
    
    // Read it back
    $obj = $s3->getObject(["Bucket" => "assisrent", "Key" => "_test_connection.txt"]);
    echo "Content: " . $obj["Body"] . "\n";
    
    // Clean up
    $s3->deleteObject(["Bucket" => "assisrent", "Key" => "_test_connection.txt"]);
    echo "Test file deleted\n";
    
    echo "S3 OK\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}