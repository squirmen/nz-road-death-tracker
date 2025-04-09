/**
 * Chart generation functions for the NZ Road Safety Dashboard
 */

/**
 * Generate all charts based on filtered data
 */
function generateCharts() {
  try {
    // Only generate charts if Plotly is available
    if (typeof Plotly === 'undefined') {
      console.error('Plotly not found! Charts cannot be rendered.');
      return;
    }
    
    // Only generate charts if CONFIG is available
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG not found! Charts cannot be rendered.');
      return;
    }
    
    // Ensure uniqueCrashes exists
    if (typeof uniqueCrashes === 'undefined' || !uniqueCrashes) {
      console.error('No crash data available! Charts cannot be rendered.');
      return;
    }
    
    // Generate all charts with error handling
    safelyExecute(generateDaysBetweenChart, 'days between');
    safelyExecute(generateCumulativeChart, 'cumulative');
    safelyExecute(generateMonthlyChart, 'monthly');
    safelyExecute(generateWeekdayChart, 'weekday');
    safelyExecute(generateRegionChart, 'region');
    safelyExecute(generateAgeGenderChart, 'age/gender');
    safelyExecute(generateVehicleChart, 'vehicle type');
    safelyExecute(generateTimeHeatmapChart, 'time heatmap');
    safelyExecute(generateRoadTypeChart, 'road type');
    safelyExecute(generateVehicleCountChart, 'vehicle count');
  } catch (error) {
    console.error('Error generating charts:', error);
  }
}

/**
 * Safely execute a chart generation function with error handling
 * @param {Function} chartFunction - Chart generation function to execute
 * @param {string} chartName - Name of the chart for error logging
 */
function safelyExecute(chartFunction, chartName) {
  try {
    chartFunction();
  } catch (error) {
    console.error(`Error generating ${chartName} chart:`, error);
  }
}

/**
 * Generate days between fatalities chart
 */
function generateDaysBetweenChart() {
  // Check if container exists
  const container = document.getElementById('daysBetweenChart');
  if (!container) {
    console.warn('Days between chart container not found in the DOM');
    return;
  }
  
  // Get crash data for charting
  const crashes = Array.from(uniqueCrashes.entries());
  
  // Safety check for data
  if (crashes.length < 2) {
    // Create empty placeholder chart
    Plotly.newPlot('daysBetweenChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'Insufficient data for days between analysis'
    });
    return;
  }
  
  crashes.sort((a, b) => a[1].date - b[1].date);
  
  const crashDates = crashes
    .map(([fcn, data]) => data.date)
    .filter(date => date !== null);
  
  // Days between fatalities chart
  const daysBetween = [];
  const daysLabels = [];
  
  for (let i = 1; i < crashDates.length; i++) {
    const diffTime = Math.abs(crashDates[i] - crashDates[i-1]);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    daysBetween.push(diffDays);
    daysLabels.push(moment(crashDates[i]).format('YYYY-MM-DD'));
  }
  
  // Check if we have data to display
  if (daysBetween.length === 0) {
    Plotly.newPlot('daysBetweenChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for days between analysis'
    });
    return;
  }
  
  Plotly.newPlot('daysBetweenChart', [{
    x: daysLabels,
    y: daysBetween,
    type: 'bar',
    marker: {
      color: daysBetween.map(days => {
        // Color gradient based on days
        if (days <= 1) return CONFIG.colors.danger; // Short gap - red
        else if (days <= 3) return CONFIG.colors.accent; // Orange
        else if (days <= 7) return CONFIG.colors.moderate; // Yellow
        else return CONFIG.colors.safe; // Long gap - green
      })
    }
  }], {
    ...CONFIG.chartDefaults,
    xaxis: {
      title: 'Date',
      tickformat: '%b %d\n%Y',
      tickangle: -45,
      nticks: 10
    },
    yaxis: { 
      title: 'Days Between Fatalities',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.1,
    hovermode: 'closest'
  });
}

