<?php
// api/faculty/destroy.php
// Deletes a faculty member. Admin only.

require_once __DIR__ . '/../connect.php';
require_once __DIR__ . '/../helpers/log_activity.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if ($_SESSION['role'] !== 'admin') {
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

$fetchResult = mysqli_query($conn, "SELECT name FROM faculty WHERE id = {$id} LIMIT 1");
$row = mysqli_fetch_assoc($fetchResult);
$name = $row['name'] ?? "id:{$id}";

$stmt = mysqli_prepare($conn, 'DELETE FROM faculty WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Faculty not found']);
    exit;
}

log_activity($conn, $userId, 'faculty', "Deleted faculty: {$name}", 'faculty', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
