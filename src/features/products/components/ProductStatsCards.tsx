import { Package, AlertTriangle, Tag } from "lucide-react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  iconColor: string
}

const StatCard = ({ icon, label, value, iconColor }: StatCardProps) => (
  <div className="rounded-2xl p-3 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-start justify-center min-h-0 pl-3">
    <div className={`h-7 w-7 mb-1 drop-shadow ${iconColor}`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-white/80">{label}</span>
    <span className="text-lg font-bold text-white mt-0.5">{value}</span>
  </div>
)

interface ProductStatsCardsProps {
  totalProducts: number
  lowStock: number
  activePromotions: number
  categories: number
}

export const ProductStatsCards = ({
  totalProducts,
  lowStock,
  activePromotions,
  categories
}: ProductStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Package className="h-7 w-7" />}
        iconColor="text-[#E5FF29]"
        label="Total Products"
        value={totalProducts}
      />
      <StatCard
        icon={<AlertTriangle className="h-7 w-7" />}
        iconColor="text-[#FF00BD]"
        label="Low Stock"
        value={lowStock}
      />
      <StatCard
        icon={<Tag className="h-7 w-7" />}
        iconColor="text-[#00E676]"
        label="Active Promotions"
        value={activePromotions}
      />
      <StatCard
        icon={<Package className="h-7 w-7" />}
        iconColor="text-[#40A9FF]"
        label="Categories"
        value={categories}
      />
    </div>
  )
} 