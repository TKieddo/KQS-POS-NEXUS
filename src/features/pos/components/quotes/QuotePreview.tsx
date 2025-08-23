'use client'

import React from 'react'
import { X, Download, Mail, Calendar, User, FileText, Building2, Phone, Mail as MailIcon, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface QuotePreviewProps {
  quote: any
  isOpen: boolean
  onClose: () => void
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({
  quote,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full mx-auto max-h-[95vh] flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-4 border-b border-gray-100/50 flex-shrink-0 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 rounded-xl mr-3 shadow-lg">
                <FileText className="h-4 w-4 text-black" />
              </div>
              Quote Preview
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100/80 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quote Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/5 rounded-2xl mb-4">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">QUOTE</h1>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Quote Number: <span className="text-gray-900">{quote.quoteNumber}</span></p>
              <p className="text-xs text-gray-600 font-medium">Date: <span className="text-gray-900">{formatDate(quote.createdAt)}</span></p>
            </div>
          </div>

          {/* Company Info */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">KQS POS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-900 font-medium">123 Business Street</p>
                        <p className="text-xs text-gray-600">City, State 12345</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-900 font-medium">(555) 123-4567</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-900 font-medium">info@kqspos.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                Customer Information
              </h3>
              {quote.customer ? (
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50 shadow-lg">
                  <h4 className="font-bold text-gray-900 text-sm mb-2">{quote.customer.name}</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700 flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-gray-500" />
                      {quote.customer.phone}
                    </p>
                    {quote.customer.email && (
                      <p className="text-xs text-gray-700 flex items-center">
                        <MailIcon className="h-3 w-3 mr-2 text-gray-500" />
                        {quote.customer.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50/80 rounded-xl p-4 border border-yellow-200/50">
                  <p className="text-xs text-yellow-800 italic font-medium">No customer selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Items</h3>
              <div className="bg-gray-50/80 rounded-xl overflow-hidden border border-gray-200/50 shadow-lg">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100/80 to-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {quote.items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-100/50 transition-colors duration-200">
                        <td className="px-4 py-3 text-xs text-gray-900 font-medium">{item.product.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{item.product.sku}</td>
                        <td className="px-4 py-3 text-xs text-gray-900 text-right font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-xs text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-xs text-gray-900 text-right font-bold">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-8">
            <div className="flex justify-end">
              <div className="bg-black rounded-2xl p-6 border border-gray-800 shadow-lg w-72">
                <h3 className="text-sm font-semibold text-white mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">Subtotal:</span>
                    <span className="font-bold text-white">{formatCurrency(quote.subtotal)}</span>
                  </div>
                  
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">
                        Discount ({quote.discountType === 'percentage' ? `${quote.discount}%` : 'Fixed'}):
                      </span>
                      <span className="font-bold text-green-400">
                        -{formatCurrency(quote.discountType === 'percentage' 
                          ? (quote.subtotal * quote.discount) / 100 
                          : quote.discount
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-[#E5FF29] bg-gray-900 px-3 py-1 rounded-lg text-xs">{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 shadow-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Validity
                </h3>
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
                  <p className="text-xs text-gray-700 font-medium">This quote is valid until: <span className="text-gray-900 font-bold">{quote.validUntil}</span></p>
                </div>
              </div>
              
              {quote.notes && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
                    <p className="text-xs text-gray-700 leading-relaxed">{quote.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100/50 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
              <div className="text-xs text-gray-700 space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#E5FF29] rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>This quote is valid for 30 days from the date of issue</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#E5FF29] rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Prices are subject to change without notice</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#E5FF29] rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Payment terms: Net 30 days</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#E5FF29] rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Delivery available upon request</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#E5FF29] rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Returns accepted within 14 days with original receipt</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100/50 flex gap-3 bg-gradient-to-r from-gray-50/50 to-white/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 text-sm"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              // TODO: Download PDF
              console.log('Downloading quote PDF')
            }}
            className="flex-1 h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={() => {
              // TODO: Email quote
              console.log('Emailing quote')
            }}
            className="flex-1 h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 text-sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Quote
          </Button>
        </div>
      </div>
    </div>
  )
} 