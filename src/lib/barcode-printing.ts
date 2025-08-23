// Barcode Printing Utilities
// This file contains functions for generating and printing barcode labels

export interface BarcodeLabel {
  id: string
  name: string
  sku: string
  barcode: string
  price?: number
  category?: string
  isVariant?: boolean
  variantInfo?: string
}

export interface PrintOptions {
  labelType: 'product-labels' | 'barcode-labels' | 'price-tags' | 'custom-size'
  includeInfo: {
    productName: boolean
    price: boolean
    sku: boolean
    barcode: boolean
  }
  quantityPerProduct: number
  includeVariants: boolean
}

/**
 * Generate barcode labels for printing
 */
export const generateBarcodeLabels = (
  products: Array<{
    id: string
    name: string
    sku: string | null
    barcode: string | null
    price: number
    categories?: { name: string }
    variants?: Array<{
      id: string
      sku: string | null
      barcode: string | null
      price: number | null
    }>
  }>,
  options: PrintOptions
): BarcodeLabel[] => {
  const labels: BarcodeLabel[] = []

  products.forEach(product => {
    // Add main product labels
    if (product.barcode) {
      for (let i = 0; i < options.quantityPerProduct; i++) {
        labels.push({
          id: `${product.id}-main-${i}`,
          name: product.name,
          sku: product.sku || '',
          barcode: product.barcode,
          price: product.price,
          category: product.categories?.name,
          isVariant: false
        })
      }
    }

    // Add variant labels if requested
    if (options.includeVariants && product.variants) {
      product.variants.forEach(variant => {
        if (variant.barcode) {
          for (let i = 0; i < options.quantityPerProduct; i++) {
            labels.push({
              id: `${variant.id}-variant-${i}`,
              name: product.name,
              sku: variant.sku || '',
              barcode: variant.barcode,
              price: variant.price || product.price,
              category: product.categories?.name,
              isVariant: true,
              variantInfo: `Variant: ${variant.sku}`
            })
          }
        }
      })
    }
  })

  return labels
}

/**
 * Generate HTML for barcode labels (for printing)
 */
export const generateBarcodeHTML = (labels: BarcodeLabel[], options: PrintOptions): string => {
  const labelStyles = {
    'product-labels': 'width: 2in; height: 1in;',
    'barcode-labels': 'width: 1.5in; height: 0.5in;',
    'price-tags': 'width: 3in; height: 2in;',
    'custom-size': 'width: 2in; height: 1in;'
  }

  const style = labelStyles[options.labelType]

  const labelHTML = labels.map(label => `
    <div style="${style} border: 1px solid #ccc; padding: 4px; margin: 2px; display: inline-block; font-family: Arial, sans-serif; font-size: 10px;">
      ${options.includeInfo.productName ? `<div style="font-weight: bold; margin-bottom: 2px;">${label.name}</div>` : ''}
      ${options.includeInfo.sku ? `<div style="margin-bottom: 2px;">SKU: ${label.sku}</div>` : ''}
      ${options.includeInfo.price ? `<div style="margin-bottom: 2px;">$${label.price?.toFixed(2)}</div>` : ''}
      ${options.includeInfo.barcode ? `<div style="font-family: monospace; font-size: 12px; text-align: center; margin-top: 4px;">${label.barcode}</div>` : ''}
      ${label.isVariant && label.variantInfo ? `<div style="font-size: 8px; color: #666;">${label.variantInfo}</div>` : ''}
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barcode Labels</title>
      <style>
        body { margin: 0; padding: 10px; }
        .label-container { display: flex; flex-wrap: wrap; gap: 4px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px;">
        <h2>Barcode Labels Preview</h2>
        <p>Total labels: ${labels.length}</p>
        <button onclick="window.print()">Print Labels</button>
        <button onclick="window.close()">Close</button>
      </div>
      <div class="label-container">
        ${labelHTML}
      </div>
    </body>
    </html>
  `
}

/**
 * Print barcode labels using browser print functionality
 */
export const printBarcodeLabels = (labels: BarcodeLabel[], options: PrintOptions): void => {
  const html = generateBarcodeHTML(labels, options)
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

/**
 * Download barcode labels as PDF (placeholder for future implementation)
 */
export const downloadBarcodePDF = (labels: BarcodeLabel[], options: PrintOptions): void => {
  // TODO: Implement PDF generation using a library like jsPDF
  console.log('PDF generation would be implemented here')
  alert('PDF generation feature coming soon!')
}

/**
 * Validate barcode format (basic validation)
 */
export const validateBarcode = (barcode: string): boolean => {
  if (!barcode || barcode.length < 8) return false
  
  // Basic validation - can be enhanced for specific barcode types
  return /^[0-9]+$/.test(barcode) || /^[0-9A-Z]+$/.test(barcode)
}

/**
 * Generate a unique barcode (simple implementation)
 */
export const generateUniqueBarcode = (base: string): string => {
  // Simple hash-based barcode generation
  let hash = 0
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().padStart(12, '0').slice(0, 12)
} 