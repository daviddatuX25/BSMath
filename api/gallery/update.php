<?php
// api/gallery/update.php
// Updates gallery title/description, optionally replaces image file.
// RBAC: admin and program_head only.

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if (!in_array($_SESSION['role'], ['admin', 'program_head'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

// Read both JSON body AND multipart (gallery uses multipart for file replacement)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'multipart/form-data') !== false) {
    $id    = (int) ($_POST['id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $hasFile = !empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
} else {
    $body  = json_decode(file_get_contents('php://input'), true) ?? [];
    $id    = (int) ($body['id'] ?? 0);
    $title = trim($body['title'] ?? '');
    $description = trim($body['description'] ?? '');
    $hasFile = false;
}

$userId = (int) $_SESSION['user_id'];

if ($id <= 0 || $title === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id and title are required']);
    exit;
}

// ── Optional file replacement ────────────────────────────────────────
$imageUrl = null;
if ($hasFile) {
    $file = $_FILES['image'];
    $maxSize = 5 * 1024 * 1024;
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'File must be under 5 MB']);
        exit;
    }
    if (!in_array($file['type'], $allowedTypes, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Only JPG, PNG, GIF, and WebP images allowed']);
        exit;
    }

    $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename  = uniqid() . '_' . $safe . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/gallery/';
    $uploadPath = $uploadDir . $filename;

    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $imageUrl = 'uploads/gallery/' . $filename;
    }
}

// ── Build UPDATE query ───────────────────────────────────────────────
if ($imageUrl !== null) {
    $stmt = mysqli_prepare(
        $conn,
        'UPDATE gallery SET title = ?, description = ?, image_url = ? WHERE id = ?'
    );
    mysqli_stmt_bind_param($stmt, 'sssi', $title, $description, $imageUrl, $id);
} else {
    $stmt = mysqli_prepare(
        $conn,
        'UPDATE gallery SET title = ?, description = ? WHERE id = ?'
    );
    mysqli_stmt_bind_param($stmt, 'ssi', $title, $description, $id);
}

mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Gallery item not found']);
    exit;
}

log_activity($conn, $userId, 'gallery', "Updated gallery: {$title}", 'gallery', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
