<?php
// api/faculty/store.php
// Creates a new faculty member. Admin only.

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

$userId        = (int) $_SESSION['user_id'];
$body          = json_decode(file_get_contents('php://input'), true) ?? [];
$name          = trim($body['name']          ?? '');
$email         = trim($body['email']         ?? '');
$position      = trim($body['position']      ?? '');
$department    = trim($body['department']    ?? '');
$specialization = trim($body['specialization'] ?? '');
$imageUrl      = trim($body['image_url']     ?? '');
$status        = $body['status']             ?? 'active';

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Name is required']);
    exit;
}

// Whitelist status
if (!in_array($status, ['active', 'inactive'], true)) {
    $status = 'active';
}

// Validate image_url if provided
if ($imageUrl !== '' && !preg_match('/^https?:\/\//i', $imageUrl)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Image URL must start with http:// or https://']);
    exit;
}

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO faculty (name, email, position, department, specialization, image_url, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'sssssssi', $name, $email, $position, $department, $specialization, $imageUrl, $status, $userId);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'faculty', "Created faculty: {$name}", 'faculty', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'name' => $name, 'status' => $status],
    'error'   => null,
]);
