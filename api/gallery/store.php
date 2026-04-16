<?php
// api/gallery/store.php
// Handles image file upload + metadata for gallery.
// Receives multipart/form-data (NOT JSON).
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

$userId = (int) $_SESSION['user_id'];
$title  = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');

if ($title === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Title is required']);
    exit;
}

// ── File validation ───────────────────────────────────────────────────
if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Image file is required']);
    exit;
}

$file = $_FILES['image'];
$maxSize = 5 * 1024 * 1024; // 5 MB
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

// ── Safe filename + move ──────────────────────────────────────────────
// WHY: Use a unique prefix to avoid name collisions. Keep the original extension
// so browsers render it correctly.
$ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
$safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$filename = uniqid() . '_' . $safe . '.' . $ext;
$uploadDir = __DIR__ . '/../../uploads/gallery/';
$uploadPath = $uploadDir . $filename;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Failed to save file']);
    exit;
}

$imageUrl = 'uploads/gallery/' . $filename;

// ── Insert into DB ───────────────────────────────────────────────────
$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO gallery (title, image_url, description, uploaded_by) VALUES (?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'sssi', $title, $imageUrl, $description, $userId);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'gallery', "Uploaded gallery: {$title}", 'gallery', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'title' => $title, 'image_url' => $imageUrl],
    'error'   => null,
]);
