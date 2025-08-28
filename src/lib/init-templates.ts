import { createAllReceiptTemplates } from './create-laybye-templates'

/**
 * Initialize all receipt templates for a branch
 * This can be called from the browser console or as a utility function
 */
export const initializeTemplatesForBranch = async (branchId: string) => {
  console.log('🚀 Initializing all receipt templates for branch:', branchId)
  
  try {
    const result = await createAllReceiptTemplates(branchId)
    
    if (result.success && result.results) {
      const successCount = result.results.filter(r => r.success).length
      const totalCount = result.results.length
      
      console.log(`✅ Successfully created ${successCount}/${totalCount} templates!`)
      
      // Log each created template
      result.results.forEach(r => {
        if (r.success) {
          console.log(`✅ Created: ${r.name}`)
        } else {
          console.error(`❌ Failed to create: ${r.name}`, r.error)
        }
      })
      
      return result
    } else {
      console.error('❌ Failed to initialize templates:', result.error)
      return result
    }
  } catch (error) {
    console.error('❌ Error initializing templates:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).initializeTemplatesForBranch = initializeTemplatesForBranch
  console.log('🎯 Template initialization function available globally as: window.initializeTemplatesForBranch(branchId)')
}
