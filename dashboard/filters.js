/**
 * Filters functionality for the NZ Road Safety Dashboard
 */

// Initialize date pickers
let startDatePicker;
let endDatePicker;

/**
 * Initialize filters and date pickers
 */
function initializeFilters() {
  // Initialize date pickers
  startDatePicker = flatpickr("#startDate", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    onChange: function(selectedDates, dateStr) {
      document.getElementById('startDate').value = dateStr;
    }
  });

  endDatePicker = flatpickr("#endDate", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    onChange: function(selectedDates, dateStr) {
      document.getElementById('endDate').value = dateStr;
    }
  });
  
  // Get unique values for each filter
  const regions = [...new Set(allData.map(row => row.Region))].filter(Boolean).sort();
  const vehicles = [...new Set(allData.map(row => row['Vehicle type']))].filter(Boolean).sort();
  const ageGroups = [...new Set(allData.map(row => row['Age group']))].filter(Boolean)
    .sort((a, b) => {
      // Custom sort for age groups
      const aMatch = a.match(/^(\d+)/);
      const bMatch = b.match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });
  
  // Populate region filter
  const regionFilter = document.getElementById('regionFilter');
  regions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });
  
  // Populate vehicle filter
  const vehicleFilter = document.getElementById('vehicleFilter');
  vehicles.forEach(vehicle => {
    const option = document.createElement('option');
    option.value = vehicle;
    option.textContent = vehicle;
    vehicleFilter.appendChild(option);
  });
  
  // Populate age filter
  const ageFilter = document.getElementById('ageFilter');
  ageGroups.forEach(age => {
    const option = document.createElement('option');
    option.value = age;
    option.textContent = age;
    ageFilter.appendChild(option);
  });
  
  // Set up event listeners
  setupFilterEvents();
}

/**
 * Setup filter toggle functionality
 */
function setupFilterToggle() {
  const filtersToggle = document.getElementById('filtersToggle');
  const filtersCard = document.getElementById('filtersCard');
  const filtersBody = document.getElementById('filtersBody');
  const filterIcon = document.getElementById('filterIcon');
  
  filtersToggle.addEventListener('click', function() {
    // Toggle the collapsed class on the card
    filtersCard.classList.toggle('filters-collapsed');
    
    // Toggle the rotate class on the icon
    filterIcon.classList.toggle('rotate-icon');
    
    // If we need to explicitly toggle visibility of the body
    if (filtersCard.classList.contains('filters-collapsed')) {
      filtersBody.style.display = 'none';
    } else {
      filtersBody.style.display = '';
    }
  });
}

/**
 * Setup filter event listeners
 */
