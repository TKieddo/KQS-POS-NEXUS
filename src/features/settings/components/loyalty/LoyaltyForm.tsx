import React, { useState, useEffect } from 'react'
import { Save, Star, Gift, Users, TrendingUp, Award, Percent, Crown, Zap, Target, Calendar, Plus, Edit, Trash2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { SettingsToggle } from '../SettingsToggle'
import { loyaltyService, type LoyaltySettings, type LoyaltyTier, type LoyaltyReward } from '@/lib/loyalty-service'

interface LoyaltyFormProps {
  onSave?: () => void
}

export const LoyaltyForm: React.FC<LoyaltyFormProps> = ({ onSave }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<LoyaltySettings>({
    is_active: false,
    points_per_rand: 1,
    points_expiry_months: 12,
    auto_tier_upgrade: true,
    birthday_bonus_enabled: true,
    welcome_bonus_points: 100,
    referral_bonus_points: 50
  })
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])

  // Modal states
  const [showTierModal, setShowTierModal] = useState(false)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null)
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null)

  // Form states
  const [newTier, setNewTier] = useState({
    name: '',
    min_spend: '',
    points_multiplier: '',
    benefits: [''],
    color: '#3B82F6',
    is_default: false
  })
  const [newReward, setNewReward] = useState({
    name: '',
    points_cost: '',
    type: 'discount' as const,
    value: '',
    is_active: true
  })

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [settingsResult, tiersResult, rewardsResult] = await Promise.all([
        loyaltyService.getLoyaltySettings(),
        loyaltyService.getLoyaltyTiers(),
        loyaltyService.getLoyaltyRewards()
      ])

      if (settingsResult.data) {
        setSettings(settingsResult.data)
      }
      if (tiersResult.data) {
        setTiers(tiersResult.data)
      }
      if (rewardsResult.data) {
        setRewards(rewardsResult.data)
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await loyaltyService.saveLoyaltySettings(settings)
      if (result.error) {
        alert('Failed to save settings: ' + result.error)
        return
      }
      onSave?.()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTier = async () => {
    if (!newTier.name || !newTier.min_spend || !newTier.points_multiplier) {
      alert('Please fill in all required fields')
      return
    }

    const tier: LoyaltyTier = {
      name: newTier.name,
      min_spend: parseFloat(newTier.min_spend),
      points_multiplier: parseFloat(newTier.points_multiplier),
      benefits: newTier.benefits.filter(b => b.trim() !== ''),
      color: newTier.color,
      is_default: newTier.is_default,
      is_active: true
    }

    const result = await loyaltyService.saveLoyaltyTier(tier)
    if (result.error) {
      alert('Failed to add tier: ' + result.error)
      return
    }

    setTiers([...tiers, result.data!])
    setNewTier({ name: '', min_spend: '', points_multiplier: '', benefits: [''], color: '#3B82F6', is_default: false })
    setShowTierModal(false)
  }

  const handleEditTier = async () => {
    if (!editingTier || !editingTier.name || !editingTier.min_spend || !editingTier.points_multiplier) {
      alert('Please fill in all required fields')
      return
    }

    const result = await loyaltyService.saveLoyaltyTier(editingTier)
    if (result.error) {
      alert('Failed to update tier: ' + result.error)
      return
    }

    setTiers(tiers.map(tier => tier.id === editingTier.id ? result.data! : tier))
    setEditingTier(null)
    setShowTierModal(false)
  }

  const handleDeleteTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return

    const result = await loyaltyService.deleteLoyaltyTier(id)
    if (result.error) {
      alert('Failed to delete tier: ' + result.error)
      return
    }

    setTiers(tiers.filter(tier => tier.id !== id))
  }

  const handleAddReward = async () => {
    if (!newReward.name || newReward.points_cost === '') {
      alert('Please fill in all required fields')
      return
    }

    const reward: LoyaltyReward = {
      name: newReward.name,
      points_cost: parseFloat(newReward.points_cost),
      type: newReward.type,
      value: parseFloat(newReward.value),
      is_active: newReward.is_active
    }

    const result = await loyaltyService.saveLoyaltyReward(reward)
    if (result.error) {
      alert('Failed to add reward: ' + result.error)
      return
    }

    setRewards([...rewards, result.data!])
    setNewReward({ name: '', points_cost: '', type: 'discount', value: '', is_active: true })
    setShowRewardModal(false)
  }

  const handleEditReward = async () => {
    if (!editingReward || !editingReward.name || editingReward.points_cost === 0) {
      alert('Please fill in all required fields')
      return
    }

    const result = await loyaltyService.saveLoyaltyReward(editingReward)
    if (result.error) {
      alert('Failed to update reward: ' + result.error)
      return
    }

    setRewards(rewards.map(reward => reward.id === editingReward.id ? result.data! : reward))
    setEditingReward(null)
    setShowRewardModal(false)
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return

    const result = await loyaltyService.deleteLoyaltyReward(id)
    if (result.error) {
      alert('Failed to delete reward: ' + result.error)
      return
    }

    setRewards(rewards.filter(reward => reward.id !== id))
  }

  const addBenefit = () => {
    setNewTier({ ...newTier, benefits: [...newTier.benefits, ''] })
  }

  const removeBenefit = (index: number) => {
    setNewTier({ 
      ...newTier, 
      benefits: newTier.benefits.filter((_, i) => i !== index) 
    })
  }

  const updateBenefit = (index: number, value: string) => {
    const updatedBenefits = [...newTier.benefits]
    updatedBenefits[index] = value
    setNewTier({ ...newTier, benefits: updatedBenefits })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF29]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Program Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-[#E5FF29]" />
          Program Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsToggle
            label="Enable Loyalty Program"
            description="Activate the loyalty program for customers"
            checked={settings.is_active}
            onChange={(checked) => setSettings(prev => ({ ...prev, is_active: checked }))}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points per Rand</label>
            <PremiumInput
              type="number"
              min="0"
              step="0.1"
              value={settings.points_per_rand}
              onChange={(e) => setSettings(prev => ({ ...prev, points_per_rand: parseFloat(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Expiry (months)</label>
            <PremiumInput
              type="number"
              min="1"
              value={settings.points_expiry_months}
              onChange={(e) => setSettings(prev => ({ ...prev, points_expiry_months: parseInt(e.target.value) || 12 }))}
              className="h-9"
            />
          </div>

          <SettingsToggle
            label="Auto Tier Upgrade"
            description="Automatically upgrade customers to higher tiers"
            checked={settings.auto_tier_upgrade}
            onChange={(checked) => setSettings(prev => ({ ...prev, auto_tier_upgrade: checked }))}
          />

          <SettingsToggle
            label="Birthday Bonus"
            description="Give bonus points on customer birthdays"
            checked={settings.birthday_bonus_enabled}
            onChange={(checked) => setSettings(prev => ({ ...prev, birthday_bonus_enabled: checked }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus Points</label>
            <PremiumInput
              type="number"
              min="0"
              value={settings.welcome_bonus_points}
              onChange={(e) => setSettings(prev => ({ ...prev, welcome_bonus_points: parseInt(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus Points</label>
            <PremiumInput
              type="number"
              min="0"
              value={settings.referral_bonus_points}
              onChange={(e) => setSettings(prev => ({ ...prev, referral_bonus_points: parseInt(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <PremiumButton
            onClick={handleSave}
            gradient="green"
            icon={Save}
            disabled={isSaving}
            className="px-6"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </PremiumButton>
        </div>
      </div>

      {/* Loyalty Tiers */}
      <div className="bg-gray-100/60 rounded-2xl shadow-md p-6 border border-[#E5FF29]/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#E5FF29]" />
            Loyalty Tiers
          </h3>
          <PremiumButton
            onClick={() => setShowTierModal(true)}
            gradient="blue"
            icon={Plus}
            size="sm"
          >
            Add Tier
          </PremiumButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div key={tier.id} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-[#E5FF29]/30 hover:border-[#E5FF29]/50 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#E5FF29]/10 backdrop-blur-xl">
              {/* Premium gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />
              
              {/* Luxury animated orbs */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#E5FF29]/20 to-transparent rounded-full blur-3xl transform translate-x-20 -translate-y-20 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl transform -translate-x-16 translate-y-16 animate-pulse delay-300" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl transform -translate-x-12 -translate-y-12 animate-pulse delay-500" />
              </div>

              {/* Subtle mesh gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8">
                {/* Premium header with floating elements */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Main tier icon with premium styling */}
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-2xl ring-1 ring-[#E5FF29]/20 flex items-center justify-center shadow-2xl backdrop-blur-sm" 
                          style={{ 
                            background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}40)`,
                            border: `1px solid ${tier.color}30`
                          }}
                        >
                          <Crown className="h-6 w-6 text-white drop-shadow-lg" />
                        </div>
                        {/* Floating indicator */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#E5FF29] to-yellow-400 rounded-full animate-pulse shadow-lg shadow-[#E5FF29]/50" />
                        {/* Subtle glow */}
                        <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5FF29]/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xl tracking-tight drop-shadow-sm">{tier.name}</h4>
                      {tier.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-[#E5FF29] to-yellow-400 text-black text-xs font-bold rounded-full shadow-lg">
                          <div className="w-1 h-1 bg-black rounded-full mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Floating action buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => {
                        setEditingTier(tier)
                        setShowTierModal(true)
                      }}
                      className="p-3 text-white hover:text-[#E5FF29] bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-[#E5FF29]/20 hover:border-[#E5FF29]/40 shadow-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => tier.id && handleDeleteTier(tier.id)}
                      className="p-3 text-white hover:text-red-400 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-[#E5FF29]/20 hover:border-red-500/40 shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Premium stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 border border-[#E5FF29]/20 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#E5FF29]/10 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <div className="text-xs text-gray-400 mb-1 font-medium tracking-wide">Min Spend</div>
                      <div className="text-white font-bold text-lg tracking-tight">R{tier.min_spend.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 border border-[#E5FF29]/20 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <div className="text-xs text-gray-400 mb-1 font-medium tracking-wide">Multiplier</div>
                      <div className="text-white font-bold text-lg tracking-tight">{tier.points_multiplier}x</div>
                    </div>
                  </div>
                </div>

                {/* Luxury benefits section */}
                {tier.benefits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-[#E5FF29] to-transparent" />
                      <div className="text-xs font-bold text-[#E5FF29] uppercase tracking-widest">Exclusive Benefits</div>
                      <div className="w-6 h-0.5 bg-gradient-to-l from-[#E5FF29] to-transparent" />
                    </div>
                    <div className="space-y-3">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm text-gray-300 group/benefit">
                          <div className="relative">
                            <div className="w-2 h-2 bg-gradient-to-br from-[#E5FF29] to-yellow-400 rounded-full flex-shrink-0 shadow-sm shadow-[#E5FF29]/50" />
                            <div className="absolute inset-0 w-2 h-2 bg-[#E5FF29] rounded-full animate-ping opacity-20" />
                          </div>
                          <span className="group-hover/benefit:text-white transition-colors duration-200">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Rewards */}
      <div className="bg-gray-100/60 rounded-2xl shadow-md p-6 border border-[#E5FF29]/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#E5FF29]" />
            Loyalty Rewards
          </h3>
          <PremiumButton
            onClick={() => setShowRewardModal(true)}
            gradient="purple"
            icon={Plus}
            size="sm"
          >
            Add Reward
          </PremiumButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, index) => (
            <div key={reward.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:bg-gray-900/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#E5FF29]/10 border border-[#E5FF29]/30 hover:border-[#E5FF29]/50">
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E5FF29]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative p-4">
                {/* Compact header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#E5FF29]/10 border border-[#E5FF29]/30">
                        {reward.type === 'discount' && <Percent className="h-4.5 w-4.5 text-[#E5FF29]" />}
                        {reward.type === 'service' && <Zap className="h-4.5 w-4.5 text-[#E5FF29]" />}
                        {reward.type === 'bonus' && <Award className="h-4.5 w-4.5 text-[#E5FF29]" />}
                        {reward.type === 'multiplier' && <TrendingUp className="h-4.5 w-4.5 text-[#E5FF29]" />}
                      </div>
                      {/* Subtle pulse indicator for active rewards */}
                      {reward.is_active && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E5FF29] rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm tracking-tight">{reward.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
                        reward.is_active 
                          ? 'bg-[#E5FF29]/20 text-[#E5FF29] border-[#E5FF29]/40' 
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        <div className={`w-1 h-1 rounded-full mr-1 ${reward.is_active ? 'bg-[#E5FF29]' : 'bg-red-400'}`} />
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <button
                      onClick={() => {
                        setEditingReward(reward)
                        setShowRewardModal(true)
                      }}
                      className="p-1.5 text-white hover:text-[#E5FF29] bg-white/5 hover:bg-[#E5FF29]/10 rounded-md transition-all duration-200 border border-[#E5FF29]/20 hover:border-[#E5FF29]/40"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => reward.id && handleDeleteReward(reward.id)}
                      className="p-1.5 text-white hover:text-red-400 bg-white/5 hover:bg-red-500/20 rounded-md transition-all duration-200 border border-[#E5FF29]/20 hover:border-red-500/40"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {/* Compact stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/5 rounded-lg p-2.5 border border-[#819202]">
                    <div className="text-xs text-gray-400 mb-1">Points</div>
                    <div className="text-white font-semibold">{reward.points_cost}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-[#819202]">
                    <div className="text-xs text-gray-400 mb-1">Type</div>
                    <div className="text-white font-semibold capitalize text-sm">{reward.type}</div>
                  </div>
                </div>

                {/* Value display */}
                {reward.value > 0 && (
                  <div className="bg-gradient-to-r from-[#E5FF29]/10 to-transparent rounded-lg p-2.5 mb-3 border border-[#819202]">
                    <div className="text-xs text-[#E5FF29] mb-1 font-medium">Value</div>
                    <div className="text-white font-bold">
                      {reward.type === 'discount' ? `R${reward.value}` : `${reward.value}x`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Tier Modal */}
      <Modal
        isOpen={showTierModal}
        onClose={() => {
          setShowTierModal(false)
          setEditingTier(null)
          setNewTier({ name: '', min_spend: '', points_multiplier: '', benefits: [''], color: '#3B82F6', is_default: false })
        }}
        title={editingTier ? 'Edit Tier' : 'Add New Tier'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
              <PremiumInput
                value={editingTier?.name || newTier.name}
                onChange={(e) => {
                  if (editingTier) {
                    setEditingTier({ ...editingTier, name: e.target.value })
                  } else {
                    setNewTier({ ...newTier, name: e.target.value })
                  }
                }}
                placeholder="e.g., Gold, Platinum"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={editingTier?.color || newTier.color}
                onChange={(e) => {
                  if (editingTier) {
                    setEditingTier({ ...editingTier, color: e.target.value })
                  } else {
                    setNewTier({ ...newTier, color: e.target.value })
                  }
                }}
                className="w-full h-9 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Spend (R)</label>
              <PremiumInput
                type="number"
                min="0"
                value={editingTier?.min_spend || newTier.min_spend}
                onChange={(e) => {
                  if (editingTier) {
                    setEditingTier({ ...editingTier, min_spend: parseFloat(e.target.value) || 0 })
                  } else {
                    setNewTier({ ...newTier, min_spend: e.target.value })
                  }
                }}
                placeholder="0"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Multiplier</label>
              <PremiumInput
                type="number"
                min="0"
                step="0.1"
                value={editingTier?.points_multiplier || newTier.points_multiplier}
                onChange={(e) => {
                  if (editingTier) {
                    setEditingTier({ ...editingTier, points_multiplier: parseFloat(e.target.value) || 0 })
                  } else {
                    setNewTier({ ...newTier, points_multiplier: e.target.value })
                  }
                }}
                placeholder="1.0"
                className="h-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            {(editingTier?.benefits || newTier.benefits).map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <PremiumInput
                  value={benefit}
                  onChange={(e) => {
                    if (editingTier) {
                      const updatedBenefits = [...editingTier.benefits]
                      updatedBenefits[index] = e.target.value
                      setEditingTier({ ...editingTier, benefits: updatedBenefits })
                    } else {
                      updateBenefit(index, e.target.value)
                    }
                  }}
                  placeholder="e.g., Priority support"
                  className="flex-1 h-9"
                />
                <button
                  onClick={() => {
                    if (editingTier) {
                      const updatedBenefits = editingTier.benefits.filter((_, i) => i !== index)
                      setEditingTier({ ...editingTier, benefits: updatedBenefits })
                    } else {
                      removeBenefit(index)
                    }
                  }}
                  className="px-3 py-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addBenefit}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Benefit
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={editingTier?.is_default || newTier.is_default}
              onChange={(e) => {
                if (editingTier) {
                  setEditingTier({ ...editingTier, is_default: e.target.checked })
                } else {
                  setNewTier({ ...newTier, is_default: e.target.checked })
                }
              }}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default tier for new customers
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <PremiumButton
              variant="outline"
              onClick={() => {
                setShowTierModal(false)
                setEditingTier(null)
                setNewTier({ name: '', min_spend: '', points_multiplier: '', benefits: [''], color: '#3B82F6', is_default: false })
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              onClick={editingTier ? handleEditTier : handleAddTier}
              gradient="blue"
            >
              {editingTier ? 'Update Tier' : 'Add Tier'}
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Reward Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false)
          setEditingReward(null)
          setNewReward({ name: '', points_cost: '', type: 'discount', value: '', is_active: true })
        }}
        title={editingReward ? 'Edit Reward' : 'Add New Reward'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
            <PremiumInput
              value={editingReward?.name || newReward.name}
              onChange={(e) => {
                if (editingReward) {
                  setEditingReward({ ...editingReward, name: e.target.value })
                } else {
                  setNewReward({ ...newReward, name: e.target.value })
                }
              }}
              placeholder="e.g., R50 Discount"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
              <PremiumInput
                type="number"
                min="0"
                value={editingReward?.points_cost || newReward.points_cost}
                onChange={(e) => {
                  if (editingReward) {
                    setEditingReward({ ...editingReward, points_cost: parseFloat(e.target.value) || 0 })
                  } else {
                    setNewReward({ ...newReward, points_cost: e.target.value })
                  }
                }}
                placeholder="500"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
              <select
                value={editingReward?.type || newReward.type}
                onChange={(e) => {
                  if (editingReward) {
                    setEditingReward({ ...editingReward, type: e.target.value as any })
                  } else {
                    setNewReward({ ...newReward, type: e.target.value as any })
                  }
                }}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
              >
                <option value="discount">Discount</option>
                <option value="service">Service</option>
                <option value="bonus">Bonus</option>
                <option value="multiplier">Multiplier</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <PremiumInput
              type="number"
              min="0"
              step="0.01"
              value={editingReward?.value || newReward.value}
              onChange={(e) => {
                if (editingReward) {
                  setEditingReward({ ...editingReward, value: parseFloat(e.target.value) || 0 })
                } else {
                  setNewReward({ ...newReward, value: e.target.value })
                }
              }}
              placeholder="50.00"
              className="h-9"
            />
            <p className="text-xs text-gray-500 mt-1">
              For discounts: amount in Rands. For multipliers: multiplier value (e.g., 2 for double points)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editingReward?.is_active || newReward.is_active}
              onChange={(e) => {
                if (editingReward) {
                  setEditingReward({ ...editingReward, is_active: e.target.checked })
                } else {
                  setNewReward({ ...newReward, is_active: e.target.checked })
                }
              }}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <PremiumButton
              variant="outline"
              onClick={() => {
                setShowRewardModal(false)
                setEditingReward(null)
                setNewReward({ name: '', points_cost: '', type: 'discount', value: '', is_active: true })
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              onClick={editingReward ? handleEditReward : handleAddReward}
              gradient="purple"
            >
              {editingReward ? 'Update Reward' : 'Add Reward'}
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 