/**
 * Generate cumulative fatalities chart
 */
function generateCumulativeChart() {
  // Check if container exists
  const container = document.getElementById('cumulativeChart');
  if (!container) {
    console.warn('Cumulative chart container not found in the DOM');
    return;
  }
  
  // Get crash data for charting
  const crashes = Array.from(uniqueCrashes.entries());
  
  // Safety check for data
  if (crashes.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('cumulativeChart', [{
      x: [],
      y: [],
      type: 'scatter'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for cumulative analysis'
    });
    return;
  }
  
  crashes.sort((a, b) => a[1].date - b[1].date);
  
  // Cumulative fatalities chart
  const cumulativeDates = [];
  const cumulativeValues = [];
  let cumulative = 0;
  
  // Create cumulative data sorted by date
  crashes.forEach(([fcn, data], index) => {
    if (data.date) {
      cumulative += data.fatalities || 0;
      cumulativeDates.push(moment(data.date).format('YYYY-MM-DD'));
      cumulativeValues.push(cumulative);
    }
  });
  
  // Check if we have data to display
  if (cumulativeDates.length === 0) {
    Plotly.newPlot('cumulativeChart', [{
      x: [],
      y: [],
      type: 'scatter'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for cumulative analysis'
    });
    return;
  }
  
  Plotly.newPlot('cumulativeChart', [{
    x: cumulativeDates,
    y: cumulativeValues,
    type: 'scatter',
    mode: 'lines',
    line: {
      shape: 'linear',
      width: 3,
      color: CONFIG.colors.primary
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.1)'
  }], {
    ...CONFIG.chartDefaults,
    xaxis: {
      title: 'Date',
      tickformat: '%b %d\n%Y',
      tickangle: -45,
      nticks: 10
    },
    yaxis: { 
      title: 'Total Fatalities',
      gridcolor: '#f1f5f9'
    },
    hovermode: 'closest'
  });
}

/**
 * Generate monthly fatalities chart
 */
function generateMonthlyChart() {
  // Check if container exists
  const container = document.getElementById('monthlyChart');
  if (!container) {
    console.warn('Monthly chart container not found in the DOM');
    return;
  }
  
  // Get crash data for charting
  const crashes = Array.from(uniqueCrashes.entries());
  
  // Safety check for data
  if (crashes.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('monthlyChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for monthly analysis'
    });
    return;
  }
  
  // Monthly fatalities chart
  const monthlyCounts = {};
  
  crashes.forEach(([fcn, data]) => {
    if (data.date) {
      const monthKey = moment(data.date).format('YYYY-MM');
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + (data.fatalities || 0);
    }
  });
  
  // Check if we have data to display
  if (Object.keys(monthlyCounts).length === 0) {
    Plotly.newPlot('monthlyChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for monthly analysis'
    });
    return;
  }
  
  const monthlyKeys = Object.keys(monthlyCounts).sort();
  const monthlyVals = monthlyKeys.map(k => monthlyCounts[k]);
  
  // Add month names to labels
  const monthlyLabels = monthlyKeys.map(key => {
    return moment(key).format('MMM YYYY');
  });
  
  Plotly.newPlot('monthlyChart', [{
    x: monthlyLabels,
    y: monthlyVals,
    type: 'bar',
    marker: {
      color: monthlyVals.map(val => {
        // Color based on value
        const max = Math.max(...monthlyVals, 1); // Avoid division by zero
        const ratio = val / max;
        if (ratio < 0.33) return CONFIG.colors.safe; // Low - green
        else if (ratio < 0.66) return CONFIG.colors.moderate; // Medium - yellow
        else return CONFIG.colors.danger; // High - red
      })
    }
  }], {
    ...CONFIG.chartDefaults,
    xaxis: {
      title: 'Month',
      tickangle: -45
    },
    yaxis: { 
      title: 'Fatalities',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.1,
    hovermode: 'closest'
  });
}

/**
 * Generate weekday fatalities chart
 */
function generateWeekdayChart() {
  // Check if container exists
  const container = document.getElementById('weekdayChart');
  if (!container) {
    console.warn('Weekday chart container not found in the DOM');
    return;
  }
  
  // Get crash dates
  const crashDates = Array.from(uniqueCrashes.values())
    .map(crash => crash.date)
    .filter(date => date !== null);
  
  // Safety check for data
  if (crashDates.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('weekdayChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for weekday analysis'
    });
    return;
  }
  
  // Weekday chart
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  
  crashDates.forEach(date => {
    weekdayCounts[date.getDay()]++;
  });
  
  const weekdayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  Plotly.newPlot('weekdayChart', [{
    x: weekdayLabels,
    y: weekdayCounts,
    type: 'bar',
    marker: {
      color: weekdayCounts.map(val => {
        // Color based on value
        const max = Math.max(...weekdayCounts, 1); // Avoid division by zero
        const ratio = val / max;
        if (ratio < 0.5) return CONFIG.colors.safe; // Low - green
        else if (ratio < 0.75) return CONFIG.colors.moderate; // Medium - yellow
        else return CONFIG.colors.danger; // High - red
      })
    }
  }], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 50, l: 50, r: 20 },
    yaxis: { 
      title: 'Fatal Crashes',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.3,
    hovermode: 'closest'
  });
}

