<?php
// api/users/update.php
// Updates a user account. Admin only.
// Password is optional — only hashed and updated if a new password is provided.

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
$id       = (int) ($body['id']       ?? 0);
$name     = trim($body['name']     ?? '');
$email    = trim($body['email']    ?? '');
$password = $body['password']      ?? ''; // optional — empty means don't change
$role     = $body['role']          ?? 'admin';

if ($id <= 0 || $name === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id, name, and email are required']);
    exit;
}

if (!in_array($role, ['admin', 'dean', 'program_head'], true)) {
    $role = 'admin';
}

// Check email uniqueness (excluding current user)
$checkStmt = mysqli_prepare($conn, 'SELECT id FROM users WHERE email = ? AND id != ?');
mysqli_stmt_bind_param($checkStmt, 'si', $email, $id);
mysqli_stmt_execute($checkStmt);
mysqli_stmt_store_result($checkStmt);
if (mysqli_stmt_num_rows($checkStmt) > 0) {
    mysqli_stmt_close($checkStmt);
    http_response_code(409);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Email already in use by another account']);
    exit;
}
mysqli_stmt_close($checkStmt);

// Build UPDATE query — only include password if a new one was provided
if ($password !== '') {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = mysqli_prepare(
        $conn,
        'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?'
    );
    mysqli_stmt_bind_param($stmt, 'ssssi', $name, $email, $hashedPassword, $role, $id);
} else {
    $stmt = mysqli_prepare(
        $conn,
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?'
    );
    mysqli_stmt_bind_param($stmt, 'sssi', $name, $email, $role, $id);
}

mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'User not found']);
    exit;
}

log_activity($conn, $userId, 'user', "Updated user: {$name} ({$role})", 'users', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
