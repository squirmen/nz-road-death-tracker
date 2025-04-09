/**
 * Data loading and processing utilities for the NZ Road Safety Dashboard
 */

// Global data variables
let allData = [];
let filteredData = [];
let uniqueCrashes = new Map(); // To track unique crashes and their fatality counts
let totalFatalities = 0; // Track total fatalities separately

/**
 * Parse a date string in DD/MM/YYYY format
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {Date|null} Parsed Date object or null if invalid
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
}

/**
 * Format a date in YYYY-MM-DD format
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Process crash data by filtering out excluded records and analyzing metrics
 * @param {Array} data - Raw data from CSV
 * @returns {Object} Processed data with metrics
 */
function processCrashData(data) {
  // Filter out excluded records (only rows where Exclude === false)
  const validData = data.filter(row => row.Exclude === false);

  // Store unique crashes by FCN
  const crashes = new Map();

  // Track total number of fatalities (each row = one person)
  let totalDeaths = 0;

  validData.forEach(row => {
    const fcn = row.FCN;

    // Each row is one fatality
    totalDeaths += 1;

    // If this crash hasn't been seen, initialize it
    if (!crashes.has(fcn)) {
      crashes.set(fcn, {
        date: parseDate(row['Crash date']),
        fatalities: 1,
        vehicles: parseInt(row['Crash num vehicles'] || 1)
      });
    } else {
      // If already exists, just increment the fatality count
      crashes.get(fcn).fatalities += 1;
    }
  });

  return {
    validData: validData,
    uniqueCrashes: crashes,
    totalFatalities: totalDeaths,
    crashCount: crashes.size
  };
}

/**
 * Load and initialize dataset
 * @param {Function} callback - Function to call when data is loaded
 */
function loadData(callback) {
  Papa.parse(CONFIG.csvUrl, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      // Process the data
      const processedData = processCrashData(results.data);
      
      // Set global variables
      allData = processedData.validData;
      filteredData = [...allData];
      uniqueCrashes = processedData.uniqueCrashes;
      totalFatalities = processedData.totalFatalities;
      
      if (typeof callback === 'function') {
        callback(allData);
      }
      
      // Hide loading overlay
      document.getElementById('loadingOverlay').style.display = 'none';
    },
    error: function(error) {
      console.error('Error loading CSV:', error);
      alert('Failed to load data. Please try again later.');
      document.getElementById('loadingOverlay').style.display = 'none';
    }
  });
}

/**
 * Calculate unique crashes and metrics from filtered data
 * @param {Array} data - Filtered crash data
 * @returns {Object} Object with crash metrics
 */
function calculateCrashMetrics(data) {
  const crashes = new Map();
  let fatalities = 0;
  
  data.forEach(row => {
    // Count fatalities from each record
    const fatalityCount = parseInt(row['Crash fatality no'] || 0);
    fatalities += fatalityCount;
    
    // Track unique crashes
    const fcn = row.FCN;
    if (!crashes.has(fcn)) {
      crashes.set(fcn, {
        date: parseDate(row['Crash date']),
        fatalities: fatalityCount,
        vehicles: parseInt(row['Crash num vehicles'] || 1)
      });
    }
  });
  
  return {
    crashes: crashes,
    fatalities: fatalities,
    crashCount: crashes.size
  };
}

/**
 * Get crash dates sorted
 * @param {Map} crashes - Map of unique crashes
 * @returns {Array} Sorted array of crash dates
 */
function getSortedCrashDates(crashes) {
  return Array.from(crashes.values())
    .map(crash => crash.date)
    .filter(date => date !== null)
    .sort((a, b) => a - b);
}

/**
 * Calculate days between consecutive crashes
 * @param {Array} crashDates - Sorted array of crash dates
 * @returns {Array} Array of days between consecutive crashes
 */
function calculateDaysBetween(crashDates) {
  const daysBetween = [];
  
  for (let i = 1; i < crashDates.length; i++) {
    const diffTime = Math.abs(crashDates[i] - crashDates[i-1]);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysBetween.push(diffDays);
  }
  
  return daysBetween;
}

/**
 * Count values in an array
 * @param {Array} array - Array of values
 * @returns {Object} Object with counts of each value
 */
function countOccurrences(array) {
  const counts = {};
  array.forEach(value => {
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  return counts;
}

/**
 * Group crash data by a field
 * @param {Array} data - Filtered crash data
 * @param {string} field - Field to group by
 * @returns {Object} Object with counts grouped by field
 */
function groupByField(data, field) {
  const groups = {};
  data.forEach(row => {
    const value = row[field];
    if (value) {
      groups[value] = (groups[value] || 0) + 1;
    }
  });
  return groups;
}

/**
 * Get top N entries from an object by value
 * @param {Object} obj - Object with key-value pairs
 * @param {number} n - Number of entries to return
 * @returns {Array} Array of [key, value] pairs
 */
function getTopN(obj, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// Export functions
if (typeof module !== 'undefined') {
  module.exports = {
    parseDate,
    formatDate,
    formatNumber,
    processCrashData,
    loadData,
    calculateCrashMetrics,
    getSortedCrashDates,
    calculateDaysBetween,
    countOccurrences,
    groupByField,
    getTopN
  };
}