/**
 * Generate region distribution chart
 */
function generateRegionChart() {
  // Check if container exists
  const container = document.getElementById('regionChart');
  if (!container) {
    console.warn('Region chart container not found in the DOM');
    return;
  }
  
  // Safety check for filtered data
  if (!filteredData || filteredData.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('regionChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for region analysis'
    });
    return;
  }
  
  // Region chart
  const regionCounts = {};
  
  filteredData.forEach(row => {
    const region = row.Region;
    if (region) {
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    }
  });
  
  // Check if we have data to display
  if (Object.keys(regionCounts).length === 0) {
    Plotly.newPlot('regionChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No region data available'
    });
    return;
  }
  
  const regionEntries = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
  const regionNames = regionEntries.map(entry => entry[0]);
  const regionValues = regionEntries.map(entry => entry[1]);
  
  Plotly.newPlot('regionChart', [{
    x: regionNames,
    y: regionValues,
    type: 'bar',
    marker: {
      color: CONFIG.colors.secondary
    }
  }], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 120, l: 50, r: 20 },
    xaxis: {
      title: 'Region',
      tickangle: -45
    },
    yaxis: { 
      title: 'Fatalities',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.3,
    hovermode: 'closest'
  });
}

/**
 * Generate age and gender distribution chart
 */
function generateAgeGenderChart() {
  // Check if container exists
  const container = document.getElementById('ageGenderChart');
  if (!container) {
    console.warn('Age-gender chart container not found in the DOM');
    return;
  }
  
  // Safety check for filtered data
  if (!filteredData || filteredData.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('ageGenderChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for age/gender analysis'
    });
    return;
  }
  
  // Age and gender chart
  const ageGenderCounts = {};
  
  filteredData.forEach(row => {
    const age = row['Age group'];
    const gender = row.Gender;
    
    if (age && gender) {
      if (!ageGenderCounts[age]) {
        ageGenderCounts[age] = { Male: 0, Female: 0, Unknown: 0 };
      }
      ageGenderCounts[age][gender] = (ageGenderCounts[age][gender] || 0) + 1;
    }
  });
  
  // Check if we have data to display
  if (Object.keys(ageGenderCounts).length === 0) {
    Plotly.newPlot('ageGenderChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No age/gender data available'
    });
    return;
  }
  
  const ageGroups = Object.keys(ageGenderCounts).sort((a, b) => {
    // Sort age groups correctly
    const aMatch = a.match(/^(\d+)/);
    const bMatch = b.match(/^(\d+)/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.localeCompare(b);
  });
  
  const maleValues = ageGroups.map(age => ageGenderCounts[age].Male || 0);
  const femaleValues = ageGroups.map(age => ageGenderCounts[age].Female || 0);
  const unknownValues = ageGroups.map(age => ageGenderCounts[age].Unknown || 0);
  
  Plotly.newPlot('ageGenderChart', [
    {
      x: ageGroups,
      y: maleValues,
      name: 'Male',
      type: 'bar',
      marker: { color: CONFIG.colors.primary }
    },
    {
      x: ageGroups,
      y: femaleValues,
      name: 'Female',
      type: 'bar',
      marker: { color: CONFIG.colors.danger }
    },
    {
      x: ageGroups,
      y: unknownValues,
      name: 'Unknown',
      type: 'bar',
      marker: { color: CONFIG.colors.neutral }
    }
  ], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 120, l: 50, r: 20 },
    xaxis: {
      title: 'Age Group',
      tickangle: -45
    },
    yaxis: { 
      title: 'Fatalities',
      gridcolor: '#f1f5f9'
    },
    barmode: 'stack',
    bargap: 0.15,
    legend: {
      x: 0.5,
      y: 1.15,
      xanchor: 'center',
      orientation: 'h'
    },
    hovermode: 'closest'
  });
}

