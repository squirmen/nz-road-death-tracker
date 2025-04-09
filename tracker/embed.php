<?php
// Enable error reporting temporarily
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include configuration
require_once 'config.php';

// Set timezone to New Zealand
date_default_timezone_set('Pacific/Auckland');

// Get fatality data from database
function get_fatality_data() {
    $db = db_connect();
    
    if (!$db) {
        return [
            'days_since' => '?',
            'count' => '?',
            'last_checked' => 'Database connection failed'
        ];
    }
    
    try {
        // Get the latest record
        $stmt = $db->query('SELECT count, change_date, check_date FROM fatality_tracker ORDER BY id DESC LIMIT 1');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return [
                'days_since' => '?',
                'count' => '?',
                'last_checked' => 'No data found'
            ];
        }
        
        // Calculate days since last fatality
        $change_date = new DateTime($result['change_date']);
        $now = new DateTime();
        
        // Set both dates to midnight for whole day calculation
        $change_date->setTime(0, 0, 0);
        $now->setTime(0, 0, 0);
        
        $interval = $now->diff($change_date);
        $days_since = $interval->days;
                    
        // Format the last checked date
        $last_checked = new DateTime($result['check_date']); // Get date in server timezone
        $last_checked->modify('+17 hours'); // Add 17 hours to convert to NZ time
        $formatted_check_date = $last_checked->format('d/m/Y, g:i a'); // Format in 12-hour time

        return [
            'days_since' => $days_since,
            'count' => $result['count'],
            'last_checked' => $formatted_check_date
        ];
    } catch (PDOException $e) {
        return [
            'days_since' => '?',
            'count' => '?',
            'last_checked' => 'Error: ' . $e->getMessage()
        ];
    }
}

// Get the data
$data = get_fatality_data();

// Set headers for embedding
header('Content-Type: text/html');
header('Access-Control-Allow-Origin: *');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NZ Road Death Tracker</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
        }
        .embed-tracker {
            background-color: #ffcc00;
            border: 12px solid #000;
            border-radius: 10px;
            text-align: center;
            padding: 15px;
            box-sizing: border-box;
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
        }
        .embed-header {
            font-weight: bold;
            font-size: 18px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .embed-subheader {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .embed-counter {
            font-size: 72px;
            font-weight: bold;
            line-height: 1;
            margin: 15px 0;
        }
        .embed-footer {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }
        .embed-total {
            font-size: 14px;
            margin: 5px 0;
        }
        .embed-source {
            font-size: 10px;
            margin-top: 10px;
        }
        .embed-source a {
            color: #333;
            text-decoration: none;
        }
        .embed-source a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="embed-tracker">
        <div class="embed-header">Road Death Tracker</div>
        <div class="embed-subheader">Days Since Last Road Fatality in NZ</div>
        <div class="embed-counter"><?php echo $data['days_since']; ?></div>
        <div class="embed-footer">Every Day Without a Death Counts</div>
        <div class="embed-total">Total fatalities this year: <?php echo $data['count']; ?></div>
        <div class="embed-source"><a href="https://nzroads.tfwelch.com" target="_blank">nzroads.tfwelch.com</a></div>
    </div>
</body>
</html>