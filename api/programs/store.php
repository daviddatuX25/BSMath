<?php
// api/programs/store.php
// POST { "name": "...", "code": "...", "description": "..." }
// Admin and Program Head only.
// Note: "name" is the programs table column (schema). Accepts "title" as alias for compatibility.

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
// Accept "name" or "title" (title kept for frontend compatibility)
$name        = trim($body['name']        ?? $body['title']       ?? '');
$code        = strtoupper(trim($body['code'] ?? ''));
$description = trim($body['description'] ?? '');
$userId      = (int) $_SESSION['user_id'];

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Name is required']);
    exit;
}

// Auto-generate code from name if not provided
if ($code === '') {
    // Take uppercase initials (up to 10 chars), strip spaces
    $words = preg_split('/\s+/', $name);
    $code  = strtoupper(implode('', array_map(fn($w) => substr($w, 0, 1), $words)));
    if (strlen($code) < 3) {
        $code = strtoupper(preg_replace('/\s+/', '', substr($name, 0, 10)));
    }
}

$stmt = mysqli_prepare($conn, 'INSERT INTO programs (name, code, description, created_by) VALUES (?, ?, ?, ?)');
mysqli_stmt_bind_param($stmt, 'sssi', $name, $code, $description, $userId);

if (!mysqli_stmt_execute($stmt)) {
    $errNo = mysqli_stmt_errno($stmt);
    mysqli_stmt_close($stmt);
    if ($errNo === 1062) { // Duplicate entry (unique code constraint)
        http_response_code(409);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Program code already exists. Provide a unique code.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Failed to create program']);
    }
    exit;
}

$newId = (int) mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

log_activity($conn, $userId, 'program', "Created program: {$name}", 'programs', $newId);

echo json_encode([
    'success' => true,
    'data'    => ['id' => $newId, 'name' => $name, 'code' => $code, 'description' => $description],
    'error'   => null,
]);
