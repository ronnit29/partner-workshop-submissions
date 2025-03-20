import {
  ExtractionFunction,
  LoadingFunction,
  ExtractionOutput,
  LoadingInput,
} from '@devrev/ts-adaas';
import { TeamsClient } from './teams-client';
import { MSTeamsConnection, TeamsMessage } from './types';

export const extraction: ExtractionFunction = async (context) => {
  const connection = context.connection as MSTeamsConnection;
  const client = new TeamsClient(connection);
  
  await client.authenticate();
  
  // For this example, we'll use a fixed team ID
  // In production, you might want to fetch this from configuration or scan all teams
  const teamId = process.env.MS_TEAMS_TEAM_ID;
  if (!teamId) {
    throw new Error('MS_TEAMS_TEAM_ID environment variable is required');
  }

  const channels = await client.getChannels(teamId);
  const allMessages: TeamsMessage[] = [];

  for (const channel of channels) {
    const messages = await client.getMessages(channel.id, teamId);
    allMessages.push(...messages);
  }

  const output: ExtractionOutput = {
    objects: allMessages.map((message) => ({
      external_id: message.id,
      title: `Message from ${message.from.user.displayName}`,
      description: message.content,
      created_date: message.createdDateTime,
      modified_date: message.lastModifiedDateTime,
      metadata: {
        channel_id: message.channelIdentity?.channelId,
        team_id: message.channelIdentity?.teamId,
        author: message.from.user.displayName,
        author_email: message.from.user.email,
      },
    })),
  };

  return output;
};

export const loading: LoadingFunction = async (input: LoadingInput) => {
  // The loading function receives the processed data and can perform
  // additional transformations or validations before it's indexed in DevRev
  return {
    success: true,
    message: `Successfully processed ${input.objects.length} Teams messages`,
  };
};

export const install_initial_domain_mapping = async () => {
  // This function would set up any necessary initial configuration
  // such as creating custom fields or setting up search mappings
  return {
    success: true,
    message: 'Successfully installed initial domain mapping',
  };
}; 