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
import { DollarSign, TrendingUp, TrendingDown, Package } from 'lucide-react'

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

interface CostAnalysisProps {
  className?: string
}

export const CostAnalysis = ({ className }: CostAnalysisProps) => {
  // Inventory value over time
  const inventoryValueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Value',
        data: [125000, 132000, 128000, 145000, 152000, 148000],
        borderColor: '#E5FF29',
        backgroundColor: 'rgba(229,255,41,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Cost vs Revenue comparison
  const costRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cost of Goods',
        data: [85000, 92000, 88000, 98000, 105000, 102000],
        backgroundColor: 'hsl(240, 5.9%, 10%)',
        borderRadius: 8,
      },
      {
        label: 'Revenue',
        data: [120000, 135000, 125000, 145000, 160000, 155000],
        backgroundColor: '#E5FF29',
        borderRadius: 8,
      },
    ],
  }

  // Profit margins by category
  const profitMarginsData = {
    labels: ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home'],
    datasets: [
      {
        data: [35, 42, 28, 25, 18],
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

  // Aging analysis
  const agingData = {
    labels: ['0-30 days', '31-60 days', '61-90 days', '90+ days'],
    datasets: [
      {
        label: 'Value',
        data: [85000, 45000, 25000, 15000],
        backgroundColor: [
          '#00E676',
          '#E5FF29',
          '#FFB300',
          '#FF3B3B',
        ],
        borderRadius: 8,
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
        ticks: { 
          color: '#000',
          callback: function(value: any) {
            return typeof value === 'number' && value >= 1000 ? (value/1000) + 'K' : value;
          }
        },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#000', font: { size: 11 } },
      },
    },
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-black">$148,000</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-[#E5FF29]" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Cost</p>
              <p className="text-2xl font-bold text-black">$24.50</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">-2.1%</span>
              </div>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Profit Margin</p>
              <p className="text-2xl font-bold text-black">32.4%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+1.8%</span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnover Rate</p>
              <p className="text-2xl font-bold text-black">4.2x</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+0.3x</span>
              </div>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Value Trend */}
        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <h3 className="text-lg font-semibold text-black mb-4">Inventory Value Trend</h3>
          <div className="h-64">
            <Line data={inventoryValueData} options={chartOptions} />
          </div>
        </Card>

        {/* Cost vs Revenue */}
        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <h3 className="text-lg font-semibold text-black mb-4">Cost vs Revenue</h3>
          <div className="h-64">
            <Bar data={costRevenueData} options={chartOptions} />
          </div>
        </Card>

        {/* Profit Margins by Category */}
        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <h3 className="text-lg font-semibold text-black mb-4">Profit Margins by Category</h3>
          <div className="h-64">
            <Doughnut data={profitMarginsData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Aging Analysis */}
        <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
          <h3 className="text-lg font-semibold text-black mb-4">Inventory Aging Analysis</h3>
          <div className="h-64">
            <Bar data={agingData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Detailed Aging Table */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <h3 className="text-lg font-semibold text-black mb-4">Detailed Aging Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-l-xl">Age Range</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Items Count</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Total Value</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">% of Total</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Risk Level</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    0-30 days
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-black">1,250</td>
                <td className="px-3 py-3 font-semibold text-black">$85,000</td>
                <td className="px-3 py-3 text-gray-600">57.4%</td>
                <td className="px-3 py-3">
                  <span className="text-green-600 font-medium">Low</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-gray-500">-</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    31-60 days
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-black">680</td>
                <td className="px-3 py-3 font-semibold text-black">$45,000</td>
                <td className="px-3 py-3 text-gray-600">30.4%</td>
                <td className="px-3 py-3">
                  <span className="text-yellow-600 font-medium">Medium</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-blue-600 font-medium cursor-pointer">Review</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    61-90 days
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-black">320</td>
                <td className="px-3 py-3 font-semibold text-black">$25,000</td>
                <td className="px-3 py-3 text-gray-600">16.9%</td>
                <td className="px-3 py-3">
                  <span className="text-orange-600 font-medium">High</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-red-600 font-medium cursor-pointer">Discount</span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    90+ days
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-black">180</td>
                <td className="px-3 py-3 font-semibold text-black">$15,000</td>
                <td className="px-3 py-3 text-gray-600">10.1%</td>
                <td className="px-3 py-3">
                  <span className="text-red-600 font-medium">Critical</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-red-600 font-medium cursor-pointer">Clearance</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 