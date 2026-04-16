<?php
// api/approvals/reject.php
// Rejects a pending announcement or event. Dean only.
// Body: { "type": "announcement"|"event", "id": 5 }

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if ($_SESSION['role'] !== 'dean') {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed']);
    exit;
}

$userId   = (int) $_SESSION['user_id'];
$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$type     = $body['type'] ?? '';
$id       = (int) ($body['id'] ?? 0);

if (!in_array($type, ['announcement', 'event'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Type must be "announcement" or "event"']);
    exit;
}
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id is required']);
    exit;
}

$table = $type === 'announcement' ? 'announcements' : 'events';

$checkStmt = mysqli_prepare($conn, "SELECT id, title, status FROM {$table} WHERE id = ?");
mysqli_stmt_bind_param($checkStmt, 'i', $id);
mysqli_stmt_execute($checkStmt);
$checkResult = mysqli_stmt_get_result($checkStmt);
$row = mysqli_fetch_assoc($checkResult);
mysqli_stmt_close($checkStmt);

if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => ucfirst($type) . ' not found']);
    exit;
}
if ($row['status'] !== 'pending') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => ucfirst($type) . ' is not pending (status: ' . $row['status'] . ')']);
    exit;
}

$title = $row['title'];

$stmt = mysqli_prepare(
    $conn,
    "UPDATE {$table} SET status = 'rejected', approved_by = ? WHERE id = ?"
);
mysqli_stmt_bind_param($stmt, 'ii', $userId, $id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'approval', "Rejected {$type}: {$title}", $table, $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
