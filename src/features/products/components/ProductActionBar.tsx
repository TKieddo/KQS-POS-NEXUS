import { 
  Search, 
  Filter, 
  Barcode, 
  Printer, 
  Upload, 
  Download, 
  Tag, 
  ArrowUpDown 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProductActionBarProps {
  searchTerm?: string
  onSearchChange?: (value: string) => void
  onGenerateBarcodes: () => void
  onImportProducts: () => void
  onManagePromotions: () => void
  onBulkPriceUpdate: () => void
  onExportProducts: () => void
  onPrintLabels: () => void
}

export const ProductActionBar = ({
  searchTerm = '',
  onSearchChange,
  onGenerateBarcodes,
  onImportProducts,
  onManagePromotions,
  onBulkPriceUpdate,
  onExportProducts,
  onPrintLabels
}: ProductActionBarProps) => {
  return (
    <div className="rounded-2xl p-4 shadow-lg bg-[#F3F3F3]">
      <div className="flex flex-col gap-4">
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-white text-black border border-white/10 rounded-md" 
            />
          </div>
          <Button variant="outline" className="bg-[hsl(var(--primary))] border-white/10 text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onGenerateBarcodes}
          >
            <Barcode className="mr-2 h-4 w-4" />
            Print Barcodes
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onPrintLabels}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Labels
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onImportProducts}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Products
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onExportProducts}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Products
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onManagePromotions}
          >
            <Tag className="mr-2 h-4 w-4" />
            Manage Promotions
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black border-black/20 hover:bg-black/5"
            onClick={onBulkPriceUpdate}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Bulk Price Update
          </Button>
        </div>
      </div>
    </div>
  )
} 