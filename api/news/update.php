<?php
// api/news/update.php
// Updates title/content/image_url/status for an existing news article.
// Status is NOT hard-coded here — admin explicitly controls published/draft/archived.
// RBAC: admin only.

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

$role = $_SESSION['role'] ?? '';
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$userId    = (int) $_SESSION['user_id'];
$body      = json_decode(file_get_contents('php://input'), true) ?? [];
$id        = (int) ($body['id']        ?? 0);
$title     = trim($body['title']       ?? '');
$content   = trim($body['content']     ?? '');
$image_url = trim($body['image_url']   ?? '') ?: null;
$status    = $body['status']           ?? '';

// Whitelist the status values allowed for news (different from announcements!)
if (!in_array($status, ['published', 'draft', 'archived'], true)) {
    $status = 'draft'; // safe fallback
}

if ($id <= 0 || $title === '' || $content === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id, title, and content are required']);
    exit;
}

// Validate image_url if provided
if ($image_url !== null && !preg_match('/^https?:\/\//i', $image_url)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'image_url must start with http:// or https://']);
    exit;
}

$stmt = mysqli_prepare(
    $conn,
    'UPDATE news SET title = ?, content = ?, image_url = ?, status = ? WHERE id = ?'
);
mysqli_stmt_bind_param($stmt, 'ssssi', $title, $content, $image_url, $status, $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    // Distinguish "row not found" from "no changes"
    $checkStmt = mysqli_prepare($conn, 'SELECT id FROM news WHERE id = ? LIMIT 1');
    mysqli_stmt_bind_param($checkStmt, 'i', $id);
    mysqli_stmt_execute($checkStmt);
    mysqli_stmt_store_result($checkStmt);
    $exists = mysqli_stmt_num_rows($checkStmt) > 0;
    mysqli_stmt_close($checkStmt);

    if (!$exists) {
        http_response_code(404);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'News article not found']);
        exit;
    }
}

log_activity($conn, $userId, 'news', "Updated news: {$title}", 'news', $id);
echo json_encode(['success' => true, 'data' => null, 'error' => null]);
