<?php
/**
 * BSMath Admin SPA - Logout Endpoint
 * POST — destroys the current session.
 * Returns: { "success": true, "data": null, "error": null }
 */

require_once __DIR__ . '/../connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}
session_destroy();

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
