import { useState } from 'react'
import { Gift, Star, TrendingUp, Users, Award, Plus, Filter, Download, Eye } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { useLoyaltyManagement } from '../hooks/useLoyaltyManagement'
import { toast } from 'sonner'

interface LoyaltyAccount {
  id: string
  customerId: string
  customerName: string
  cardNumber: string
  currentPoints: number
  lifetimePoints: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierPoints: number
  nextTierPoints: number
  pointsToNextTier: number
  status: 'active' | 'inactive'
  lastTransactionDate: string
}

interface LoyaltyTransaction {
  id: string
  customerId: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus'
  points: number
  description: string
  date: string
  balance: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: 'discount' | 'product' | 'service' | 'cashback'
  status: 'active' | 'inactive'
  redemptionCount: number
}

const mockLoyaltyAccounts: LoyaltyAccount[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    customerName: 'John Smith',
    cardNumber: 'LOY-ABC123',
    currentPoints: 1250,
    lifetimePoints: 8500,
    tier: 'silver',
    tierPoints: 5000,
    nextTierPoints: 15000,
    pointsToNextTier: 2500,
    status: 'active',
    lastTransactionDate: '2024-01-20'
  },
  {
    id: '2',
    customerId: 'CUST-002',
    customerName: 'Sarah Johnson',
    cardNumber: 'LOY-DEF456',
    currentPoints: 450,
    lifetimePoints: 2200,
    tier: 'bronze',
    tierPoints: 0,
    nextTierPoints: 1000,
    pointsToNextTier: 550,
    status: 'active',
    lastTransactionDate: '2024-01-18'
  },
  {
    id: '3',
    customerId: 'CUST-003',
    customerName: 'Mike Wilson',
    cardNumber: 'LOY-GHI789',
    currentPoints: 8500,
    lifetimePoints: 25000,
    tier: 'platinum',
    tierPoints: 50000,
    nextTierPoints: 100000,
    pointsToNextTier: 15000,
    status: 'active',
    lastTransactionDate: '2024-01-22'
  }
]

const mockTransactions: LoyaltyTransaction[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    type: 'earned',
    points: 250,
    description: 'Purchase: $250.00',
    date: '2024-01-20',
    balance: 1250
  },
  {
    id: '2',
    customerId: 'CUST-001',
    type: 'redeemed',
    points: -500,
    description: 'Reward: 10% Discount',
    date: '2024-01-15',
    balance: 1000
  },
  {
    id: '3',
    customerId: 'CUST-002',
    type: 'earned',
    points: 150,
    description: 'Purchase: $150.00',
    date: '2024-01-18',
    balance: 450
  }
]

const mockRewards: Reward[] = [
  {
    id: '1',
    name: '10% Store Discount',
    description: 'Get 10% off your next purchase',
    pointsCost: 500,
    category: 'discount',
    status: 'active',
    redemptionCount: 45
  },
  {
    id: '2',
    name: 'Free Shipping',
    description: 'Free shipping on your next order',
    pointsCost: 200,
    category: 'service',
    status: 'active',
    redemptionCount: 23
  },
  {
    id: '3',
    name: '$25 Cash Back',
    description: 'Redeem for $25 cash back',
    pointsCost: 2500,
    category: 'cashback',
    status: 'active',
    redemptionCount: 12
  }
]

