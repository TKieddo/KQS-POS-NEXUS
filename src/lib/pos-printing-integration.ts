import { printTransactionReceipt, type TransactionData } from './receipt-printing-service'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { supabase } from './supabase'

// POSPrintingService class implements all printing methods

// Data interfaces for different transaction types
export interface SalePrintData {
  transactionNumber: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
    category?: string
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  amountPaid: number
  change: number
  cashier?: string
}

export interface LaybyePaymentPrintData {
  transactionNumber: string
  laybyeId: string
  paymentId: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  paymentAmount: number
  balanceRemaining: number
  totalPaid: number
  cashier?: string
}

export interface LaybyeReservePrintData {
  transactionNumber: string
  laybyeId: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  total: number
  paymentAmount: number
  balanceRemaining: number
  cashier?: string
}

export interface RefundPrintData {
  transactionNumber: string
  originalSaleNumber: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  refundAmount: number
  refundReason?: string
  cashier?: string
}

export interface CashUpPrintData {
  transactionNumber: string
  sessionNumber: string
  cashier: string
  openingFloat: number
  cashSales: number
  cardSales: number
  cashDrops: number
  cashPayouts: number
  closingBalance: number
  countedCash: number
  variance: number
  notes?: string
  paymentMethods?: Record<string, number>
  productCategories?: Record<string, number>
  transactionTypes?: Record<string, number>
  grasshopperFees?: number
}

export interface TillSessionPrintData {
  sessionNumber: string
  cashier: string
  startTime: string
  endTime: string
  cashSales: number
  cardSales: number
  laybyePayments: number
  cashDrops: number
  cashPayouts: number
  sessionTotal: number
  openingFloat: number
  closingBalance: number
}

export interface CashDropPrintData {
  transactionNumber: string
  cashier: string
  sessionNumber: string
  amountDropped: number
  reason: string
  tillBalanceBefore: number
  tillBalanceAfter: number
}

export interface AccountPaymentPrintData {
  transactionNumber: string
  customer: string
  accountNumber: string
  paymentAmount: number
  previousBalance: number
  newBalance: number
  paymentMethod: string
  cashier?: string
}

export interface LaybyeCancellationPrintData {
  transactionNumber: string
  laybyeId: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  refundAmount: number
  reason?: string
  cashier?: string
}

export interface ReturnsExchangePrintData {
  transactionNumber: string
  customer?: string
  returnedItems: Array<{
    name: string
    size?: string
    reason: string
  }>
  exchangedItems: Array<{
    name: string
    size?: string
  }>
  reason: string
  cashier?: string
}

export interface DeliveryPrintData {
  transactionNumber: string
  customer: string
  address: string
  phone: string
  items: Array<{
    name: string
    quantity: number
  }>
  deliveryInstructions?: string
}

export interface QuotationPrintData {
  transactionNumber: string
  customer: string
  validUntil: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  bulkDiscount: number
  total: number
}

export interface OrderReceiptPrintData {
  transactionNumber: string
  customer: string
  expectedDelivery: string
  items: Array<{
    name: string
    size?: string
    price: number
  }>
  depositRequired: number
  balanceOnDelivery: number
  cashier?: string
}

export interface CustomerStatementPrintData {
  transactionNumber: string
  customer: string
  accountNumber: string
  transactions: Array<{
    date: string
    description: string
    debit: number
    credit: number
    balance: number
  }>
  currentBalance: number
  creditLimit: number
  availableCredit: number
}

export interface IntermediateBillPrintData {
  transactionNumber: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  cashier?: string
}

/**
 * Centralized POS Printing Service
 * Handles automatic receipt printing for all transaction types using beautiful templates
 */
export class POSPrintingService {
  private branchId: string
  private cashier: string

  constructor(branchId: string, cashier: string) {
    this.branchId = branchId
    this.cashier = cashier
  }

