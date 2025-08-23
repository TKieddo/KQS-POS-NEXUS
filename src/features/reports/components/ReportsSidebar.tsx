import React, { useState } from "react"
import { BarChart, Package, Users, CreditCard, Search, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"

const reportCategories = [
  {
    label: "Sales Reports",
    icon: BarChart,
    reports: [
      { name: "Sales Overview", id: "sales-overview" },
      { name: "Top Products", id: "top-products" },
      { name: "Sales by Cashier", id: "sales-cashier" },
      { name: "Sales by Payment Method", id: "sales-payment" },
      { name: "Refunds", id: "refunds" },
      { name: "Discounts Used", id: "discounts" },
      { name: "Profit & Tax", id: "profit-tax" },
    ],
  },
  {
    label: "Inventory Reports",
    icon: Package,
    reports: [
      { name: "Stock On Hand", id: "stock-on-hand" },
      { name: "Stock Movement", id: "stock-movement" },
      { name: "Low Stock Alerts", id: "low-stock" },
      { name: "Inventory Valuation", id: "inventory-valuation" },
      { name: "Automated Reorder", id: "auto-reorder" },
    ],
  },
  {
    label: "Customer Reports",
    icon: Users,
    reports: [
      { name: "Customer Balances", id: "customer-balances" },
      { name: "Purchase History", id: "purchase-history" },
      { name: "Loyalty Points", id: "loyalty-points" },
      { name: "Lay-By Contracts", id: "layby-contracts" },
    ],
  },
  {
    label: "Cash & Sessions",
    icon: CreditCard,
    reports: [
      { name: "Till Sessions", id: "till-sessions" },
      { name: "Cash Drops & Withdrawals", id: "cash-drops" },
    ],
  },
]

export const ReportsSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Responsive: show sidebar as overlay on mobile
  const sidebarContent = (
    <nav
      className={`h-full flex flex-col bg-white/70 backdrop-blur-xl border-r border-border shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } rounded-r-2xl overflow-hidden relative`}
      aria-label="Reports sidebar"
    >
      {/* Collapse/Expand Button */}
      <button
        className="absolute top-4 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-[#E5FF29]/20 transition"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5 text-black" /> : <ChevronLeft className="h-5 w-5 text-black" />}
      </button>
      {/* Search Bar */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Input
              className="pl-10 bg-white/60 border border-border rounded-xl"
              placeholder="Search reports..."
              aria-label="Search reports"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
      {/* Categories */}
      <ul className="flex-1 space-y-6 px-2 pt-2 pb-8 overflow-y-auto">
        {reportCategories.map((cat) => (
          <li key={cat.label}>
            <div
              className={`flex items-center gap-2 mb-2 text-muted-foreground font-semibold text-xs uppercase tracking-wide px-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <cat.icon className="h-5 w-5 text-[#E5FF29]" />
              {!collapsed && cat.label}
            </div>
            <ul className={`space-y-1 ${collapsed ? "hidden" : "ml-6"}`}>
              {cat.reports.map((r) => (
                <li key={r.id}>
                  <button
                    className="w-full text-left px-2 py-2 rounded-xl hover:bg-[#E5FF29]/10 focus:bg-[#E5FF29]/20 focus:outline-none text-sm transition flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#E5FF29] inline-block" />
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center p-2">
        <button
          className="p-2 rounded-full bg-white/80 shadow-md"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-black" />
        </button>
      </div>
      {/* Sidebar (desktop & mobile overlay) */}
      <div className={`fixed md:static z-40 top-0 left-0 h-full ${mobileOpen ? "block" : "hidden md:block"}`}
        style={{ width: collapsed ? 80 : 256 }}
      >
        {sidebarContent}
      </div>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  )
} 