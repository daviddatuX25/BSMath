<?php
// api/announcements/store.php
// Creates a new announcement. All 3 roles may create.
// Status is always 'pending' on creation — approval is Phase 4's job.

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

$userId   = (int) $_SESSION['user_id'];
$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$title    = trim($body['title']    ?? '');
$content  = trim($body['content']  ?? '');
$priority = $body['priority']      ?? 'normal';

// Whitelist priority so the client cannot smuggle arbitrary values into the enum column
if (!in_array($priority, ['low', 'normal', 'high'], true)) {
    $priority = 'normal';
}

if ($title === '' || $content === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Title and content are required']);
    exit;
}

$status = 'pending'; // hard-coded — admins can edit status later via update.php

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO announcements (title, content, status, priority, author_id) VALUES (?, ?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'ssssi', $title, $content, $status, $priority, $userId);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'announcement', "Created announcement: {$title}", 'announcements', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'title' => $title, 'status' => $status, 'priority' => $priority],
    'error'   => null,
]);