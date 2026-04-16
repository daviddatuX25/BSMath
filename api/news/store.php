<?php
// api/news/store.php
// Creates a new news article. Status is always 'draft' on creation.
// Admin publishes manually via update.php.
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
$title     = trim($body['title']     ?? '');
$content   = trim($body['content']   ?? '');
$image_url = trim($body['image_url'] ?? '') ?: null;

if ($title === '' || $content === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Title and content are required']);
    exit;
}

// Validate image_url if provided — must look like a URL (starts with http:// or https://)
if ($image_url !== null && !preg_match('/^https?:\/\//i', $image_url)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'image_url must start with http:// or https://']);
    exit;
}

$status = 'draft'; // New articles are drafts — admin publishes manually via edit

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO news (title, content, image_url, status, author_id) VALUES (?, ?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'ssssi', $title, $content, $image_url, $status, $userId);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'news', "Created news: {$title}", 'news', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'title' => $title, 'status' => $status],
    'error'   => null,
]);
