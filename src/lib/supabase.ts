import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const generateTransactionNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `TXN${year}${month}${day}-${hours}${minutes}${seconds}-${random}`
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  BUSINESS_ASSETS: 'business-assets'
} as const

// Ensure storage buckets exist
export async function ensureStorageBuckets() {
  try {
    const buckets = Object.values(STORAGE_BUCKETS)
    
    for (const bucketName of buckets) {
      const { data: bucket, error } = await supabase.storage.getBucket(bucketName)
      
      if (error && error.message.includes('not found')) {
        console.log(`Creating storage bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createError) {
          console.error(`Failed to create bucket ${bucketName}:`, createError)
        } else {
          console.log(`Successfully created bucket: ${bucketName}`)
        }
      } else if (error) {
        console.error(`Error checking bucket ${bucketName}:`, error)
      } else {
        console.log(`Bucket ${bucketName} exists`)
      }
    }
  } catch (error) {
    console.error('Error ensuring storage buckets:', error)
  }
}

// Image upload functions
export async function uploadProductImage(
  file: File,
  productId?: string,
  variantId?: string
): Promise<string | null> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      console.error('Invalid file provided for upload')
      return null
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('File too large. Maximum size is 10MB')
      return null
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed')
      return null
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = productId 
      ? variantId 
        ? `products/${productId}/variants/${variantId}/${fileName}`
        : `products/${productId}/${fileName}`
      : `temp/${fileName}`

    console.log('🗄️ [DEBUG] Starting image upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
      bucket: STORAGE_BUCKETS.PRODUCT_IMAGES
    })

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ [DEBUG] Supabase storage upload error:', error)
      return null
    }

    console.log('✅ [DEBUG] File uploaded successfully:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
      .getPublicUrl(filePath)

    console.log('🔗 [DEBUG] Generated public URL:', urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error('❌ [DEBUG] Error uploading product image:', error)
    console.error('❌ [DEBUG] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return null
  }
}

export async function uploadBusinessAsset(
  file: File,
  assetType: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${assetType}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.BUSINESS_ASSETS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading business asset:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.BUSINESS_ASSETS)
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading business asset:', error)
    return null
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketName = pathParts[1]
    const filePath = pathParts.slice(2).join('/')

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      // Property Management Tables
      property_buildings: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          postal_code: string | null
          total_units: number
          occupied_units: number
          total_rent: number
          collected_rent: number
          overdue_payments: number
          amenities: string[]
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          postal_code?: string | null
          total_units: number
          occupied_units?: number
          total_rent?: number
          collected_rent?: number
          overdue_payments?: number
          amenities?: string[]
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          postal_code?: string | null
          total_units?: number
          occupied_units?: number
          total_rent?: number
          collected_rent?: number
          overdue_payments?: number
          amenities?: string[]
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      property_rooms: {
        Row: {
          id: string
          building_id: string
          room_number: string
          floor: string
          type: string
          size: number | null
          rent_amount: number
          status: string
          amenities: string[]
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          building_id: string
          room_number: string
          floor: string
          type: string
          size?: number | null
          rent_amount: number
          status?: string
          amenities?: string[]
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          room_number?: string
          floor?: string
          type?: string
          size?: number | null
          rent_amount?: number
          status?: string
          amenities?: string[]
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_tenants: {
        Row: {
          id: string
          building_id: string
          room_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          lease_start_date: string
          lease_end_date: string
          monthly_rent: number
          security_deposit: number
          payment_status: string
          payment_due_date: string
          documents: string[]
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          building_id: string
          room_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          lease_start_date: string
          lease_end_date: string
          monthly_rent: number
          security_deposit: number
          payment_status?: string
          payment_due_date: string
          documents?: string[]
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          room_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          lease_start_date?: string
          lease_end_date?: string
          monthly_rent?: number
          security_deposit?: number
          payment_status?: string
          payment_due_date?: string
          documents?: string[]
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      property_payments: {
        Row: {
          id: string
          tenant_id: string
          building_id: string
          amount: number
          payment_date: string
          payment_method: string
          receipt_number: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          building_id: string
          amount: number
          payment_date: string
          payment_method: string
          receipt_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          building_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_receipts: {
        Row: {
          id: string
          receipt_number: string
          date: string
          due_date: string | null
          tenant_id: string
          building_id: string
          items: any[]
          subtotal: number
          tax_amount: number
          total: number
          payment_method: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          date: string
          due_date?: string | null
          tenant_id: string
          building_id: string
          items: any[]
          subtotal: number
          tax_amount: number
          total: number
          payment_method: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          date?: string
          due_date?: string | null
          tenant_id?: string
          building_id?: string
          items?: any[]
          subtotal?: number
          tax_amount?: number
          total?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_documents: {
        Row: {
          id: string
          building_id: string | null
          tenant_id: string | null
          room_id: string | null
          name: string
          type: string
          url: string
          size: number | null
          uploaded_by: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          building_id?: string | null
          tenant_id?: string | null
          room_id?: string | null
          name: string
          type: string
          url: string
          size?: number | null
          uploaded_by: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          building_id?: string | null
          tenant_id?: string | null
          room_id?: string | null
          name?: string
          type?: string
          url?: string
          size?: number | null
          uploaded_by?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_inventory_items: {
        Row: {
          id: string
          room_id: string
          name: string
          description: string | null
          condition: string
          quantity: number
          purchase_date: string | null
          purchase_price: number | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          name: string
          description?: string | null
          condition: string
          quantity?: number
          purchase_date?: string | null
          purchase_price?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          name?: string
          description?: string | null
          condition?: string
          quantity?: number
          purchase_date?: string | null
          purchase_price?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_maintenance_records: {
        Row: {
          id: string
          building_id: string
          room_id: string | null
          type: string
          description: string
          cost: number | null
          scheduled_date: string | null
          completion_date: string | null
          status: string
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          building_id: string
          room_id?: string | null
          type: string
          description: string
          cost?: number | null
          scheduled_date?: string | null
          completion_date?: string | null
          status?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          room_id?: string | null
          type?: string
          description?: string
          cost?: number | null
          scheduled_date?: string | null
          completion_date?: string | null
          status?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_communications: {
        Row: {
          id: string
          tenant_id: string
          type: string
          subject: string
          content: string
          sent_at: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          subject: string
          content: string
          sent_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: string
          subject?: string
          content?: string
          sent_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      variant_option_types: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      variant_options: {
        Row: {
          id: string
          type_id: string
          value: string
          label: string
          color_hex: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type_id: string
          value: string
          label: string
          color_hex?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type_id?: string
          value?: string
          label?: string
          color_hex?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string | null
          barcode: string | null
          category_id: string | null
          price: number
          cost_price: number | null
          stock_quantity: number
          min_stock_level: number
          max_stock_level: number | null
          unit: string
          is_active: boolean
          image_url: string | null
          has_variants: boolean
          discount_amount: number | null
          discount_type: string | null
          discount_description: string | null
          discount_expires_at: string | null
          is_discount_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          price: number
          cost_price?: number | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          unit?: string
          is_active?: boolean
          image_url?: string | null
          has_variants?: boolean
          discount_amount?: number | null
          discount_type?: string | null
          discount_description?: string | null
          discount_expires_at?: string | null
          is_discount_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          price?: number
          cost_price?: number | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          unit?: string
          is_active?: boolean
          image_url?: string | null
          has_variants?: boolean
          discount_amount?: number | null
          discount_type?: string | null
          discount_description?: string | null
          discount_expires_at?: string | null
          is_discount_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          barcode: string | null
          price: number | null
          cost_price: number | null
          stock_quantity: number
          min_stock_level: number
          max_stock_level: number | null
          image_url: string | null
          is_active: boolean
          discount_amount: number | null
          discount_type: string | null
          discount_description: string | null
          discount_expires_at: string | null
          is_discount_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku?: string | null
          barcode?: string | null
          price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          image_url?: string | null
          is_active?: boolean
          discount_amount?: number | null
          discount_type?: string | null
          discount_description?: string | null
          discount_expires_at?: string | null
          is_discount_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string | null
          barcode?: string | null
          price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          image_url?: string | null
          is_active?: boolean
          discount_amount?: number | null
          discount_type?: string | null
          discount_description?: string | null
          discount_expires_at?: string | null
          is_discount_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string | null
          variant_id: string | null
          image_url: string
          image_name: string | null
          image_size: number | null
          is_main_image: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          variant_id?: string | null
          image_url: string
          image_name?: string | null
          image_size?: number | null
          is_main_image?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          variant_id?: string | null
          image_url?: string
          image_name?: string | null
          image_size?: number | null
          is_main_image?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          business_website: string | null
          business_hours: any | null
          logo_url: string | null
          receipt_footer: string | null
          tax_rate: number | null
          tax_name: string | null
          currency: string | null
          currency_symbol: string | null
          timezone: string | null
          language: string | null
          date_format: string | null
          time_format: string | null
          decimal_places: number | null
          auto_backup: boolean | null
          backup_frequency: string | null
          notifications_enabled: boolean | null
          email_notifications: boolean | null
          sms_notifications: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          business_website?: string | null
          business_hours?: any | null
          logo_url?: string | null
          receipt_footer?: string | null
          tax_rate?: number | null
          tax_name?: string | null
          currency?: string | null
          currency_symbol?: string | null
          timezone?: string | null
          language?: string | null
          date_format?: string | null
          time_format?: string | null
          decimal_places?: number | null
          auto_backup?: boolean | null
          backup_frequency?: string | null
          notifications_enabled?: boolean | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          business_website?: string | null
          business_hours?: any | null
          logo_url?: string | null
          receipt_footer?: string | null
          tax_rate?: number | null
          tax_name?: string | null
          currency?: string | null
          currency_symbol?: string | null
          timezone?: string | null
          language?: string | null
          date_format?: string | null
          time_format?: string | null
          decimal_places?: number | null
          auto_backup?: boolean | null
          backup_frequency?: string | null
          notifications_enabled?: boolean | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          name: string
          description: string | null
          discount_type: string
          discount_amount: number
          start_date: string
          end_date: string
          is_active: boolean
          applies_to: string
          category_ids: string[] | null
          product_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          discount_type: string
          discount_amount: number
          start_date: string
          end_date: string
          is_active?: boolean
          applies_to?: string
          category_ids?: string[] | null
          product_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          discount_type?: string
          discount_amount?: number
          start_date?: string
          end_date?: string
          is_active?: boolean
          applies_to?: string
          category_ids?: string[] | null
          product_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type VariantOption = Database['public']['Tables']['variant_options']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Promotion = Database['public']['Tables']['promotions']['Row']





export type Settings = {
  id: number
  default_markup?: number | null
          updated_at: string
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Generate unique transaction numbers (duplicate removed)

// Generate unique order numbers
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Generate unique refund numbers
export const generateRefundNumber = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `REF-${timestamp}-${random}`
}

// Format currency
export const formatCurrency = (amount: number, currency = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}



// ========================================
// COMMON QUERY FUNCTIONS
// ========================================

// Get products with category information
export const getProductsWithCategory = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

// Get sales with customer and items information
export const getSalesWithDetails = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email
      ),
      sale_items (
        *,
        products (
          id,
          name,
          sku
        )
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get customers with their balances
export const getCustomersWithBalances = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('first_name')

  return { data, error }
}

// Get laybye orders with customer and items
export const getLaybyeOrdersWithDetails = async () => {
  const { data, error } = await supabase
    .from('laybye_orders')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      laybye_items (
        *,
        products (
          id,
          name,
          sku
        )
      ),
      laybye_payments (
        id,
        amount,
        payment_method,
        payment_date
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get business settings
export const getBusinessSettings = async () => {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .single()

  return { data, error }
}

// Update business settings
export const updateBusinessSettings = async (settings: Partial<Database['public']['Tables']['business_settings']['Row']>) => {
  const { data, error } = await supabase
    .from('business_settings')
    .update(settings)
    .eq('id', (await getBusinessSettings()).data?.id)
    .select()
    .single()

  return { data, error }
} 

// ========================================
// PRODUCT SERVICE FUNCTIONS
// ========================================

// Get all products with category information
export const getProducts = async (branchId?: string) => {
  if (!branchId) {
    // If no branchId provided, return all products (central warehouse view)
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('is_active', true)
      .order('name')

    return { data, error }
  }

  // Branch view: derive products from branch_stock (actual branch inventory)
  const { data: branchRows, error } = await supabase
    .from('branch_stock')
    .select(`
      product_id,
      stock_quantity,
      variant_id,
      products (*,
        categories (
          id,
          name,
          color
        )
      )
    `)
    .eq('branch_id', branchId)

  if (error) return { data: null, error }

  // Group by product and sum branch stock quantity
  const productIdToInfo: Record<string, { product: any; branch_quantity: number }> = {}
  for (const row of (branchRows as any[]) || []) {
    const product = (row as any).products as any
    if (!product) continue
    if (!(product as any).is_active) continue
    if (!productIdToInfo[(product as any).id]) {
      productIdToInfo[(product as any).id] = { product, branch_quantity: 0 }
    }
    // Sum only variant rows (variant_id not null) or include product-level stock if that's your model
    // Here we add any stock_quantity present
    const qty = Number((row as any).stock_quantity) || 0
    productIdToInfo[(product as any).id].branch_quantity += qty
  }

  const products = Object.values(productIdToInfo)
    .map(({ product, branch_quantity }) => ({ ...product, branch_quantity }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  return { data: products, error: null }
}

// Get a single product by ID
export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

// Get a single product by SKU
export const getProductBySku = async (sku: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('sku', sku)
    .single()

  return { data, error }
}

// Create a new product
export const createProduct = async (productData: Omit<Database['public']['Tables']['products']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🗄️ [DEBUG] createProduct: Starting database insert')
  console.log('📦 [DEBUG] createProduct: Input productData:', JSON.stringify(productData, null, 2))
  
  const insertData = {
    ...productData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('🗄️ [DEBUG] createProduct: Final insert data:', JSON.stringify(insertData, null, 2))
  
  const { data, error } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single()

  console.log('🗄️ [DEBUG] createProduct: Supabase response:', { data, error })
  
  if (error) {
    console.error('❌ [DEBUG] createProduct: Database error:', error)
    console.error('❌ [DEBUG] createProduct: Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
  } else {
    console.log('✅ [DEBUG] createProduct: Product created successfully:', data)
  }

  return { data, error }
}

// Update a product
export const updateProduct = async (id: string, updates: Partial<Database['public']['Tables']['products']['Update']>) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Delete a product (soft delete by setting is_active to false)
export const deleteProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Bulk delete products
export const bulkDeleteProducts = async (ids: string[]) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)
    .select()

  return { data, error }
}

// Update product stock quantity
export const updateProductStock = async (id: string, quantity: number) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      stock_quantity: quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Get products with low stock
export const getLowStockProducts = async (threshold: number = 5) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('is_active', true)
    .lte('stock_quantity', threshold)
    .order('stock_quantity')

  return { data, error }
}

// Get out of stock products
export const getOutOfStockProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('is_active', true)
    .eq('stock_quantity', 0)
    .order('name')

  return { data, error }
}

// Search products by name, SKU, or barcode
export const searchProducts = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
    .order('name')

  return { data, error }
}

// Get products by category
export const getProductsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .order('name')

  return { data, error }
}

// ========================================
// CATEGORY SERVICE FUNCTIONS
// ========================================

// Get all categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

// Create a new category
export const createCategory = async (categoryData: Omit<Database['public']['Tables']['categories']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Update a category
export const updateCategory = async (id: string, updates: Partial<Database['public']['Tables']['categories']['Update']>) => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Delete a category (soft delete)
export const deleteCategory = async (id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
} 

// ========================================
// BRANCH SERVICE FUNCTIONS
// ========================================

// Get all branches
export const getBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

// Create a new branch
export const createBranch = async (branchData: Omit<Database['public']['Tables']['branches']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('branches')
    .insert({
      ...branchData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Update a branch
export const updateBranch = async (id: string, updates: Partial<Database['public']['Tables']['branches']['Update']>) => {
  const { data, error } = await supabase
    .from('branches')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Delete a branch (soft delete)
export const deleteBranch = async (id: string) => {
  const { data, error } = await supabase
    .from('branches')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
} 

// ========================================
// PRODUCT VARIANT SERVICE FUNCTIONS
// ========================================

// Create a new product variant
export const createProductVariant = async (variantData: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🔢 [DEBUG] createProductVariant: Starting variant insert')
  console.log('📦 [DEBUG] createProductVariant: Input variantData:', JSON.stringify(variantData, null, 2))
  
  const insertData = {
    ...variantData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('🔢 [DEBUG] createProductVariant: Final insert data:', JSON.stringify(insertData, null, 2))
  
  const { data, error } = await supabase
    .from('product_variants')
    .insert(insertData)
    .select()
    .single()
    
  console.log('🔢 [DEBUG] createProductVariant: Supabase response:', { data, error })
  
  if (error) {
    console.error('❌ [DEBUG] createProductVariant: Database error:', error)
    console.error('❌ [DEBUG] createProductVariant: Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
  } else {
    console.log('✅ [DEBUG] createProductVariant: Variant created successfully:', data)
  }
  
  return { data, error }
}

// ========================================
// PRODUCT IMAGE SERVICE FUNCTIONS
// ========================================

// Create a new product image
export const createProductImage = async (imageData: Omit<ProductImage, 'id' | 'created_at'>) => {
  console.log('🖼️ [DEBUG] createProductImage: Starting image insert')
  console.log('📦 [DEBUG] createProductImage: Input imageData:', JSON.stringify(imageData, null, 2))
  
  const insertData = {
    ...imageData,
    created_at: new Date().toISOString()
  }
  
  console.log('🖼️ [DEBUG] createProductImage: Final insert data:', JSON.stringify(insertData, null, 2))
  
  const { data, error } = await supabase
    .from('product_images')
    .insert(insertData)
    .select()
    .single()
    
  console.log('🖼️ [DEBUG] createProductImage: Supabase response:', { data, error })
  
  if (error) {
    console.error('❌ [DEBUG] createProductImage: Database error:', error)
    console.error('❌ [DEBUG] createProductImage: Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
  } else {
    console.log('✅ [DEBUG] createProductImage: Image created successfully:', data)
  }
  
  return { data, error }
}

// ========================================
// SETTINGS SERVICE FUNCTIONS
// ========================================

// Fetch settings (universal markup)
export const getSetting = async (): Promise<Settings | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data as Settings
} 

// Get a single product by ID with variants and options
export const getProductWithVariants = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color
      ),
      variants:product_variants (
        id,
        sku,
        barcode,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        image_url,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

// Get product variants with their options
export const getProductVariantsWithOptions = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      product_variant_options (
        id,
        option_id,
        variant_options (
          id,
          value,
          label,
          color_hex,
          variant_option_types (
            id,
            name,
            display_name
          )
        )
      )
    `)
    .eq('product_id', productId)
    .eq('is_active', true)

  return { data, error }
} 