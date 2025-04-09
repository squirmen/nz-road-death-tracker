<?php
// Database configuration
$db_host = 'localhost';
$db_name = 'tfwelc5_nz_road_tracker'; // Replace with your database name
$db_user = 'tfwelc5_admin'; // Replace with your database username
$db_pass = 'pohbEt-7rapvy-rakcav'; // Replace with your database password

// JSON data source
$json_url = 'https://mot-analytics.gitlab.io/safety/fatals-reporting/ytd_road_fatalities.json';

// Error reporting - set to 0 in production
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Connect to database
function db_connect() {
    global $db_host, $db_name, $db_user, $db_pass;
    
    try {
        $db = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}
?>