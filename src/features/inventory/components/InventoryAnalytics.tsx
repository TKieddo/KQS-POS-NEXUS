import { Card } from '@/components/ui/card'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface InventoryAnalyticsProps {
  className?: string
}

export const InventoryAnalytics = ({ className }: InventoryAnalyticsProps) => {
  // Stock level trends data
  const stockTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Clothing',
        data: [1200, 1100, 1300, 1400, 1350, 1500],
        borderColor: '#E5FF29',
        backgroundColor: 'rgba(229,255,41,0.1)',
        tension: 0.4,
      },
      {
        label: 'Shoes',
        data: [800, 750, 900, 850, 950, 1000],
        borderColor: '#29B6FF',
        backgroundColor: 'rgba(41,182,255,0.1)',
        tension: 0.4,
      },
      {
        label: 'Accessories',
        data: [500, 450, 600, 550, 650, 700],
        borderColor: '#FF29E5',
        backgroundColor: 'rgba(255,41,229,0.1)',
        tension: 0.4,
      },
    ],
  }

  // Turnover rates data
  const turnoverData = {
    labels: ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home'],
    datasets: [
      {
        label: 'Turnover Rate (%)',
        data: [85, 72, 68, 45, 38],
        backgroundColor: [
          'hsl(240, 5.9%, 10%)',
          'hsl(240, 4.8%, 95.9%)',
          '#E5FF29',
          '#29B6FF',
          '#FF29E5',
        ],
        borderRadius: 8,
      },
    ],
  }

  // Value distribution data
  const valueDistributionData = {
    labels: ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          '#E5FF29',
          '#29B6FF',
          '#FF29E5',
          '#00E676',
          '#FF3B3B',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#000', font: { size: 12 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#000' },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
      y: {
        ticks: { color: '#000' },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
    },
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Stock Level Trends */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <h3 className="text-lg font-semibold text-black mb-4">Stock Level Trends</h3>
        <div className="h-64">
          <Line data={stockTrendsData} options={chartOptions} />
        </div>
      </Card>

      {/* Turnover Rates */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <h3 className="text-lg font-semibold text-black mb-4">Turnover Rates</h3>
        <div className="h-64">
          <Bar data={turnoverData} options={chartOptions} />
        </div>
      </Card>

      {/* Value Distribution */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <h3 className="text-lg font-semibold text-black mb-4">Value Distribution</h3>
        <div className="h-64">
          <Doughnut 
            data={valueDistributionData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom' as const,
                  labels: { color: '#000', font: { size: 11 } },
                },
              },
            }} 
          />
        </div>
      </Card>
    </div>
  )
} 