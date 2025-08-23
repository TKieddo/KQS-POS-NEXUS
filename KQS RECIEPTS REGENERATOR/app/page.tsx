"use client";

import { useState, useEffect } from 'react';
import StoreSettings from '@/app/components/StoreSettings';
import ReceiptForm from '@/app/components/ReceiptForm';
import ReceiptPreview from '@/app/components/ReceiptPreview';
import LuxuryReceiptPreview from '@/app/components/LuxuryReceiptPreview';
import { StoreInfo, ReceiptItem, Tenant } from '@/types';
import { Printer, Download, Settings, LayoutTemplate } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Function to generate a new invoice number
const generateInvoiceNumber = (lastNumber?: string) => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const datePart = `${day}${month}${year}`; // Format: DDMMYY
  
  // If we have a last invoice number, check if it's from today
  if (lastNumber && lastNumber.length >= 12) { // KQSPD + 6 digits date + 2 digits sequence
    const invoiceDate = lastNumber.replace('KQSPD', '').slice(0, 6);
    
    if (invoiceDate === datePart) {
      // Same day, increment the sequence number
      const sequenceNumber = parseInt(lastNumber.slice(-2), 10) || 0;
      const nextSequence = (sequenceNumber + 1).toString().padStart(2, '0');
      return `KQSPD${datePart}${nextSequence}`;
    }
  }
  
  // New day or first invoice, start with 01
  return `KQSPD${datePart}01`;
};

export default function ReceiptGenerator() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('storeInfo');
      return saved ? JSON.parse(saved) : {
        name: 'KQS PROPERTY DEVELOPMENT (PTY) LTD',
        address: 'P.O.BOX 3',
        city: 'MOKHOTLONG 500',
        postalCode: '',
        phone: '+266 27004584/ +266 62001684',
        email: 'kqspropertydevelopment@yahoo.com',
        website: '',
        taxRate: 0,
        vatNumber: '',
        companyRegistration: ''
      };
    }
    return {
      name: 'KQS PROPERTY DEVELOPMENT (PTY) LTD',
      address: 'P.O.BOX 3',
      city: 'MOKHOTLONG 500',
      postalCode: '',
      phone: '+266 27004584/ +266 62001684',
      email: 'kqspropertydevelopment@yahoo.com',
      website: '',
      taxRate: 0,
      vatNumber: '',
      companyRegistration: ''
    };
  });

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [receiptNumber, setReceiptNumber] = useState<string>(() => generateInvoiceNumber());
  
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30);
  
  const [invoiceDate, setInvoiceDate] = useState<Date>(today);
  const [invoiceDueDate, setInvoiceDueDate] = useState<Date>(dueDate);
  const [shipBy, setShipBy] = useState<string>('Kabeli Tuke');
  
  const [tenantInfo, setTenantInfo] = useState<Tenant>({
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>('EFT');
  const [notes, setNotes] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [luxuryTemplate, setLuxuryTemplate] = useState<boolean>(false);

  // Initialize state from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
      if (lastInvoiceNumber) {
        setReceiptNumber(generateInvoiceNumber(lastInvoiceNumber));
      }
      
      const templateChoice = localStorage.getItem('templateChoice');
      if (templateChoice === 'luxury') {
        setLuxuryTemplate(true);
      }
    }
  }, []);

  // Save store info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
  }, [storeInfo]);
  
  // Save the current invoice number when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastInvoiceNumber', receiptNumber);
    }
  }, [receiptNumber]);
  
  // Save template choice
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('templateChoice', luxuryTemplate ? 'luxury' : 'standard');
    }
  }, [luxuryTemplate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const receiptElement = document.querySelector('.receipt-container');
    if (!receiptElement) return;
    
    try {
      const canvas = await html2canvas(receiptElement as HTMLElement, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 0
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0); // Use highest quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false // Better quality
      });
      
      // For A4 size - width: 210mm, height: 297mm
      const imgWidth = 210; // Full A4 width
      const imgHeight = 297; // Full A4 height
      
      // Add the image at full A4 size with no margins for perfect fit
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate new invoice number after successful PDF generation
      setReceiptNumber(generateInvoiceNumber(receiptNumber));
      
      pdf.save(`KQS_Invoice_${receiptNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (storeInfo.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 print:hidden">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-kqsBlack">KQS Invoice Generator</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setLuxuryTemplate(!luxuryTemplate)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                title={luxuryTemplate ? "Switch to standard template" : "Switch to luxury template"}
              >
                <LayoutTemplate size={18} />
                {luxuryTemplate ? "Standard Template" : "Luxury Template"}
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>
        </header>

        {showSettings ? (
          <StoreSettings storeInfo={storeInfo} setStoreInfo={setStoreInfo} onClose={() => setShowSettings(false)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="print:hidden">
              <ReceiptForm 
                items={items} 
                setItems={setItems} 
                receiptNumber={receiptNumber}
                setReceiptNumber={setReceiptNumber}
                tenantInfo={tenantInfo}
                setTenantInfo={setTenantInfo}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                notes={notes}
                setNotes={setNotes}
                taxRate={storeInfo.taxRate}
                invoiceDate={invoiceDate}
                setInvoiceDate={setInvoiceDate}
                invoiceDueDate={invoiceDueDate}
                setInvoiceDueDate={setInvoiceDueDate}
                shipBy={shipBy}
                setShipBy={setShipBy}
              />
              
              <div className="mt-6 flex gap-4">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-kqsRed text-white rounded-lg hover:opacity-90"
                >
                  <Printer size={18} />
                  Print Invoice
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-kqsBlack text-white rounded-lg hover:opacity-90"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-md">
              {luxuryTemplate ? (
                <LuxuryReceiptPreview 
                  storeInfo={storeInfo}
                  items={items}
                  receiptNumber={receiptNumber}
                  tenantInfo={tenantInfo}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  total={total}
                  date={invoiceDate}
                  dueDate={invoiceDueDate}
                  shipBy={shipBy}
                  paymentMethod={paymentMethod}
                  notes={notes}
                />
              ) : (
                <ReceiptPreview 
                  storeInfo={storeInfo}
                  items={items}
                  receiptNumber={receiptNumber}
                  tenantInfo={tenantInfo}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  total={total}
                  date={invoiceDate}
                  dueDate={invoiceDueDate}
                  shipBy={shipBy}
                  paymentMethod={paymentMethod}
                  notes={notes}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 