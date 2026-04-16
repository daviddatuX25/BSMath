<?php
// api/announcements/index.php
// Returns every announcement joined with the author's name.
// RBAC: all 3 roles (admin, dean, program_head) can view.

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

// Newest announcement first. LEFT JOIN so rows still appear if the author was deleted.
$result = mysqli_query($conn, "
    SELECT
        a.id,
        a.title,
        a.content,
        a.status,
        a.priority,
        a.created_at,
        a.updated_at,
        u.name AS author_name
    FROM announcements a
    LEFT JOIN users u ON u.id = a.author_id
    ORDER BY a.created_at DESC
");

$announcements = [];
while ($row = mysqli_fetch_assoc($result)) {
    $announcements[] = [
        'id'          => (int) $row['id'],
        'title'       => $row['title'],
        'content'     => $row['content'],
        'status'      => $row['status'],
        'priority'    => $row['priority'],
        'author_name' => $row['author_name'] ?? 'Unknown',
        'created_at'  => $row['created_at'],
        'updated_at'  => $row['updated_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $announcements, 'error' => null]);