function setupFilterEvents() {
  // Setup filter toggle functionality
  const filtersToggle = document.getElementById('filtersToggle');
  const filtersCard = document.getElementById('filtersCard');
  const filtersBody = document.getElementById('filtersBody');
  const filterIcon = document.getElementById('filterIcon');
  
  filtersToggle.addEventListener('click', function() {
    // Toggle the collapsed class on the card
    filtersCard.classList.toggle('filters-collapsed');
    
    // Toggle the rotate class on the icon
    filterIcon.classList.toggle('rotate-icon');
    
    // Explicitly toggle visibility of the body
    if (filtersCard.classList.contains('filters-collapsed')) {
      filtersBody.style.display = 'none';
    } else {
      filtersBody.style.display = 'flex'; // Changed from empty string to 'flex'
    }
  });
  
  // Range chip functionality
  const rangeChips = document.querySelectorAll('.mini-chip');
  rangeChips.forEach(chip => {
    chip.addEventListener('click', function() {
      // Remove active class from all chips and add to clicked one
      rangeChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');

      const range = this.getAttribute('data-range');
      const today = new Date();
      let startDate = null;
      let endDate = today;

      // Calculate start date based on selected range
      if (range === 'all') {
        // Clear both inputs for "All Time"
        startDatePicker.clear();
        endDatePicker.clear();
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        applyFilters();
        return;
      } else if (range === 'ytd') {
        // Year to date
        startDate = new Date(today.getFullYear(), 0, 1);
      } else {
        // Last X days
        const days = parseInt(range);
        startDate = new Date();
        startDate.setDate(today.getDate() - days);
      }

      // Format dates for display
      const startDateStr = startDate.toISOString().slice(0, 10);
      const endDateStr = today.toISOString().slice(0, 10);

      // Update both the flatpickr instances and the input values
      startDatePicker.setDate(startDate);
      endDatePicker.setDate(today);

      // Explicitly set the input values as well
      document.getElementById('startDate').value = startDateStr;
      document.getElementById('endDate').value = endDateStr;

      // Apply filters with a slight delay to ensure everything is updated
      setTimeout(applyFilters, 50);
    });
  });

  // Apply and Reset buttons
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

/**
 * Apply filters to data
 */
function applyFilters() {
  const startDateValue = document.getElementById('startDate').value;
  const endDateValue = document.getElementById('endDate').value;
  const region = document.getElementById('regionFilter').value;
  const vehicle = document.getElementById('vehicleFilter').value;
  const age = document.getElementById('ageFilter').value;
  const gender = document.getElementById('genderFilter').value;
  
  let filtered = [...allData];
  let activeFilters = 0;
  
  // Apply date range filter
  if (startDateValue && endDateValue) {
    try {
      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);
      // Include the entire end day by setting time to end of day
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(row => {
        const crashDate = parseDate(row['Crash date']);
        return crashDate && crashDate >= startDate && crashDate <= endDate;
      });
      activeFilters++;
    } catch (e) {
      console.error("Date filtering error:", e);
    }
  }
          
  // Apply region filter
  if (region !== 'all') {
    filtered = filtered.filter(row => row.Region === region);
    activeFilters++;
  }
  
  // Apply vehicle filter
  if (vehicle !== 'all') {
    filtered = filtered.filter(row => row['Vehicle type'] === vehicle);
    activeFilters++;
  }
  
  // Apply age filter
  if (age !== 'all') {
    filtered = filtered.filter(row => row['Age group'] === age);
    activeFilters++;
  }
  
  // Apply gender filter
  if (gender !== 'all') {
    filtered = filtered.filter(row => row.Gender === gender);
    activeFilters++;
  }
  
  // Update active filters count badge
  const filterCountEl = document.getElementById('activeFiltersCount');
  if (activeFilters === 0) {
    filterCountEl.textContent = 'No active filters';
    filterCountEl.className = 'badge badge-primary';
  } else {
    filterCountEl.textContent = `${activeFilters} active filter${activeFilters > 1 ? 's' : ''}`;
    filterCountEl.className = 'badge badge-warning';
  }
  
  filteredData = filtered;
  updateDashboard();
}

/**
 * Reset all filters to default values
 */
function resetFilters() {
  document.getElementById('regionFilter').value = 'all';
  document.getElementById('vehicleFilter').value = 'all';
  document.getElementById('ageFilter').value = 'all';
  document.getElementById('genderFilter').value = 'all';
  document.getElementById('comparisonFilter').value = 'none';
  
  // Clear date inputs
  startDatePicker.clear();
  endDatePicker.clear();
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  
  // Reset range chips
  document.querySelectorAll('.mini-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  document.querySelector('.mini-chip[data-range="all"]').classList.add('active');
  
  // Reset active filters badge
  document.getElementById('activeFiltersCount').textContent = 'No active filters';
  document.getElementById('activeFiltersCount').className = 'badge badge-primary';
  
  // Apply the reset filters
  filteredData = [...allData];
  updateDashboard();
}

// Export functions if module exists
if (typeof module !== 'undefined') {
  module.exports = {
    initializeFilters,
    setupFilterEvents,
    applyFilters,
    resetFilters
  };
}