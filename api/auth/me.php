<?php
/**
 * BSMath Admin SPA - Current User Endpoint
 * GET — returns the currently logged-in user from session.
 * Returns: { "success": true, "data": { id, name, email, role }, "error": null }
 *       or: { "success": false, "data": null, "error": "Not authenticated" }  (HTTP 401)
 */

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

// Re-fetch from DB so role is always fresh (session can't carry stale role)
$stmt = $conn->prepare('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    // Session references a deleted user — clear it
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

echo json_encode([
    'success' => true,
    'data'    => [
        'id'    => (int) $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ],
    'error' => null
]);
