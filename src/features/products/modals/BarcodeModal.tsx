import { Printer, Download, Eye, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/supabase"
import { 
  generateBarcodeLabels, 
  printBarcodeLabels, 
  downloadBarcodePDF,
  type PrintOptions 
} from "@/lib/barcode-printing"

interface BarcodeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  selectedProductIds?: string[]
}

interface ProductWithVariants extends Product {
  variants?: Array<{
    id: string
    sku: string | null
    barcode: string | null
    price: number | null
    stock_quantity: number
  }>
}

export const BarcodeModal = ({ isOpen, onClose, selectedCount, selectedProductIds = [] }: BarcodeModalProps) => {
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(false)
  const [labelType, setLabelType] = useState('product-labels')
  const [includeInfo, setIncludeInfo] = useState({
    productName: true,
    price: true,
    sku: true,
    barcode: true
  })
  const [quantityPerProduct, setQuantityPerProduct] = useState(1)
  const [includeVariants, setIncludeVariants] = useState(true)

  // Fetch products with their variants when modal opens
  useEffect(() => {
    if (isOpen && selectedProductIds.length > 0) {
      fetchProductsWithVariants()
    }
  }, [isOpen, selectedProductIds])

  const fetchProductsWithVariants = async () => {
    setLoading(true)
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          variants:product_variants (
            id,
            sku,
            barcode,
            price,
            stock_quantity
          )
        `)
        .in('id', selectedProductIds)
        .eq('is_active', true)

      if (productsError) throw productsError

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (products.length === 0) {
      alert('No products to print')
      return
    }

    const printOptions: PrintOptions = {
      labelType: labelType as any,
      includeInfo,
      quantityPerProduct,
      includeVariants
    }

    const labels = generateBarcodeLabels(products, printOptions)
    
    if (labels.length === 0) {
      alert('No barcodes found to print. Make sure products have barcodes set.')
      return
    }

    printBarcodeLabels(labels, printOptions)
  }

  const handleDownloadPDF = () => {
    if (products.length === 0) {
      alert('No products to export')
      return
    }

    const printOptions: PrintOptions = {
      labelType: labelType as any,
      includeInfo,
      quantityPerProduct,
      includeVariants
    }

    const labels = generateBarcodeLabels(products, printOptions)
    
    if (labels.length === 0) {
      alert('No barcodes found to export. Make sure products have barcodes set.')
      return
    }

    downloadBarcodePDF(labels, printOptions)
  }

  const getTotalBarcodes = () => {
    let total = products.length * quantityPerProduct
    if (includeVariants) {
      total += products.reduce((sum, product) => {
        return sum + (product.variants?.length || 0) * quantityPerProduct
      }, 0)
    }
    return total
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Barcodes & Labels">
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-[#F3F3F3] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-black/60" />
            <h3 className="font-semibold text-black">Print Summary</h3>
          </div>
          <p className="text-sm text-black/70">
            {selectedCount} products selected • {getTotalBarcodes()} barcodes to print
            {includeVariants && products.some(p => p.variants && p.variants.length > 0) && 
              ` • Including ${products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)} variants`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Label Type</label>
            <select 
              value={labelType}
              onChange={(e) => setLabelType(e.target.value)}
              className="w-full p-2 border border-black/20 rounded-md bg-white"
            >
              <option value="product-labels">Product Labels (2" x 1")</option>
              <option value="barcode-labels">Barcode Labels (1.5" x 0.5")</option>
              <option value="price-tags">Price Tags (3" x 2")</option>
              <option value="custom-size">Custom Size</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">Quantity per Item</label>
            <Input 
              type="number" 
              value={quantityPerProduct}
              onChange={(e) => setQuantityPerProduct(parseInt(e.target.value) || 1)}
              min="1" 
              max="100"
              className="bg-white border-black/20" 
            />
          </div>
        </div>

        {/* Include Information */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Include Information</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={includeInfo.productName}
                onChange={(e) => setIncludeInfo(prev => ({ ...prev, productName: e.target.checked }))}
                className="rounded" 
              />
              <span className="text-sm text-black">Product Name</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={includeInfo.price}
                onChange={(e) => setIncludeInfo(prev => ({ ...prev, price: e.target.checked }))}
                className="rounded" 
              />
              <span className="text-sm text-black">Price</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={includeInfo.sku}
                onChange={(e) => setIncludeInfo(prev => ({ ...prev, sku: e.target.checked }))}
                className="rounded" 
              />
              <span className="text-sm text-black">SKU</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={includeInfo.barcode}
                onChange={(e) => setIncludeInfo(prev => ({ ...prev, barcode: e.target.checked }))}
                className="rounded" 
              />
              <span className="text-sm text-black">Barcode</span>
            </label>
          </div>
        </div>

        {/* Variants Option */}
        {products.some(p => p.variants && p.variants.length > 0) && (
          <div>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={includeVariants}
                onChange={(e) => setIncludeVariants(e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm font-medium text-black">Include product variants</span>
            </label>
            <p className="text-xs text-black/60 mt-1">
              Print barcodes for all product variants (sizes, colors, etc.)
            </p>
          </div>
        )}

        {/* Preview Section */}
        {products.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-black mb-2">Preview</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded p-2 text-xs">
                  <div className="font-medium text-black">{product.name}</div>
                  <div className="text-black/60">Barcode: {product.barcode || 'Not set'}</div>
                  {includeVariants && product.variants && product.variants.length > 0 && (
                    <div className="mt-1">
                      <div className="text-black/50">Variants:</div>
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="ml-2 text-black/60">
                          • {variant.sku} - {variant.barcode || 'No barcode'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Button 
            className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
            onClick={handlePrint}
            disabled={loading}
          >
            <Printer className="mr-2 h-4 w-4" />
            {loading ? 'Loading...' : 'Print Barcodes'}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 