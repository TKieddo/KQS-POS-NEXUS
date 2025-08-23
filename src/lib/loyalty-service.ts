import { supabase } from './supabase'

export interface LoyaltySettings {
  id?: string
  is_active: boolean
  points_per_rand: number
  points_expiry_months: number
  auto_tier_upgrade: boolean
  birthday_bonus_enabled: boolean
  welcome_bonus_points: number
  referral_bonus_points: number
  created_at?: string
  updated_at?: string
}

export interface LoyaltyTier {
  id?: string
  name: string
  min_spend: number
  points_multiplier: number
  benefits: string[]
  color: string
  is_default: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface LoyaltyReward {
  id?: string
  name: string
  points_cost: number
  type: 'discount' | 'service' | 'bonus' | 'multiplier'
  value: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

class LoyaltyService {
  // Get loyalty settings
  async getLoyaltySettings(): Promise<{ data: LoyaltySettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      return { 
        data: data || {
          is_active: false,
          points_per_rand: 1,
          points_expiry_months: 12,
          auto_tier_upgrade: true,
          birthday_bonus_enabled: true,
          welcome_bonus_points: 100,
          referral_bonus_points: 50
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error fetching loyalty settings:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch loyalty settings' 
      }
    }
  }

  // Save loyalty settings
  async saveLoyaltySettings(settings: LoyaltySettings): Promise<{ data: LoyaltySettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error saving loyalty settings:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to save loyalty settings' 
      }
    }
  }

  // Get loyalty tiers
  async getLoyaltyTiers(): Promise<{ data: LoyaltyTier[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('min_spend', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching loyalty tiers:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch loyalty tiers' 
      }
    }
  }

  // Save loyalty tier
  async saveLoyaltyTier(tier: LoyaltyTier): Promise<{ data: LoyaltyTier | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .upsert({
          ...tier,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error saving loyalty tier:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to save loyalty tier' 
      }
    }
  }

  // Delete loyalty tier
  async deleteLoyaltyTier(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('loyalty_tiers')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error deleting loyalty tier:', error)
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete loyalty tier' 
      }
    }
  }

  // Get loyalty rewards
  async getLoyaltyRewards(): Promise<{ data: LoyaltyReward[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('points_cost', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching loyalty rewards:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch loyalty rewards' 
      }
    }
  }

  // Save loyalty reward
  async saveLoyaltyReward(reward: LoyaltyReward): Promise<{ data: LoyaltyReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .upsert({
          ...reward,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error saving loyalty reward:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to save loyalty reward' 
      }
    }
  }

  // Delete loyalty reward
  async deleteLoyaltyReward(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error deleting loyalty reward:', error)
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete loyalty reward' 
      }
    }
  }
}

export const loyaltyService = new LoyaltyService() 