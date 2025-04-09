<?php
// Include configuration
require_once 'config.php';

// Set timezone to New Zealand
date_default_timezone_set('Pacific/Auckland');

// Get fatality data from database
function get_fatality_data() {
    $db = db_connect();
    
    if (!$db) {
        return [
            'days_since' => 'Error',
            'count' => '--',
            'last_checked' => 'Database connection failed'
        ];
    }
    
    try {
        // Get the latest record
        $stmt = $db->query('SELECT count, change_date, check_date FROM fatality_tracker ORDER BY id DESC LIMIT 1');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return [
                'days_since' => 'Error',
                'count' => '--',
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
        error_log("Database error: " . $e->getMessage());
        return [
            'days_since' => 'Error',
            'count' => '--',
            'last_checked' => 'Database error'
        ];
    }
}

// Get the data
$data = get_fatality_data();

// Site settings
$site_url = "https://nzroads.tfwelch.com";
$site_title = "{$data['days_since']} days since the last road fatality in NZ";
$site_description = "It has been {$data['days_since']} days since the last road fatality in New Zealand. Total fatalities this year: {$data['count']}";
$preview_image = "$site_url/road-safety-preview.png";

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $site_title; ?></title>
    
  <!-- Open Graph / Facebook Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://nzroads.tfwelch.com">
  <meta property="og:title" content="<?php echo $data['days_since']; ?> days since the last road fatality in NZ">
  <meta property="og:description" content="Total fatalities this year: <?php echo $data['count']; ?>. Every day without a death counts.">
  <meta property="og:image" content="https://nzroads.tfwelch.com/road-safety-preview.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://nzroads.tfwelch.com">
  <meta name="twitter:title" content="<?php echo $data['days_since']; ?> days since the last road fatality in NZ">
  <meta name="twitter:description" content="Total fatalities this year: <?php echo $data['count']; ?>. Every day without a death counts.">
  <meta name="twitter:image" content="https://nzroads.tfwelch.com/road-safety-preview.png">
  
  <!-- For Facebook to correctly render the preview -->
  <link rel="canonical" href="<?php echo $site_url; ?>" />
    
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  <style>
      body {
          font-family: 'Roboto', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
          background-image: linear-gradient(to bottom, #e8e8e8, #f8f8f8);
      }
      
      .safety-sign {
          background-color: #ffcc00;
          border: 12px solid #000;
          border-radius: 12px;
          text-align: center;
          padding: 30px;
          width: 420px;
          box-shadow: 
              0 10px 30px rgba(0,0,0,0.25),
              0 0 0 1px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
      }
      
      .safety-sign::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: repeating-linear-gradient(
              -45deg,
              #000,
              #000 10px,
              #ffcc00 10px,
              #ffcc00 20px
          );
          opacity: 0.3;
      }
      
      .sign-header {
          text-transform: uppercase;
          font-family: 'Roboto Condensed', sans-serif;
          font-weight: 700;
          font-size: 28px;
          margin-bottom: 15px;
          color: #000;
          letter-spacing: 1px;
          text-shadow: 1px 1px 0 rgba(255,255,255,0.3);
      }
      
      .sign-subheader {
          font-size: 22px;
          margin-bottom: 5px;
          color: #000;
          font-weight: 700;
      }
      
      .days-counter {
          font-size: 140px;
          font-weight: 700;
          color: #000;
          margin: 25px 0;
          font-family: 'Roboto Condensed', sans-serif;
          line-height: 1;
          text-shadow: 
              3px 3px 0 rgba(0,0,0,0.1),
              -1px -1px 0 rgba(255,255,255,0.3);
          position: relative;
      }
      
      .sign-footer {
          font-size: 20px;
          margin-top: 25px;
          font-weight: 700;
          color: #000;
          position: relative;
          padding-bottom: 10px;
      }
      
      .sign-footer::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background-color: #000;
          opacity: 0.3;
      }
      
      .updated {
          font-size: 12px;
          margin-top: 20px;
          color: #333;
      }
      
      .fatal-count {
          font-size: 18px;
          margin-top: 15px;
          color: #333;
          font-weight: 700;
      }
      
      .loading {
          color: #777;
          font-style: italic;
      }
      
      .credits {
          font-size: 10px;
          margin-top: 10px;
          color: #666;
          text-align: center;
      }
      
      .credits a {
          color: #555;
          text-decoration: none;
          border-bottom: 1px dotted #555;
      }
      
      .credits a:hover {
          color: #333;
          border-bottom: 1px solid #333;
      }
      
      /* Action buttons section */
      .action-buttons {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 8px;
      }
      
      /* Refined share button */
      .share-button {
          background-color: rgba(0, 0, 0, 0.1);
          color: #000;
          border: none;
          border-radius: 4px;
          width: auto;
          height: auto;
          padding: 6px 10px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
      }
      
      .share-button:hover {
          background-color: rgba(0, 0, 0, 0.2);
      }
      
      .share-button svg {
          margin-right: 4px;
          width: 12px;
          height: 12px;
      }
      
      .share-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s;
      }
      
      .share-container.active {
          opacity: 1;
          visibility: visible;
      }
      
      .share-panel {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 300px;
          max-width: 90%;
          position: relative;
      }
      
      .share-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
      }
      
      .share-options {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
      }
      
      .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
      }
      
      .share-option:hover {
          transform: scale(1.1);
      }
      
      .share-icon {
          width: 40px;
          height: 40px;
          background-color: #f5f5f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
      }
      
      .share-name {
          font-size: 12px;
      }
      
      .close-share {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
      }
      
      .share-link {
          margin-top: 15px;
      }
      
      .share-link input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 14px;
      }
      
      .share-link button {
          width: 100%;
          padding: 8px;
          background: #000;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
      }
      
      .share-link button:hover {
          background: #333;
      }
      
      .share-preview {
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 15px;
      }
      
      .share-preview-image {
          width: 100%;
          border-radius: 4px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
      }

      /* Embed section styles */
      .embed-section {
          text-align: center;
          margin-top: 20px;
          margin-bottom: 30px;
      }

      .embed-button {
          font-size: 14px;
          padding: 8px 15px;
          background-color: #000;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
      }

      .embed-button:hover {
          background-color: #333;
      }

      .next-update {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
          text-align: center;
      }

      /* Embed modal styles */
      .embed-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s;
      }

      .embed-container.active {
          opacity: 1;
          visibility: visible;
      }

      .embed-panel {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          position: relative;
      }

      .embed-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
      }

      .close-embed {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
      }

      .embed-code {
          width: 100%;
          height: 60px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 12px;
          font-family: monospace;
      }

      .copy-button {
          width: 100%;
          padding: 8px;
          background: #000;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
          margin-bottom: 15px;
      }

      .copy-button:hover {
          background: #333;
      }

      .embed-preview {
          border: 1px solid #ddd;
          border-radius: 4px;
      }
      
      @media (max-width: 500px) {
          .safety-sign {
              width: 85vw;
              padding: 20px;
              border-width: 8px;
          }
          
          .days-counter {
              font-size: 100px;
          }
          
          .sign-header {
              font-size: 24px;
          }
          
          .sign-subheader {
              font-size: 18px;
          }
      }
      
      /* Subtle pulse animation for the counter */
      @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.01); }
          100% { transform: scale(1); }
      }
      
      .days-counter {
          animation: pulse 2s infinite ease-in-out;
      }
  </style>
