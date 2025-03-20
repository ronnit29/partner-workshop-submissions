# Gong API Integration Project

This repository contains a Chef cookbook for managing infrastructure configurations with Gong API integration. The project enables seamless integration between Gong's AI-powered conversation analytics platform and your infrastructure management system.

## Features

- Gong API integration for call data retrieval and analysis
- Secure authentication and data handling
- Automated data synchronization
- Custom data extraction and loading functions
- Domain mapping for efficient data organization

## Prerequisites

1. Install [Chef Workstation](https://docs.chef.io/workstation/install_workstation/)
2. Install [Git](https://git-scm.com/downloads)
3. Gong API credentials (Access Key and Secret Key)
4. Node.js and npm (for API integration components)

## Project Structure

```
.
├── my_cookbook/          # Main cookbook directory
├── code/                 # Gong API integration code
│   ├── src/             # Source code
│   ├── scripts/         # Utility scripts
│   └── test/            # Test files
├── .github/             # GitHub Actions workflows
├── .env.example         # Example environment variables
├── Makefile            # Build and deployment automation
├── manifest.yaml       # Project manifest
└── metadata.json       # Project metadata
```

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd gong_project
```

2. Set up your environment:
- Copy `.env.example` to `.env`
- Update the environment variables in `.env` with your specific values:
  - GONG_ACCESS_KEY
  - GONG_SECRET_KEY
  - GONG_ACCOUNT_ID
  - Other required configuration values

3. Build the cookbook:
```bash
make build
```

4. Deploy the cookbook:
```bash
make deploy
```

## Gong API Integration

### Available Functions

- `retrieve_gong_data`: Retrieves and searches Gong call data while preserving user permissions
- `gongDataLoading`: Loads Gong data using Airdrop technology
- `extraction`: Handles data extraction from Gong API
- `loading`: Manages data loading and integration

### Authentication

The project uses secure authentication methods for Gong API access:
- API credentials are stored securely in environment variables
- Token-based authentication with automatic refresh
- User permission preservation

## Development

### Adding New Recipes

1. Create a new recipe file in `my_cookbook/recipes/`
2. Add the recipe to the cookbook's metadata
3. Update the default recipe if needed

### Testing

Run tests using:
```bash
make test
```

## Common Issues

#### Q: Build fails with dependency errors
A: Ensure all required cookbook dependencies are properly specified in the metadata.rb file

#### Q: Deployment fails with authentication errors
A: Verify your Gong API credentials are properly configured in your environment

#### Q: Environment variables not being picked up
A: Make sure you've copied `.env.example` to `.env` and filled in all required values

#### Q: Gong API connection issues
A: Check your API credentials and ensure your network allows access to Gong's API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues related to:
- Gong API integration: Contact the development team
- Chef cookbook: Refer to the Chef documentation
- General project issues: Open an issue in the repository
