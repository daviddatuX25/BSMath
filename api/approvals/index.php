<?php
// api/approvals/index.php
// Returns pending announcements + events for Dean approval.
// Dean only (admin can also view for oversight).

require_once __DIR__ . '/../connect.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
if (!in_array($_SESSION['role'], ['admin', 'dean'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}

// Optional filter: ?type=announcements or ?type=events
$filter = $_GET['type'] ?? '';
$allowedFilters = ['announcements', 'events'];

$items = [];

// ── Pending announcements ────────────────────────────────────────────
if ($filter === '' || $filter === 'announcements') {
    $result = mysqli_query($conn, "
        SELECT
            a.id,
            a.title,
            a.content,
            a.status,
            a.priority,
            a.created_at,
            u.name AS author_name
        FROM announcements a
        LEFT JOIN users u ON u.id = a.author_id
        WHERE a.status = 'pending'
        ORDER BY a.created_at ASC
    ");
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = [
            'type'        => 'announcement',
            'id'          => (int) $row['id'],
            'title'       => $row['title'],
            'content'     => $row['content'],
            'status'      => $row['status'],
            'priority'    => $row['priority'],
            'author_name' => $row['author_name'] ?? 'Unknown',
            'created_at'  => $row['created_at'],
        ];
    }
}

// ── Pending events ────────────────────────────────────────────────────
if ($filter === '' || $filter === 'events') {
    $result = mysqli_query($conn, "
        SELECT
            e.id,
            e.title,
            e.description,
            e.status,
            e.event_date,
            e.event_time,
            e.location,
            e.created_at,
            u.name AS author_name
        FROM events e
        LEFT JOIN users u ON u.id = e.author_id
        WHERE e.status = 'pending'
        ORDER BY e.created_at ASC
    ");
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = [
            'type'        => 'event',
            'id'          => (int) $row['id'],
            'title'       => $row['title'],
            'description' => $row['description'],
            'status'      => $row['status'],
            'event_date'  => $row['event_date'],
            'event_time'  => $row['event_time'],
            'location'    => $row['location'],
            'author_name' => $row['author_name'] ?? 'Unknown',
            'created_at'  => $row['created_at'],
        ];
    }
}

echo json_encode(['success' => true, 'data' => $items, 'error' => null]);
