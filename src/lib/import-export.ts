// Product Import/Export Utilities
// Handles CSV import/export for products with variants

import { supabase } from './supabase'
import type { Product } from './supabase'

export interface ImportProduct {
  // Main product fields
  name: string
  description?: string
  sku: string
  barcode?: string
  category_name?: string
  price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level?: number
  max_stock_level?: number
  unit?: string
  is_active?: boolean
  
  // Discount fields
  discount_amount?: number
  discount_type?: 'percentage' | 'fixed'
  discount_description?: string
  discount_expires_at?: string
  is_discount_active?: boolean
  
  // Variant fields (for products with variants)
  has_variants?: boolean
  variant_sku?: string
  variant_barcode?: string
  variant_price?: number
  variant_cost_price?: number
  variant_stock_quantity?: number
  variant_min_stock_level?: number
  variant_max_stock_level?: number
  
  // Variant options
  size?: string
  color?: string
  gender?: string
  brand?: string
  style?: string
  
  // Images
  main_image_url?: string
  variant_image_url?: string
}

export interface ExportProduct extends Product {
  category_name?: string
  variants?: Array<{
    sku: string | null
    barcode: string | null
    price: number | null
    cost_price: number | null
    stock_quantity: number
    min_stock_level: number
    max_stock_level: number | null
    size?: string
    color?: string
    gender?: string
    brand?: string
    style?: string
    image_url?: string | null
  }>
}

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  warnings: Array<{
    row: number
    field: string
    message: string
  }>
}

// ========================================
// CSV PROCESSING
// ========================================

/**
 * Parse CSV content and return structured data
 */
export function parseCSV(csvContent: string): ImportProduct[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const products: ImportProduct[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue
    
    const product: any = {}
    headers.forEach((header, index) => {
      const value = values[index]?.trim().replace(/"/g, '') || ''
      
      // Convert numeric fields
      if (['price', 'cost_price', 'stock_quantity', 'min_stock_level', 'max_stock_level', 'discount_amount', 'variant_price', 'variant_cost_price', 'variant_stock_quantity', 'variant_min_stock_level', 'variant_max_stock_level'].includes(header)) {
        product[header] = value ? parseFloat(value) : undefined
      }
      // Convert boolean fields
      else if (['is_active', 'is_discount_active', 'has_variants'].includes(header)) {
        product[header] = value.toLowerCase() === 'true' || value === '1'
      }
      // Keep string fields as is
      else {
        product[header] = value || undefined
      }
    })
    
    products.push(product)
  }
  
  return products
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current)
  return values
}

/**
 * Convert products to CSV format
 */
export function productsToCSV(products: ExportProduct[]): string {
  const headers = [
    'name', 'description', 'sku', 'barcode', 'category_name', 'price', 'cost_price',
    'stock_quantity', 'min_stock_level', 'max_stock_level', 'unit', 'is_active',
    'discount_amount', 'discount_type', 'discount_description', 'discount_expires_at', 'is_discount_active',
    'has_variants', 'main_image_url',
    // Variant fields
    'variant_sku', 'variant_barcode', 'variant_price', 'variant_cost_price',
    'variant_stock_quantity', 'variant_min_stock_level', 'variant_max_stock_level',
    'size', 'color', 'gender', 'brand', 'style', 'variant_image_url'
  ]
  
  const csvLines = [headers.join(',')]
  
  products.forEach(product => {
    if (product.variants && product.variants.length > 0) {
      // Create a row for each variant
      product.variants.forEach(variant => {
        const row = [
          product.name,
          product.description || '',
          product.sku || '',
          product.barcode || '',
          product.category_name || '',
          product.price,
          product.cost_price || '',
          product.stock_quantity,
          product.min_stock_level,
          product.max_stock_level || '',
          product.unit,
          product.is_active,
          product.discount_amount || '',
          product.discount_type || '',
          product.discount_description || '',
          product.discount_expires_at || '',
          product.is_discount_active || false,
          true, // has_variants
          product.image_url || '',
          // Variant data
          variant.sku || '',
          variant.barcode || '',
          variant.price || '',
          variant.cost_price || '',
          variant.stock_quantity,
          variant.min_stock_level,
          variant.max_stock_level || '',
          variant.size || '',
          variant.color || '',
          variant.gender || '',
          variant.brand || '',
          variant.style || '',
          variant.image_url || ''
        ]
        csvLines.push(row.map(value => `"${value}"`).join(','))
      })
    } else {
      // Create a single row for product without variants
      const row = [
        product.name,
        product.description || '',
        product.sku || '',
        product.barcode || '',
        product.category_name || '',
        product.price,
        product.cost_price || '',
        product.stock_quantity,
        product.min_stock_level,
        product.max_stock_level || '',
        product.unit,
        product.is_active,
        product.discount_amount || '',
        product.discount_type || '',
        product.discount_description || '',
        product.discount_expires_at || '',
        product.is_discount_active || false,
        false, // has_variants
        product.image_url || '',
        // Empty variant fields
        '', '', '', '', '', '', '', '', '', '', '', ''
      ]
      csvLines.push(row.map(value => `"${value}"`).join(','))
    }
  })
  
  return csvLines.join('\n')
}