/**
 * Generate vehicle type distribution chart
 */
function generateVehicleChart() {
  // Check if container exists
  const container = document.getElementById('vehicleChart');
  if (!container) {
    console.warn('Vehicle chart container not found in the DOM');
    return;
  }
  
  // Safety check for filtered data
  if (!filteredData || filteredData.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('vehicleChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for vehicle analysis'
    });
    return;
  }
  
  // Vehicle type chart
  const vehicleCounts = {};
  
  filteredData.forEach(row => {
    const vehicle = row['Vehicle type'];
    if (vehicle) {
      vehicleCounts[vehicle] = (vehicleCounts[vehicle] || 0) + 1;
    }
  });
  
  // Check if we have data to display
  if (Object.keys(vehicleCounts).length === 0) {
    Plotly.newPlot('vehicleChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No vehicle data available'
    });
    return;
  }
  
  const vehicleEntries = Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1]);
  const vehicleNames = vehicleEntries.map(entry => entry[0]);
  const vehicleValues = vehicleEntries.map(entry => entry[1]);
  
  Plotly.newPlot('vehicleChart', [{
    x: vehicleNames,
    y: vehicleValues,
    type: 'bar',
    marker: {
      color: CONFIG.colors.safe
    }
  }], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 120, l: 50, r: 20 },
    xaxis: {
      title: 'Vehicle Type',
      tickangle: -45
    },
    yaxis: { 
      title: 'Fatalities',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.3,
    hovermode: 'closest'
  });
}

/**
 * Generate time of day heatmap chart
 */
