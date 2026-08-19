<?php
require '/usr/src/code/vendor/autoload.php';

// Test 1: Store encoding
echo "=== Test 1: Store encode ===\n";
try {
    $store = new \Utopia\Auth\Store();
    $store->setProperty('id', 'test-user-123');
    $store->setProperty('secret', 'my-test-secret');
    $encoded = $store->encode();
    echo "Encoded: '" . $encoded . "'\n";
    echo "Empty: " . (empty($encoded) ? "YES" : "NO") . "\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

// Test 2: json_encode base64
echo "\n=== Test 2: Direct encode ===\n";
$json = json_encode(["id" => "test-user-123", "secret" => "my-test-secret"]);
echo "JSON: $json\n";
echo "Base64: " . base64_encode($json) . "\n";

// Test 3: Check if json_encode throws
echo "\n=== Test 3: JSON_THROW_ON_ERROR ===\n";
try {
    $json2 = json_encode(["id" => "test", "secret" => "value"], JSON_THROW_ON_ERROR);
    echo "OK: $json2\n";
} catch (\JsonException $e) {
    echo "JSON Error: " . $e->getMessage() . "\n";
}

// Test 4: Check PHP error
echo "\n=== Test 4: Error reporting ===\n";
error_reporting(E_ALL);
ini_set('display_errors', 1);
echo "Error reporting: " . error_reporting() . "\n";
echo "display_errors: " . ini_get('display_errors') . "\n";

// Test 5: Check if there's a session store that uses encryption
echo "\n=== Test 5: Check Store types ===\n";
$classes = [
    'Utopia\\Auth\\Store',
    'Appwrite\\Auth\\Store',
    'Utopia\\Auth\\Proof',
];
foreach (\Utopia\CLI\Command::class ? [] : [], '') {
    // skip
}
echo "Utopia\Auth\Store exists: " . (class_exists('Utopia\\Auth\\Store') ? 'YES' : 'NO') . "\n";

// Test 6: Try to create a session via HTTP from inside the container
echo "\n=== Test 6: Internal HTTP test ===\n";
$cmd = 'curl -s -X POST -H "Content-Type: application/json" -H "X-Appwrite-Project: console" -d \'{"email":"admin@horizon.local","password":"Admin123456!"}\' "http://localhost:80/v1/account/sessions/email"';
echo "Running: $cmd\n";
$output = shell_exec($cmd);
echo "Result: " . $output . "\n";
