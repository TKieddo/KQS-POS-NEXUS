import React from "react"

const categories = [
  "All",
  "Sales",
  "Inventory",
  "Customers",
  "Cash & Sessions"
]

interface ReportsCategoryTabsProps {
  selected: string
  onCategoryChange: (cat: string) => void
}

export const ReportsCategoryTabs: React.FC<ReportsCategoryTabsProps> = ({ selected, onCategoryChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border border-transparent focus:outline-none whitespace-nowrap
            ${selected === cat
              ? "bg-[#E5FF29] text-black shadow-md border-[#E5FF29]"
              : "bg-white/70 text-muted-foreground hover:bg-[#E5FF29]/10"}
          `}
          onClick={() => onCategoryChange(cat)}
          aria-pressed={selected === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  )
} 