"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useQzTray } from "@/features/printers/hooks/useQzTray"
import { printReceipt } from "@/lib/qz-printing"
import { Loader2, Printer, Settings, Save, RotateCcw, Download, Upload, Copy, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/premium-card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useBranch } from "@/context/BranchContext"
import { 
  loadReceiptTemplates, 
  saveReceiptTemplate, 
  deleteReceiptTemplate, 
  setDefaultTemplate, 
  duplicateReceiptTemplate,
  exportTemplates,
  importTemplates,
  getDefaultTemplate,
  type ReceiptTemplate 
} from "@/lib/receipt-template-service"
import { generateDefaultTemplates } from "@/lib/default-templates"
import { TemplateManagement } from "@/components/ui/template-management"
import { TemplateEditor } from "@/components/ui/template-editor"
import { TemplatePreviewModal } from "@/components/ui/template-preview-modal"
import RetailReceiptPreview from "@/components/ui/retail-receipt-preview"
import LuxuryReceiptPreview from "@/components/ui/luxury-receipt-preview"
import LaybyePaymentReceiptPreview from "@/components/ui/laybye-payment-receipt-preview"
import LaybyeReserveSlipPreview from "@/components/ui/laybye-reserve-slip-preview"
import AccountPaymentReceiptPreview from "@/components/ui/account-payment-receipt-preview"
import IntermediateBillReceiptPreview from "@/components/ui/intermediate-bill-receipt-preview"
import TillSessionReportReceiptPreview from "@/components/ui/till-session-report-receipt-preview"
import LaybyeCancellationReceiptPreview from "@/components/ui/laybye-cancellation-receipt-preview"
import ReturnsExchangeSlipReceiptPreview from "@/components/ui/returns-exchange-slip-receipt-preview"
import RefundSlipReceiptPreview from "@/components/ui/refund-slip-receipt-preview"
import CashUpReportReceiptPreview from "@/components/ui/cash-up-report-receipt-preview"
import OrderSlipReceiptPreview from "@/components/ui/order-slip-receipt-preview"
import CashDropWithdrawReceiptPreview from "@/components/ui/cash-drop-withdraw-receipt-preview"
import DeliverySlipReceiptPreview from "@/components/ui/delivery-slip-receipt-preview"
import QuotationSlipReceiptPreview from "@/components/ui/quotation-slip-receipt-preview"
import CustomerStatementReceiptPreview from "@/components/ui/customer-statement-receipt-preview"