  private async getReceiptTemplate(templateType: string = 'retail_receipt') {
    try {
      const { data, error } = await supabase
        .from('receipt_templates')
        .select('*')
        .eq('branch_id', this.branchId)
        .eq('template_type', templateType)
        .single()

      if (error) {
        console.error('Error fetching receipt template:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching receipt template:', error)
      return null
    }
  }

  private async printReceipt(
    transactionType: string,
    transactionData: TransactionData,
    printerName?: string
  ): Promise<boolean> {
    try {
      // Get the appropriate template for this transaction type
      const templateType = this.getTemplateTypeForTransaction(transactionType)
      const template = await this.getReceiptTemplate(templateType)

      if (!template) {
        console.warn('No template found, using default template')
        // You could create a default template here if needed
      }

      const result = await printTransactionReceipt({
        transactionType: transactionType as any,
        branchId: this.branchId,
        transactionData,
        printerName
      })

      if (result.success) {
        if (result.method === 'qz_tray') {
          toast.success('Receipt printed via thermal printer!')
        } else if (result.method === 'browser') {
          toast.success('Receipt opened in browser for printing.')
        } else {
          toast.success('Receipt printed successfully!')
        }
        return true
      } else {
        console.warn('Receipt printing failed:', result.error)
        toast.error('Receipt printing failed')
        return false
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
      toast.error('Receipt printing failed')
      return false
    }
  }

  private getTemplateTypeForTransaction(transactionType: string): string {
    switch (transactionType) {
      case 'sale':
        return 'retail_receipt'
      case 'laybye_payment':
        return 'laybye_payment_receipt'
      case 'laybye_reserve':
        return 'laybye_reserve_slip'
      case 'refund':
        return 'refund_slip'
      case 'account_payment':
        return 'account_payment_receipt'
      case 'cash_up':
        return 'cash_up_report'
      case 'till_session':
        return 'till_session_report'
      case 'cash_drop':
        return 'cash_drop_withdraw'
      case 'laybye_cancellation':
        return 'laybye_cancellation'
      case 'returns_exchange':
        return 'returns_exchange_slip'
      case 'delivery':
        return 'delivery_slip'
      case 'quotation':
        return 'quotation_slip'
      case 'order':
        return 'order_slip'
      case 'customer_statement':
        return 'customer_statement'
      case 'intermediate_bill':
        return 'intermediate_bill'
      default:
        return 'retail_receipt'
    }
  }

  async printSaleReceipt(data: SalePrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount,
      total: data.total,
      paymentMethod: data.paymentMethod,
      amountPaid: data.amountPaid,
      change: data.change
    }

    await this.printReceipt('sale', transactionData)
  }

  async printLaybyePaymentReceipt(data: LaybyePaymentPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      laybyeId: data.laybyeId,
      paymentId: data.paymentId,
      items: data.items,
      paymentAmount: data.paymentAmount,
      balanceRemaining: data.balanceRemaining,
      totalPaid: data.totalPaid
    }

    await this.printReceipt('laybye_payment', transactionData)
  }

  async printLaybyeReserveReceipt(data: LaybyeReservePrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      laybyeId: data.laybyeId,
      items: data.items,
      total: data.total,
      paymentAmount: data.paymentAmount,
      balanceRemaining: data.balanceRemaining
    }

