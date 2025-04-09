/**
 * Key metrics calculation functions for the NZ Road Safety Dashboard
 */

/**
 * Update summary statistics
 */
function updateSummaryStats() {
  const statsContainer = document.getElementById('summaryStats');
  statsContainer.innerHTML = '';
  
  // Calculate metrics from filtered data
  const metrics = calculateCrashMetrics(filteredData);
  uniqueCrashes = metrics.crashes;
  
  // Get total fatalities directly from metrics calculation
  const totalFatalities = metrics.fatalities;
  
  // Get crash dates for analysis
  const crashDates = getSortedCrashDates(uniqueCrashes);
  
  // Calculate days between crashes
  const daysBetween = calculateDaysBetween(crashDates);
  
  const avgDays = daysBetween.length > 0 ? 
    (daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length).toFixed(1) : 0;
  const maxStreak = daysBetween.length > 0 ? Math.max(...daysBetween) : 0;
  
  // Calculate year-to-date comparison
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  // Calculate fatalities by year
  const yearFatalities = {};
  filteredData.forEach(row => {
    if (row['Crash date']) {
      const date = parseDate(row['Crash date']);
      if (date) {
        const year = date.getFullYear();
        if (!yearFatalities[year]) yearFatalities[year] = 0;
        
        // Count fatalities
        const fatalityCount = parseInt(row['Crash fatality no'] || 0);
        yearFatalities[year] += fatalityCount;
      }
    }
  });
  
  // Year-to-date calculations
  const now = new Date();
  const thisYearFatalities = yearFatalities[currentYear] || 0;
  
  // Calculate YTD for last year
  const ytdLastYear = filteredData
    .filter(row => {
      const date = parseDate(row['Crash date']);
      if (!date) return false;
      return date.getFullYear() === lastYear && 
             (date.getMonth() < now.getMonth() || 
             (date.getMonth() === now.getMonth() && date.getDate() <= now.getDate()));
    })
    .reduce((sum, row) => sum + parseInt(row['Crash fatality no'] || 0), 0);
  
  const yearChange = thisYearFatalities - ytdLastYear;
  const yearChangePercent = ytdLastYear > 0 ? 
    ((yearChange / ytdLastYear) * 100).toFixed(1) : 0;
  
  // Calculate crashes per day (frequency)
  const dateRange = crashDates.length > 0 ? 
    (crashDates[crashDates.length - 1] - crashDates[0]) / (1000 * 60 * 60 * 24) : 0;
  const crashesPerDay = (uniqueCrashes.size / (dateRange || 1)).toFixed(2);
  
  // Calculate new KPIs
  const speedZoneMetrics = calculateHighSpeedZoneFatalities(filteredData);
  const vulnerableUserMetrics = calculateVulnerableUserFatalities(filteredData);
  
  // Create stat cards
  const stats = [
    {
      label: 'Total Fatalities',
      value: formatNumber(totalFatalities),
      icon: 'fas fa-skull-crossbones',
      description: 'Total road deaths in selected period',
      tooltip: 'Represents the total number of lives lost in road crashes during the selected time period.'
    },
    {
      label: 'Unique Crashes',
      value: formatNumber(uniqueCrashes.size),
      icon: 'fas fa-car-crash',
      description: 'Distinct crash incidents',
      tooltip: 'Shows the number of unique crash incidents that resulted in fatalities.'
    },
    {
      label: 'Avg. Days Between',
      value: avgDays,
      icon: 'fas fa-calendar-day',
      description: 'Days between fatal crashes (average)',
      tooltip: 'The average number of days between fatal crash incidents.'
    },
    {
      label: 'Longest Safety Streak',
      value: maxStreak,
      icon: 'fas fa-trophy',
      description: 'Maximum days without fatalities',
      tooltip: 'The longest period (in days) where no fatal crashes occurred.'
    },
    {
      label: `Fatalities (${currentYear})`,
      value: formatNumber(thisYearFatalities),
      icon: 'fas fa-chart-line',
      description: `${yearChange > 0 ? '+' : ''}${yearChange} fatalities (${yearChange > 0 ? '+' : ''}${yearChangePercent}%) vs YTD ${lastYear}`,
      changeClass: yearChange <= 0 ? 'positive-change' : 'negative-change',
      tooltip: `Compares road fatalities in ${currentYear} with the same period in ${lastYear}.`
    },
    {
      label: 'High-Speed Zone Fatalities',
      value: `${speedZoneMetrics.percentage}%`,
      icon: 'fas fa-tachometer-alt',
      description: `${speedZoneMetrics.highSpeedFatalities} deaths in zones ≥80 km/h`,
      tooltip: 'Percentage of fatalities occurring in high-speed zones (≥80 km/h).'
    },
    {
      label: 'Vulnerable Road Users',
      value: `${vulnerableUserMetrics.percentage}%`,
      icon: 'fas fa-walking',
      description: `${vulnerableUserMetrics.vulnerableUserFatalities} deaths of unprotected users`,
      tooltip: 'Percentage of fatalities involving pedestrians, cyclists, and motorcyclists.'
    },
    {
      label: 'Crashes Per Day',
      value: crashesPerDay,
      icon: 'fas fa-stopwatch',
      description: 'Average fatal crashes per day',
      tooltip: 'The average number of fatal crashes occurring each day during the selected period.'
    }
  ];
  
  // Render stat cards
  stats.forEach(stat => {
    const statCard = document.createElement('div');
    statCard.className = 'card stat-card';
    
    statCard.innerHTML = `
      <div class="stat-header">
        <div class="tooltip-trigger">
          <h4 class="stat-label">${stat.label}</h4>
          <div class="metric-tooltip">${stat.tooltip}</div>
        </div>
        <div class="stat-icon">
          <i class="${stat.icon}"></i>
        </div>
      </div>
      <div class="stat-value">${stat.value}</div>
      <div class="stat-comparison ${stat.changeClass || ''}">${stat.description}</div>
    `;
    
    statsContainer.appendChild(statCard);
  });
}


