// QZ Tray printing utilities for KQS POS
// Based on the working demo approach
// Usage: import { printReceipt, openCashDrawer, printReceiptAndOpenDrawer } from '@/lib/qz-printing'

declare var qz: any

export async function printReceipt(printerName: string, data: string | string[], options?: any) {
  if (!qz) throw new Error('QZ Tray not loaded');
  if (!qz.websocket.isActive()) throw new Error('QZ Tray not connected');
  
  console.log('🖨️ Starting print job to printer:', printerName);
  console.log('🖨️ QZ Tray status:', qz.websocket.isActive());
  
  // Get available printers to verify the printer exists
  const availablePrinters = await qz.printers.find();
  console.log('🖨️ Available printers:', availablePrinters);
  
  if (!availablePrinters.includes(printerName)) {
    throw new Error(`Printer "${printerName}" not found. Available printers: ${availablePrinters.join(', ')}`);
  }
  
  // Create proper QZ Tray configuration for thermal printers
  const config = qz.configs.create(printerName, {
    rasterize: false,
    orientation: 'portrait',
    colorType: 'color',
    copies: 1,
    density: 8,
    jobName: 'KQS Receipt',
    perSpool: 1,
    // Force direct printing (not to file)
    host: undefined,
    port: undefined,
    ...options
  });
  
  const printData = Array.isArray(data) ? data : [data];
  
  console.log('🖨️ Print configuration:', config);
  console.log('🖨️ Print data length:', printData.length);
  console.log('🖨️ First few lines of data:', printData.slice(0, 3));
  
  try {
    await qz.print(config, printData);
    console.log('✅ Print job sent successfully to QZ Tray');
  } catch (error) {
    console.error('❌ Print job failed:', error);
    throw error;
  }
}

export async function openCashDrawer(printerName: string) {
  if (!qz) throw new Error('QZ Tray not loaded');
  if (!qz.websocket.isActive()) throw new Error('QZ Tray not connected');
  
  const config = qz.configs.create(printerName);
  
  // ESC/POS open drawer command (common for thermal printers)
  const openDrawerCmd = String.fromCharCode(27) + "p" + String.fromCharCode(0) + String.fromCharCode(25) + String.fromCharCode(250);
  
  await qz.print(config, [openDrawerCmd]);
}

export async function printReceiptAndOpenDrawer(printerName: string, data: string | string[], options?: any) {
  await printReceipt(printerName, data, options);
  await openCashDrawer(printerName);
}

// Debug function to test QZ Tray connection and printer setup
export async function testQzTrayConnection() {
  if (!qz) {
    console.error('❌ QZ Tray library not loaded');
    return { success: false, error: 'QZ Tray library not loaded' };
  }
  
  try {
    console.log('🔍 Testing QZ Tray connection...');
    
    // Check connection status
    const isConnected = qz.websocket.isActive();
    console.log('🔍 QZ Tray connected:', isConnected);
    
    if (!isConnected) {
      console.log('🔍 Attempting to connect...');
      await qz.websocket.connect();
      console.log('✅ QZ Tray connected successfully');
    }
    
    // Get available printers
    const printers = await qz.printers.find();
    console.log('🔍 Available printers:', printers);
    
    // Test printer configuration
    if (printers.length > 0) {
      const testPrinter = printers[0];
      console.log('🔍 Testing printer configuration for:', testPrinter);
      
      const config = qz.configs.create(testPrinter, {
        rasterize: false,
        orientation: 'portrait',
        colorType: 'color',
        copies: 1,
        density: 8,
        jobName: 'Test Print'
      });
      
      console.log('🔍 Test printer config:', config);
      
      return {
        success: true,
        connected: true,
        printers: printers,
        testPrinter: testPrinter,
        config: config
      };
    } else {
      return {
        success: false,
        error: 'No printers found',
        connected: isConnected,
        printers: []
      };
    }
  } catch (error) {
    console.error('❌ QZ Tray test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
      printers: []
    };
  }
}

