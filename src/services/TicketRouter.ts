interface TicketRouting {
  assignTicket: (ticket: Ticket) => Promise<string>; // Returns agent ID
  getAgentTickets: (agentId: string) => Promise<Ticket[]>;
}

class RegionalTicketRouter implements TicketRouting {
  private async getAvailableAgents(region: string): Promise<Agent[]> {
    // Fetch agents from the region with their current workload
    return await db.agents.findMany({
      where: { region: region },
      include: { ticketCount: true }
    });
  }

  public async assignTicket(ticket: Ticket): Promise<string> {
    const agents = await this.getAvailableAgents(ticket.region);
    
    // Simple round-robin load balancing
    const selectedAgent = agents.reduce((min, agent) => 
      agent.ticketCount < min.ticketCount ? agent : min
    );

    return selectedAgent.id;
  }

  public async getAgentTickets(agentId: string): Promise<Ticket[]> {
    return await db.tickets.findMany({
      where: { assignedAgentId: agentId }
    });
  }
} 