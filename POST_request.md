# DevRev Schema Custom Set API

## Endpoint
POST https://api.devrev.ai/internal/schemas.custom.set

## Headers
```json
{
    "Content-Type": "application/json",
    "Authorization": "Bearer <your_access_token>"
}
```

## Request Body
```json
{
    "type": "tenant_fragment",
    "deprecated": false,
    "description": "Customer Support Automation for SpeedFusion",
    "fields": [
        {
            "field_type": "enum",
            "allowed_values": [
                "North America",
                "Europe",
                "Asia-Pacific"
            ],
            "description": "Defines the geographical region of the customer account",
            "name": "region",
            "is_filterable": true,
            "ui": {
                "display_name": "Region"
            }
        },
        {
            "name": "sector",
            "field_type": "enum",
            "allowed_values": [
                "Finance",
                "Healthcare",
                "Retail",
                "Technology"
            ],
            "description": "Defines the industry sector of the customer",
            "is_filterable": true,
            "ui": {
                "display_name": "Sector"
            }
        },
        {
            "name": "support_group",
            "field_type": "tokens",
            "description": "Auto-assigned support group based on region",
            "ui": {
                "display_name": "Support Group"
            }
        },
        {
            "name": "assigned_agent",
            "field_type": "tokens",
            "description": "Support agent assigned in a load-balanced way",
            "ui": {
                "display_name": "Assigned Agent"
            }
        },
        {
            "name": "ticket_id",
            "field_type": "tokens",
            "description": "Unique identifier for the support ticket",
            "ui": {
                "display_name": "Ticket ID"
            }
        },
        {
            "name": "conversation_id",
            "field_type": "tokens",
            "description": "Unique identifier for the customer conversation",
            "ui": {
                "display_name": "Conversation ID"
            }
        },
        {
            "name": "ticket_count",
            "field_type": "int",
            "description": "Total number of tickets created for the region",
            "ui": {
                "display_name": "Ticket Count"
            }
        }
    ],
    "conditions": [
        {
            "effects": [
                {
                    "fields": ["custom_fields.sector"],
                    "allowed_values": ["Finance", "Healthcare"]
                }
            ],
            "expression": "custom_fields.region == 'North America'"
        },
        {
            "effects": [
                {
                    "fields": ["custom_fields.sector"],
                    "allowed_values": ["Retail", "Technology"]
                }
            ],
            "expression": "custom_fields.region == 'Europe'"
        },
        {
            "effects": [
                {
                    "fields": ["custom_fields.sector"],
                    "allowed_values": ["Technology", "Healthcare"]
                }
            ],
            "expression": "custom_fields.region == 'Asia-Pacific'"
        }
    ],
    "subtype": "support_ticket",
    "subtype_display_name": "Support Ticket",
    "leaf_type": "issue"
}
```

## Response Example
```json
{
    "status": "success",
    "message": "Schema updated successfully"
}
```

## Notes
- Replace `<your_access_token>` with your actual DevRev API access token
- The schema defines the structure for support tickets with region-dependent sector filtering
- Ensure all required fields are included in the request body
- Test the API in a development environment before deploying to production 