// ========================================
// VALIDATION
// ========================================

/**
 * Validate import data
 */
export function validateImportData(products: ImportProduct[]): ImportResult {
  const result: ImportResult = {
    success: true,
    message: 'Validation successful',
    imported: 0,
    errors: [],
    warnings: []
  }
  
  products.forEach((product, index) => {
    const row = index + 2 // +2 because of 0-based index and header row
    
    // Required fields
    if (!product.name?.trim()) {
      result.errors.push({ row, field: 'name', message: 'Product name is required' })
    }
    
    if (!product.sku?.trim()) {
      result.errors.push({ row, field: 'sku', message: 'SKU is required' })
    }
    
    if (!product.price || product.price <= 0) {
      result.errors.push({ row, field: 'price', message: 'Valid price is required' })
    }
    
    // Variant validation
    if (product.has_variants) {
      if (!product.variant_sku?.trim()) {
        result.errors.push({ row, field: 'variant_sku', message: 'Variant SKU is required for products with variants' })
      }
      
      if (!product.size && !product.color && !product.gender && !product.brand && !product.style) {
        result.warnings.push({ row, field: 'variant_options', message: 'No variant options specified (size, color, gender, brand, style)' })
      }
    }
    
    // Discount validation
    if (product.is_discount_active && product.discount_amount) {
      if (product.discount_type === 'percentage' && (product.discount_amount <= 0 || product.discount_amount > 100)) {
        result.errors.push({ row, field: 'discount_amount', message: 'Percentage discount must be between 0 and 100' })
      }
      
      if (product.discount_type === 'fixed' && product.discount_amount >= product.price) {
        result.errors.push({ row, field: 'discount_amount', message: 'Fixed discount cannot be greater than or equal to price' })
      }
    }
    
    // Expiration date validation
    if (product.discount_expires_at) {
      const expiryDate = new Date(product.discount_expires_at)
      if (isNaN(expiryDate.getTime())) {
        result.errors.push({ row, field: 'discount_expires_at', message: 'Invalid expiration date format' })
      } else if (expiryDate < new Date()) {
        result.warnings.push({ row, field: 'discount_expires_at', message: 'Discount expires in the past' })
      }
    }
  })
  
  result.success = result.errors.length === 0
  result.imported = products.length
  
  if (result.errors.length > 0) {
    result.message = `Validation failed: ${result.errors.length} errors found`
  } else if (result.warnings.length > 0) {
    result.message = `Validation successful with ${result.warnings.length} warnings`
  }
  
  return result
}

// ========================================
// DATABASE OPERATIONS
// ========================================

/**
 * Import products to database
 */
export async function importProducts(products: ImportProduct[], mode: 'add' | 'update' | 'replace'): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    message: 'Import successful',
    imported: 0,
    errors: [],
    warnings: []
  }
  
  try {
    // Group products by main SKU to handle variants
    const productGroups = groupProductsBySKU(products)
    
    for (const [mainSku, productRows] of productGroups) {
      try {
        const mainProduct = productRows[0]
        const variants = productRows.filter(p => p.has_variants && p.variant_sku)
        
        // Get or create category
        let categoryId: string | null = null
        if (mainProduct.category_name) {
          categoryId = await getOrCreateCategory(mainProduct.category_name)
        }
        
        // Prepare product data
        const productData = {
          name: mainProduct.name,
          description: mainProduct.description,
          sku: mainProduct.sku,
          barcode: mainProduct.barcode,
          category_id: categoryId,
          price: mainProduct.price,
          cost_price: mainProduct.cost_price,
          stock_quantity: variants.length > 0 ? 0 : mainProduct.stock_quantity,
          min_stock_level: mainProduct.min_stock_level || 0,
          max_stock_level: mainProduct.max_stock_level,
          unit: mainProduct.unit || 'piece',
          is_active: mainProduct.is_active !== false,
          image_url: mainProduct.main_image_url,
          has_variants: variants.length > 0,
          discount_amount: mainProduct.discount_amount,
          discount_type: mainProduct.discount_type,
          discount_description: mainProduct.discount_description,
          discount_expires_at: mainProduct.discount_expires_at,
          is_discount_active: mainProduct.is_discount_active || false,
        }
        
        // Check if product exists
        const existingProduct = await getProductBySKU(mainProduct.sku)
        
        if (existingProduct && mode === 'add') {
          result.warnings.push({ row: 0, field: 'sku', message: `Product with SKU ${mainProduct.sku} already exists, skipping` })
          continue
        }
        
        let productId: string
        
        if (existingProduct && (mode === 'update' || mode === 'replace')) {
          // Update existing product
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
          
          if (error) throw error
          productId = existingProduct.id
        } else {
          // Create new product
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()
          
          if (error) throw error
          productId = data.id
        }
        
        // Handle variants
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantData = {
              product_id: productId,
              sku: variant.variant_sku,
              barcode: variant.variant_barcode,
              price: variant.variant_price || mainProduct.price,
              cost_price: variant.variant_cost_price || mainProduct.cost_price,
              stock_quantity: variant.variant_stock_quantity || 0,
              min_stock_level: variant.variant_min_stock_level || mainProduct.min_stock_level || 0,
              max_stock_level: variant.variant_max_stock_level || mainProduct.max_stock_level,
              image_url: variant.variant_image_url,
              is_active: true,
            }
            
            await supabase
              .from('product_variants')
              .insert(variantData)
          }
        }
        
        result.imported++
        
      } catch (error) {
        result.errors.push({ 
          row: 0, 
          field: 'general', 
          message: `Failed to import product group ${mainSku}: ${error instanceof Error ? error.message : 'Unknown error'}` 
        })
      }
    }
    
  } catch (error) {
    result.success = false
    result.message = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
  
  return result
}

