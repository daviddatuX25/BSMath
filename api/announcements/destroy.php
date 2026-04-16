<?php
// api/announcements/destroy.php
// Deletes an announcement by id. RBAC: all 3 roles may delete.

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = (int) ($body['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id is required']);
    exit;
}

// Fetch the title BEFORE delete so the activity log can name it.
// $id is already cast to int, so inline interpolation is injection-safe here,
// but we use a prepared statement for consistency with the rest of the codebase.
$titleStmt = mysqli_prepare($conn, 'SELECT title FROM announcements WHERE id = ? LIMIT 1');
mysqli_stmt_bind_param($titleStmt, 'i', $id);
mysqli_stmt_execute($titleStmt);
mysqli_stmt_bind_result($titleStmt, $titleValue);
$hasRow = mysqli_stmt_fetch($titleStmt);
mysqli_stmt_close($titleStmt);

$title = $hasRow ? $titleValue : "id:{$id}";

$stmt = mysqli_prepare($conn, 'DELETE FROM announcements WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Announcement not found']);
    exit;
}

log_activity($conn, $userId, 'announcement', "Deleted announcement: {$title}", 'announcements', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);