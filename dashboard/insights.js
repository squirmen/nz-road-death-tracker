/**
 * Insights generation for the NZ Road Safety Dashboard
 */

/**
 * Update insights based on filtered data
 */
function updateInsights() {
  const insightsContainer = document.getElementById('insightsContainer');
  insightsContainer.innerHTML = '';
  
  // Extract relevant data for analysis
  const regions = filteredData.map(row => row.Region).filter(Boolean);
  const vehicleTypes = filteredData.map(row => row['Vehicle type']).filter(Boolean);
  const ageGroups = filteredData.map(row => row['Age group']).filter(Boolean);
  const genders = filteredData.map(row => row.Gender).filter(Boolean);
  
  // Get dates for analysis
  const crashDates = Array.from(uniqueCrashes.values())
    .map(crash => crash.date)
    .filter(date => date !== null)
    .sort((a, b) => a - b);
  
  const weekdays = crashDates.map(date => date.getDay());
  
  // Count occurrences
  const regionCounts = countOccurrences(regions);
  const vehicleCounts = countOccurrences(vehicleTypes);
  const weekdayCounts = countOccurrences(weekdays);
  const ageCounts = countOccurrences(ageGroups);
  
  // Find top region by fatalities
  const topRegion = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Find top vehicle type by fatalities
  const topVehicle = Object.entries(vehicleCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Find most dangerous day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostDangerousDay = Object.entries(weekdayCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Find most at-risk age group
  const topAgeGroup = Object.entries(ageCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Calculate recent trend
  const recentMonths = 3;
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - recentMonths);
  
  const recentFatalities = crashDates.filter(date => date >= threeMonthsAgo).length;
  const previousPeriodFatalities = crashDates.filter(date => 
    date >= new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth() - recentMonths, threeMonthsAgo.getDate()) && 
    date < threeMonthsAgo
  ).length;
  
  const recentTrend = recentFatalities - previousPeriodFatalities;
  const recentTrendPercent = previousPeriodFatalities > 0 ? 
    ((recentTrend / previousPeriodFatalities) * 100).toFixed(1) : 0;
  
  // Time of day analysis
  const hourCounts = {};
  filteredData.forEach(row => {
    if (row['Crash time']) {
      try {
        let hour = parseInt(row['Crash time'].split(':')[0]);
        
        // Handle PM times
        if (row['Crash time'].includes('PM') && hour < 12) {
          hour += 12;
        }
        // Handle 12 AM
        if (row['Crash time'].includes('AM') && hour === 12) {
          hour = 0;
        }
        
        if (!isNaN(hour)) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      } catch (e) {
        // Skip invalid times
      }
    }
  });
  
  // Find peak hour
  const peakHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  const formatHour = (hour) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  };
  
  // Create insights
  const insights = [
    {
      title: `Region with Highest Risk`,
      text: `${topRegion[0]} accounts for ${(topRegion[1] / filteredData.length * 100).toFixed(1)}% of all road fatalities (${topRegion[1]} deaths).`,
      icon: 'fas fa-map-marker-alt'
    },
    {
      title: `Most Vulnerable Road Users`,
      text: `${topVehicle[0]} users represent ${(topVehicle[1] / filteredData.length * 100).toFixed(1)}% of all fatalities (${topVehicle[1]} deaths).`,
      icon: 'fas fa-car'
    },
    {
      title: `High-Risk Day of the Week`,
      text: `${dayNames[mostDangerousDay[0]]} has the highest number of fatalities with ${mostDangerousDay[1]} deaths (${(mostDangerousDay[1] / filteredData.length * 100).toFixed(1)}% of total).`,
      icon: 'fas fa-calendar-week'
    },
    {
      title: `Most At-Risk Age Group`,
      text: `The ${topAgeGroup[0]} age group accounts for ${(topAgeGroup[1] / filteredData.length * 100).toFixed(1)}% of fatalities (${topAgeGroup[1]} deaths).`,
      icon: 'fas fa-users'
    },
    {
      title: `Peak Crash Time`,
      text: `The highest number of fatal crashes (${peakHour[1]}) occur around ${formatHour(parseInt(peakHour[0]))}.`,
      icon: 'fas fa-clock'
    },
    {
      title: `Recent ${recentMonths}-Month Trend`,
      text: `Fatalities ${recentTrend < 0 ? 'decreased' : 'increased'} by ${Math.abs(recentTrend)} (${recentTrend < 0 ? '' : '+'}${recentTrendPercent}%) compared to the previous ${recentMonths} months.`,
      icon: recentTrend < 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up'
    }
  ];
  
  // Render insights
  insights.forEach(insight => {
    const insightCard = document.createElement('div');
    insightCard.className = 'insight-card';
    
    insightCard.innerHTML = `
      <div class="insight-header">
        <div class="insight-icon">
          <i class="${insight.icon}"></i>
        </div>
        <h3 class="insight-title">${insight.title}</h3>
      </div>
      <div class="insight-body">
        <p class="insight-text">${insight.text}</p>
      </div>
    `;
    
    insightsContainer.appendChild(insightCard);
  });
}

// Export functions if module exists
if (typeof module !== 'undefined') {
  module.exports = {
    updateInsights
  };
}