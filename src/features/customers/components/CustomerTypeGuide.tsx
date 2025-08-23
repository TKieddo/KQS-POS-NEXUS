import { User, Crown, Building, CreditCard, Gift, Info, CheckCircle, XCircle, X } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumModal } from '@/components/ui/premium-modal'

interface CustomerTypeGuideProps {
  isOpen: boolean
  onClose: () => void
  selectedType?: 'regular' | 'vip' | 'wholesale'
  hasCreditAccount?: boolean
  hasLoyaltyAccount?: boolean
}

export const CustomerTypeGuide = ({ 
  isOpen, 
  onClose, 
  selectedType = 'regular', 
  hasCreditAccount = false, 
  hasLoyaltyAccount = true 
}: CustomerTypeGuideProps) => {
  const customerTypes = {
    regular: {
      icon: <User className="h-5 w-5" />,
      title: 'Regular Customer',
      description: 'Standard retail customers',
      features: [
        { text: 'Loyalty rewards program', included: true },
        { text: 'Credit account', included: false },
        { text: 'Standard payment terms', included: true },
        { text: 'Basic customer support', included: true }
      ],
      bestFor: [
        'Walk-in customers',
        'Occasional shoppers',
        'Cash/credit card payments',
        'Building initial loyalty'
      ],
      recommendations: [
        'Start all new customers as Regular',
        'Enable loyalty program for all',
        'Upgrade to VIP after consistent purchases'
      ]
    },
    vip: {
      icon: <Crown className="h-5 w-5" />,
      title: 'VIP Customer',
      description: 'High-value, trusted customers',
      features: [
        { text: 'Enhanced loyalty rewards', included: true },
        { text: 'Credit account available', included: true },
        { text: 'Extended payment terms', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Exclusive offers & discounts', included: true }
      ],
      bestFor: [
        'High-value customers',
        'Frequent shoppers',
        'Trusted customers with good history',
        'Premium service expectations'
      ],
      recommendations: [
        'Upgrade from Regular after 6+ months',
        'Require good payment history',
        'Offer higher credit limits',
        'Provide premium customer service'
      ]
    },
    wholesale: {
      icon: <Building className="h-5 w-5" />,
      title: 'Wholesale Customer',
      description: 'Business customers & resellers',
      features: [
        { text: 'Business loyalty program', included: true },
        { text: 'Credit account with extended terms', included: true },
        { text: 'Bulk purchase discounts', included: true },
        { text: 'Business account management', included: true },
        { text: 'Dedicated account manager', included: true }
      ],
      bestFor: [
        'Business customers',
        'Bulk buyers',
        'Resellers & distributors',
        'Long-term business relationships'
      ],
      recommendations: [
        'Require business verification',
        'Set up extended payment terms (60-90 days)',
        'Offer volume discounts',
        'Provide business-specific support'
      ]
    }
  }

  const currentType = customerTypes[selectedType]

  return (
    <PremiumModal isOpen={isOpen} onClose={onClose} size="lg" title="Customer Type Guide">
      <PremiumCard variant="gradient" gradient="blue" className="p-4 shadow-lg rounded-xl border border-gray-100/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Customer Type Guide</h3>
      </div>

      {/* Selected Type Info */}
      <div className="bg-white/80 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            {currentType.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{currentType.title}</h4>
            <p className="text-xs text-gray-600">{currentType.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Features:</h5>
          {currentType.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              {feature.included ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span className={`text-xs ${feature.included ? 'text-gray-700' : 'text-gray-500'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Best For */}
        <div className="space-y-2 mb-4">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Best For:</h5>
          <ul className="text-xs text-gray-600 space-y-1">
            {currentType.bestFor.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Recommendations:</h5>
          <ul className="text-xs text-gray-600 space-y-1">
            {currentType.recommendations.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Account Setup Guide */}
      <div className="bg-white/80 rounded-lg p-4">
        <h5 className="text-xs font-medium text-gray-700 mb-3">Recommended Account Setup:</h5>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Loyalty Account */}
          <div className={`p-3 rounded-lg border-2 transition-all ${
            hasLoyaltyAccount 
              ? 'border-green-500 bg-green-50/50' 
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Gift className={`h-4 w-4 ${hasLoyaltyAccount ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium text-gray-700">Loyalty Program</span>
            </div>
            <p className="text-xs text-gray-600">
              {hasLoyaltyAccount ? '✅ Enabled' : '❌ Not enabled'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedType === 'regular' ? 'Standard rewards' :
               selectedType === 'vip' ? 'Enhanced rewards' :
               'Business rewards'}
            </p>
          </div>

          {/* Credit Account */}
          <div className={`p-3 rounded-lg border-2 transition-all ${
            hasCreditAccount 
              ? 'border-blue-500 bg-blue-50/50' 
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className={`h-4 w-4 ${hasCreditAccount ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium text-gray-700">Credit Account</span>
            </div>
            <p className="text-xs text-gray-600">
              {hasCreditAccount ? '✅ Enabled' : '❌ Not enabled'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedType === 'regular' ? 'Not recommended' :
               selectedType === 'vip' ? 'Standard terms' :
               'Extended terms'}
            </p>
          </div>
        </div>

        {/* Setup Recommendations */}
        <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
          <h6 className="text-xs font-medium text-blue-700 mb-2">💡 Setup Tips:</h6>
          <ul className="text-xs text-blue-600 space-y-1">
            {selectedType === 'regular' && (
              <>
                <li>• Enable loyalty program for all regular customers</li>
                <li>• Start with bronze tier, upgrade based on spending</li>
                <li>• Consider credit account after 6+ months of good history</li>
              </>
            )}
            {selectedType === 'vip' && (
              <>
                <li>• Enable both loyalty and credit accounts</li>
                <li>• Start with silver or gold loyalty tier</li>
                <li>• Set higher credit limits for trusted customers</li>
              </>
            )}
            {selectedType === 'wholesale' && (
              <>
                <li>• Enable both loyalty and credit accounts</li>
                <li>• Set extended payment terms (60-90 days)</li>
                <li>• Require business verification documents</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </PremiumCard>
    </PremiumModal>
  )
} 