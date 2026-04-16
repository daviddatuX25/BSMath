<?php
require_once __DIR__ . '/../connect.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

// Events are restricted to admin and dean only
$role = $_SESSION['role'] ?? '';
if (!in_array($role, ['admin', 'dean'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}

$result = mysqli_query($conn, "
    SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.status,
        e.created_at,
        e.updated_at,
        u.name AS author_name
    FROM events e
    LEFT JOIN users u ON u.id = e.author_id
    ORDER BY e.event_date ASC, e.created_at DESC
");

$events = [];
while ($row = mysqli_fetch_assoc($result)) {
    $events[] = [
        'id'          => (int) $row['id'],
        'title'       => $row['title'],
        'description' => $row['description'],
        'event_date'  => $row['event_date'],
        'event_time'  => $row['event_time'],
        'location'    => $row['location'],
        'status'      => $row['status'],
        'author_name' => $row['author_name'] ?? 'Unknown',
        'created_at'  => $row['created_at'],
        'updated_at'  => $row['updated_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $events, 'error' => null]);