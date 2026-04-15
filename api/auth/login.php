<?php
/**
 * BSMath Admin SPA - Login Endpoint
 * POST { "email": "...", "password": "..." }
 * Returns: { "success": true, "data": { id, name, email, role }, "error": null }
 *       or: { "success": false, "data": null, "error": "Invalid credentials" }
 */

require_once __DIR__ . '/../connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Email and password are required']);
    exit;
}

// Parameterized query — prevents SQL injection
$stmt = $conn->prepare('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid credentials']);
    exit;
}

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role']    = $user['role'];
$_SESSION['name']    = $user['name'];

echo json_encode([
    'success' => true,
    'data'    => [
        'id'    => (int) $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ],
    'error' => null
]);