/**
 * Calculate percentage of fatalities in high-speed zones
 * @param {Array} data - Filtered data array
 * @returns {Object} Metrics for high-speed zones
 */
function calculateHighSpeedZoneFatalities(data) {
  let highSpeedFatalities = 0;
  let totalFatalitiesWithSpeed = 0;
  
  data.forEach(row => {
    // Check if speed limit data exists and fatality count is valid
    if (row['Speed limit'] && !isNaN(row['Speed limit']) && row['Crash fatality no']) {
      totalFatalitiesWithSpeed++;
      
      // Consider speeds ≥80 km/h as high speed
      if (row['Speed limit'] >= 80) {
        highSpeedFatalities++;
      }
    }
  });
  
  // Calculate percentage (handle edge case of no data)
  const percentage = totalFatalitiesWithSpeed > 0 
    ? (highSpeedFatalities / totalFatalitiesWithSpeed * 100).toFixed(1) 
    : 0;
    
  return {
    highSpeedFatalities: highSpeedFatalities,
    totalFatalitiesWithSpeed: totalFatalitiesWithSpeed,
    percentage: percentage
  };
}

/**
 * Calculate percentage of fatalities involving vulnerable road users
 * @param {Array} data - Filtered data array
 * @returns {Object} Metrics for vulnerable road users
 */
function calculateVulnerableUserFatalities(data) {
  let vulnerableUserFatalities = 0;
  let totalFatalitiesWithVehicle = 0;
  
  // Define vulnerable road user vehicle types
  const vulnerableTypes = ['Pedestrian', 'Cyclist', 'Motorcycle', 'Moped', 'Bicycle'];
  
  data.forEach(row => {
    // Check if vehicle type data exists and fatality count is valid
    if (row['Vehicle type'] && row['Crash fatality no']) {
      totalFatalitiesWithVehicle++;
      
      // Check if this is a vulnerable road user
      if (vulnerableTypes.some(type => row['Vehicle type'].includes(type))) {
        vulnerableUserFatalities++;
      }
    }
  });
  
  // Calculate percentage (handle edge case of no data)
  const percentage = totalFatalitiesWithVehicle > 0 
    ? (vulnerableUserFatalities / totalFatalitiesWithVehicle * 100).toFixed(1) 
    : 0;
    
  return {
    vulnerableUserFatalities: vulnerableUserFatalities,
    totalFatalitiesWithVehicle: totalFatalitiesWithVehicle,
    percentage: percentage
  };
}

/**
 * Update advanced metrics
 */
