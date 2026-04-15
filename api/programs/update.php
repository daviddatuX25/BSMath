<?php
// api/programs/update.php
// POST { "id": 1, "name": "...", "code": "...", "description": "..." }
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

$body        = json_decode(file_get_contents('php://input'), true);
$id          = (int) ($body['id']          ?? 0);
// Accept "name" or "title" as alias
$name        = trim($body['name']          ?? $body['title']       ?? '');
$code        = strtoupper(trim($body['code'] ?? ''));
$description = trim($body['description']   ?? '');
$userId      = (int) $_SESSION['user_id'];

if ($id <= 0 || $name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'id and name are required']);
    exit;
}

// Build update query — only update code if provided to avoid clobbering unique constraint
if ($code !== '') {
    $stmt = mysqli_prepare($conn, 'UPDATE programs SET name = ?, code = ?, description = ? WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'sssi', $name, $code, $description, $id);
} else {
    $stmt = mysqli_prepare($conn, 'UPDATE programs SET name = ?, description = ? WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'ssi', $name, $description, $id);
}

if (!mysqli_stmt_execute($stmt)) {
    $errNo = mysqli_stmt_errno($stmt);
    mysqli_stmt_close($stmt);
    if ($errNo === 1062) {
        http_response_code(409);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Program code already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Failed to update program']);
    }
    exit;
}

$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    // Could be no change in data — fetch to confirm record exists
    $check = mysqli_query($conn, "SELECT id FROM programs WHERE id = {$id} LIMIT 1");
    if (!mysqli_fetch_assoc($check)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Program not found']);
        exit;
    }
}

log_activity($conn, $userId, 'program', "Updated program: {$name}", 'programs', $id);

echo json_encode(['success' => true, 'data' => null, 'error' => null]);
