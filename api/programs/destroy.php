<?php
// api/programs/destroy.php
// POST { "id": 1 }
// Admin and Program Head only.

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

// Fetch name before deleting (for activity log). $id is cast to int — no injection risk.
$nameResult = mysqli_query($conn, "SELECT name FROM programs WHERE id = {$id} LIMIT 1");
$nameRow    = mysqli_fetch_assoc($nameResult);
$name       = $nameRow['name'] ?? "id:{$id}";

$stmt = mysqli_prepare($conn, 'DELETE FROM programs WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Program not found']);
    exit;
}

log_activity($conn, $userId, 'program', "Deleted program: {$name}", 'programs', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