function updateAdvancedMetrics() {
  const metricsContainer = document.getElementById('advancedMetrics');
  metricsContainer.innerHTML = '';
  
  // Calculate metrics from filtered data 
  const metrics = calculateCrashMetrics(filteredData);
  
  // Get crash data for analysis
  const crashData = Array.from(metrics.crashes.values());
  const crashDates = crashData
    .map(crash => crash.date)
    .filter(date => date !== null)
    .sort((a, b) => a - b);
  
  // Calculate days between crashes
  const daysBetween = calculateDaysBetween(crashDates);
  
  // 1. Fatality rate per 100,000 population
  const totalFatalities = metrics.fatalities;
  
  // Calculate annualized rate
  let annualRate = 0;
  if (crashDates.length >= 2) {
    const dateRangeInDays = (crashDates[crashDates.length - 1] - crashDates[0]) / (1000 * 60 * 60 * 24);
    const yearFraction = dateRangeInDays / 365;
    if (yearFraction > 0) {
      annualRate = (totalFatalities / yearFraction / CONFIG.nzPopulation) * 100000;
    }
  }
  
  // 2. Statistical volatility (standard deviation of days between)
  const avgDays = daysBetween.length > 0 ? 
    daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length : 0;
  const variance = daysBetween.length > 0 ? 
    daysBetween.reduce((a, b) => a + Math.pow(b - avgDays, 2), 0) / daysBetween.length : 0;
  const volatility = Math.sqrt(variance).toFixed(1);
  
  // 3. Fatality frequency (average number of fatalities per month)
  let frequencyPerMonth = 0;
  if (crashDates.length >= 2) {
    const oldestDate = crashDates[0];
    const newestDate = crashDates[crashDates.length - 1];
    const monthsDiff = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                       (newestDate.getMonth() - oldestDate.getMonth());
    frequencyPerMonth = (totalFatalities / (monthsDiff || 1)).toFixed(1);
  }
  
  // 4. Safety improvement metric (change in average days between fatalities year over year)
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  const thisYearIntervals = [];
  const lastYearIntervals = [];
  
  for (let i = 1; i < crashDates.length; i++) {
    const diffDays = Math.ceil(Math.abs(crashDates[i] - crashDates[i-1]) / (1000 * 60 * 60 * 24));
    if (crashDates[i].getFullYear() === currentYear) {
      thisYearIntervals.push(diffDays);
    } else if (crashDates[i].getFullYear() === lastYear) {
      lastYearIntervals.push(diffDays);
    }
  }
  
  const thisYearAvg = thisYearIntervals.length > 0 ? 
    thisYearIntervals.reduce((a, b) => a + b, 0) / thisYearIntervals.length : 0;
  
  const lastYearAvg = lastYearIntervals.length > 0 ? 
    lastYearIntervals.reduce((a, b) => a + b, 0) / lastYearIntervals.length : 0;
  
  const safetyImprovement = thisYearAvg - lastYearAvg;
  const safetyImprovementPercent = lastYearAvg > 0 ? 
    ((safetyImprovement / lastYearAvg) * 100).toFixed(1) : 0;
  
  // Create metric cards
  const metricCards = [
    {
      title: 'Annual Fatality Rate',
      value: annualRate.toFixed(2),
      comparison: 'Per 100,000 population',
      icon: 'fas fa-chart-pie',
      tooltip: 'Standardized rate showing road fatalities per 100,000 population on an annual basis. This allows for fair comparison across different regions and time periods.'
    },
    {
      title: 'Safety Streak Volatility',
      value: volatility,
      comparison: 'Days (standard deviation)',
      icon: 'fas fa-heartbeat',
      tooltip: 'Measures the variation in days between fatal crashes. Lower volatility with higher average days between crashes indicates more consistent road safety.'
    },
    {
      title: 'Monthly Fatality Frequency',
      value: frequencyPerMonth,
      comparison: 'Deaths per month on average',
      icon: 'fas fa-calendar-check',
      tooltip: 'The average number of road fatalities occurring each month during the selected period. Helps establish a baseline for assessing monthly trends.'
    },
    {
      title: 'Safety Gap Change',
      value: safetyImprovement.toFixed(1),
      comparison: `${safetyImprovement > 0 ? '+' : ''}${safetyImprovementPercent}% vs. last year`,
      icon: 'fas fa-exchange-alt',
      positive: safetyImprovement > 0,
      changeClass: safetyImprovement > 0 ? 'positive-change' : 'negative-change',
      tooltip: `Measures how the average time between fatal crashes has changed compared to last year. Positive values indicate improvement (longer gaps between fatalities).`
    }
  ];
  
  // Render metric cards
  metricCards.forEach(metric => {
    const metricCard = document.createElement('div');
    metricCard.className = 'card advanced-metric-card';
    
    metricCard.innerHTML = `
      <div class="metric-icon">
        <i class="${metric.icon}"></i>
      </div>
      <div class="metric-content">
        <div class="metric-header">
          <div class="tooltip-trigger">
            <h4 class="metric-title">${metric.title}</h4>
            <div class="metric-tooltip">${metric.tooltip}</div>
          </div>
        </div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-comparison ${metric.changeClass || ''}">${metric.comparison}</div>
      </div>
    `;
    
    metricsContainer.appendChild(metricCard);
  });
}

// Export functions if module exists
if (typeof module !== 'undefined') {
  module.exports = {
    updateSummaryStats,
    updateAdvancedMetrics
  };
}