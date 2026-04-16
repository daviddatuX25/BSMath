<?php
// api/news/index.php
// Returns every news article joined with the author's name.
// RBAC: admin only (dean and program_head get 403).

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

$role = $_SESSION['role'] ?? '';
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}

// Newest article first. LEFT JOIN so rows still appear if the author was deleted.
$result = mysqli_query($conn, "
    SELECT
        n.id,
        n.title,
        n.content,
        n.image_url,
        n.status,
        n.created_at,
        n.updated_at,
        u.name AS author_name
    FROM news n
    LEFT JOIN users u ON u.id = n.author_id
    ORDER BY n.created_at DESC
");

$news = [];
while ($row = mysqli_fetch_assoc($result)) {
    $news[] = [
        'id'          => (int) $row['id'],
        'title'       => $row['title'],
        'content'     => $row['content'],
        'image_url'   => $row['image_url'],
        'status'      => $row['status'],
        'author_name' => $row['author_name'] ?? 'Unknown',
        'created_at'  => $row['created_at'],
        'updated_at'  => $row['updated_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $news, 'error' => null]);