function generateTimeHeatmapChart() {
  // Check if container exists
  const container = document.getElementById('timeHeatmapChart');
  if (!container) {
    console.warn('Time heatmap container not found in the DOM');
    return;
  }
  
  // Safety check for filtered data
  if (!filteredData || filteredData.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('timeHeatmapChart', [{
      z: [[0]],
      type: 'heatmap'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for time analysis'
    });
    return;
  }
  
  // Time heatmap chart
  const timeHeatmap = Array(7).fill().map(() => Array(24).fill(0)); // [day][hour]
  let hasData = false;
  
  filteredData.forEach(row => {
    if (row['Crash date'] && row['Crash time']) {
      try {
        const date = parseDate(row['Crash date']);
        if (!date) return;
        
        let hour = -1;
        
        if (row['Crash time'].includes(':')) {
          const timeStr = row['Crash time'];
          let hours = parseInt(timeStr.split(':')[0]);
          
          // Handle AM/PM format
          if (timeStr.includes('PM') && hours < 12) {
            hours += 12;
          } else if (timeStr.includes('AM') && hours === 12) {
            hours = 0;
          }
          
          hour = hours;
        }
        
        const dayOfWeek = date.getDay();
        
        if (!isNaN(dayOfWeek) && !isNaN(hour) && hour >= 0 && hour < 24) {
          timeHeatmap[dayOfWeek][hour]++;
          hasData = true;
        }
      } catch (e) {
        // Skip invalid data
      }
    }
  });
  
  // Check if we have data to display
  if (!hasData) {
    Plotly.newPlot('timeHeatmapChart', [{
      z: [[0]],
      type: 'heatmap'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No time data available'
    });
    return;
  }
  
  const hourLabels = Array.from({length: 24}, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour}${ampm}`;
  });
  
  Plotly.newPlot('timeHeatmapChart', [{
    z: timeHeatmap,
    x: hourLabels,
    y: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    type: 'heatmap',
    colorscale: [
      [0, 'rgb(247, 250, 252)'],
      [0.1, 'rgb(226, 232, 240)'],
      [0.2, 'rgb(203, 213, 225)'],
      [0.3, 'rgb(148, 163, 184)'],
      [0.4, 'rgb(100, 116, 139)'],
      [0.5, 'rgb(71, 85, 105)'],
      [0.6, 'rgb(51, 65, 85)'],
      [0.7, 'rgb(30, 41, 59)'],
      [0.8, 'rgb(15, 23, 42)'],
      [1.0, 'rgb(2, 6, 23)']
    ],
    hoverongaps: false
  }], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 50, l: 100, r: 20 },
    xaxis: {
      title: 'Hour of Day'
    },
    yaxis: {
      title: 'Day of Week'
    },
    annotations: []
  });
}

/**
 * Generate road type distribution chart
 */
function generateRoadTypeChart() {
  // Check if container exists
  const container = document.getElementById('roadTypeChart');
  if (!container) {
    console.warn('Road type chart container not found in the DOM');
    return;
  }
  
  // Safety check for filtered data
  if (!filteredData || filteredData.length === 0) {
    // Create empty placeholder chart
    Plotly.newPlot('roadTypeChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No data available for road type analysis'
    });
    return;
  }
  
  // Road type chart
  const roadTypeCounts = {};
  
  filteredData.forEach(row => {
    const roadType = row['Road type'];
    if (roadType) {
      roadTypeCounts[roadType] = (roadTypeCounts[roadType] || 0) + 1;
    }
  });
  
  // Check if we have data to display
  if (Object.keys(roadTypeCounts).length === 0) {
    Plotly.newPlot('roadTypeChart', [{
      x: [],
      y: [],
      type: 'bar'
    }], {
      ...CONFIG.chartDefaults,
      title: 'No road type data available'
    });
    return;
  }
  
  const roadTypeEntries = Object.entries(roadTypeCounts).sort((a, b) => b[1] - a[1]);
  const roadTypeNames = roadTypeEntries.map(entry => entry[0]);
  const roadTypeValues = roadTypeEntries.map(entry => entry[1]);
  
  // Use a more professional color scale for road types
  const roadTypeColors = roadTypeValues.map((val, index) => {
    // Safety check for division by zero
    const denominator = Math.max(roadTypeValues.length, 1);
    return `rgba(59, 130, 246, ${1 - (index * 0.7 / denominator)})`;
  });
  
  Plotly.newPlot('roadTypeChart', [{
    x: roadTypeNames,
    y: roadTypeValues,
    type: 'bar',
    marker: {
      color: roadTypeColors
    }
  }], {
    ...CONFIG.chartDefaults,
    margin: { t: 10, b: 120, l: 50, r: 20 },
    xaxis: {
      title: 'Road Type',
      tickangle: -45
    },
    yaxis: { 
      title: 'Fatalities',
      gridcolor: '#f1f5f9'
    },
    bargap: 0.3,
    hovermode: 'closest'
  });
}

/**
 * Generate multi-vehicle vs. single-vehicle chart
 */
function generateVehicleCountChart() {
  try {
    // Check if container exists
    const container = document.getElementById('vehicleCountChart');
    if (!container) {
      console.warn('Vehicle count chart container not found in the DOM');
      return;
    }
    
    // Vehicle count distribution chart
    const vehicleCountData = { 'Single Vehicle': 0, 'Multiple Vehicles': 0 };
    let totalWithVehicleCount = 0;
    
    // Count crashes by vehicle count with safety checks
    uniqueCrashes.forEach((crash, fcn) => {
      if (crash && crash.vehicles !== undefined) {
        totalWithVehicleCount++;
        if (crash.vehicles === 1) {
          vehicleCountData['Single Vehicle']++;
        } else if (crash.vehicles > 1) {
          vehicleCountData['Multiple Vehicles']++;
        }
      }
    });
    
    // Only proceed if we have data
    if (totalWithVehicleCount === 0) {
      console.warn("No vehicle count data available for chart");
      
      // Create an empty placeholder chart instead of failing
      Plotly.newPlot('vehicleCountChart', [{
        labels: ['No Data'],
        values: [1],
        type: 'pie',
        textinfo: 'label',
        marker: { colors: ['#f1f5f9'] }
      }], {
        ...CONFIG.chartDefaults,
        height: 350,
        margin: { t: 10, b: 10, l: 10, r: 10 },
        annotations: [{
          text: 'No vehicle count data available',
          showarrow: false,
          font: { size: 14, color: '#64748b' },
          align: 'center',
          x: 0.5,
          y: 0.5
        }]
      });
      
      return;
    }
    
    // Create data for pie chart
    const labels = Object.keys(vehicleCountData);
    const values = Object.values(vehicleCountData);
    
    // Create pie chart
    Plotly.newPlot('vehicleCountChart', [{
      labels: labels,
      values: values,
      type: 'pie',
      textinfo: 'label+percent',
      insidetextorientation: 'radial',
      marker: {
        colors: [CONFIG.colors.primary, CONFIG.colors.accent]
      }
    }], {
      ...CONFIG.chartDefaults,
      height: 350,
      margin: { t: 10, b: 10, l: 10, r: 10 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5,
        y: 0,
        xanchor: 'center'
      }
    });
    
    // Safely add count annotation to the center of the pie chart
    try {
      const total = values.reduce((acc, val) => acc + val, 0);
      if (total > 0) {
        const percentSingle = ((vehicleCountData['Single Vehicle'] / total) * 100).toFixed(1);
        
        // Create text annotation for the summary stats
        const annotation = {
          text: `${vehicleCountData['Single Vehicle']} Single (${percentSingle}%)<br>${vehicleCountData['Multiple Vehicles']} Multiple`,
          showarrow: false,
          font: {
            size: 12,
            color: '#64748b'
          },
          align: 'center',
          x: 0.5,
          y: 1.1
        };
        
        // Add annotation to layout safely
        const chartElement = document.getElementById('vehicleCountChart');
        if (chartElement && chartElement._fullLayout) {
          Plotly.relayout('vehicleCountChart', { annotations: [annotation] });
        }
      }
    } catch (annotationError) {
      console.warn("Could not add annotation to vehicle count chart:", annotationError);
    }
  } catch (error) {
    console.error("Error generating vehicle count chart:", error);
    // Create a fallback empty chart
    Plotly.newPlot('vehicleCountChart', [{
      type: 'bar',
      x: [],
      y: []
    }], {
      ...CONFIG.chartDefaults,
      title: 'Chart Error - Check Console'
    });
  }
}

// Export functions if module exists
if (typeof module !== 'undefined') {
  module.exports = {
    generateCharts,
    generateDaysBetweenChart,
    generateCumulativeChart,
    generateMonthlyChart,
    generateWeekdayChart,
    generateRegionChart,
    generateAgeGenderChart,
    generateVehicleChart,
    generateTimeHeatmapChart,
    generateRoadTypeChart,
    generateVehicleCountChart,
    safelyExecute
  };
}