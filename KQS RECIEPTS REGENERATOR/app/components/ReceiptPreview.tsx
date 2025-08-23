"use client";

import { StoreInfo, ReceiptItem, Tenant } from '@/types';
import Image from 'next/image';

interface ReceiptPreviewProps {
  storeInfo: StoreInfo;
  items: ReceiptItem[];
  receiptNumber: string;
  tenantInfo: Tenant;
  subtotal: number;
  taxAmount: number;
  total: number;
  date: Date;
  dueDate: Date;
  shipBy: string;
  paymentMethod: string;
  notes: string;
}

export default function ReceiptPreview({
  storeInfo,
  items,
  receiptNumber,
  tenantInfo,
  subtotal,
  taxAmount,
  total,
  date,
  dueDate,
  shipBy,
  paymentMethod,
  notes
}: ReceiptPreviewProps) {
  const formattedDate = new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\//g, '/');

  const formattedDueDate = new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dueDate).replace(/\//g, '/');

  return (
    <div className="receipt-container mx-auto bg-white" style={{ 
      border: '6px solid #C1272D', 
      outline: '1px solid #800000',
      outlineOffset: '-3px',
      maxWidth: '190mm', // A4 width minus margins for better printing
      width: '100%',
      position: 'relative',
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontSize: '11px',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Watermark */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '60px',
        color: 'rgba(193, 39, 45, 0.03)',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        KQS AUTHENTIC
      </div>
      
      {/* Subtle pattern overlay for security */}
      <div style={{ 
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23C1272D' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      
      <div className="p-5" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header section */}
        <div className="flex justify-between items-start mb-2">
          {/* Logo and contact info */}
          <div className="w-3/5">
            <div className="relative" style={{ 
              height: '80px',
              width: 'auto',
              aspectRatio: '678/300' 
            }}>
              <Image
                src="/assets/KQS-Receipt-logo.png"
                alt="KQS Property Development"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
              />
            </div>
            
            {/* Contact info box */}
            <div className="border border-gray-300 rounded-md text-center p-2 mt-2 mb-2 w-4/5 shadow-sm">
              <div className="text-xs">kqspropertydevelopment@yahoo.com</div>
              <div className="text-xs">+266 27004584/ +266 62001684</div>
            </div>
          </div>
          
          {/* Invoice heading */}
          <div className="pt-2 text-right">
            <h1 className="text-3xl font-bold mb-4 tracking-wide" style={{ color: '#C1272D' }}>INVOICE</h1>
          </div>
        </div>
        
        {/* Address and invoice details */}
        <div className="flex justify-between mb-3">
          {/* Address */}
          <div className="w-1/2">
            <p className="my-0.5 text-gray-700">P.O.BOX 3</p>
            <p className="my-0.5 text-gray-700">OPPOSITE EDUCATION</p>
            <p className="my-0.5 text-gray-700">MOKHOTLONG 500</p>
            <p className="my-0.5 text-gray-700">LESOTHO</p>
            <p className="my-0.5 text-blue-600">kqspropertydevelopment@yahoo.com</p>
          </div>
          
          {/* Invoice details - Right aligned labels */}
          <div className="w-1/2">
            <div className="flex justify-end mb-0.5">
              <div className="font-medium mr-2">Date:</div>
              <div>{formattedDate}</div>
            </div>
            
            <div className="flex justify-end mb-0.5">
              <div className="font-medium mr-2">Invoice No.:</div>
              <div>{receiptNumber}</div>
            </div>
            
            <div className="flex justify-end mb-0.5">
              <div className="font-medium mr-2">Due Date:</div>
              <div>{formattedDueDate}</div>
            </div>
            
            <div className="flex justify-end mb-0.5">
              <div className="font-medium mr-2">Ship By:</div>
              <div>{shipBy}</div>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="flex w-full my-2 rounded-md overflow-hidden shadow-sm">
          <div className="py-1.5 text-center text-white font-bold flex-1" style={{ backgroundColor: '#00AA00' }}>
            KQS PROPERTY
          </div>
          <div className="py-1.5 text-center text-white font-bold flex-1 bg-black">
            DEVELOPMENT(PTY)LTD
          </div>
        </div>

        {/* Billing information */}
        <div className="mb-3 mt-4">
          <div className="font-medium text-gray-700">Bill To:</div>
          <div className="mt-1">
            <p className="font-semibold">{tenantInfo.name}</p>
            {tenantInfo.address && <p>{tenantInfo.address}</p>}
            <p>LESOTHO</p>
          </div>
        </div>

        {/* Invoice table - Fixed height container */}
        <div style={{ height: '250px', overflowY: 'hidden' }}>
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 font-medium text-center text-white w-[10%]" style={{ backgroundColor: '#C1272D' }}>
                  Item
                </th>
                <th className="py-2 px-3 font-medium text-center text-white w-[10%]" style={{ backgroundColor: '#C1272D' }}>
                  Qty
                </th>
                <th className="py-2 px-3 font-medium text-center text-white w-[40%]" style={{ backgroundColor: '#C1272D' }}>
                  Description
                </th>
                <th className="py-2 px-3 font-medium text-center text-white w-[20%]" style={{ backgroundColor: '#C1272D' }}>
                  Unit Price
                </th>
                <th className="py-2 px-3 font-medium text-center text-white w-[20%]" style={{ backgroundColor: '#C1272D' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border-b border-gray-200 p-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border-b border-gray-200 p-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border-b border-gray-200 p-2 text-left">
                      {item.name}{item.description ? `, ${item.description}` : ''}
                    </td>
                    <td className="border-b border-gray-200 p-2 text-right">
                      {item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border-b border-gray-200 p-2 text-right font-medium">
                      {(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No items added to invoice
                  </td>
                </tr>
              )}
              
              {/* Empty rows to fill the fixed height table - removed backgrounds */}
              {Array(Math.max(0, 8 - items.length)).fill(0).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border-b border-gray-200 p-2" style={{ height: '28px' }}></td>
                  <td className="border-b border-gray-200"></td>
                  <td className="border-b border-gray-200"></td>
                  <td className="border-b border-gray-200"></td>
                  <td className="border-b border-gray-200"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals and Bank Details layout */}
        <div className="flex my-3">
          {/* Bank details - moved to the left */}
          <div className="w-3/5 pr-4">
            <p className="font-semibold mb-2">BANK DETAILS</p>
            <div className="rounded-md p-3 shadow-sm" style={{ backgroundColor: 'rgba(249, 249, 249, 0.7)' }}>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-medium py-1 w-1/4 pr-1 text-gray-700">BANK NAME:</td>
                    <td className="py-1">NEDBANK</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1 pr-1 text-gray-700">ACCOUNT NAME:</td>
                    <td className="py-1">KQS PROPERTY DEVELOPMENT</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1 pr-1 text-gray-700">ACCOUNT NUMBER:</td>
                    <td className="py-1">11990265455</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1 pr-1 text-gray-700">BRANCH NAME:</td>
                    <td className="py-1">BUTHA-BUTHE</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1 pr-1 text-gray-700">BRANCH CODE:</td>
                    <td className="py-1">390161</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1 pr-1 text-gray-700">Swift Address:</td>
                    <td className="py-1">NEDLLSMX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Totals - Right side - with more transparent background */}
          <div className="w-2/5 flex justify-end">
            <div className="shadow-sm rounded-md overflow-hidden">
              <table className="w-full max-w-[200px] border-collapse">
                <tbody>
                  <tr>
                    <td className="border-b border-gray-200 p-2 text-right font-medium" style={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}>
                      Sub Total
                    </td>
                    <td className="border-b border-gray-200 p-2 text-right" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                      {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-200 p-2 text-right font-medium" style={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}>
                      VAT
                    </td>
                    <td className="border-b border-gray-200 p-2 text-right" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                      0.00
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-right font-medium" style={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}>
                      Due Amount
                    </td>
                    <td className="p-2 text-right font-bold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#C1272D' }}>
                      M{subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center font-medium mt-4 pt-3 border-t border-gray-200">
          <p style={{ color: '#C1272D' }}>THANK YOU FOR YOUR BUSINESS</p>
        </div>
      </div>
    </div>
  );
} 