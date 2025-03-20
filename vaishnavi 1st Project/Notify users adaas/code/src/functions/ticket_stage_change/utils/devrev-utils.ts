/*
 * Copyright (c) 2023 DevRev, Inc. All rights reserved.
 */

import { postCall, getCall, generateQueryString } from "./api-utils"

const DEVREV_API_BASE = "https://api.devrev.ai/";

export interface SupportAgent {
    id: string;
    ticketCount: number;
    conversationCount: number;
    division: string;
}

// Custom type fragment for FutureScape support tickets
const FUTURESCAPE_SUPPORT_TICKET_SCHEMA = {
    type: "custom_type_fragment",
    deprecated: false,
    description: "Customer Support Automation for FutureScape",
    fields: [
        {
            field_type: "enum",
            allowed_values: ["Enterprise", "SMB", "Government"],
            description: "Defines the division of the customer account",
            name: "division",
            is_filterable: true,
            ui: { display_name: "Division" }
        },
        {
            name: "area",
            field_type: "enum",
            allowed_values: ["North", "South", "East", "West"],
            description: "Defines the geographical area of the customer",
            is_filterable: true,
            ui: { display_name: "Area" }
        },
        {
            name: "support_group",
            field_type: "tokens",
            description: "Auto-assigned support group based on division",
            ui: { display_name: "Support Group" }
        },
        {
            name: "assigned_agent",
            field_type: "tokens",
            description: "Support agent assigned in a load-balanced way",
            ui: { display_name: "Assigned Agent" }
        },
        {
            name: "ticket_id",
            field_type: "tokens",
            description: "Unique identifier for the support ticket",
            ui: { display_name: "Ticket ID" }
        },
        {
            name: "conversation_id",
            field_type: "tokens",
            description: "Unique identifier for the customer conversation",
            ui: { display_name: "Conversation ID" }
        },
        {
            name: "ticket_count",
            field_type: "int",
            description: "Total number of tickets created for the division",
            ui: { display_name: "Ticket Count" }
        }
    ],
    conditions: [
        {
            effects: [
                {
                    fields: ["custom_fields.area"],
                    allowed_values: ["North", "South"]
                }
            ],
            expression: "custom_fields.division == 'Enterprise'"
        },
        {
            effects: [
                {
                    fields: ["custom_fields.area"],
                    allowed_values: ["East", "West"]
                }
            ],
            expression: "custom_fields.division == 'SMB'"
        },
        {
            effects: [
                {
                    fields: ["custom_fields.area"],
                    allowed_values: ["North", "West"]
                }
            ],
            expression: "custom_fields.division == 'Government'"
        }
    ],
    subtype: "support_ticket_futurescape",
    subtype_display_name: "Support Ticket (futurescape)",
    leaf_type: "issue"
};

export async function setCustomSchema(token: string): Promise<void> {
    const endpoint = DEVREV_API_BASE + "internal/schemas.custom.set";
    await postCall(endpoint, FUTURESCAPE_SUPPORT_TICKET_SCHEMA, token);
}

export async function getPart(partID: string, token: string) {
    const partGetPath = "parts.get?";
    let params: any = {
        ...(partID && { id: partID }),
    };
    let endpoint = DEVREV_API_BASE + partGetPath + generateQueryString(params);
    let part = await getCall(endpoint, token);
    if (!part)
        console.error("Unable to fetch part from the Part Id : " + partID);
    return part;
}

export async function getPartOwnersString(partObject: any) {
    let partOwnersString = "";
    // Making a string of part owners
    if ((partObject.part.owned_by).length == 0)
        return partOwnersString;
    let mentionUser = partObject.part.owned_by[0].id;
    partOwnersString = partOwnersString + "<" + mentionUser + ">";
    for (let i = 1; i < (partObject.part.owned_by).length; i++) {
        let mentionUser = partObject.part.owned_by[i].id;
        partOwnersString = partOwnersString + ", <" + mentionUser + ">";
    }
    return partOwnersString;
}

