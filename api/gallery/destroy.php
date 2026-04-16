<?php
// api/gallery/destroy.php
// Deletes a gallery item and its image file from disk.
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

$body   = json_decode(file_get_contents('php://input'), true);
$id     = (int) ($body['id'] ?? 0);
$userId = (int) $_SESSION['user_id'];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id is required']);
    exit;
}

// Fetch the row to get the image path for file deletion
$fetchResult = mysqli_query($conn, "SELECT title, image_url FROM gallery WHERE id = {$id} LIMIT 1");
$row = mysqli_fetch_assoc($fetchResult);
if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Gallery item not found']);
    exit;
}
$title    = $row['title'];
$imageUrl = $row['image_url'];

// Delete from DB
$stmt = mysqli_prepare($conn, 'DELETE FROM gallery WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Gallery item not found']);
    exit;
}

// Delete the image file from disk (silent fail — DB row is already gone)
if ($imageUrl && file_exists(__DIR__ . '/../../' . $imageUrl)) {
    @unlink(__DIR__ . '/../../' . $imageUrl);
}

log_activity($conn, $userId, 'gallery', "Deleted gallery: {$title}", 'gallery', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
