import { client, publicSDK } from '@devrev/typescript-sdk';

interface CallDetails {
  id: string;
  title: string;
  host: Host;
  duration: number;
  start_time: string;
  end_time: string;
  transcript_url: string | null;
  participants: string[];
  status: string;
}

interface Host {
  name: string;
  email: string;
  avatar_url: string | null;
}

function validateCallId(callId: string): boolean {
  // Basic validation for Gong call ID format
  const callIdRegex = /^[a-zA-Z0-9-]+$/;
  return callIdRegex.test(callId);
}

export const getCallDetails = async (callId: string, gongToken: string): Promise<CallDetails> => {
  try {
    if (!validateCallId(callId)) {
      throw new Error('Invalid Call ID format: ' + callId);
    }

    // TODO: Replace with actual Gong API call
    // This is a mock implementation
    const response = await fetch(`https://api.gong.io/v2/calls/${callId}`, {
      headers: {
        'Authorization': `Bearer ${gongToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call details: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract relevant information
    const callDetails: CallDetails = {
      id: data.id,
      title: data.title,
      host: {
        name: data.host.name,
        email: data.host.email,
        avatar_url: data.host.avatar_url
      },
      duration: data.duration,
      start_time: data.start_time,
      end_time: data.end_time,
      transcript_url: data.transcript_url,
      participants: data.participants,
      status: data.status
    };
    
    return callDetails;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch call details: ${error.message}`);
    }
    throw new Error('Failed to fetch call details: Unknown error');
  }
};

// Function to create a timeline comment with the call details
const createTimelineComment = async (partId: string, callDetails: CallDetails, devrevSDK: publicSDK.Api<any>): Promise<void> => {
  // Format the body of the timeline comment
  const bodyComment = `**Gong Call Details:**
  - Title: ${callDetails.title}
  - Host: ${callDetails.host.name}
  - Duration: ${callDetails.duration} minutes
  - Start Time: ${callDetails.start_time}
  - End Time: ${callDetails.end_time}
  - Status: ${callDetails.status}
  - Participants: ${callDetails.participants.join(', ')}
  ${callDetails.transcript_url ? `\n- [View Transcript](${callDetails.transcript_url})` : ''}`;

  // Create a timeline comment with the call details
  await devrevSDK.timelineEntriesCreate({
    body: bodyComment,
    object: partId,
    body_type: publicSDK.TimelineCommentBodyType.Text,
    type: publicSDK.TimelineEntriesCreateRequestType.TimelineComment,
    visibility: publicSDK.TimelineEntryVisibility.Internal,
  });
};

// Function to handle the command event
const handleEvent = async (event: any) => {
  // Get the Gong token from the environment variables
  const gongToken = event.input_data.keyrings['gong_connection'];

  // Get the devrev token and initialise the DevRev SDK
  const devrevToken = event.context.secrets['service_account_token'];
  const endpoint = event.execution_metadata.devrev_endpoint;
  const devrevSDK = client.setup({
    endpoint: endpoint,
    token: devrevToken,
  });

  // Retrieve the Part ID from the command event
  const partId = event.payload['source_id'];

  // Get the command parameters from the event (Call ID)
  const callId: string = event.payload['parameters'];

  // Get the call details
  const callDetails = await getCallDetails(callId, gongToken);

  // Create a timeline comment with the call details  
  await createTimelineComment(partId, callDetails, devrevSDK);
};

export const run = async (events: any[]) => {
  for (const event of events) {
    await handleEvent(event);
  }
};

export default run;