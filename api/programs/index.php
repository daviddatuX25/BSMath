<?php
// api/programs/index.php
// GET — returns all programs. Admin and Program Head only.

require_once __DIR__ . '/../connect.php';

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

$result = mysqli_query($conn, '
    SELECT p.id, p.name, p.code, p.description, p.status, p.created_at, u.name AS created_by_name
    FROM programs p
    JOIN users u ON u.id = p.created_by
    ORDER BY p.created_at DESC
');

$programs = [];
while ($row = mysqli_fetch_assoc($result)) {
    $programs[] = [
        'id'              => (int) $row['id'],
        'name'            => $row['name'],
        'code'            => $row['code'],
        'description'     => $row['description'],
        'status'          => $row['status'],
        'created_at'      => $row['created_at'],
        'created_by_name' => $row['created_by_name'],
    ];
}

echo json_encode(['success' => true, 'data' => $programs, 'error' => null]);
