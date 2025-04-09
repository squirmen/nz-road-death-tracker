/**
 * Configuration settings for the NZ Road Safety Dashboard
 */

// Data source URL with cache busting
const timestamp = new Date().getTime(); // Current timestamp for cache busting
const baseUrl = "https://nzroads.tfwelch.com/assets/NZ_RoadDeaths_Provisional.csv";
const cacheBustedUrl = `${baseUrl}?v=${timestamp}`;

const CONFIG = {
  // CSV data source URL with cache busting
  csvUrl: cacheBustedUrl,
  
  // NZ Population estimate for per-capita calculations
  nzPopulation: 5120000,
  
  // Chart colors
  colors: {
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    accent: "#f97316",
    neutral: "#94a3b8",
    
    // Color scales
    safe: "rgba(34, 197, 94, 0.7)",     // Green
    moderate: "rgba(234, 179, 8, 0.7)",  // Yellow
    danger: "rgba(239, 68, 68, 0.7)",    // Red
    primary: "rgba(59, 130, 246, 0.7)",  // Blue
    secondary: "rgba(249, 115, 22, 0.7)" // Orange
  },
  
  // Chart settings
  chartDefaults: {
    height: 400,
    margin: { t: 10, b: 80, l: 50, r: 20 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    font: {
      family: 'Inter, sans-serif'
    },
    hoverlabel: { 
      bgcolor: '#334155', 
      font: { color: 'white' } 
    }
  }
};

// Export the config
if (typeof module !== 'undefined') {
  module.exports = CONFIG;
}