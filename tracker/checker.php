<?php
// This script is designed to be run by a cron job to check for fatality count updates

// Include configuration
require_once 'config.php';

// Set timezone to New Zealand
date_default_timezone_set('Pacific/Auckland');

// Log function
function log_message($message) {
    $log_file = dirname(__FILE__) . '/checker_log.txt';
    $date = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$date] $message" . PHP_EOL, FILE_APPEND);
}

// Fetch the latest data from the JSON endpoint
function fetch_latest_count() {
    global $json_url;
    
    try {
        $response = @file_get_contents($json_url);
        
        if ($response === false) {
            log_message("Error: Unable to fetch data from $json_url");
            return null;
        }
        
        // Extract the number from brackets using regex
        if (preg_match('/\[(\d+)\]/', $response, $matches)) {
            return intval($matches[1]);
        } else {
            log_message("Error: Could not extract number from response: $response");
            return null;
        }
    } catch (Exception $e) {
        log_message("Exception: " . $e->getMessage());
        return null;
    }
}

// Get the current count from the database
function get_current_db_count($db) {
    try {
        $stmt = $db->query('SELECT count FROM fatality_tracker ORDER BY id DESC LIMIT 1');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            return intval($result['count']);
        } else {
            log_message("No records found in database");
            return 0;
        }
    } catch (PDOException $e) {
        log_message("Database error: " . $e->getMessage());
        return null;
    }
}

// Update the database with new count
function update_fatality_count($db, $new_count) {
    try {
        $stmt = $db->prepare('INSERT INTO fatality_tracker (count, change_date, check_date) VALUES (:count, NOW(), NOW())');
        $stmt->bindParam(':count', $new_count, PDO::PARAM_INT);
        $stmt->execute();
        
        log_message("Updated count to $new_count");
        return true;
    } catch (PDOException $e) {
        log_message("Error updating count: " . $e->getMessage());
        return false;
    }
}

// Update just the check date
function update_check_date($db) {
    try {
        $stmt = $db->prepare('UPDATE fatality_tracker SET check_date = NOW() WHERE id = (SELECT max_id FROM (SELECT MAX(id) as max_id FROM fatality_tracker) as temp)');
        $stmt->execute();
        
        log_message("Updated check date");
        return true;
    } catch (PDOException $e) {
        log_message("Error updating check date: " . $e->getMessage());
        return false;
    }
}

// Main execution
log_message("Starting check for fatality count updates");

// Get latest count from JSON
$latest_count = fetch_latest_count();

if ($latest_count === null) {
    log_message("Exiting: Failed to fetch latest count");
    exit(1);
}

// Connect to database
$db = db_connect();

if (!$db) {
    log_message("Exiting: Failed to connect to database");
    exit(1);
}

// Get current count from database
$current_count = get_current_db_count($db);

if ($current_count === null) {
    log_message("Exiting: Failed to get current count from database");
    exit(1);
}

// Compare and update if needed
if ($latest_count > $current_count) {
    log_message("Count increased from $current_count to $latest_count");
    update_fatality_count($db, $latest_count);
} else {
    log_message("No change in count: $current_count");
    update_check_date($db);
}

log_message("Check completed successfully");
exit(0);
?>