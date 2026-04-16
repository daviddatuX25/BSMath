<?php
// api/users/store.php
// Creates a new user account. Admin only.
// Password is hashed with password_hash() — never stored in plain text.

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$userId   = (int) $_SESSION['user_id'];
$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$name     = trim($body['name']     ?? '');
$email    = trim($body['email']    ?? '');
$password = $body['password']      ?? '';
$role     = $body['role']          ?? 'admin';

if ($name === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Name, email, and password are required']);
    exit;
}

// Whitelist role — client cannot submit arbitrary values
if (!in_array($role, ['admin', 'dean', 'program_head'], true)) {
    $role = 'admin';
}

// Check email uniqueness
$checkStmt = mysqli_prepare($conn, 'SELECT id FROM users WHERE email = ?');
mysqli_stmt_bind_param($checkStmt, 's', $email);
mysqli_stmt_execute($checkStmt);
mysqli_stmt_store_result($checkStmt);
if (mysqli_stmt_num_rows($checkStmt) > 0) {
    mysqli_stmt_close($checkStmt);
    http_response_code(409);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Email already exists']);
    exit;
}
mysqli_stmt_close($checkStmt);

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $hashedPassword, $role);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'user', "Created user: {$name} ({$role})", 'users', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'name' => $name, 'email' => $email, 'role' => $role],
    'error'   => null,
]);
