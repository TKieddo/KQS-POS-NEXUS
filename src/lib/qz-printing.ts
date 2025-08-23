// QZ Tray printing utilities for KQS POS
// Based on the working demo approach
// Usage: import { printReceipt, openCashDrawer, printReceiptAndOpenDrawer } from '@/lib/qz-printing'

declare var qz: any

export async function printReceipt(printerName: string, data: string | string[], options?: any) {
  if (!qz) throw new Error('QZ Tray not loaded');
  if (!qz.websocket.isActive()) throw new Error('QZ Tray not connected');
  
  const config = qz.configs.create(printerName, options);
  const printData = Array.isArray(data) ? data : [data];
  
  await qz.print(config, printData);
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