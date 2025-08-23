import React from "react"

interface YearSelectorProps {
  years: number[]
  selectedYear: number
  onChange: (year: number) => void
}

export const YearSelector: React.FC<YearSelectorProps> = ({ years, selectedYear, onChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {years.map((year) => (
        <button
          key={year}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border border-transparent focus:outline-none whitespace-nowrap
            ${selectedYear === year
              ? "bg-[#E5FF29] text-black shadow-md border-[#E5FF29]"
              : "bg-white/70 text-muted-foreground hover:bg-[#E5FF29]/10"}
          `}
          onClick={() => onChange(year)}
          aria-pressed={selectedYear === year}
        >
          {year}
        </button>
      ))}
    </div>
  )
} 