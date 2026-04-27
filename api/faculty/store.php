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

$userId  = (int) $_SESSION['user_id'];
$isMultipart = isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false;

if ($isMultipart) {
    $name           = trim($_POST['name']           ?? '');
    $email          = trim($_POST['email']          ?? '');
    $position       = trim($_POST['position']       ?? '');
    $department     = trim($_POST['department']     ?? '');
    $specialization = trim($_POST['specialization'] ?? '');
    $status         = $_POST['status']              ?? 'active';
    $hasImage       = !empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
} else {
    $body           = json_decode(file_get_contents('php://input'), true) ?? [];
    $name           = trim($body['name']           ?? '');
    $email          = trim($body['email']           ?? '');
    $position       = trim($body['position']        ?? '');
    $department     = trim($body['department']     ?? '');
    $specialization = trim($body['specialization'] ?? '');
    $status         = $body['status']               ?? 'active';
    $hasImage       = false;
}

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Name is required']);
    exit;
}

if (!in_array($status, ['active', 'inactive'], true)) {
    $status = 'active';
}

$imageUrl = '';
if ($hasImage) {
    $file = $_FILES['image'];
    $maxSize = 5 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'File must be under 5 MB']);
        exit;
    }
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Only JPG, PNG, GIF, and WebP images allowed']);
        exit;
    }
    $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename  = uniqid() . '_' . $safe . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/faculty/';
    $uploadPath = $uploadDir . $filename;
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $imageUrl = '/uploads/faculty/' . $filename;
    }
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
