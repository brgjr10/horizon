<?php
/**
 * Direct Appwrite bootstrap script
 * Creates project, database, collections, and API key
 * Run from inside the Appwrite container
 */

require __DIR__ . '/vendor/autoload.php';

use Appwrite\SDK\API\Project;
use Appwrite\SDK\API\Database;
use Appwrite\SDK\API\Collection;
use Appwrite\SDK\API\Key;

// Get env vars
$opensslKey = getenv('_APP_OPENSSL_KEY_V1');
echo "OpenSSL key: " . $opensslKey . " (len: " . strlen($opensslKey) . ")\n";

// Check if we can load the Appwrite application context
$appPath = '/usr/src/code';
chdir($appPath);

// Try to bootstrap Appwrite
$config = [
    'root' => '/usr/src/code',
    'storage' => '/usr/src/code/storage',
    'cache' => '/tmp',
    'database' => 'mariadb',
    'db_host' => 'horizon-mariadb',
    'db_port' => 3306,
    'db_schema' => 'appwrite',
    'db_user' => 'appwrite',
    'db_pass' => 'appwrite',
    'db_root_pass' => 'appwrite',
    'redis_host' => 'horizon-redis',
    'redis_port' => 6379,
    'openssl_key_v1' => $opensslKey,
    'env' => 'development',
];

// Try to use the Database class directly
$db = new \Utopia\Database\Database(
    new \Utopia\Database\Adapter\MariaDB(
        '127.0.0.1',
        3306,
        'appwrite',
        'appwrite',
        'appwrite'
    ),
    new \Utopia\Database\Serializer(
        new \Appwrite\Frontend\Formatter\Size(1)
    ),
    new \Utopia\Database\Parser\Schema(),
    new \Appwrite\Hook\HooksManager(),
    true,
    '',
    new \Appwrite\Log\Audit\Event(''),
    [],
    $config
);

echo "Database connected\n";

// Actually, let me try a simpler approach - just use mysql to insert data
echo "\nThis approach is too complex. Let me try direct SQL.\n";
