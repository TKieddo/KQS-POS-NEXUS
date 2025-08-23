import { toast } from 'sonner'

export interface DatabaseError {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export const handleDatabaseError = (error: DatabaseError, operation: string = 'operation') => {
  console.error(`Error during ${operation}:`, error)

  // Handle authentication errors
  if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
    toast.error('Session expired. Please refresh the page and try again.')
    return
  }

  // Handle common database constraint errors
  if (error.code === '23505') {
    if (error.message?.includes('categories_name_key')) {
      toast.error('A category with this name already exists')
    } else if (error.message?.includes('variant_option_types_name_key')) {
      toast.error('A variant type with this name already exists')
    } else if (error.message?.includes('unique')) {
      toast.error('This item already exists')
    } else {
      toast.error('Duplicate entry - item already exists')
    }
    return
  }

  if (error.code === '23503') {
    if (error.message?.includes('categories')) {
      toast.error('Cannot delete category - it is being used by products')
    } else if (error.message?.includes('variant_option_types')) {
      toast.error('Cannot delete variant type - it is being used by products or categories')
    } else {
      toast.error('Cannot delete - item is being used by other records')
    }
    return
  }

  // Handle permission errors
  if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
    toast.error('Permission denied. You do not have access to perform this action.')
    return
  }

  // Handle network/connection errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    toast.error('Connection error. Please check your internet connection and try again.')
    return
  }

  // Generic error fallback
  const errorMessage = error.message || `Failed to complete ${operation}`
  toast.error(errorMessage)
}

export const handleAuthError = (error: any) => {
  if (error?.message?.includes('Invalid login credentials')) {
    toast.error('Invalid email or password')
  } else if (error?.message?.includes('Email not confirmed')) {
    toast.error('Please confirm your email address')
  } else if (error?.message?.includes('Too many requests')) {
    toast.error('Too many attempts. Please wait a moment and try again.')
  } else {
    toast.error(error?.message || 'Authentication failed')
  }
}

export const isAuthError = (error: any): boolean => {
  return error?.code === 'PGRST301' || 
         error?.message?.includes('JWT expired') ||
         error?.code === 'PGRST116' ||
         error?.message?.includes('permission denied')
}

export const refreshPageOnAuthError = (error: any) => {
  if (isAuthError(error)) {
    setTimeout(() => {
      window.location.reload()
    }, 2000) // Give user time to see the error message
  }
}
