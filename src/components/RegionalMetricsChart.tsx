import { Line } from 'react-chartjs-2';

interface MetricsChartProps {
  data: RegionalMetrics[];
}

interface RegionalMetrics {
  region: string;
  tickets: number;
  conversations: number;
  timestamp: Date;
}

const RegionalMetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.timestamp.toLocaleDateString()),
    datasets: [
      {
        label: 'Tickets',
        data: data.map(d => d.tickets),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Conversations',
        data: data.map(d => d.conversations),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="metrics-chart">
      <Line 
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

export default RegionalMetricsChart; 