# New Zealand Road Death Tracker

An interactive web dashboard for visualizing and analyzing road fatality data across New Zealand. This project aims to increase awareness and understanding of road safety trends through data visualization.

## 🌐 Live Site

Visit the live dashboard at [nzroads.tfwelch.com](https://nzroads.tfwelch.com)

## 📊 Features

- Interactive maps displaying road death locations
- Time-based trend analysis
- Filtering by various factors (vehicle type, location, time period)
- Responsive design for desktop and mobile viewing
- Regular data updates from official sources

## 🛠️ Technical Details

This project consists of:
- Dashboard interface built with JavaScript
- Data processing scripts
- CSV data storage
- PHP backend components

## 📁 Repository Structure

```
NZ_Road-Death-Tracker/
├── assets/
│   └── NZ_RoadDeaths_Provisional.csv  # Main data file
├── dashboard/
│   ├── charts.js                      # Chart generation code
│   ├── config.js                      # Configuration settings
│   ├── dashboard.js                   # Main dashboard logic
│   ├── data-utils.js                  # Data processing utilities
│   ├── filters.js                     # Data filtering functions
│   ├── index.html                     # Dashboard interface
│   ├── insights.js                    # Data analysis components
│   ├── metrics.js                     # Key metrics calculations
│   └── styles.css                     # Dashboard styling
├── tracker/
│   └── [Various PHP files]            # Backend processing
└── fonts/
    └── [Font files]                   # Typography resources
```

## 🔄 Data Updates

The data is updated regularly to reflect the latest available official statistics. To update the data:

```bash
./update_road_deaths.sh path/to/new/data.csv
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions to improve the dashboard are welcome. Please feel free to fork the repository and submit pull requests.

## 📧 Contact

For questions or suggestions, please open an issue in this repository.
