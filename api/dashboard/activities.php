<?php
// api/dashboard/activities.php
// GET — returns last 10 activity rows with user name.
// Accessible by all authenticated roles.

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

$result = mysqli_query($conn, '
    SELECT a.id, a.type, a.description, a.created_at, u.name AS user_name
    FROM activities a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 10
');

$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $activities[] = [
        'id'          => (int) $row['id'],
        'type'        => $row['type'],
        'description' => $row['description'],
        'user_name'   => $row['user_name'],
        'created_at'  => $row['created_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $activities, 'error' => null]);
