import React from "react"
import Link from 'next/link'
import { BarChart, Package, Users, CreditCard, TrendingUp, Star, RotateCcw, DollarSign, AlertTriangle, PieChart } from "lucide-react"

const reportCards = [
  {
    id: "sales-overview",
    title: "Sales Overview",
    description: "Track daily, weekly, and monthly sales trends.",
    icon: TrendingUp,
    category: "Sales",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  {
    id: "top-products",
    title: "Top Products",
    description: "See your best-selling products by quantity and profit.",
    icon: Star,
    category: "Sales",
    color: "from-black/5 to-black/10",
  },
  {
    id: "sales-cashier",
    title: "Sales by Cashier",
    description: "Analyze sales performance by staff.",
    icon: Users,
    category: "Sales",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  {
    id: "sales-payment",
    title: "Sales by Payment Method",
    description: "Breakdown of sales by cash, card, MPESA, etc.",
    icon: CreditCard,
    category: "Sales",
    color: "from-black/5 to-black/10",
  },
  {
    id: "refunds",
    title: "Refunds",
    description: "Monitor refund frequency and amounts.",
    icon: RotateCcw,
    category: "Sales",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  {
    id: "discounts",
    title: "Discounts Used",
    description: "Track discounts and their impact on sales.",
    icon: DollarSign,
    category: "Sales",
    color: "from-black/5 to-black/10",
  },
  {
    id: "profit-tax",
    title: "Profit & Tax",
    description: "View profit margins and tax breakdowns.",
    icon: PieChart,
    category: "Sales",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  // Inventory
  {
    id: "stock-on-hand",
    title: "Stock On Hand",
    description: "Current inventory levels and low stock alerts.",
    icon: Package,
    category: "Inventory",
    color: "from-black/5 to-black/10",
  },
  {
    id: "stock-movement",
    title: "Stock Movement",
    description: "Track received, discarded, and adjusted stock.",
    icon: BarChart,
    category: "Inventory",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  {
    id: "inventory-valuation",
    title: "Inventory Valuation",
    description: "Total value of current inventory.",
    icon: DollarSign,
    category: "Inventory",
    color: "from-black/5 to-black/10",
  },
  // Customers
  {
    id: "customer-balances",
    title: "Customer Balances",
    description: "Outstanding balances on customer accounts.",
    icon: Users,
    category: "Customers",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  {
    id: "purchase-history",
    title: "Purchase History",
    description: "Detailed purchase records for each customer.",
    icon: BarChart,
    category: "Customers",
    color: "from-black/5 to-black/10",
  },
  {
    id: "loyalty-points",
    title: "Loyalty Points",
    description: "Track points earned and redeemed.",
    icon: Star,
    category: "Customers",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
  // Cash & Sessions
  {
    id: "till-sessions",
    title: "Till Sessions",
    description: "Session history and cash management.",
    icon: CreditCard,
    category: "Cash & Sessions",
    color: "from-black/5 to-black/10",
  },
  {
    id: "cash-drops",
    title: "Cash Drops & Withdrawals",
    description: "Monitor cash movements and discrepancies.",
    icon: AlertTriangle,
    category: "Cash & Sessions",
    color: "from-[#E5FF29]/10 to-[#E5FF29]/20",
  },
]

interface ReportsListGridProps {
  category?: string
}

export const ReportsListGrid: React.FC<ReportsListGridProps> = ({ category }) => {
  const filtered = category ? reportCards.filter((c) => c.category === category) : reportCards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filtered.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.id}
            href={`/admin/reports/${card.id}`}
            className={`relative overflow-hidden rounded-2xl border border-[#E5FF29]/20 bg-white/70 backdrop-blur-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] group flex flex-col items-start text-left focus:outline-none`}
            tabIndex={0}
            aria-label={card.title}
          >
            {/* Icon Badge */}
            <div className={`p-3 rounded-xl bg-black ${card.color} shadow-sm mb-4 w-fit`}>
              <Icon className="w-6 h-6 text-[#E5FF29]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-black mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{card.description}</p>
            </div>
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E5FF29]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
        )
      })}
    </div>
  )
} 