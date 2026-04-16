<?php
// api/faculty/index.php
// Returns all faculty members. Admin only.

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
    SELECT
        f.id,
        f.name,
        f.email,
        f.position,
        f.department,
        f.specialization,
        f.image_url,
        f.status,
        f.created_at,
        f.updated_at,
        u.name AS created_by_name
    FROM faculty f
    LEFT JOIN users u ON u.id = f.created_by
    ORDER BY f.name ASC
");

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = [
        'id'              => (int) $row['id'],
        'name'            => $row['name'],
        'email'           => $row['email'],
        'position'        => $row['position'],
        'department'      => $row['department'],
        'specialization'  => $row['specialization'],
        'image_url'       => $row['image_url'],
        'status'          => $row['status'],
        'created_at'      => $row['created_at'],
        'updated_at'      => $row['updated_at'],
        'created_by_name' => $row['created_by_name'] ?? 'Unknown',
    ];
}

echo json_encode(['success' => true, 'data' => $items, 'error' => null]);
