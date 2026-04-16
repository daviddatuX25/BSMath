<?php
require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

$role = $_SESSION['role'] ?? '';
if (!in_array($role, ['admin', 'dean'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$userId      = (int) $_SESSION['user_id'];
$body        = json_decode(file_get_contents('php://input'), true) ?? [];
$title       = trim($body['title']       ?? '');
$description = trim($body['description'] ?? '');
$event_date  = trim($body['event_date']  ?? '');
$event_time  = trim($body['event_time']  ?? '') ?: null;
$location    = trim($body['location']    ?? '') ?: null;

if ($title === '' || $event_date === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Title and event date are required']);
    exit;
}

// Validate date format YYYY-MM-DD
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $event_date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid date format. Use YYYY-MM-DD']);
    exit;
}

$status = 'pending'; // hard-coded — Dean approves in Phase 4

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO events (title, description, event_date, event_time, location, status, author_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'ssssssi',
    $title, $description, $event_date, $event_time, $location, $status, $userId
);
mysqli_stmt_execute($stmt);
$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'event', "Created event: {$title}", 'events', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'title' => $title, 'status' => $status],
    'error'   => null,
]);