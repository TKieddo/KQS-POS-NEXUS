import { supabase } from './supabase'

export interface VariantOption {
  id: string
  value: string
  label: string
  type: 'size' | 'color' | 'gender' | 'brand' | 'style'
  color_hex?: string
  sort_order: number
  is_active: boolean
}

export interface VariantOptionType {
  id: string
  name: string
  display_name: string
  description?: string
  is_active: boolean
  sort_order: number
}

export interface CategoryVariantConfig {
  category_id: string
  variant_type_id: string
  is_required: boolean
  sort_order: number
}

// Get all variant option types
export async function getVariantOptionTypes(): Promise<VariantOptionType[]> {
  try {
    const { data, error } = await supabase
      .from('variant_option_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching variant option types:', error)
    return []
  }
}

// Get variant options by type
export async function getVariantOptionsByType(typeName: string): Promise<VariantOption[]> {
  try {
    const { data, error } = await supabase
      .from('variant_options')
      .select(`
        id,
        value,
        label,
        color_hex,
        sort_order,
        is_active,
        variant_option_types!inner(name)
      `)
      .eq('variant_option_types.name', typeName)
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    
    return (data || []).map(item => ({
      id: item.id,
      value: item.value,
      label: item.label,
      type: item.variant_option_types.name as VariantOption['type'],
      color_hex: item.color_hex,
      sort_order: item.sort_order,
      is_active: item.is_active
    }))
  } catch (error) {
    console.error(`Error fetching variant options for type ${typeName}:`, error)
    return []
  }
}

// Get variant options for a specific category
export async function getVariantOptionsForCategory(categoryId: string): Promise<{
  [key: string]: VariantOption[]
}> {
  try {
    // Get category variant configurations
    const { data: configs, error: configError } = await supabase
      .from('category_variant_configs')
      .select(`
        variant_type_id,
        is_required,
        sort_order,
        variant_option_types!inner(name)
      `)
      .eq('category_id', categoryId)
      .order('sort_order')

    if (configError) throw configError

    const result: { [key: string]: VariantOption[] } = {}

    // Get options for each variant type
    for (const config of configs || []) {
      const typeName = config.variant_option_types.name
      const options = await getVariantOptionsByType(typeName)
      result[typeName] = options
    }

    return result
  } catch (error) {
    console.error(`Error fetching variant options for category ${categoryId}:`, error)
    return {}
  }
}

// Get size options for a category
export async function getSizeOptionsForCategory(categoryId: string): Promise<VariantOption[]> {
  const options = await getVariantOptionsForCategory(categoryId)
  return options.size || []
}

// Get color options for a category
export async function getColorOptionsForCategory(categoryId: string): Promise<VariantOption[]> {
  const options = await getVariantOptionsForCategory(categoryId)
  return options.color || []
}

// Get gender options for a category
export async function getGenderOptionsForCategory(categoryId: string): Promise<VariantOption[]> {
  const options = await getVariantOptionsForCategory(categoryId)
  return options.gender || []
}

// Get brand options for a category
export async function getBrandOptionsForCategory(categoryId: string): Promise<VariantOption[]> {
  const options = await getVariantOptionsForCategory(categoryId)
  return options.brand || []
}

// Get style options for a category
export async function getStyleOptionsForCategory(categoryId: string): Promise<VariantOption[]> {
  const options = await getVariantOptionsForCategory(categoryId)
  return options.style || []
}

// Add new variant option
export async function addVariantOption(
  typeName: string,
  value: string,
  label: string,
  colorHex?: string
): Promise<VariantOption | null> {
  try {
    // Get the variant option type ID
    const { data: typeData, error: typeError } = await supabase
      .from('variant_option_types')
      .select('id')
      .eq('name', typeName)
      .single()

    if (typeError) throw typeError

    // Insert the new option
    const { data, error } = await supabase
      .from('variant_options')
      .insert({
        type_id: typeData.id,
        value,
        label,
        color_hex: colorHex,
        sort_order: 999 // Will be updated later
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding variant option:', error)
    return null
  }
}

// Update variant option
export async function updateVariantOption(
  id: string,
  updates: Partial<Pick<VariantOption, 'value' | 'label' | 'color_hex' | 'sort_order' | 'is_active'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('variant_options')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating variant option:', error)
    return false
  }
}

// Delete variant option
export async function deleteVariantOption(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('variant_options')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting variant option:', error)
    return false
  }
}

// Get all categories with their variant configurations
export async function getCategoriesWithVariants(): Promise<{
  id: string
  name: string
  description?: string
  color: string
  variant_configs: CategoryVariantConfig[]
}[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        color,
        category_variant_configs(
          variant_type_id,
          is_required,
          sort_order,
          variant_option_types(name, display_name)
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return (data || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      variant_configs: category.category_variant_configs || []
    }))
  } catch (error) {
    console.error('Error fetching categories with variants:', error)
    return []
  }
} 