/**
 * Export products from database
 */
export async function exportProducts(): Promise<ExportProduct[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      variants:product_variants (*)
    `)
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  
  return (products || []).map(product => ({
    ...product,
    category_name: product.categories?.name,
    variants: product.variants || []
  }))
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Group products by main SKU to handle variants
 */
function groupProductsBySKU(products: ImportProduct[]): Map<string, ImportProduct[]> {
  const groups = new Map<string, ImportProduct[]>()
  
  products.forEach(product => {
    const key = product.sku
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(product)
  })
  
  return groups
}

/**
 * Get or create category by name
 */
async function getOrCreateCategory(name: string): Promise<string> {
  // First try to find existing category
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .single()
  
  if (existing) return existing.id
  
  // Create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name,
      description: `Category for ${name}`,
      color: '#3B82F6',
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return newCategory.id
}

/**
 * Get product by SKU
 */
async function getProductBySKU(sku: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    'name', 'description', 'sku', 'barcode', 'category_name', 'price', 'cost_price',
    'stock_quantity', 'min_stock_level', 'max_stock_level', 'unit', 'is_active',
    'discount_amount', 'discount_type', 'discount_description', 'discount_expires_at', 'is_discount_active',
    'has_variants', 'main_image_url',
    'variant_sku', 'variant_barcode', 'variant_price', 'variant_cost_price',
    'variant_stock_quantity', 'variant_min_stock_level', 'variant_max_stock_level',
    'size', 'color', 'gender', 'brand', 'style', 'variant_image_url'
  ]
  
  const exampleRows = [
    // Simple product without variants
    [
      'Basic T-Shirt',
      'Comfortable cotton t-shirt',
      'TSHIRT-001',
      '123456789012',
      'Clothing',
      '29.99',
      '15.00',
      '50',
      '5',
      '100',
      'piece',
      'true',
      '10',
      'percentage',
      'Summer Sale',
      '2024-08-31T23:59:59',
      'true',
      'false',
      'https://example.com/tshirt.jpg',
      '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    // Product with variants - main product row
    [
      'Premium Jeans',
      'High-quality denim jeans',
      'JEANS-001',
      '123456789013',
      'Clothing',
      '89.99',
      '45.00',
      '0', // Stock managed at variant level
      '2',
      '50',
      'piece',
      'true',
      '', '', '', '', 'false',
      'true',
      'https://example.com/jeans.jpg',
      '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    // Variant 1
    [
      'Premium Jeans',
      'High-quality denim jeans',
      'JEANS-001',
      '123456789013',
      'Clothing',
      '89.99',
      '45.00',
      '0',
      '2',
      '50',
      'piece',
      'true',
      '', '', '', '', 'false',
      'true',
      'https://example.com/jeans.jpg',
      'JEANS-001-32-BLUE',
      '123456789014',
      '89.99',
      '45.00',
      '15',
      '2',
      '20',
      '32',
      'Blue',
      'Unisex',
      'Premium Brand',
      'Slim Fit',
      'https://example.com/jeans-blue-32.jpg'
    ],
    // Variant 2
    [
      'Premium Jeans',
      'High-quality denim jeans',
      'JEANS-001',
      '123456789013',
      'Clothing',
      '89.99',
      '45.00',
      '0',
      '2',
      '50',
      'piece',
      'true',
      '', '', '', '', 'false',
      'true',
      'https://example.com/jeans.jpg',
      'JEANS-001-34-BLUE',
      '123456789015',
      '89.99',
      '45.00',
      '12',
      '2',
      '20',
      '34',
      'Blue',
      'Unisex',
      'Premium Brand',
      'Slim Fit',
      'https://example.com/jeans-blue-34.jpg'
    ],
    // Product with discount
    [
      'Wireless Headphones',
      'Bluetooth wireless headphones with noise cancellation',
      'HEADPHONES-001',
      '123456789016',
      'Electronics',
      '199.99',
      '120.00',
      '25',
      '3',
      '50',
      'piece',
      'true',
      '25',
      'percentage',
      'Black Friday Sale',
      '2024-11-30T23:59:59',
      'true',
      'false',
      'https://example.com/headphones.jpg',
      '', '', '', '', '', '', '', '', '', '', '', ''
    ]
  ]
  
  const csvLines = [headers.join(',')]
  csvLines.push(...exampleRows.map(row => row.map(value => `"${value}"`).join(',')))
  
  return csvLines.join('\n')
} 