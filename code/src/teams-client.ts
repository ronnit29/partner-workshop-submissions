import axios from 'axios';
import { TeamsMessage, TeamsChannel, MSTeamsConnection } from './types';

export class TeamsClient {
  private accessToken: string;
  private baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(private connection: MSTeamsConnection) {
    this.accessToken = connection.accessToken || '';
  }

  private async getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getChannels(teamId: string): Promise<TeamsChannel[]> {
    const response = await axios.get(
      `${this.baseUrl}/teams/${teamId}/channels`,
      { headers: await this.getHeaders() }
    );
    return response.data.value;
  }

  async getMessages(channelId: string, teamId: string): Promise<TeamsMessage[]> {
    const response = await axios.get(
      `${this.baseUrl}/teams/${teamId}/channels/${channelId}/messages`,
      { headers: await this.getHeaders() }
    );
    return response.data.value;
  }

  async authenticate(): Promise<void> {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.connection.tenantId}/oauth2/v2.0/token`;
    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        client_id: this.connection.clientId,
        client_secret: this.connection.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    this.accessToken = response.data.access_token;
  }
} 