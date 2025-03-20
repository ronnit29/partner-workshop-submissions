# DevRev API Integration Example

This project demonstrates how to integrate with the DevRev API, specifically showing how to make POST requests to create custom field schemas and handle ticket stage changes.

## Project Structure

```
.
├── api_example.ts          # Example of making POST requests to DevRev API
└── Load balanced manner data/
    └── code/
        └── src/
            └── functions/
                └── ticket_stage_change/
                    └── index.ts  # Main ticket stage change handler
```

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- DevRev API Token

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install axios @types/axios sprintf-js @types/sprintf-js
```

## Configuration

1. Replace the API token in `api_example.ts`:
```typescript
const token = 'YOUR_DEVREV_API_TOKEN';  // Replace with your actual token
```

## API Endpoints

The example demonstrates POST requests to the following DevRev API endpoint:
- `https://api.devrev.ai/internal/schemas.custom.set`

## Usage

### Running the API Example

```bash
ts-node api_example.ts
```

### Custom Field Schema Structure

The example shows how to create a custom field schema with the following structure:
```typescript
{
    type: "custom_type_fragment",
    deprecated: false,
    description: "Example custom field schema",
    fields: [
        {
            field_type: "enum",
            allowed_values: ["Option1", "Option2"],
            description: "Example enum field",
            name: "example_field",
            is_filterable: true,
            ui: {
                display_name: "Example Field"
            }
        }
    ],
    subtype: "example_subtype",
    subtype_display_name: "Example Subtype",
    leaf_type: "issue"
}
```

## Error Handling

The code includes comprehensive error handling:
- API request errors
- Token validation
- Response validation

## Development

To modify the example:
1. Update the payload in `api_example.ts` to match your needs
2. Add additional API endpoints as needed
3. Modify error handling as required

## Security Notes

- Never commit your API token to version control
- Use environment variables for sensitive data
- Always validate API responses

## Contributing

Feel free to submit issues and enhancement requests! 