// Dynamic preview component that shows the correct template based on template type
const DynamicReceiptPreview: React.FC<{ template: ReceiptTemplate; className?: string }> = ({ 
  template, 
  className = "" 
}) => {
  const getTemplateInfo = () => {
    const name = template.name.toLowerCase()
    
    if (name.includes('retail')) {
      return { title: 'KQS Retail Receipt', description: 'Beautiful 2-column layout with QR code integration' }
    }
    if (name.includes('final laybye payment')) {
      return { title: 'KQS Final Laybye Payment', description: 'Final laybye payment receipt with balance tracking and progress display' }
    }
    if (name.includes('laybye') && name.includes('payment')) {
      return { title: 'KQS Laybye Payment Receipt', description: 'Installment payment receipt with balance tracking and progress display' }
    }
    if (name.includes('laybye reserve')) {
      return { title: 'KQS Lay-bye Reserve Slip', description: 'Reservation slip for lay-bye items' }
    }
    if (name.includes('account payment')) {
      return { title: 'KQS Account Payment Receipt', description: 'Customer account payment with balance update' }
    }
    if (name.includes('intermediate')) {
      return { title: 'KQS Intermediate Bill', description: 'Non-final bill for review before payment' }
    }
    if (name.includes('till session')) {
      return { title: 'KQS Till Session Report', description: 'Summary of till session cash movements' }
    }
    if (name.includes('laybye cancellation')) {
      return { title: 'KQS Lay-bye Cancellation', description: 'Receipt for cancelled lay-bye and refund details' }
    }
    if (name.includes('returns') && name.includes('exchange')) {
      return { title: 'KQS Returns & Exchange Slip', description: 'Returns and exchange slip template for customer service' }
    }
    if (name.includes('refund')) {
      return { title: 'KQS Refund Slip', description: 'Slip for refunded items and amount' }
    }
    if (name.includes('cash up')) {
      return { title: 'KQS Cash Up Report', description: 'Summary of end-of-day cash up and reconciliation' }
    }
    if (name.includes('order')) {
      return { title: 'KQS Order Slip', description: 'Special order slip for items not in stock' }
    }
    if (name.includes('cash drop')) {
      return { title: 'KQS Cash Drop/Withdraw', description: 'Cash drop or withdrawal receipt' }
    }
    if (name.includes('delivery')) {
      return { title: 'KQS Delivery Slip', description: 'Slip for goods delivered to customer' }
    }
    if (name.includes('quotation')) {
      return { title: 'KQS Quotation Slip', description: 'Quotation for bulk/group/company purchases' }
    }
    if (name.includes('customer statement')) {
      return { title: 'KQS Customer Statement', description: 'Account Statement for Customer' }
    }
    
    // Default
    return { title: template.name, description: template.description || 'Receipt template' }
  }

  const getTemplateComponent = () => {
    const name = template.name.toLowerCase()
    
    // Debug: Log the template name to see what we're working with
    console.log('Template name:', template.name, 'Lowercase:', name, 'Includes cash up:', name.includes('cash up'))
    
    // Create a modified template with the correct receipt type title
    const modifiedTemplate = {
      ...template,
      receipt_type: getReceiptType(name)
    }
    
    // Return the appropriate preview component based on template type
    if (name.includes('cash up')) {
      console.log('Rendering CashUpReportReceiptPreview')
      return <CashUpReportReceiptPreview className={className} />
    }
    if (name.includes('final laybye payment')) {
      return <LuxuryReceiptPreview className={className} />
    }
    if (name.includes('laybye') && name.includes('payment')) {
      return <LaybyePaymentReceiptPreview className={className} />
    }
    if (name.includes('laybye reserve')) {
      return <LaybyeReserveSlipPreview className={className} />
    }
    if (name.includes('account payment')) {
      return <AccountPaymentReceiptPreview className={className} />
    }
    if (name.includes('intermediate')) {
      return <IntermediateBillReceiptPreview className={className} />
    }
    if (name.includes('till session')) {
      return <TillSessionReportReceiptPreview className={className} />
    }
    if (name.includes('laybye cancellation')) {
      return <LaybyeCancellationReceiptPreview className={className} />
    }
    if (name.includes('returns') && name.includes('exchange')) {
      return <ReturnsExchangeSlipReceiptPreview className={className} />
    }
    if (name.includes('refund')) {
      return <RefundSlipReceiptPreview className={className} />
    }
    if (name.includes('order')) {
      return <OrderSlipReceiptPreview className={className} />
    }
    if (name.includes('cash drop')) {
      return <CashDropWithdrawReceiptPreview className={className} />
    }
    if (name.includes('delivery')) {
      return <DeliverySlipReceiptPreview className={className} />
    }
    if (name.includes('quotation')) {
      return <QuotationSlipReceiptPreview className={className} />
    }
    if (name.includes('customer statement')) {
      return <CustomerStatementReceiptPreview className={className} />
    }
    
    // Default to retail receipt for unknown types
    return <RetailReceiptPreview template={modifiedTemplate} className={className} />
  }

  const getReceiptType = (name: string) => {
    if (name.includes('retail')) return 'Retail Receipt'
    if (name.includes('final laybye payment')) return 'Final Laybye Payment'
    if (name.includes('laybye') && name.includes('payment')) return 'Laybye Payment'
    if (name.includes('laybye reserve')) return 'Lay-bye Reserve Slip'
    if (name.includes('account payment')) return 'Account Payment'
    if (name.includes('intermediate')) return 'Intermediate Bill'
    if (name.includes('till session')) return 'Till Session Report'
    if (name.includes('laybye cancellation')) return 'Lay-bye Cancellation'
    if (name.includes('returns') && name.includes('exchange')) return 'Returns & Exchange Slip'
    if (name.includes('refund')) return 'Refund Slip'
    if (name.includes('cash up')) return 'Cash Up Report'
    if (name.includes('order')) return 'Order Slip'
    if (name.includes('cash drop')) return 'Cash Drop/Withdraw'
    if (name.includes('delivery')) return 'Delivery Slip'
    if (name.includes('quotation')) return 'Quotation Slip'
    if (name.includes('customer statement')) return 'Customer Statement'
    return 'Receipt'
  }

  const templateInfo = getTemplateInfo()
  const name = template.name.toLowerCase()

  // Check if the component has its own title/description
  const hasOwnTitle = name.includes('cash up') || 
                     name.includes('final laybye payment') || 
                     name.includes('laybye') || 
                     name.includes('account payment') || 
                     name.includes('intermediate') || 
                     name.includes('till session') || 
                     (name.includes('returns') && name.includes('exchange')) || 
                     name.includes('refund') || 
                     name.includes('order') || 
                     name.includes('cash drop') || 
                     name.includes('delivery') || 
                     name.includes('quotation') || 
                     name.includes('customer statement')

  return (
    <div className={className}>
      {!hasOwnTitle && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{templateInfo.title}</h3>
          <p className="text-sm text-gray-600">{templateInfo.description}</p>
        </div>
      )}
      {getTemplateComponent()}
    </div>
  )
}

// Function to convert image to base64 for QZ Tray
const convertImageToBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:image/png;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting image to base64:', error)
    throw error
  }
}

const ESC = "\x1B"
const NEWLINE = "\x0A"

