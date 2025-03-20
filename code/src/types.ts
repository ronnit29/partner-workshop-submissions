import { BaseConnection } from '@devrev/ts-adaas';

export interface TeamsMessage {
  id: string;
  content: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  from: {
    user: {
      displayName: string;
      email?: string;
    };
  };
  channelIdentity?: {
    channelId: string;
    teamId: string;
  };
}

export interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  teamId: string;
}

export interface MSTeamsConnection extends BaseConnection {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  accessToken?: string;
} 