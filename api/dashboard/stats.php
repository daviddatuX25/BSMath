<?php
// api/dashboard/stats.php
// GET — returns counts for the 4 stats cards.
// Accessible by all authenticated roles.

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

$result = mysqli_query($conn, '
    SELECT
        (SELECT COUNT(*) FROM programs)       AS programs,
        (SELECT COUNT(*) FROM announcements)  AS announcements,
        (SELECT COUNT(*) FROM events)         AS events,
        (SELECT COUNT(*) FROM users)          AS users
');

$row = mysqli_fetch_assoc($result);

echo json_encode([
    'success' => true,
    'data'    => [
        'programs'      => (int) $row['programs'],
        'announcements' => (int) $row['announcements'],
        'events'        => (int) $row['events'],
        'users'         => (int) $row['users'],
    ],
    'error' => null
]);
