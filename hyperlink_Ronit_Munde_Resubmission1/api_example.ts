import axios from 'axios';

// Example of making a POST request to DevRev API
async function makeDevRevPostRequest() {
    // Replace with your actual DevRev API token
    const token = 'YOUR_DEVREV_API_TOKEN';
    
    // Example payload for creating a custom field schema
    const payload = {
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
    };

    try {
        // Making POST request to DevRev API
        const response = await axios.post(
            'https://api.devrev.ai/internal/schemas.custom.set',
            payload,
            {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('POST request successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error making POST request:', error.message);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        await makeDevRevPostRequest();
    } catch (error) {
        console.error('Main function error:', error);
    }
}

// Run the example
main(); 