<?php
// api/users/index.php
// Returns all users (WITHOUT password hashes). Admin only.

require_once __DIR__ . '/../connect.php';

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

$result = mysqli_query($conn, "
    SELECT id, email, name, role, created_at, updated_at
    FROM users
    ORDER BY name ASC
");

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = [
        'id'         => (int) $row['id'],
        'email'      => $row['email'],
        'name'       => $row['name'],
        'role'       => $row['role'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $items, 'error' => null]);
