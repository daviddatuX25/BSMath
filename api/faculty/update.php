<?php
// api/faculty/update.php
// Updates a faculty member. Admin only.

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
$id            = (int) ($body['id'] ?? 0);
$name          = trim($body['name']          ?? '');
$email         = trim($body['email']         ?? '');
$position      = trim($body['position']      ?? '');
$department    = trim($body['department']    ?? '');
$specialization = trim($body['specialization'] ?? '');
$imageUrl      = trim($body['image_url']     ?? '');
$status        = $body['status']             ?? 'active';

if ($id <= 0 || $name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id and name are required']);
    exit;
}

if (!in_array($status, ['active', 'inactive'], true)) {
    $status = 'active';
}

if ($imageUrl !== '' && !preg_match('/^https?:\/\//i', $imageUrl)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Image URL must start with http:// or https://']);
    exit;
}

$stmt = mysqli_prepare(
    $conn,
    'UPDATE faculty SET name = ?, email = ?, position = ?, department = ?, specialization = ?, image_url = ?, status = ? WHERE id = ?'
);
mysqli_stmt_bind_param($stmt, 'sssssssi', $name, $email, $position, $department, $specialization, $imageUrl, $status, $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Faculty not found']);
    exit;
}

log_activity($conn, $userId, 'faculty', "Updated faculty: {$name}", 'faculty', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
