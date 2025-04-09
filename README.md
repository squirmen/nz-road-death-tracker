# New Zealand Road Death Tracker

A web-based tracker and interactive dashboard for monitoring and visualizing road fatality data across New Zealand. The project features a counter displaying days since the last road death, combined with comprehensive data visualization tools to increase awareness and understanding of road safety trends.

## 🌐 Live Site

Visit the live site at [nzroads.tfwelch.com](https://nzroads.tfwelch.com)

## 📊 Features

- Real-time counter tracking days since the last road fatality
- Interactive dashboard with detailed data visualizations
- Maps displaying road death locations
- Time-based trend analysis
- Filtering by various factors (vehicle type, location, time period)
- Responsive design for desktop and mobile viewing
- Regular data updates from official sources

## 🛠️ Technical Details

This project consists of:
- PHP-based tracker for counting days since last road death
- JavaScript dashboard for data visualization
- CSV data storage for fatality records
- Automated deployment via GitHub Actions

## 📁 Repository Structure

```
NZ_Road-Death-Tracker/
├── tracker/              # Main website files for the days counter
│   ├── index.php         # Main entry point
│   ├── checker.php       # Date checking logic
│   ├── complete.php      # Completion handlers
│   ├── config.php        # Configuration
│   └── other PHP files   # Supporting functionality
├── dashboard/            # Data visualization dashboard
│   ├── charts.js         # Chart generation code
│   ├── config.js         # Dashboard configuration
│   ├── dashboard.js      # Main dashboard logic
│   ├── data-utils.js     # Data processing utilities
│   ├── filters.js        # Data filtering functions
│   ├── index.html        # Dashboard interface
│   ├── insights.js       # Data analysis components
│   ├── metrics.js        # Key metrics calculations
│   └── styles.css        # Dashboard styling
└── assets/               # Shared resources
    └── NZ_RoadDeaths_Provisional.csv  # Main data file
```

## 🔄 Data Updates

The road death data is updated regularly using:

```bash
./update_road_deaths.sh path/to/new/data.csv
```

This script updates the CSV file and automatically deploys the changes to the website.

## 🚀 Deployment

This project uses GitHub Actions for automated deployment to the web server. Changes pushed to the main branch are automatically deployed to the live site.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions to improve the tracker or dashboard are welcome. Please feel free to fork the repository and submit pull requests.

## 📧 Contact

For questions or suggestions, please open an issue in this repository.
