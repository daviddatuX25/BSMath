<?php
// api/helpers/log_activity.php
// Shared activity logger function.
// Include this file in any endpoint that writes data.
// Usage: log_activity($conn, $userId, "program", "Created program: Title", "programs", $newId);

function log_activity(
    mysqli $conn,
    int    $userId,
    string $type,
    string $description,
    ?string $entityType = null,
    ?int    $entityId   = null
): void {
    $stmt = mysqli_prepare($conn, '
        INSERT INTO activities (user_id, type, description, entity_type, entity_id)
        VALUES (?, ?, ?, ?, ?)
    ');
    if (!$stmt) return; // silent fail — activity logging must never break the main action
    mysqli_stmt_bind_param($stmt, 'isssi', $userId, $type, $description, $entityType, $entityId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
}