</head>
<body>
    <div class="safety-sign">
        <div class="action-buttons">
            <button class="share-button" id="shareBtn" aria-label="Share">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share
            </button>
        </div>
        <div class="sign-header">ROAD DEATH TRACKER</div>
        <div class="sign-subheader">Days Since Last</div>
        <div class="sign-subheader">Road Fatality in New Zealand</div>
        <div class="days-counter"><?php echo $data['days_since']; ?></div>
        <div class="sign-footer">Every Day Without a Death Counts</div>
        <div class="fatal-count">Total fatalities this year: <?php echo $data['count']; ?></div>
        <div class="updated">Last checked: <?php echo $data['last_checked']; ?></div>
        <div class="credits">
            Data source: <a href="https://www.transport.govt.nz/statistics-and-insights/safety-road-deaths/year-to-date-road-deaths/" target="_blank">Ministry of Transport</a> | 
            Created by <a href="https://tfwelch.com" target="_blank">Tim Welch</a>
        </div>
    </div>

    <div class="embed-section">
        <button id="embedBtn" class="embed-button">Embed This Tracker</button>
        <div id="nextUpdate" class="next-update">Next update check in: --:--:--</div>
    </div>

    <div class="share-container" id="shareContainer">
        <div class="share-panel">
            <div class="share-title">Share this safety record</div>
            <button class="close-share" id="closeShareBtn">×</button>
            <div class="share-options">
                <div class="share-option" id="shareFacebook">
                    <div class="share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </div>
                    <div class="share-name">Facebook</div>
                </div>
                <div class="share-option" id="shareTwitter">
                    <div class="share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                    </div>
                    <div class="share-name">Twitter</div>
                </div>
                <div class="share-option" id="shareLinkedIn">
                    <div class="share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                    </div>
                    <div class="share-name">LinkedIn</div>
                </div>
                <div class="share-option" id="shareBluesky">
                    <div class="share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0285FF">
                            <path d="M12 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5zm0-8.833l3.469 2.083 3.469-6.934L12 8.75 5.062 8.816l3.469 6.934L12 13.667z"/>
                        </svg>
                    </div>
                    <div class="share-name">Bluesky</div>
                </div>
            </div>
            <div class="share-link">
                <input type="text" id="shareUrl" readonly value="<?php echo $site_url; ?>">
                <button id="copyLinkBtn">Copy Link</button>
            </div>
            <div class="share-preview">
                <p>Preview image for social media:</p>
                <img class="share-preview-image" src="<?php echo $preview_image; ?>" alt="Preview image for sharing">
            </div>
        </div>
    </div>
    
    <div id="embedSection" class="embed-container">
        <div class="embed-panel">
            <div class="embed-title">Embed This Tracker</div>
            <button class="close-embed" id="closeEmbedBtn">×</button>
            <p>Copy and paste this code into your website:</p>
            <textarea readonly class="embed-code"><iframe src="https://nzroads.tfwelch.com/embed.php" width="330" height="300" frameborder="0" scrolling="no"></iframe></textarea>
            <button id="copyEmbedBtn" class="copy-button">Copy Code</button>
            <p>Preview:</p>
            <iframe src="embed.php" width="330" height="300" frameborder="0" scrolling="no" class="embed-preview"></iframe>
        </div>
    </div>

    <script>
        // Share and embed functionality
        document.addEventListener('DOMContentLoaded', function() {
            const shareBtn = document.getElementById('shareBtn');
            const closeShareBtn = document.getElementById('closeShareBtn');
            const shareContainer = document.getElementById('shareContainer');
            const copyLinkBtn = document.getElementById('copyLinkBtn');
            const shareUrl = document.getElementById('shareUrl');
            
            // Embed functionality
            const embedBtn = document.getElementById('embedBtn');
            const closeEmbedBtn = document.getElementById('closeEmbedBtn');
            const embedContainer = document.getElementById('embedSection');
            const copyEmbedBtn = document.getElementById('copyEmbedBtn');
            const embedCode = document.querySelector('.embed-code');
            
            // Set the current URL in the input field
            shareUrl.value = window.location.href;
            
            // Open share panel
            shareBtn.addEventListener('click', () => {
                shareContainer.classList.add('active');
            });
            
            // Close share panel
            closeShareBtn.addEventListener('click', () => {
                shareContainer.classList.remove('active');
            });
            
            // Close when clicking outside
            shareContainer.addEventListener('click', (e) => {
                if (e.target === shareContainer) {
                    shareContainer.classList.remove('active');
                }
            });
            
            // Copy link button
            copyLinkBtn.addEventListener('click', () => {
                shareUrl.select();
                document.execCommand('copy');
                copyLinkBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyLinkBtn.textContent = 'Copy Link';
                }, 2000);
            });
            
            // Social media share buttons
            document.getElementById('shareFacebook').addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            });
            
            document.getElementById('shareTwitter').addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`${<?php echo $data['days_since']; ?>} days since the last road fatality in New Zealand. Every day without a death counts. #RoadSafety #NewZealand`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
            });
            
            document.getElementById('shareLinkedIn').addEventListener('click', () => {
                const timestamp = Date.now(); // Current timestamp to prevent caching
                const url = encodeURIComponent(`${window.location.href}?t=${timestamp}`);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
            });
            
            document.getElementById('shareBluesky').addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`${<?php echo $data['days_since']; ?>} days since the last road fatality in New Zealand. Every day without a death counts.`);
                window.open(`https://bsky.app/intent/compose?text=${text} ${url}`, '_blank');
            });
            
            // Open embed panel
            embedBtn.addEventListener('click', () => {
                embedContainer.classList.add('active');
            });

            // Close embed panel
            closeEmbedBtn.addEventListener('click', () => {
                embedContainer.classList.remove('active');
            });

            // Close when clicking outside
            embedContainer.addEventListener('click', (e) => {
                if (e.target === embedContainer) {
                    embedContainer.classList.remove('active');
                }
            });

            // Copy embed code button
            copyEmbedBtn.addEventListener('click', () => {
                embedCode.select();
                document.execCommand('copy');
                copyEmbedBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyEmbedBtn.textContent = 'Copy Code';
                }, 2000);
            });
            
            // Function to update the countdown to next check
            function updateNextCheckCountdown() {
                // Get the current time
                const now = new Date();
                
                // Find the next check time (next multiple of 4 hours)
                const nextCheckHour = Math.ceil(now.getHours() / 4) * 4;
                const nextCheck = new Date(now);
                nextCheck.setHours(nextCheckHour, 0, 0, 0);
                
                // If we're already past the next check time, add 4 hours
                if (nextCheck <= now) {
                    nextCheck.setHours(nextCheck.getHours() + 4);
                }
                
                // Calculate the time difference
                const timeDiff = nextCheck - now;
                
                // Calculate hours, minutes, seconds
                let hours = Math.floor(timeDiff / (1000 * 60 * 60));
                let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                
                // Format with leading zeros
                hours = hours.toString().padStart(2, '0');
                minutes = minutes.toString().padStart(2, '0');
                seconds = seconds.toString().padStart(2, '0');
                
                // Update the element
                document.getElementById('nextUpdate').textContent = `Next update check in: ${hours}:${minutes}:${seconds}`;
                
                // Update every second
                setTimeout(updateNextCheckCountdown, 1000);
            }
            
            // Start the countdown
            updateNextCheckCountdown();
        });
    </script>

<div class="dashboard-preview">
    <h3>Road Safety Insights</h3>
    <div class="preview-stats">
        <div class="preview-stat">
            <span class="stat-value">7.49</span>
            <span class="stat-label">Annual Fatality Rate</span>
        </div>
        <div class="preview-stat">
            <span class="stat-value">31.6</span>
            <span class="stat-label">Monthly Fatalities</span>
        </div>
    </div>
    <a href="/dashboard.html" class="view-full">View Full Dashboard →</a>
</div>
</body>
</html>