const createPrintData = async (template: ReceiptTemplate) => {
  const data: any[] = []
  data.push(ESC + "@")

  // Get template type and generate appropriate content
  const templateName = template.name.toLowerCase()
  
  // Check if this is an internal receipt type that shouldn't have a logo
  const isInternalReceipt = templateName.includes('cash up') || 
                           templateName.includes('laybye reserve') ||
                           templateName.includes('till session') ||
                           templateName.includes('cash drop')

  // Only add logo for non-internal receipts
  if (!isInternalReceipt) {
    // Logo (centered)
    data.push(ESC + "a" + "\x01")
    try {
      const base64Logo = await convertImageToBase64('/images/receipts/KQS RECEIPT LOGO-Photoroom.png')
      data.push({
        type: 'raw',
        format: 'image',
        flavor: 'base64',
        data: base64Logo,
        options: {
          language: 'ESCPOS',
          dotDensity: 'single',
          width: 384,
          height: 100,
          scale: 0.5
        }
      })
    } catch (error) {
      data.push(ESC + "!" + "\x08")
      data.push(ESC + "E" + "\x01")
      data.push(template.business_name + NEWLINE)
      data.push(ESC + "E" + "\x00")
      data.push(ESC + "!" + "\x00")
    }
  }
  
  if (templateName.includes('cash up')) {
    // Cash Up Report
    data.push("Cash Up Report" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Report #: KQS-CU-2024-00021" + NEWLINE)
    data.push("Session #: TS-2024-00012" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Date: 24-Dec-24 • Time: 19:00 PM" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Detail                    Amount" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Opening Float             R1000.00" + NEWLINE)
    data.push("Cash Sales                R3500.00" + NEWLINE)
    data.push("Card Sales                R2200.00" + NEWLINE)
    data.push("Cash Drops                -R500.00" + NEWLINE)
    data.push("Cash Payouts              -R200.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Closing Balance           R3800.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Counted Cash              R3750.00" + NEWLINE)
    data.push("Variance                  -R50.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Notes: Short by 50.00, verified by supervisor." + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Cash Up Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("All cash up reports must be verified and signed by a supervisor." + NEWLINE)
    data.push("Litlaleho tsa cash up li tlameha ho netefatsoa ke mookameli pele li saenngoa." + NEWLINE)
    
  } else if (templateName.includes('final laybye payment')) {
    // Final Laybye Payment
    data.push("Final Laybye Payment" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Receipt #: KQS-2024-001234" + NEWLINE)
    data.push("Laybye ID: 52466" + NEWLINE)
    data.push("Payment ID: 13098" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("MPESA                         R450.00" + NEWLINE)
    data.push("Change                        R0.00" + NEWLINE)
    data.push("Total Already Paid            R2550.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    // Lay-bye Policy
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Lay-bye Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size." + NEWLINE)
    data.push("(Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle Le ha ese felletsoe ke nako." + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
  } else if (templateName.includes('refund')) {
    // Refund Slip
    data.push("Refund Slip" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Refund #: KQS-RF-2024-00088" + NEWLINE)
    data.push("Date: 24-Dec-24 • Time: 15:45 PM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Refund Amount                 R2050.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Reason: Product defect and wrong size" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Refund Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Refunds are processed for valid reasons only and require original receipt." + NEWLINE)
    data.push("Chelete e khutlisetsoa feela haeba ho na le Lebaka Le utloahalang le invoice ea pele." + NEWLINE)
    
  } else if (templateName.includes('laybye payment') && !templateName.includes('final')) {
    // Laybye Payment Receipt
    data.push("Laybye Payment Receipt" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Receipt #: KQS-2024-001234" + NEWLINE)
    data.push("Laybye ID: 52466" + NEWLINE)
    data.push("Payment ID: 13098" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Payment Amount                R450.00" + NEWLINE)
    data.push("Balance Remaining             R2550.00" + NEWLINE)
    data.push("Total Already Paid            R2550.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    // Lay-bye Policy
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Lay-bye Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size." + NEWLINE)
    data.push("(Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle Le ha ese felletsoe ke nako." + NEWLINE)
    
  } else if (templateName.includes('laybye reserve')) {
    // Laybye Reserve Slip
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("LAY-BYE RESERVE SLIP" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("KEEP WITH GOODS" + NEWLINE)
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("------------------------------------------" + NEWLINE)
    
    // Lay-bye Number
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push("LAY-BYE NUMBER" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("LB-2024-001" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("------------------------------------------" + NEWLINE)
    
    // Customer Details
    data.push("Name:                    John Doe" + NEWLINE)
    data.push("Phone:                   +267 71 234 567" + NEWLINE)
    data.push("Customer ID:              CUST-001" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    // Product Details
    data.push("Product:                  Nike Air Max 270" + NEWLINE)
    data.push("SKU:                      NK-AM270-BLK-42" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    // Financial Details
    data.push("Total Amount:             P1200.00" + NEWLINE)
    data.push("Amount Paid:              P400.00" + NEWLINE)
    data.push("Remaining Balance:        P800.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    // Important Dates
    data.push("Lay-bye Date:             15/01/2024" + NEWLINE)
    data.push("Expiry Date:              15/04/2024" + NEWLINE)
    
  } else if (templateName.includes('laybye cancellation')) {
    // Laybye Cancellation Receipt
    data.push("Lay-bye Cancellation" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Cancellation #: KQS-LC-2024-00033" + NEWLINE)
    data.push("Laybye ID: 52466" + NEWLINE)
    data.push("Date: 24-Dec-24 • Time: 15:45 PM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Refund Amount                 R3000.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Reason: Customer request" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Cancellation Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Lay-bye cancellations are processed with full refund of deposits made." + NEWLINE)
    data.push("Ho khutlisetsoa chelete eohle e e nkelletsoeng ha ho khutloa lay-bye." + NEWLINE)
    
  } else if (templateName.includes('returns') && templateName.includes('exchange')) {
    // Returns & Exchange Slip
    data.push("Returns & Exchange Slip" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Exchange #: KQS-RE-2024-00042" + NEWLINE)
    data.push("Date: 24-Dec-24 • Time: 15:45 PM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Returned Item                 Exchange" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers (Size 8)      ADIDAS Sneakers (Size 9)" + NEWLINE)
    data.push("Designer Dress (M)            Designer Dress (L)" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Reason: Wrong size" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Return & Exchange Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Returns and exchanges accepted within 7 days of purchase with a valid receipt." + NEWLINE)
    data.push("Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa." + NEWLINE)
    
  } else if (templateName.includes('quotation')) {
    // Quotation Slip
    data.push("Quotation Slip" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Quotation #: KQS-QT-2024-00055" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("Valid Until: 28-Dec-24" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Price" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x2            R1700.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Subtotal                      R3850.00" + NEWLINE)
    data.push("Bulk Discount (10%)           -R385.00" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Total                         R3465.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Terms & Conditions" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("This quotation is valid for 7 days. Prices subject to change." + NEWLINE)
    data.push("Quotation ena e sebetsa matsatsi a 7. Litheko li ka fetoha." + NEWLINE)
    
  } else if (templateName.includes('delivery')) {
    // Delivery Slip
    data.push("Delivery Slip" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Delivery #: KQS-DL-2024-00067" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("Address: 123 Main Street, Maseru" + NEWLINE)
    data.push("Phone: 2700 7795" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Qty" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers               x1" + NEWLINE)
    data.push("Designer Dress                x1" + NEWLINE)
    data.push("Luxury Handbag                x1" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Delivery Instructions" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Please deliver during business hours. Call customer before delivery." + NEWLINE)
    data.push("Ka kopo isa nako ea kereke. Bitsa moreki pele ho isa." + NEWLINE)
    
  } else if (templateName.includes('order')) {
    // Order Slip
    data.push("Order Slip" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Order #: KQS-OR-2024-00078" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("Expected Delivery: 28-Dec-24" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Price" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Nike Air Max (Size 10)        R1200.00" + NEWLINE)
    data.push("Puma Running Shoes (Size 9)   R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Deposit Required               R500.00" + NEWLINE)
    data.push("Balance on Delivery            R1650.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Order Terms" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Orders require 50% deposit. Balance due on delivery." + NEWLINE)
    data.push("Dikopo di hloka 50% deposit. Chelete e setseng e lefshwa ha ho isa." + NEWLINE)
    
  } else if (templateName.includes('cash drop')) {
    // Cash Drop Receipt
    data.push("Cash Drop Receipt" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Drop #: KQS-CD-2024-00089" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Session: TS-2024-00012" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Amount Dropped                R500.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Reason: Till limit exceeded" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Till Balance Before Drop      R3200.00" + NEWLINE)
    data.push("Till Balance After Drop       R2700.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "a" + "\x01") // Center alignment
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Cash Drop Policy" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(ESC + "a" + "\x00") // Left alignment
    data.push("Cash drops must be verified by supervisor and recorded." + NEWLINE)
    data.push("Cash drops li tlameha ho netefatsoa ke mookameli le ho ngoloa." + NEWLINE)
    
  } else if (templateName.includes('till session')) {
    // Till Session Report
    data.push("Till Session Report" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Session #: TS-2024-00012" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Date: 21-Dec-24" + NEWLINE)
    data.push("Start Time: 08:00 AM" + NEWLINE)
    data.push("End Time: 06:00 PM" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Transaction Type              Amount" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Cash Sales                    R4500.00" + NEWLINE)
    data.push("Card Sales                    R2800.00" + NEWLINE)
    data.push("Laybye Payments               R1200.00" + NEWLINE)
    data.push("Cash Drops                    -R500.00" + NEWLINE)
    data.push("Cash Payouts                  -R200.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Session Total                 R7800.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Opening Float                 R1000.00" + NEWLINE)
    data.push("Closing Balance               R8800.00" + NEWLINE)
    
  } else if (templateName.includes('intermediate')) {
    // Intermediate Bill
    data.push("Intermediate Bill" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Bill #: KQS-IB-2024-00091" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Subtotal                      R3000.00" + NEWLINE)
    data.push("Tax                           R300.00" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("TOTAL                         R3300.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("NOTE: This is an intermediate bill. Final payment required." + NEWLINE)
    data.push("Tlhokomeliso: Sena ke bill ea pakeng. Chelete ea ho qetela e hlokahala." + NEWLINE)
    
  } else if (templateName.includes('account payment')) {
    // Account Payment Receipt
    data.push("Account Payment Receipt" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Payment #: KQS-AP-2024-00102" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("Account #: ACC-2024-00015" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Payment Details               Amount" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Payment Amount                R500.00" + NEWLINE)
    data.push("Previous Balance              R2500.00" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("New Balance                   R2000.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Payment Method: MPESA" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Account Terms" + NEWLINE)
    data.push("Account payments reduce outstanding balance. Credit limit applies." + NEWLINE)
    data.push("Dikhelete tsa account li fokotsa chelete e setseng. Credit limit e sebetsa." + NEWLINE)
    
  } else if (templateName.includes('customer statement')) {
    // Customer Statement
    data.push("Customer Statement" + NEWLINE)
    data.push(ESC + "a" + "\x00")
    
    data.push("Statement #: KQS-CS-2024-00113" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    data.push("Account #: ACC-2024-00015" + NEWLINE)
    data.push("Date: 21-Dec-24" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Date        Description       Debit    Credit   Balance" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("15-Dec-24   Purchase          R3000.00          R3000.00" + NEWLINE)
    data.push("18-Dec-24   Payment                    R500.00  R2500.00" + NEWLINE)
    data.push("20-Dec-24   Purchase          R1200.00          R3700.00" + NEWLINE)
    data.push("21-Dec-24   Payment                    R500.00  R3200.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Current Balance               R3200.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("Credit Limit                  R5000.00" + NEWLINE)
    data.push("Available Credit              R1800.00" + NEWLINE)
    data.push("------------------------------------------" + NEWLINE)
    
    data.push("Statement Terms" + NEWLINE)
    data.push("This statement shows your account activity. Please settle outstanding balance." + NEWLINE)
    data.push("Statement ena e bonts'a tsebetso ea account ea hau. Ka kopo lefa chelete e setseng." + NEWLINE)
    
  } else {
    // Default Retail Receipt
    data.push("Retail Receipt" + NEWLINE)
    data.push(ESC + "a" + "\x00")

    // Receipt details (no extra blank lines)
    data.push("Receipt #: KQS-2024-009876" + NEWLINE)
    data.push("Date: 21-Dec-24 • Time: 11:24 AM" + NEWLINE)
    data.push("Cashier: Hape" + NEWLINE)
    data.push("Customer: NTEBALENG TAELO" + NEWLINE)
    // Section divider (single line)
    data.push("------------------------------------------" + NEWLINE)

    // Items table header with visual separator
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Description                    Total" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    data.push("------------------------------------------" + NEWLINE)

    // Items (without icons for now to test printer connection)
    data.push("ADIDAS Sneakers x1            R850.00" + NEWLINE)
    data.push("Designer Dress x1             R1200.00" + NEWLINE)
    data.push("Luxury Handbag x1             R950.00" + NEWLINE)

    // Section divider (single line)
    data.push("------------------------------------------" + NEWLINE)

    // Totals (compact, no extra blank lines)
    data.push("Subtotal                      R3000.00" + NEWLINE)
    data.push("Tax                           R300.00" + NEWLINE)
    data.push("Discount                      -R100.00" + NEWLINE)
    if (template.show_points_section) {
      data.push("Points Used                   -50" + NEWLINE)
    }
    // Major divider before TOTAL
    data.push("==========================================" + NEWLINE)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("TOTAL                         R3150.00" + NEWLINE)
    data.push(ESC + "E" + "\x00") // Bold off
    // Payment details
    data.push("MPESA                         R3200.00" + NEWLINE)
    data.push("Change                        R50.00" + NEWLINE)
    if (template.show_points_section) {
      data.push(ESC + "E" + "\x01") // Bold on
      data.push("Points Earned: 30" + NEWLINE)
      data.push(ESC + "E" + "\x00") // Bold off
    }
    // Section divider (single line)
    data.push("------------------------------------------" + NEWLINE)

    // Business tagline (centered, no extra blank lines)
    if (template.show_tagline) {
      data.push(ESC + "a" + "\x01")
      data.push(template.business_tagline + NEWLINE)
      data.push(ESC + "a" + "\x00")
      // Section divider (single line)
      data.push("------------------------------------------" + NEWLINE)
    }

    // Return & Exchange Policy (centered title, then text)
    if (template.show_policy_section) {
      data.push(ESC + "a" + "\x01")
      data.push(ESC + "E" + "\x01") // Bold on
      data.push("Return & Exchange Policy" + NEWLINE)
      data.push(ESC + "E" + "\x00") // Bold off
      data.push(ESC + "a" + "\x00")
      data.push(template.return_policy_english + NEWLINE)
      data.push(template.return_policy_sesotho + NEWLINE)
      // Section divider (single line)
      data.push("------------------------------------------" + NEWLINE)
    }
  }

  // QR/Promo section (website URL only for now)
  if (template.show_qr_section) {
    // Footer text (centered and bold) - ABOVE the website
    if (template.footer_text) {
      data.push(ESC + "a" + "\x01") // Center alignment
      data.push(ESC + "E" + "\x01") // Bold on
      data.push(template.footer_text + NEWLINE)
      data.push(ESC + "E" + "\x00") // Bold off
      data.push(ESC + "a" + "\x00") // Left alignment
    }

    data.push(ESC + "a" + "\x01")
    data.push(template.business_website + NEWLINE)
    data.push(ESC + "a" + "\x00")

    // Small space below website URL
    data.push(NEWLINE)

    // Contact info with icons
    // Address (bold label, normal value)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Address:")
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(" " + template.business_address + NEWLINE)
    
    // Phone (bold label, normal value)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Phone:")
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(" " + template.business_phone + NEWLINE)
    
    // Facebook (bold label, normal handle)
    data.push(ESC + "E" + "\x01") // Bold on
    data.push("Facebook:")
    data.push(ESC + "E" + "\x00") // Bold off
    data.push(" " + template.business_facebook + NEWLINE)
    // Major divider at the end
    data.push("==========================================" + NEWLINE)
  }

  // Thank you (centered)
  data.push(ESC + "a" + "\x01")
  data.push(template.thank_you_message + NEWLINE)
  data.push(ESC + "a" + "\x00")

  // Add extra spacing and bottom margin
  data.push(NEWLINE)
  data.push(NEWLINE)
  data.push(NEWLINE)
  data.push(NEWLINE)
  data.push(NEWLINE)
  
  // Feed paper forward before cutting
  data.push(ESC + "J" + String.fromCharCode(50)) // Feed 50 dots forward
  
  // Auto-cut the paper
  data.push(ESC + "m")

  return data
}

const ReceiptsPage = () => {
  const { selectedBranch } = useBranch()
  const { printers, status, isConnecting, connect } = useQzTray()
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const [printSuccess, setPrintSuccess] = useState<null | boolean>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [template, setTemplate] = useState<ReceiptTemplate | null>(null)
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ReceiptTemplate | null>(null)

  // Load templates from database on mount
  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedBranch) return
      
      try {
        setLoading(true)
        const loadedTemplates = await loadReceiptTemplates(selectedBranch.id)
        
        // If no templates exist, create default ones
        if (loadedTemplates.length === 0) {
          const defaultTemplates = generateDefaultTemplates()
          // Save default templates to database
          for (const defaultTemplate of defaultTemplates) {
            await saveReceiptTemplate(defaultTemplate, selectedBranch.id)
          }
          setTemplates(defaultTemplates)
          
          // Set the default template as selected
          const defaultTemplate = defaultTemplates.find(t => t.is_default) || defaultTemplates[0]
          if (defaultTemplate) {
            setTemplate(defaultTemplate)
            setSelectedTemplateId(defaultTemplate.id || null)
          }
        } else {
          setTemplates(loadedTemplates)
          
          // Set the default template as selected
          const defaultTemplate = loadedTemplates.find(t => t.is_default) || loadedTemplates[0]
          if (defaultTemplate) {
            setTemplate(defaultTemplate)
            setSelectedTemplateId(defaultTemplate.id || null)
          }
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [selectedBranch])

  // Create missing default templates
  const createMissingTemplates = useCallback(async () => {
    if (!selectedBranch) return
    
    try {
      setLoading(true)
      const allDefaultTemplates = generateDefaultTemplates()
      const existingTemplates = await loadReceiptTemplates(selectedBranch.id)
      
      // Find templates that don't exist yet
      const missingTemplates = allDefaultTemplates.filter(defaultTemplate => 
        !existingTemplates.some(existing => 
          existing.name === defaultTemplate.name
        )
      )
      
      if (missingTemplates.length === 0) {
        alert('All default templates already exist!')
        return
      }
      
      // Save missing templates to database
      for (const missingTemplate of missingTemplates) {
        await saveReceiptTemplate(missingTemplate, selectedBranch.id)
      }
      
      // Reload templates
      const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
      setTemplates(updatedTemplates)
      
      alert(`Successfully created ${missingTemplates.length} new templates!`)
    } catch (error) {
      console.error('Error creating missing templates:', error)
      alert('An error occurred while creating templates.')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch])

  // Save template to database
  const saveTemplate = useCallback(async () => {
    if (!template || !selectedBranch) return
    
    try {
      setSaving(true)
      const result = await saveReceiptTemplate(template, selectedBranch.id)
      
      if (result.success && result.template) {
        // Update the templates list
        setTemplates(prev => {
          const existingIndex = prev.findIndex(t => t.id === result.template?.id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = result.template!
            return updated
          } else {
            return [...prev, result.template!]
          }
        })
        
        setTemplate(result.template)
        setSelectedTemplateId(result.template.id || null)
        setHasUnsavedChanges(false)
        
        // Show success message
        alert('Template saved successfully!')
      } else {
        alert(`Error saving template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('An unexpected error occurred while saving the template.')
    } finally {
      setSaving(false)
    }
  }, [template, selectedBranch])

  // Reset template to defaults
  const resetTemplate = useCallback(async () => {
    if (!selectedBranch) return
    
    try {
      const defaultTemplate = await getDefaultTemplate(selectedBranch.id)
      setTemplate(defaultTemplate)
      setSelectedTemplateId(defaultTemplate.id || null)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error resetting template:', error)
    }
  }, [selectedBranch])

  // Handle template changes
  const handleTemplateChange = useCallback((field: keyof ReceiptTemplate, value: string | boolean) => {
    if (!template) return
    
    setTemplate(prev => prev ? { ...prev, [field]: value } : null)
    setHasUnsavedChanges(true)
  }, [template])

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setTemplate(selectedTemplate)
      setSelectedTemplateId(templateId)
      setHasUnsavedChanges(false)
    }
  }, [templates])

  // Set template as default
  const handleSetDefault = useCallback(async (templateId: string) => {
    if (!selectedBranch) return
    
    try {
      const result = await setDefaultTemplate(templateId, selectedBranch.id)
      if (result.success) {
        // Reload templates to reflect the change
        const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
        setTemplates(updatedTemplates)
        alert('Default template updated successfully!')
      } else {
        alert(`Error setting default template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error setting default template:', error)
      alert('An unexpected error occurred.')
    }
  }, [selectedBranch])

  // Duplicate template
  const handleDuplicate = useCallback(async (templateId: string) => {
    if (!selectedBranch) return
    
    try {
      const result = await duplicateReceiptTemplate(templateId)
      if (result.success && result.template) {
        // Reload templates to include the new duplicate
        const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
        setTemplates(updatedTemplates)
        alert('Template duplicated successfully!')
      } else {
        alert(`Error duplicating template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('An unexpected error occurred.')
    }
  }, [selectedBranch])

  // Delete template
  const handleDelete = useCallback(async (templateId: string) => {
    if (!selectedBranch) return
    
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteReceiptTemplate(templateId)
      if (result.success) {
        // Reload templates
        const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
        setTemplates(updatedTemplates)
        
        // If the deleted template was selected, select the default template
        if (selectedTemplateId === templateId) {
          const defaultTemplate = updatedTemplates.find(t => t.is_default) || updatedTemplates[0]
          if (defaultTemplate) {
            setTemplate(defaultTemplate)
            setSelectedTemplateId(defaultTemplate.id || null)
          }
        }
        
        alert('Template deleted successfully!')
      } else {
        alert(`Error deleting template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('An unexpected error occurred.')
    }
  }, [selectedBranch, selectedTemplateId])

  // Export templates
  const handleExport = useCallback(async () => {
    if (!selectedBranch) return
    
    try {
      const result = await exportTemplates(selectedBranch.id)
      if (result.success && result.data) {
        // Create and download the file
        const blob = new Blob([result.data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kqs-receipt-templates-${selectedBranch.name}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        alert('Templates exported successfully!')
      } else {
        alert(`Error exporting templates: ${result.error}`)
      }
    } catch (error) {
      console.error('Error exporting templates:', error)
      alert('An unexpected error occurred.')
    }
  }, [selectedBranch])

  // Update luxury receipt template name
  const updateLuxuryReceiptName = useCallback(async () => {
    if (!selectedBranch) return
    
    try {
      // Find the luxury receipt template
      const luxuryTemplate = templates.find(t => t.name === 'KQS Luxury Receipt')
      if (!luxuryTemplate) {
        alert('Luxury receipt template not found!')
        return
      }

      // Update the template name and description
      const updatedTemplate = {
        ...luxuryTemplate,
        name: 'KQS Final Laybye Payment',
        description: 'Final laybye payment receipt with balance tracking and progress display'
      }

      const result = await saveReceiptTemplate(updatedTemplate, selectedBranch.id)
      if (result.success && result.template) {
        // Reload templates
        const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
        setTemplates(updatedTemplates)
        alert('Template name updated successfully!')
      } else {
        alert(`Error updating template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating template name:', error)
      alert('An unexpected error occurred while updating the template name.')
    }
  }, [selectedBranch, templates])

  // Import templates
  const handleImport = useCallback(async () => {
    if (!selectedBranch) return
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const result = await importTemplates(text, selectedBranch.id)
        if (result.success) {
          // Reload templates
          const updatedTemplates = await loadReceiptTemplates(selectedBranch.id)
          setTemplates(updatedTemplates)
          alert(`Successfully imported ${result.importedCount} templates!`)
        } else {
          alert(`Error importing templates: ${result.error}`)
        }
      } catch (error) {
        console.error('Error importing templates:', error)
        alert('An unexpected error occurred while importing templates.')
      }
    }
    input.click()
  }, [selectedBranch])

  // Handle template preview
  const handlePreview = useCallback((templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setPreviewTemplate(selectedTemplate)
      setShowPreviewModal(true)
    }
  }, [templates])

  // Handle template edit
  const handleEdit = useCallback((templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setTemplate(selectedTemplate)
      setSelectedTemplateId(templateId)
      setShowEditor(true)
      setHasUnsavedChanges(false)
    }
  }, [templates])

  const handlePrint = useCallback(async () => {
    if (!selectedPrinter || !template) return
    setPrinting(true)
    setPrintSuccess(null)
    try {
      const data = await createPrintData(template)
      console.log('Print data prepared, sending to printer...')
      await printReceipt(selectedPrinter, data)
      setPrintSuccess(true)
    } catch (err) {
      console.error('Print error:', err)
      setPrintSuccess(false)
    } finally {
      setPrinting(false)
      setTimeout(() => setPrintSuccess(null), 3000)
    }
  }, [selectedPrinter, template])

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center py-10 px-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading receipt templates...</span>
        </div>
      </main>
    )
  }

  // Show error state if no template is available
  if (!template) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center py-10 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Templates Available</h2>
          <p className="text-muted-foreground mb-4">No receipt templates found. Please create a template first.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Receipt Templates</h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={createMissingTemplates}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
              {loading ? 'Creating...' : 'Create All Templates'}
            </Button>
            <Button
              onClick={() => setShowEditor(!showEditor)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showEditor ? 'Hide Editor' : 'Edit Template'}
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={saveTemplate}
                disabled={saving}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Template Management */}
        <div className="mb-6">
          {templates.length < 16 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Create All Receipt Templates
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You have {templates.length} of 16 templates. Click "Create All Templates" to add the missing receipt templates.
                  </p>
                </div>
                <Button
                  onClick={createMissingTemplates}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  {loading ? 'Creating...' : 'Create All Templates'}
                </Button>
              </div>
            </div>
          )}
          <TemplateManagement
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={handleTemplateSelect}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Template Editor */}
          {showEditor && (
            <div className="lg:w-1/3">
              <TemplateEditor
                template={template}
                onTemplateChange={handleTemplateChange}
                onReset={resetTemplate}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={saveTemplate}
                saving={saving}
              />
            </div>
          )}

          {/* Receipt Preview and Print Controls */}
          <div className={`flex-1 flex flex-col items-center ${showEditor ? 'lg:w-2/3' : 'w-full'}`}>
            <DynamicReceiptPreview 
              className="w-full max-w-md" 
              template={template}
            />
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex gap-2 items-center">
                <select
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-primary"
                  value={selectedPrinter || ""}
                  onChange={e => setSelectedPrinter(e.target.value)}
                  disabled={status !== "connected" || printers.length === 0}
                >
                  <option value="" disabled>
                    {status === "connected" && printers.length > 0
                      ? "Select Printer"
                      : status === "connected"
                      ? "No printers found"
                      : "Connect QZ Tray first"}
                  </option>
                  {printers.map(printer => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handlePrint}
                  disabled={!selectedPrinter || printing}
                  className="ml-2 flex items-center gap-2"
                  variant="default"
                  size="sm"
                >
                  {printing ? <Loader2 className="animate-spin h-4 w-4" /> : <Printer className="h-4 w-4" />}
                  Print
                </Button>
              </div>
              {printSuccess === true && (
                <span className="text-green-600 text-xs mt-1">Printed successfully!</span>
              )}
              {printSuccess === false && (
                <span className="text-red-600 text-xs mt-1">Print failed. Check printer connection.</span>
              )}
              {status !== "connected" && (
                <Button
                  onClick={connect}
                  disabled={isConnecting}
                  className="mt-2"
                  variant="secondary"
                  size="sm"
                >
                  {isConnecting ? <Loader2 className="animate-spin h-4 w-4" /> : "Connect QZ Tray"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={previewTemplate}
        onPrint={handlePrint}
        printing={printing}
      />
    </main>
  )
}

export default ReceiptsPage 