<?php
/**
 * BSMath Admin SPA - Database Connection
 * Uses MySQLi with JSON error envelope
 */

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // dev only — restrict in production
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$config = [
    'host' => 'localhost',
    'user' => 'root',
    'pass' => '',
    'name' => 'bsmath'
];

$conn = new mysqli(
    $config['host'],
    $config['user'],
    $config['pass'],
    $config['name']
);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'data' => null,
        'error' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset('utf8');