export const LoyaltyProgram = () => {
  const {
    loyaltyAccounts,
    transactions,
    loading,
    error,
    getLoyaltyStats,
    filterLoyaltyAccounts,
    addLoyaltyTransaction,
    updateLoyaltyAccount,
    calculateTierProgress,
    getNextTierRequirements,
    clearError
  } = useLoyaltyManagement()

  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pointsAdjustment, setPointsAdjustment] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [selectedReward, setSelectedReward] = useState('')

  const filteredAccounts = filterLoyaltyAccounts(filter, searchTerm)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-pink-500'
      case 'gold': return 'from-yellow-500 to-orange-500'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'bronze': return 'from-orange-600 to-red-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '👑'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      case 'bronze': return '🥉'
      default: return '⭐'
    }
  }

  const stats = getLoyaltyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
          <p className="text-gray-600 mt-1">Manage customer rewards and loyalty points</p>
        </div>
        <div className="flex gap-3">
          <PremiumButton variant="outline" size="sm" icon={Download}>
            Export Report
          </PremiumButton>
          <PremiumButton size="sm" icon={Plus} gradient="brand">
            Add Reward
          </PremiumButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lifetime Points</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLifetimePoints.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAccounts}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Points</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averagePoints).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Tier:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: 'all', label: 'All Tiers' },
              { value: 'bronze', label: 'Bronze' },
              { value: 'silver', label: 'Silver' },
              { value: 'gold', label: 'Gold' },
              { value: 'platinum', label: 'Platinum' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === filterOption.value 
                    ? 'bg-[#E5FF29] text-black' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
        
        <PremiumInput
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          className="w-64 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
        />
      </div>

      {/* Loyalty Accounts Table */}
      <PremiumCard variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress to Next
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading loyalty accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No loyalty accounts found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Customer #{account.customerId}</div>
                        <div className="text-sm text-gray-500">Loyalty Member</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.cardNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{account.currentPoints.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {account.lifetimePoints.toLocaleString()} lifetime
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTierIcon(account.tier)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{account.tier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/80 h-2 rounded-full"
                          style={{ width: `${calculateTierProgress(account)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {account.pointsToNextTier.toLocaleString()} to next tier
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {account.lastEarnedDate ? new Date(account.lastEarnedDate).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAccount(account)}
                          className="text-[#E5FF29] hover:text-[#E5FF29]/80 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowPointsModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Adjust Points
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowRewardModal(true)
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Redeem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* Rewards Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
        </div>
        {mockRewards.map((reward) => (
          <PremiumCard key={reward.id} variant="default" className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-black" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">{reward.name}</h4>
              </div>
              <span className="text-xs font-medium text-gray-500 capitalize">{reward.category}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">{reward.pointsCost} points</div>
              <div className="text-xs text-gray-500">{reward.redemptionCount} redemptions</div>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Points Adjustment Modal */}
      <Modal
        isOpen={showPointsModal}
        onClose={() => {
          setShowPointsModal(false)
          setPointsAdjustment('')
          setAdjustmentReason('')
          setSelectedAccount(null)
        }}
        title="Adjust Points"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {selectedAccount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer: #{selectedAccount.customerId}</p>
              <p className="text-sm text-gray-600">Current Points: {selectedAccount.currentPoints.toLocaleString()}</p>
            </div>
          )}
          <PremiumInput
            label="Points Adjustment"
            type="number"
            placeholder="Enter points (positive or negative)"
            value={pointsAdjustment}
            onChange={(e) => setPointsAdjustment(e.target.value)}
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <PremiumInput
            label="Reason"
            placeholder="Reason for adjustment"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <div className="flex gap-3 pt-4">
            <PremiumButton 
              variant="outline" 
              onClick={() => {
                setShowPointsModal(false)
                setPointsAdjustment('')
                setAdjustmentReason('')
                setSelectedAccount(null)
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              gradient="brand"
              onClick={async () => {
                if (!selectedAccount || !pointsAdjustment || !adjustmentReason) {
                  toast.error('Please fill in all fields')
                  return
                }
                
                const points = parseInt(pointsAdjustment)
                if (points === 0) {
                  toast.error('Points adjustment cannot be zero')
                  return
                }

                const result = await addLoyaltyTransaction({
                  customerId: selectedAccount.customerId,
                  loyaltyAccountId: selectedAccount.id,
                  type: points > 0 ? 'earned' : 'redeemed',
                  points: Math.abs(points),
                  description: `Adjustment: ${adjustmentReason}`,
                  balanceAfter: selectedAccount.currentPoints + points
                })

                if (result.success) {
                  toast.success('Points adjustment applied successfully')
                  setShowPointsModal(false)
                  setPointsAdjustment('')
                  setAdjustmentReason('')
                  setSelectedAccount(null)
                } else {
                  toast.error(result.error || 'Failed to apply points adjustment')
                }
              }}
            >
              Apply Adjustment
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Reward Redemption Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false)
          setSelectedReward('')
          setSelectedAccount(null)
        }}
        title="Redeem Reward"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {selectedAccount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer: #{selectedAccount.customerId}</p>
              <p className="text-sm text-gray-600">Available Points: {selectedAccount.currentPoints.toLocaleString()}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Reward</label>
            <select 
              className="w-full p-3 bg-white border border-gray-200 focus:border-[#E5FF29] focus:ring-2 focus:ring-[#E5FF29]/20 rounded-xl transition-all duration-300 text-sm"
              value={selectedReward}
              onChange={(e) => setSelectedReward(e.target.value)}
            >
              <option value="">Choose a reward...</option>
              <option value="discount">10% Store Discount (500 points)</option>
              <option value="shipping">Free Shipping (200 points)</option>
              <option value="cashback">$25 Cash Back (2500 points)</option>
            </select>
          </div>
          <PremiumInput
            label="Quantity"
            type="number"
            placeholder="1"
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <div className="flex gap-3 pt-4">
            <PremiumButton 
              variant="outline" 
              onClick={() => {
                setShowRewardModal(false)
                setSelectedReward('')
                setSelectedAccount(null)
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              gradient="brand"
              onClick={async () => {
                if (!selectedAccount || !selectedReward) {
                  toast.error('Please select a reward')
                  return
                }

                const rewardCosts = {
                  discount: 500,
                  shipping: 200,
                  cashback: 2500
                }

                const cost = rewardCosts[selectedReward as keyof typeof rewardCosts]
                
                if (selectedAccount.currentPoints < cost) {
                  toast.error('Insufficient points for this reward')
                  return
                }

                const result = await addLoyaltyTransaction({
                  customerId: selectedAccount.customerId,
                  loyaltyAccountId: selectedAccount.id,
                  type: 'redeemed',
                  points: cost,
                  description: `Reward redemption: ${selectedReward}`,
                  balanceAfter: selectedAccount.currentPoints - cost
                })

                if (result.success) {
                  toast.success('Reward redeemed successfully')
                  setShowRewardModal(false)
                  setSelectedReward('')
                  setSelectedAccount(null)
                } else {
                  toast.error(result.error || 'Failed to redeem reward')
                }
              }}
            >
              Redeem Reward
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 