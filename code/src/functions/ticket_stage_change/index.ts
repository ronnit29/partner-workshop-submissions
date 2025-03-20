/*
 * Copyright (c) 2023 DevRev, Inc. All rights reserved.
 */

import {
	getPart,
	getPartOwnersString,
	ticketTimelineEntryCreate,
} from "./utils/devrev-utils"
import {
	sprintf
} from 'sprintf-js';
import axios from 'axios';

// Timeline Comment if the part owner of a ticket is devrev-bot
const BOT_PART_OWNER_NOTIF: string = `Hey, this ticket moved to Product Assist stage and may need attention.`;
const PART_OWNER_NOTIF: string = `Hey %s, this ticket moved to Product Assist stage and may need your attention. You are being notified because you are the part owner of this ticket.`;

interface CustomFields {
	location_type: 'Onsite' | 'Remote' | 'Hybrid';
	team_size: number;
	department_id: string[];
	assigned_owner: string[];
	last_updated?: string;
	created_at?: string;
}

// Custom fields schema definition
const customFieldsSchema = {
	type: "custom_type_fragment",
	deprecated: false,
	description: "Custom issue type for load-balanced issue assignment with team distribution capabilities",
	fields: [
		{
			field_type: "enum",
			allowed_values: ["Onsite", "Remote", "Hybrid"],
			description: "Specifies the work arrangement type for the team. Onsite: Physical office presence, Remote: Virtual work, Hybrid: Mixed arrangement",
			name: "location_type",
			is_filterable: true,
			is_required: true,
			ui: {
				display_name: "Location Type",
				help_text: "Select the primary work arrangement for this team"
			}
		},
		{
			field_type: "int",
			description: "Total number of team members available for load balancing. Must be greater than 0.",
			name: "team_size",
			is_required: true,
			validation: {
				min: 1,
				max: 100
			},
			ui: {
				display_name: "Team Size",
				help_text: "Enter the total number of team members (1-100)"
			}
		},
		{
			field_type: "tokens",
			description: "Unique identifiers for departments involved in this issue. Used for cross-department coordination.",
			name: "department_id",
			is_required: true,
			ui: {
				display_name: "Department",
				help_text: "Select one or more departments"
			}
		},
		{
			field_type: "tokens",
			description: "Automatically assigned owner based on load balancing algorithm. Updates dynamically.",
			name: "assigned_owner",
			is_required: true,
			ui: {
				display_name: "Assigned Owner",
				help_text: "System-assigned owner based on load balancing"
			}
		},
		{
			field_type: "datetime",
			description: "Timestamp of the last update to this issue's assignment",
			name: "last_updated",
			is_required: false,
			ui: {
				display_name: "Last Updated",
				help_text: "Automatically tracks when the assignment was last modified"
			}
		},
		{
			field_type: "datetime",
			description: "Timestamp when this issue was created",
			name: "created_at",
			is_required: false,
			ui: {
				display_name: "Created At",
				help_text: "Automatically records the creation time"
			}
		}
	],
	subtype: "load_balanced_issue",
	subtype_display_name: "Load Balanced Issue",
	leaf_type: "issue",
	version: "1.0.0"
};

async function setupCustomFields(token: string) {
	try {
		const response = await axios.post(
			'https://api.devrev.ai/internal/schemas.custom.set',
			customFieldsSchema,
			{
				headers: {
					'Authorization': `${token}`,
					'Content-Type': 'application/json'
				}
			}
		);
		console.log('Custom fields schema created successfully');
		return response.data;
	} catch (error: any) {
		console.error('Error setting up custom fields:', error);
		throw error;
	}
}

async function assignOwnerLoadBalanced(partOwners: string[], teamSize: number): Promise<string> {
	// Simple round-robin load balancing based on team size
	const currentTime = Date.now();
	const ownerIndex = Math.floor(currentTime % teamSize);
	return partOwners[ownerIndex] || partOwners[0];
}

async function EventListener(event: any) {
	const oldStage: string = event.payload.work_updated.old_work.stage.name;
	const currStage: string = event.payload.work_updated.work.stage.name;
	const workType: string = event.payload.work_updated.work.type;
	const snap_in_token = event.context.secrets.service_account_token;
	
	// Setup custom fields if this is first run
	try {
		await setupCustomFields(snap_in_token);
	} catch (error: any) {
		console.log('Custom fields might already exist:', error.message);
	}
	
	try {
		if (!(
			currStage === "awaiting_product_assist" &&
			oldStage !== "awaiting_product_assist" &&
			workType === "ticket"
		)) return;

		const ticketID = event.payload.work_updated.work.id;
		const partID = event.payload.work_updated.work.applies_to_part.id;
		const partObject = await getPart(partID, snap_in_token);

		// Get custom fields
		const customFields = partObject.part.custom_fields as CustomFields;
		const teamSize = customFields?.team_size || 1;

		console.log(`Ticket ${ticketID} moved to Product Assist stage`);

		if ((partObject.part.owned_by).length == 1 && partObject.part.owned_by[0].type != "dev_user") {
			console.log("A bot is the part owner");
			await ticketTimelineEntryCreate(ticketID, BOT_PART_OWNER_NOTIF, snap_in_token);
		} else {
			let partOwners = await getPartOwnersString(partObject);
			if (partOwners) {
				// Assign owner using load balancing
				const owners = partOwners.split(',').map(owner => owner.trim());
				const assignedOwner = await assignOwnerLoadBalanced(owners, teamSize);
				
				console.log(`Assigning ticket to: ${assignedOwner}`);
				await ticketTimelineEntryCreate(ticketID, sprintf(PART_OWNER_NOTIF, [assignedOwner]), snap_in_token);
			} else
				console.log("No part owners to notify regarding the stage change");
		}
	} catch (error) {
		console.error('Error: ', error);
	}
}

export const run = async (events: any[]) => {
	for (let i = 0; i < events.length; i++) {
		await EventListener(events[i]);
	}
};
export default run;
