/*
 * Copyright (c) 2023 DevRev, Inc. All rights reserved.
 */

import {
	getPart,
	getPartOwnersString,
	ticketTimelineEntryCreate,
	getDivisionSupportAgents,
	updateTicketOwner,
	updateConversationOwner,
	getDivisionAnalytics,
	createAnalyticsChart,
	SupportAgent,
	setCustomSchema
} from "./utils/devrev-utils"
import {
	sprintf
} from 'sprintf-js';

// Timeline Comment if the part owner of a ticket is devrev-bot
const BOT_PART_OWNER_NOTIF: string = `Hey, this ticket moved to Product Assist stage and may need attention.`;
const PART_OWNER_NOTIF: string = `Hey %s, this ticket moved to Product Assist stage and may need your attention. You are being notified because you are the part owner of this ticket.`;

// Function to handle ticket routing to division-specific support groups
async function handleTicketRouting(event: any, snap_in_token: string) {
	const ticketID = event.payload.work_created.work.id;
	const division = event.payload.work_created.work.custom_fields.division;
	
	try {
		const supportAgents = await getDivisionSupportAgents(division, snap_in_token);
		if (supportAgents.length > 0) {
			// Load balancing: Assign to agent with least tickets
			const selectedAgent = supportAgents.reduce((prev: SupportAgent, curr: SupportAgent) => 
				prev.ticketCount < curr.ticketCount ? prev : curr
			);
			await updateTicketOwner(ticketID, selectedAgent.id, snap_in_token);
		}
	} catch (error) {
		console.error('Error routing ticket:', error);
	}
}

// Function to handle conversation routing
async function handleConversationRouting(event: any, snap_in_token: string) {
	const conversationID = event.payload.conversation_created.conversation.id;
	const division = event.payload.conversation_created.conversation.custom_fields.division;
	
	try {
		const supportAgents = await getDivisionSupportAgents(division, snap_in_token);
		if (supportAgents.length > 0) {
			// Load balancing: Assign to agent with least conversations
			const selectedAgent = supportAgents.reduce((prev: SupportAgent, curr: SupportAgent) => 
				prev.conversationCount < curr.conversationCount ? prev : curr
			);
			await updateConversationOwner(conversationID, selectedAgent.id, snap_in_token);
		}
	} catch (error) {
		console.error('Error routing conversation:', error);
	}
}

// Function to generate division analytics
async function generateAnalytics(event: any, snap_in_token: string) {
	try {
		const analytics = await getDivisionAnalytics(snap_in_token);
		await createAnalyticsChart(analytics, snap_in_token);
	} catch (error) {
		console.error('Error generating analytics:', error);
	}
}

async function EventListener(event: any) {
	const snap_in_token = event.context.secrets.service_account_token;
	
	try {
		// Initialize custom schema if not already set
		await setCustomSchema(snap_in_token);

		// Handle ticket stage changes (existing functionality)
		if (event.payload.work_updated) {
			const oldStage: string = event.payload.work_updated.old_work.stage.name;
			const currStage: string = event.payload.work_updated.work.stage.name;
			const workType: string = event.payload.work_updated.work.type;

			if (currStage === "awaiting_product_assist" &&
				oldStage !== "awaiting_product_assist" &&
				workType === "ticket") {
				
				const ticketID = event.payload.work_updated.work.id;
				const partID = event.payload.work_updated.work.applies_to_part.id;
				const partObject = await getPart(partID, snap_in_token);

				console.log(`Ticket ${ticketID} moved to Product Assist stage`);

				if ((partObject.part.owned_by).length == 1 && partObject.part.owned_by[0].type != "dev_user") {
					console.log("A bot is the part owner");
					await ticketTimelineEntryCreate(ticketID, BOT_PART_OWNER_NOTIF, snap_in_token);
				} else {
					let partOwners = await getPartOwnersString(partObject);
					if (partOwners != "") {
						console.log("Creating timeline entry for the part owners");
						await ticketTimelineEntryCreate(ticketID, sprintf(PART_OWNER_NOTIF, [partOwners]), snap_in_token);
					} else
						console.log("No part owners to notify regarding the stage change");
				}
			}
		}

		// Handle new ticket routing
		if (event.payload.work_created) {
			await handleTicketRouting(event, snap_in_token);
		}

		// Handle new conversation routing
		if (event.payload.conversation_created) {
			await handleConversationRouting(event, snap_in_token);
		}

		// Generate analytics on ticket updates and new conversations
		if (event.payload.work_updated || event.payload.conversation_created) {
			await generateAnalytics(event, snap_in_token);
		}

	} catch (error) {
		console.error('Error in EventListener:', error);
	}
}

export const run = async (events: any[]) => {
	for (let i = 0; i < events.length; i++) {
		await EventListener(events[i]);
	}
};
export default run;
