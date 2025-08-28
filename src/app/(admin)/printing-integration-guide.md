# KQS POS Printing Integration Guide

## Overview

The KQS POS system now has comprehensive QZ Tray printing integration that automatically prints receipts for ALL transaction types. This integration ensures that every sale, refund, laybye payment, cashup, and other transaction automatically generates and prints the appropriate receipt using the configured thermal printer or browser printing as a fallback.

## 🎯 What's Been Integrated

### ✅ **Fully Integrated Transaction Types**

1. **Retail Sales** - Standard receipts with items, totals, and payment details
2. **Laybye Payments** - Payment receipts with balance tracking
3. **Laybye Reserve Slips** - Initial reservation slips with laybye number
4. **Refunds** - Refund slips with reason and amount
5. **Cash Up Reports** - End-of-day reconciliation reports
6. **Till Session Reports** - Session summaries with all transaction types
7. **Cash Drop Receipts** - Drop/withdrawal receipts with balances
8. **Account Payments** - Customer account payment receipts
9. **Laybye Cancellations** - Cancellation receipts with refund details
10. **Returns & Exchanges** - Return and exchange slips
11. **Delivery Slips** - Delivery instructions and item lists
12. **Quotation Slips** - Price quotes for bulk orders
13. **Order Slips** - Special order receipts
14. **Customer Statements** - Account balance statements
15. **Intermediate Bills** - Non-final bills for review

### 🔧 **Technical Implementation**

#### **Centralized Printing Service**
- **File**: `src/lib/pos-printing-integration.ts`
- **Class**: `POSPrintingService`
- **Hook**: `usePOSPrinting()`

#### **Updated Components**
- **POSInterface**: Now uses centralized printing for sales and laybye payments
- **RefundManagement**: Integrated refund receipt printing
- **CashUpPage**: Automatic cashup receipt printing on session close

#### **Receipt Templates**
- **File**: `src/lib/receipt-printing-service.ts`
- **All 15 transaction types** have complete ESC/POS implementations
- **Template mapping** automatically selects correct receipt format
- **Branch-specific templates** from database

## 🚀 How It Works

### **1. Automatic Receipt Printing**

When any transaction is completed in the POS system:

```typescript
// Example: Sale completion
const printingService = createPrintingService()
await printingService.printSaleReceipt({
  transactionNumber: "SALE-2024-001",
  customer: "John Doe",
  items: [...],
  subtotal: 100.00,
  tax: 10.00,
  discount: 5.00,
  total: 105.00,
  paymentMethod: "Cash",
  amountPaid: 110.00,
  change: 5.00
})
```

### **2. QZ Tray Integration**

The system automatically:
1. **Detects QZ Tray** connection status
2. **Uses thermal printer** if available
3. **Falls back to browser printing** if QZ Tray unavailable
4. **Shows success/error messages** to user

### **3. Template Selection**

Receipt templates are automatically selected based on:
- **Transaction type** (sale, refund, laybye, etc.)
- **Branch ID** (branch-specific templates)
- **Default template** fallback if specific template not found

## 📋 Transaction Type Details

### **Retail Sales**
- **Trigger**: Payment completion in POS
- **Template**: Retail receipt with logo, items, totals, policies
- **Print**: Automatic after successful payment

### **Laybye Payments**
- **Trigger**: Laybye payment completion
- **Template**: Laybye payment receipt with balance tracking
- **Print**: Automatic after payment processing

### **Laybye Reserve Slips**
- **Trigger**: Initial laybye order creation
- **Template**: Reserve slip with laybye number and terms
- **Print**: Automatic after deposit payment

### **Refunds**
- **Trigger**: Refund processing in refunds page
- **Template**: Refund slip with reason and amount
- **Print**: Automatic after refund completion

### **Cash Up Reports**
- **Trigger**: Session close in cashup page
- **Template**: Cash reconciliation report
- **Print**: Automatic when closing session

### **Till Session Reports**
- **Trigger**: Session end
- **Template**: Session summary with all transaction types
- **Print**: Available on demand

### **Cash Drop Receipts**
- **Trigger**: Cash drop/withdrawal
- **Template**: Drop receipt with before/after balances
- **Print**: Automatic after drop processing

### **Account Payments**
- **Trigger**: Customer account payment
- **Template**: Payment receipt with balance update
- **Print**: Automatic after payment

### **Laybye Cancellations**
- **Trigger**: Laybye cancellation
- **Template**: Cancellation receipt with refund details
- **Print**: Automatic after cancellation

### **Returns & Exchanges**
- **Trigger**: Return/exchange processing
- **Template**: Exchange slip with item details
- **Print**: Automatic after processing

### **Delivery Slips**
- **Trigger**: Delivery order creation
- **Template**: Delivery instructions and item list
- **Print**: Available on demand

### **Quotation Slips**
- **Trigger**: Quotation creation
- **Template**: Price quote with validity period
- **Print**: Available on demand

### **Order Slips**
- **Trigger**: Special order creation
- **Template**: Order receipt with deposit details
- **Print**: Automatic after order creation

### **Customer Statements**
- **Trigger**: Statement generation
- **Template**: Account balance and transaction history
- **Print**: Available on demand

### **Intermediate Bills**
- **Trigger**: Non-final bill creation
- **Template**: Bill with "intermediate" notice
- **Print**: Available on demand

