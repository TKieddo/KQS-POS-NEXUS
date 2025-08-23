import { supabase } from '@/lib/supabase'

// Types
export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VariantOptionType {
  id: string
  name: string
  display_name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface VariantOption {
  id: string
  type_id: string
  value: string
  label: string
  color_hex: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  type?: VariantOptionType
}

export interface Product {
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
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductVariant {
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
  created_at: string
  updated_at: string
}

export interface ProductVariantOption {
  id: string
  variant_id: string
  option_id: string
  created_at: string
}

export interface CategoryVariantConfig {
  id: string
  category_id: string
  variant_type_id: string
  is_required: boolean
  sort_order: number
  created_at: string
}

// Category Services
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Variant Option Types Services
export const variantTypesService = {
  async getAll(): Promise<VariantOptionType[]> {
    const { data, error } = await supabase
      .from('variant_option_types')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  async getActive(): Promise<VariantOptionType[]> {
    const { data, error } = await supabase
      .from('variant_option_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<VariantOptionType | null> {
    const { data, error } = await supabase
      .from('variant_option_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(variantType: Omit<VariantOptionType, 'id' | 'created_at' | 'updated_at'>): Promise<VariantOptionType> {
    // Get next sort order
    const { data: maxSortData } = await supabase
      .from('variant_option_types')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (maxSortData?.[0]?.sort_order || 0) + 1

    const { data, error } = await supabase
      .from('variant_option_types')
      .insert({ ...variantType, sort_order: nextSortOrder })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<VariantOptionType>): Promise<VariantOptionType> {
    const { data, error } = await supabase
      .from('variant_option_types')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('variant_option_types')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async updateSortOrder(id: string, sortOrder: number): Promise<void> {
    const { error } = await supabase
      .from('variant_option_types')
      .update({ sort_order: sortOrder })
      .eq('id', id)

    if (error) throw error
  }
}

// Variant Options Services
export const variantOptionsService = {
  async getAll(): Promise<VariantOption[]> {
    const { data, error } = await supabase
      .from('variant_options')
      .select(`
        *,
        type:variant_option_types(*)
      `)
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  async getByTypeId(typeId: string): Promise<VariantOption[]> {
    const { data, error } = await supabase
      .from('variant_options')
      .select(`
        *,
        type:variant_option_types(*)
      `)
      .eq('type_id', typeId)
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<VariantOption | null> {
    const { data, error } = await supabase
      .from('variant_options')
      .select(`
        *,
        type:variant_option_types(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(variantOption: Omit<VariantOption, 'id' | 'created_at' | 'updated_at' | 'type'>): Promise<VariantOption> {
    // Get next sort order for this type
    const { data: maxSortData } = await supabase
      .from('variant_options')
      .select('sort_order')
      .eq('type_id', variantOption.type_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (maxSortData?.[0]?.sort_order || 0) + 1

    const { data, error } = await supabase
      .from('variant_options')
      .insert({ ...variantOption, sort_order: nextSortOrder })
      .select(`
        *,
        type:variant_option_types(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<VariantOption>): Promise<VariantOption> {
    const { data, error } = await supabase
      .from('variant_options')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        type:variant_option_types(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('variant_options')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async updateSortOrder(id: string, sortOrder: number): Promise<void> {
    const { error } = await supabase
      .from('variant_options')
      .update({ sort_order: sortOrder })
      .eq('id', id)

    if (error) throw error
  }
}

// Products Services
export const productsService = {
  async getAll(limit?: number): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, color)
      `)
      .order('name')

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Product Variants Services
export const productVariantsService = {
  async getByProductId(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ProductVariant>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Category Variant Configurations Services
export const categoryVariantConfigsService = {
  async getByCategoryId(categoryId: string): Promise<CategoryVariantConfig[]> {
    const { data, error } = await supabase
      .from('category_variant_configs')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  async create(config: Omit<CategoryVariantConfig, 'id' | 'created_at'>): Promise<CategoryVariantConfig> {
    const { data, error } = await supabase
      .from('category_variant_configs')
      .insert(config)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<CategoryVariantConfig>): Promise<CategoryVariantConfig> {
    const { data, error } = await supabase
      .from('category_variant_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_variant_configs')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Combined service for complex operations
export const productsManagementService = {
  async getVariantOptionsForCategory(categoryId: string): Promise<Record<string, VariantOption[]>> {
    // Get variant types configured for this category
    const { data: configs, error: configsError } = await supabase
      .from('category_variant_configs')
      .select(`
        variant_type_id,
        is_required,
        variant_option_types(id, name, display_name)
      `)
      .eq('category_id', categoryId)
      .order('sort_order')

    if (configsError) throw configsError

    const result: Record<string, VariantOption[]> = {}

    // Get options for each variant type
    for (const config of configs || []) {
      const options = await variantOptionsService.getByTypeId(config.variant_type_id)
      const typeName = config.variant_option_types?.display_name || 'Unknown'
      result[typeName] = options
    }

    return result
  },

  async getProductWithVariants(productId: string): Promise<{
    product: Product
    variants: ProductVariant[]
    variantOptions: Record<string, VariantOption[]>
  } | null> {
    const product = await productsService.getById(productId)
    if (!product) return null

    const variants = await productVariantsService.getByProductId(productId)
    
    let variantOptions: Record<string, VariantOption[]> = {}
    if (product.category_id) {
      variantOptions = await this.getVariantOptionsForCategory(product.category_id)
    }

    return {
      product,
      variants,
      variantOptions
    }
  }
}
