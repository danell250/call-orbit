<?php
// save-signup.php - Simple PHP script to save form data to a file
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $data = $_POST;
    
    // Add timestamp
    $data['timestamp'] = date('Y-m-d H:i:s');
    
    // Convert to JSON
    $json = json_encode($data, JSON_PRETTY_PRINT);
    
    // Save to file
    $filename = 'signups_' . date('Y-m-d') . '.txt';
    file_put_contents($filename, $json . "\n---\n", FILE_APPEND | LOCK_EX);
    
    // Return success response
    echo json_encode(['status' => 'success', 'message' => 'Signup saved']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>