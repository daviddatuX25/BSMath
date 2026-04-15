<?php
/**
 * BSMath Admin SPA - Database Connection
 * Uses MySQLi with JSON error envelope
 */

header('Content-Type: application/json; charset=utf-8');

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