export async function ticketTimelineEntryCreate(ticketID: string, body: string, token: string) {
    const timelineEntryCreatePath = "timeline-entries.create";
    let endpoint = DEVREV_API_BASE + timelineEntryCreatePath;
    let payload: any = {
        object: ticketID,
        type: "timeline_comment",
        body: body,
    }
    await postCall(endpoint, payload, token);
}

interface DivisionAnalytics {
    division: string;
    ticketCount: number;
    conversationCount: number;
    agents: SupportAgent[];
}

export async function getDivisionSupportAgents(division: string, token: string): Promise<SupportAgent[]> {
    const query = {
        query: `query GetDivisionAgents($division: String!) {
            dev_users(filter: {
                custom_fields: {
                    division: {eq: $division},
                    support_group: {exists: true}
                }
            }) {
                id
                display_name
                custom_fields {
                    ticket_count
                    conversation_count
                    support_group
                }
            }
        }`,
        variables: { division }
    };

    const response = await fetch('https://api.devrev.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    });

    const data = await response.json();
    return data.data.dev_users.map((agent: any) => ({
        id: agent.id,
        ticketCount: agent.custom_fields.ticket_count || 0,
        conversationCount: agent.custom_fields.conversation_count || 0,
        division
    }));
}

export async function updateTicketOwner(ticketId: string, agentId: string, token: string): Promise<void> {
    const mutation = {
        query: `mutation UpdateTicketOwner($ticketId: ID!, $agentId: ID!) {
            work_update(id: $ticketId, input: {
                owned_by: [$agentId],
                custom_fields: {
                    assigned_agent: [$agentId]
                }
            }) {
                id
                owned_by {
                    id
                }
                custom_fields {
                    assigned_agent
                }
            }
        }`,
        variables: { ticketId, agentId }
    };

    await fetch('https://api.devrev.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mutation)
    });
}

export async function updateConversationOwner(conversationId: string, agentId: string, token: string): Promise<void> {
    const mutation = {
        query: `mutation UpdateConversationOwner($conversationId: ID!, $agentId: ID!) {
            conversation_update(id: $conversationId, input: {
                owned_by: [$agentId]
            }) {
                id
                owned_by {
                    id
                }
            }
        }`,
        variables: { conversationId, agentId }
    };

    await fetch('https://api.devrev.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mutation)
    });
}

export async function getDivisionAnalytics(token: string): Promise<DivisionAnalytics[]> {
    const query = {
        query: `query GetDivisionAnalytics {
            works(filter: {type: {eq: "issue"}}) {
                id
                custom_fields {
                    division
                    ticket_count
                }
            }
            conversations {
                id
                custom_fields {
                    division
                    conversation_count
                }
            }
        }`
    };

    const response = await fetch('https://api.devrev.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    });

    const data = await response.json();
    const divisions = ['Enterprise', 'SMB', 'Government'];
    
    return divisions.map(division => {
        const divisionTickets = data.data.works.filter((work: any) => 
            work.custom_fields.division === division
        );
        const divisionConversations = data.data.conversations.filter((conv: any) => 
            conv.custom_fields.division === division
        );

        return {
            division,
            ticketCount: divisionTickets.length,
            conversationCount: divisionConversations.length,
            agents: [] // Will be populated by getDivisionSupportAgents
        };
    });
}

export async function createAnalyticsChart(analytics: DivisionAnalytics[], token: string): Promise<void> {
    // Create a visualization using DevRev's visualization API
    const mutation = {
        query: `mutation CreateAnalyticsChart($data: JSON!) {
            visualization_create(input: {
                type: "pie",
                data: $data,
                title: "Division-wise Distribution"
            }) {
                id
            }
        }`,
        variables: {
            data: {
                labels: analytics.map(a => a.division),
                datasets: [{
                    data: analytics.map(a => a.ticketCount),
                    label: "Tickets"
                }, {
                    data: analytics.map(a => a.conversationCount),
                    label: "Conversations"
                }]
            }
        }
    };

    await fetch('https://api.devrev.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mutation)
    });
}
