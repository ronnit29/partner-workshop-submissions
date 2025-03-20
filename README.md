# Microsoft Teams ADaaS Connector for DevRev

This integration enables the indexing and searching of Microsoft Teams conversations within DevRev's search system. It extracts messages from Teams channels and makes them searchable through DevRev's interface.

## Features

- Extracts messages from Microsoft Teams channels
- Indexes message content, authors, and metadata
- Supports real-time search of Teams conversations in DevRev
- Maintains message context with channel and team information

## Prerequisites

1. Microsoft Azure Account with admin access
2. Microsoft Teams environment
3. DevRev account with appropriate permissions
4. Node.js 14+ and npm installed

## Setup

### 1. Microsoft Teams App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "App Registrations"
3. Create a new registration
4. Set the following API permissions:
   - ChannelMessage.Read.All
   - Channel.ReadBasic.All
   - Team.ReadBasic.All

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
MS_TEAMS_CLIENT_ID=your_client_id
MS_TEAMS_CLIENT_SECRET=your_client_secret
MS_TEAMS_TENANT_ID=your_tenant_id
MS_TEAMS_TEAM_ID=your_team_id
```

### 3. Installation

```bash
cd code
npm install
npm run build
```

## Usage

1. Configure the connection in DevRev:
   - Connection Type: Microsoft Teams Connection
   - Provide Client ID, Client Secret, and Tenant ID

2. Run the extraction:
   ```bash
   npm start
   ```

## Development

- `npm run lint`: Run linter
- `npm run test`: Run tests
- `npm run build`: Build the project
- `npm run start:watch`: Run with hot reload

## Architecture

The connector consists of three main components:

1. **Extraction Function**: Fetches messages from Microsoft Teams channels
2. **Loading Function**: Processes and prepares data for indexing
3. **Teams Client**: Handles authentication and API interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

ISC
