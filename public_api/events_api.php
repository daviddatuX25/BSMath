<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, title, description, event_date, event_time, location FROM events WHERE status = 'approved' ORDER BY event_date ASC");
if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query failed"]);
    exit;
}

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>