// Helper function to convert image to base64 for QZ Tray
async function convertImageToBase64(imagePath: string): Promise<string> {
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

// New function to create beautiful retail receipts using the template system
export async function createBeautifulRetailReceipt(data: {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessWebsite: string;
  businessFacebook: string;
  businessTagline: string;
  returnPolicyEnglish: string;
  returnPolicySesotho: string;
  thankYouMessage: string;
  footerText: string;
  showQrSection: boolean;
  showPolicySection: boolean;
  showPointsSection: boolean;
  showTagline: boolean;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer?: string;
  items: Array<{ name: string; quantity: number; price: number; total: number; category?: string }>;
  subtotal: number;
  tax: number;
  discount: number;
  pointsUsed?: number;
  pointsEarned?: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
}) {
  const printData: any[] = []
  printData.push(ESC + "@") // Initialize printer

  // Logo (centered)
  printData.push(ESC + "a" + "\x01")
  try {
    const base64Logo = await convertImageToBase64('/images/receipts/KQS RECEIPT LOGO-Photoroom.png')
    printData.push({
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
    // Fallback to text if logo fails
    printData.push(ESC + "!" + "\x08")
    printData.push(ESC + "E" + "\x01")
    printData.push(data.businessName + NEWLINE)
    printData.push(ESC + "E" + "\x00")
    printData.push(ESC + "!" + "\x00")
  }

  // Receipt title
  printData.push("Retail Receipt" + NEWLINE)
  printData.push(ESC + "a" + "\x00") // Left alignment

  // Receipt details
  printData.push(`Receipt #: ${data.receiptNumber}` + NEWLINE)
  printData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  printData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    printData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  printData.push("------------------------------------------" + NEWLINE)

  // Items table header
  printData.push(ESC + "E" + "\x01") // Bold on
  printData.push("Description                    Total" + NEWLINE)
  printData.push(ESC + "E" + "\x00") // Bold off
  printData.push("------------------------------------------" + NEWLINE)

  // Items
  data.items.forEach(item => {
    const name = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name.padEnd(25)
    const total = data.total.toFixed(2).padStart(10)
    printData.push(`${name} x${item.quantity}            ${total}` + NEWLINE)
  })

  printData.push("------------------------------------------" + NEWLINE)

  // Totals
  printData.push(`Subtotal                      ${data.subtotal.toFixed(2)}` + NEWLINE)
  printData.push(`Tax                           ${data.tax.toFixed(2)}` + NEWLINE)
  if (data.discount > 0) {
    printData.push(`Discount                      -${data.discount.toFixed(2)}` + NEWLINE)
  }
  if (data.showPointsSection && data.pointsUsed && data.pointsUsed > 0) {
    printData.push(`Points Used                   -${data.pointsUsed}` + NEWLINE)
  }
  
  // Major divider before TOTAL
  printData.push("==========================================" + NEWLINE)
  printData.push(ESC + "E" + "\x01") // Bold on
  printData.push(`TOTAL                         ${data.total.toFixed(2)}` + NEWLINE)
  printData.push(ESC + "E" + "\x00") // Bold off
  
  // Payment details
  printData.push(`${data.paymentMethod}                         ${data.amountPaid.toFixed(2)}` + NEWLINE)
  printData.push(`Change                        ${data.change.toFixed(2)}` + NEWLINE)
  
  if (data.showPointsSection && data.pointsEarned && data.pointsEarned > 0) {
    printData.push(ESC + "E" + "\x01") // Bold on
    printData.push(`Points Earned: ${data.pointsEarned}` + NEWLINE)
    printData.push(ESC + "E" + "\x00") // Bold off
  }
  
  printData.push("------------------------------------------" + NEWLINE)

  // Business tagline
  if (data.showTagline) {
    printData.push(ESC + "a" + "\x01") // Center alignment
    printData.push(data.businessTagline + NEWLINE)
    printData.push(ESC + "a" + "\x00") // Left alignment
    printData.push("------------------------------------------" + NEWLINE)
  }

  // Return & Exchange Policy
  if (data.showPolicySection) {
    printData.push(ESC + "a" + "\x01") // Center alignment
    printData.push(ESC + "E" + "\x01") // Bold on
    printData.push("Return & Exchange Policy" + NEWLINE)
    printData.push(ESC + "E" + "\x00") // Bold off
    printData.push(ESC + "a" + "\x00") // Left alignment
    printData.push(data.returnPolicyEnglish + NEWLINE)
    printData.push(data.returnPolicySesotho + NEWLINE)
    printData.push("------------------------------------------" + NEWLINE)
  }

  // QR/Promo section
  if (data.showQrSection) {
    // Footer text
    if (data.footerText) {
      printData.push(ESC + "a" + "\x01") // Center alignment
      printData.push(ESC + "E" + "\x01") // Bold on
      printData.push(data.footerText + NEWLINE)
      printData.push(ESC + "E" + "\x00") // Bold off
      printData.push(ESC + "a" + "\x00") // Left alignment
    }

    printData.push(ESC + "a" + "\x01") // Center alignment
    printData.push(data.businessWebsite + NEWLINE)
    printData.push(ESC + "a" + "\x00") // Left alignment

    printData.push(NEWLINE)

    // Contact info
    printData.push(ESC + "E" + "\x01") // Bold on
    printData.push("Address:")
    printData.push(ESC + "E" + "\x00") // Bold off
    printData.push(" " + data.businessAddress + NEWLINE)
    
    printData.push(ESC + "E" + "\x01") // Bold on
    printData.push("Phone:")
    printData.push(ESC + "E" + "\x00") // Bold off
    printData.push(" " + data.businessPhone + NEWLINE)
    
    printData.push(ESC + "E" + "\x01") // Bold on
    printData.push("Facebook:")
    printData.push(ESC + "E" + "\x00") // Bold off
    printData.push(" " + data.businessFacebook + NEWLINE)
  }

  printData.push("------------------------------------------" + NEWLINE)

  // Thank you message
  printData.push(ESC + "a" + "\x01") // Center alignment
  printData.push(ESC + "E" + "\x01") // Bold on
  printData.push(data.thankYouMessage + NEWLINE)
  printData.push(ESC + "E" + "\x00") // Bold off
  printData.push(ESC + "a" + "\x00") // Left alignment

  // Cut paper
  printData.push(ESC + "i")

  return printData
}

// Helper function to create ESC/POS formatted receipt data
export function createEscPosReceipt(data: {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer?: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
}) {
  const lines: string[] = [];
  
  // Header
  lines.push('\x1B\x40'); // Initialize printer
  lines.push('\x1B\x61\x01'); // Center alignment
  lines.push(data.businessName);
  lines.push(data.businessAddress);
  lines.push(data.businessPhone);
  lines.push('');
  
  // Receipt info
  lines.push('\x1B\x61\x00'); // Left alignment
  lines.push(`Receipt #: ${data.receiptNumber}`);
  lines.push(`Date: ${data.date} Time: ${data.time}`);
  lines.push(`Cashier: ${data.cashier}`);
  if (data.customer) {
    lines.push(`Customer: ${data.customer}`);
  }
  lines.push('');
  
  // Items
  lines.push('\x1B\x45\x01'); // Bold on
  lines.push('Item                    Qty    Price    Total');
  lines.push('\x1B\x45\x00'); // Bold off
  lines.push('----------------------------------------');
  
  data.items.forEach(item => {
    const name = item.name.padEnd(20).substring(0, 20);
    const qty = item.quantity.toString().padStart(3);
    const price = item.price.toFixed(2).padStart(8);
    const total = item.total.toFixed(2).padStart(8);
    lines.push(`${name} ${qty} ${price} ${total}`);
  });
  
  lines.push('----------------------------------------');
  
  // Totals
  lines.push(`Subtotal:${data.subtotal.toFixed(2).padStart(33)}`);
  if (data.tax) {
    lines.push(`Tax:${data.tax.toFixed(2).padStart(37)}`);
  }
  lines.push('\x1B\x45\x01'); // Bold on
  lines.push(`TOTAL:${data.total.toFixed(2).padStart(35)}`);
  lines.push('\x1B\x45\x00'); // Bold off
  
  lines.push(`Payment: ${data.paymentMethod}`);
  lines.push(`Amount Paid:${data.amountPaid.toFixed(2).padStart(30)}`);
  lines.push(`Change:${data.change.toFixed(2).padStart(34)}`);
  
  // Footer
  lines.push('');
  lines.push('\x1B\x61\x01'); // Center alignment
  lines.push('Thank you for shopping with us!');
  lines.push('');
  lines.push('\x1B\x61\x00'); // Left alignment
  lines.push('\x1B\x69'); // Cut paper
  
  return lines;
}

// Helper function to create ZPL label data
export function createZplLabel(data: {
  text: string;
  barcode?: string;
  x?: number;
  y?: number;
}) {
  const x = data.x || 50;
  const y = data.y || 50;
  
  const lines: string[] = [];
  lines.push('^XA'); // Start ZPL
  lines.push(`^FO${x},${y}^A0N,30,30^FD${data.text}^FS`); // Text
  
  if (data.barcode) {
    lines.push(`^FO${x},${y + 40}^BY3^BCN,100,Y,N,N^FD${data.barcode}^FS`); // Barcode
  }
  
  lines.push('^XZ'); // End ZPL
  return lines;
} 