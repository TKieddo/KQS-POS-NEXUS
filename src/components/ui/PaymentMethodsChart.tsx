import * as React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"
import { cn } from "@/lib/utils"

ChartJS.register(ArcElement, Tooltip)

const METHODS = [
  { name: "Cash", amount: 1200, color: "#FFD600" }, // bright yellow
  { name: "Bank", amount: 1800, color: "#40A9FF" }, // bright blue
  { name: "Mpesa", amount: 900, color: "#00E676" }, // bright green
  { name: "Ecocash", amount: 700, color: "#D500F9" }, // bright magenta
]

const data = {
  labels: METHODS.map(m => m.name),
  datasets: [
    {
      data: METHODS.map(m => m.amount),
      backgroundColor: METHODS.map(m => m.color),
      borderWidth: 0,
      cutout: "80%",
      borderRadius: 30,
      hoverOffset: 2,
    },
  ],
}

const options = {
  cutout: "80%",
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  responsive: true,
  maintainAspectRatio: false,
}

export interface PaymentMethodsChartProps extends React.HTMLAttributes<HTMLDivElement> {
  currency?: string
  centralLabel?: string
}

export const PaymentMethodsChart = React.forwardRef<HTMLDivElement, PaymentMethodsChartProps>(
  ({ className, currency = "$", centralLabel = "Total sales from all payment methods", ...props }, ref) => {
    const total = METHODS.reduce((sum, m) => sum + m.amount, 0)
    const size = 150
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center p-0 w-full max-w-xs",
          className
        )}
        style={{ minWidth: 200, minHeight: 210 }}
        {...props}
      >
        <div className="relative" style={{ width: size, height: size }}>
          <Doughnut data={data} options={options} width={size} height={size} />
          {/* Central value and label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white drop-shadow">{currency}{total.toLocaleString()}</span>
            <span className="text-[10px] text-gray-200 text-center leading-tight mt-1 max-w-[90px]">{centralLabel}</span>
          </div>
        </div>
        {/* Legend below chart */}
        <div className="flex justify-center gap-2 mt-2 w-full">
          {METHODS.map((m) => (
            <div key={m.name} className="flex flex-col items-center gap-0.5 min-w-[40px]">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mb-1"
                style={{ backgroundColor: m.color }}
                aria-label={m.name}
              />
              <span className="text-[10px] font-medium text-gray-100 leading-tight text-center">{m.name}</span>
              <span className="text-[9px] text-gray-300 font-semibold leading-tight text-center">{currency}{m.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
PaymentMethodsChart.displayName = "PaymentMethodsChart" 