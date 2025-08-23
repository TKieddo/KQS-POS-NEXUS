import React from "react"
import { TrendingUp, Star, RotateCcw, Package, User } from "lucide-react"
import { Card } from "@/components/ui/card"

const overviewCards = [
  {
    label: "Total Sales (Today)",
    value: "L 45,000",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20",
    iconColor: "text-[#E5FF29]",
    borderColor: "border-[#E5FF29]/30"
  },
  {
    label: "Top Product",
    value: "Denim Jacket",
    icon: Star,
    color: "bg-gradient-to-br from-black/5 to-black/10",
    iconColor: "text-white",
    borderColor: "border-black/20"
  },
  {
    label: "Refunds (This Month)",
    value: "L 2,500",
    icon: RotateCcw,
    color: "bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20",
    iconColor: "text-[#E5FF29]",
    borderColor: "border-[#E5FF29]/30"
  },
  {
    label: "Low Stock Items",
    value: "4",
    icon: Package,
    color: "bg-gradient-to-br from-black/5 to-black/10",
    iconColor: "text-white",
    borderColor: "border-black/20"
  },
  {
    label: "Top Customer",
    value: "Jane Doe",
    icon: User,
    color: "bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20",
    iconColor: "text-[#E5FF29]",
    borderColor: "border-[#E5FF29]/30"
  },
]

export const ReportsOverviewGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {overviewCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border ${card.borderColor} ${card.color} p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group z-0`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <div className="relative z-10">
              {/* Icon Badge */}
              <div className={`p-3 rounded-xl bg-black ${card.iconColor} shadow-sm mb-4 w-fit`}>
                <Icon className="w-6 h-6" />
              </div>
              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-600">{card.label}</h3>
                <p className="text-base font-bold text-gray-900">{card.value}</p>
              </div>
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 