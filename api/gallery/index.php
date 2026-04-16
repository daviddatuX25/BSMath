<?php
// api/gallery/index.php
// Returns all gallery images joined with uploader name.
// RBAC: admin and program_head only.

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

$result = mysqli_query($conn, "
    SELECT
        g.id,
        g.title,
        g.image_url,
        g.description,
        g.created_at,
        u.name AS uploaded_by_name
    FROM gallery g
    LEFT JOIN users u ON u.id = g.uploaded_by
    ORDER BY g.created_at DESC
");

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = [
        'id'               => (int) $row['id'],
        'title'            => $row['title'],
        'image_url'        => $row['image_url'],
        'description'      => $row['description'],
        'uploaded_by_name' => $row['uploaded_by_name'] ?? 'Unknown',
        'created_at'       => $row['created_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $items, 'error' => null]);