## 🔧 Setup Requirements

### **1. QZ Tray Installation**
```bash
# Download and install QZ Tray
# Visit: https://qz.io/download/
```

### **2. Printer Configuration**
- **Default printer** set in printers page
- **Printer settings** configured per printer
- **Test printing** available for verification

### **3. Receipt Templates Setup (CRITICAL)**

**Step 1: Create All Templates**
1. Go to **Admin → Receipts** page
2. Click **"Create All Templates"** button
3. This creates all 16 receipt templates in the database
4. Verify all templates are created successfully

**Step 2: Configure Templates**
1. Select each template type
2. Customize business information, policies, and layout
3. Save changes to database
4. Test printing for each template type

**Step 3: Set Default Printer**
1. Go to **Admin → Printers** page
2. Connect QZ Tray
3. Select default printer
4. Test print to verify connection

### **4. Template Mapping Verification**

The system automatically maps transaction types to templates:

| Transaction Type | Template Name | Description |
|------------------|---------------|-------------|
| `sale` | KQS Retail Receipt | Standard sales |
| `laybye_payment` | KQS Laybye Payment Receipt | Laybye payments |
| `laybye_reserve` | KQS Laybye Reserve Slip | Initial deposits |
| `refund` | KQS Refund Slip | Returns and refunds |
| `cash_up` | KQS Cash Up Report | End-of-day reports |
| `till_session` | KQS Till Session Report | Session summaries |
| `cash_drop` | KQS Cash Drop Receipt | Cash management |
| `account_payment` | KQS Account Payment Receipt | Credit payments |
| `laybye_cancellation` | KQS Laybye Cancellation Receipt | Cancellations |
| `returns_exchange` | KQS Returns & Exchange Slip | Exchanges |
| `delivery` | KQS Delivery Slip | Delivery orders |
| `quotation` | KQS Quotation Slip | Price quotes |
| `order` | KQS Order Slip | Special orders |
| `customer_statement` | KQS Customer Statement | Account statements |
| `intermediate_bill` | KQS Intermediate Bill | Partial bills |

## 📱 User Experience

### **For Cashiers**
1. **Complete transaction** as normal
2. **Receipt prints automatically** via thermal printer
3. **Success message** confirms printing
4. **Fallback to browser** if printer unavailable

### **For Managers**
1. **Monitor printing status** in admin panel
2. **Configure templates** in receipts page
3. **Set default printer** in printers page
4. **View printing logs** for troubleshooting

## 🛠️ Troubleshooting

### **Common Issues**

#### **QZ Tray Not Connected**
- **Solution**: Install and run QZ Tray
- **Check**: Browser console for connection errors
- **Fallback**: Browser printing will be used

#### **Printer Not Found**
- **Solution**: Check printer connection and drivers
- **Check**: QZ Tray printer list
- **Fallback**: Browser printing will be used

#### **Template Not Found**
- **Solution**: Create missing templates in receipts page
- **Check**: Branch-specific template availability
- **Fallback**: Default template will be used

#### **Printing Fails**
- **Solution**: Check printer paper and connection
- **Check**: QZ Tray logs for errors
- **Fallback**: Error message shown to user

### **Debug Information**
- **Console logs** show printing attempts
- **QZ Tray logs** show printer communication
- **Error messages** displayed to user
- **Success confirmations** shown for each print

## 🔄 Future Enhancements

### **Planned Features**
1. **Print queue management** for offline scenarios
2. **Multiple printer support** for different receipt types
3. **Print preview** before printing
4. **Receipt customization** per transaction type
5. **Print history** and reprint functionality

### **Integration Points**
1. **Loyalty system** integration
2. **Inventory updates** on printing
3. **Analytics tracking** of printed receipts
4. **Email receipts** as backup
5. **Digital receipt** storage

## 📞 Support

### **Technical Support**
- **QZ Tray issues**: Check QZ Tray documentation
- **Template issues**: Use receipts page for configuration
- **Printing issues**: Check printer connection and settings

### **User Training**
- **Cashier training**: Focus on normal transaction flow
- **Manager training**: Template and printer configuration
- **Admin training**: System-wide printing management

---

## 🎉 Summary

The KQS POS system now provides **comprehensive, automatic receipt printing** for all transaction types. Every sale, refund, laybye payment, and administrative transaction automatically generates and prints the appropriate receipt using the configured thermal printer or browser printing as a fallback.

**Key Benefits:**
- ✅ **Zero manual intervention** required
- ✅ **All transaction types** supported
- ✅ **QZ Tray integration** for thermal printers
- ✅ **Browser fallback** for universal compatibility
- ✅ **Template customization** per branch
- ✅ **Error handling** with user feedback
- ✅ **Professional receipts** with proper formatting

The integration is **production-ready** and provides a seamless experience for both cashiers and customers, ensuring every transaction is properly documented with a printed receipt.

## 🚨 **CRITICAL SETUP CHECKLIST**

Before using the printing system, ensure:

1. ✅ **QZ Tray installed** and running
2. ✅ **All 16 templates created** in receipts page
3. ✅ **Default printer selected** in printers page
4. ✅ **Templates customized** with business information
5. ✅ **Test printing successful** for each template type
6. ✅ **Branch-specific templates** configured
7. ✅ **QZ Tray connection** verified

**If any step fails, the system will fall back to browser printing automatically.**