    await this.printReceipt('laybye_reserve', transactionData)
  }

  async printRefundReceipt(data: RefundPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      items: data.items,
      refundAmount: data.refundAmount,
      refundReason: data.refundReason,
      originalSaleNumber: data.originalSaleNumber
    }

    await this.printReceipt('refund', transactionData)
  }

  async printCashUpReceipt(data: CashUpPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      sessionNumber: data.sessionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier,
      openingFloat: data.openingFloat,
      cashSales: data.cashSales,
      cardSales: data.cardSales,
      cashDrops: data.cashDrops,
      cashPayouts: data.cashPayouts,
      closingBalance: data.closingBalance,
      countedCash: data.countedCash,
      variance: data.variance,
      notes: data.notes,
      paymentMethods: data.paymentMethods,
      productCategories: data.productCategories,
      transactionTypes: data.transactionTypes,
      grasshopperFees: data.grasshopperFees
    }

    await this.printReceipt('cash_up', transactionData)
  }

  async printTillSessionReceipt(data: TillSessionPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.sessionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier,
      cashSales: data.cashSales,
      cardSales: data.cardSales,
      laybyePayments: data.laybyePayments,
      cashDrops: data.cashDrops,
      cashPayouts: data.cashPayouts,
      sessionTotal: data.sessionTotal,
      openingFloat: data.openingFloat,
      closingBalance: data.closingBalance
    }

    await this.printReceipt('till_session', transactionData)
  }

  async printCashDropReceipt(data: CashDropPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier,
      sessionNumber: data.sessionNumber,
      amountDropped: data.amountDropped,
      reason: data.reason,
      tillBalanceBefore: data.tillBalanceBefore,
      tillBalanceAfter: data.tillBalanceAfter
    }

    await this.printReceipt('cash_drop', transactionData)
  }

  async printAccountPaymentReceipt(data: AccountPaymentPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      accountNumber: data.accountNumber,
      paymentAmount: data.paymentAmount,
      previousBalance: data.previousBalance,
      newBalance: data.newBalance,
      paymentMethod: data.paymentMethod
    }

    await this.printReceipt('account_payment', transactionData)
  }

  async printLaybyeCancellationReceipt(data: LaybyeCancellationPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      laybyeId: data.laybyeId,
      items: data.items,
      refundAmount: data.refundAmount,
      refundReason: data.reason
    }

    await this.printReceipt('laybye_cancellation', transactionData)
  }

  async printReturnsExchangeReceipt(data: ReturnsExchangePrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      returnedItems: data.returnedItems,
      exchangedItems: data.exchangedItems,
      refundReason: data.reason
    }

    await this.printReceipt('returns_exchange', transactionData)
  }

  async printDeliveryReceipt(data: DeliveryPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: this.cashier,
      customer: data.customer,
      address: data.address,
      phone: data.phone,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: 0,
        total: 0
      })),
      deliveryInstructions: data.deliveryInstructions
    }

    await this.printReceipt('delivery', transactionData)
  }

  async printQuotationReceipt(data: QuotationPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: this.cashier,
      customer: data.customer,
      validUntil: data.validUntil,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: data.subtotal,
      discount: data.bulkDiscount,
      total: data.total
    }

    await this.printReceipt('quotation', transactionData)
  }

  async printOrderReceipt(data: OrderReceiptPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: this.cashier,
      customer: data.customer,
      expectedDelivery: data.expectedDelivery,
      items: data.items.map(item => ({
        name: item.name,
        quantity: 1,
        price: item.price,
        total: item.price
      })),
      depositRequired: data.depositRequired,
      balanceOnDelivery: data.balanceOnDelivery
    }

    await this.printReceipt('order', transactionData)
  }

  async printCustomerStatementReceipt(data: CustomerStatementPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: this.cashier,
      customer: data.customer,
      accountNumber: data.accountNumber,
      transactions: data.transactions,
      currentBalance: data.currentBalance,
      creditLimit: data.creditLimit,
      availableCredit: data.availableCredit
    }

    await this.printReceipt('customer_statement', transactionData)
  }

  async printIntermediateBillReceipt(data: IntermediateBillPrintData): Promise<void> {
    const now = new Date()
    const transactionData: TransactionData = {
      transactionNumber: data.transactionNumber,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      cashier: data.cashier || this.cashier,
      customer: data.customer,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total
    }

    await this.printReceipt('intermediate_bill', transactionData)
  }
}

/**
 * Hook to create a POS printing service instance
 */
export const usePOSPrinting = () => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()

  const createPrintingService = () => {
    if (!selectedBranch?.id) {
      throw new Error('No branch selected')
    }

    const cashier = user?.user_metadata?.full_name || user?.email || 'Cashier'
    return new POSPrintingService(selectedBranch.id, cashier)
  }

  return { createPrintingService }
}
