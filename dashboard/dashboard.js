/**
 * Main dashboard controller for the NZ Road Safety Dashboard
 */

/**
 * Initialize the dashboard by setting up event listeners and loading data
 */
function initializeDashboard() {
  // Set up modal event listeners
  setupModalListeners();
  
  // Load data and initialize dashboard
  loadData(function() {
    // Initialize filters after data is loaded
    initializeFilters();
    
    // Initial update
    updateDashboard();
  });
}

/**
 * Set up modal event listeners
 */
function setupModalListeners() {
  // Modal handling
  const modals = document.querySelectorAll('.modal');
  const modalOpeners = document.querySelectorAll('.open-modal');
  const modalClosers = document.querySelectorAll('.close-modal');
  
  modalOpeners.forEach(opener => {
    opener.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      modal.style.display = 'flex';
    });
  });
  
  modalClosers.forEach(closer => {
    closer.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.style.display = 'none';
    });
  });
  
  window.addEventListener('click', function(event) {
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

/**
 * Update all dashboard elements
 */
function updateDashboard() {
  // Update unique crashes map using the new function name
  const metrics = calculateCrashMetrics(filteredData);
  uniqueCrashes = metrics.crashes;
  
  // Update summary statistics
  updateSummaryStats();
  
  // Update advanced metrics
  updateAdvancedMetrics();
  
  // Update insights
  updateInsights();
  
  // Generate charts
  generateCharts();
  
  // Update last updated timestamp
  const lastUpdated = document.getElementById('lastUpdated');
  lastUpdated.textContent = new Date().toLocaleString();
}

// Initialize the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
