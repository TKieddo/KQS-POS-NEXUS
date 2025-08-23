"use client";

import { StoreInfo, ReceiptItem, Tenant } from '@/types';
import Image from 'next/image';

interface LuxuryReceiptPreviewProps {
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

export default function LuxuryReceiptPreview({
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
}: LuxuryReceiptPreviewProps) {
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
      border: '1px solid #e5e5e5',
              width: '190mm', // A4 width minus margins for better printing
        maxWidth: '190mm',
        height: '297mm', 
      maxHeight: '297mm',
      position: 'relative',
      fontFamily: "'Montserrat', 'Inter', 'Helvetica', sans-serif",
      fontSize: '13px',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Watermark - centered and very light */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '80px',
        color: 'rgba(220, 38, 38, 0.05)', // Very light red color (changed from gold)
        fontWeight: 'bold',
        zIndex: 0,
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none'
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
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dc2626' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      {/* Header with white background */}
      <div className="relative" style={{ 
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        padding: '15px 0',
        overflow: 'hidden',
        backgroundColor: 'white',
        borderBottom: '1px solid #eaeaea'
      }}>        
        <div className="flex justify-between items-center px-8">
          <div style={{ 
            position: 'relative',
            height: '110px',
            width: 'auto',
            aspectRatio: '678/300' // Maintain the exact aspect ratio of the logo
          }}>
            <Image
              src="/assets/KQS-Receipt-logo.png"
              alt="KQS Property Development"
              fill
              style={{ 
                objectFit: 'contain', 
                objectPosition: 'left'
              }}
              priority
            />
          </div>
          <div style={{ color: '#dc2626' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.2em' }}>
              INVOICE
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Invoice details and client info */}
        <div className="flex justify-between mb-6">
          {/* Company info */}
          <div className="w-1/2">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#dc2626' }}>KQS PROPERTY DEVELOPMENT</h2>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '3px' }}>P.O.BOX 3</p>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '3px' }}>OPPOSITE EDUCATION</p>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '3px' }}>MOKHOTLONG 500</p>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '3px' }}>LESOTHO</p>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '3px' }}>kqspropertydevelopment@yahoo.com</p>
            <p style={{ fontSize: '13px', color: '#555' }}>+266 27004584/ +266 62001684</p>
          </div>
          
          {/* Invoice details - now with black background and rounded corners */}
          <div className="w-2/5">
            <div style={{ 
              backgroundColor: '#000000', 
              padding: '16px', 
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px' }}>
                <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 700 }}>INVOICE NO.</div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '13px', color: '#dc2626' }}>{receiptNumber}</div>
                
                <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 700 }}>DATE</div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#dc2626' }}>{formattedDate}</div>
                
                <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 700 }}>DUE DATE</div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#dc2626' }}>{formattedDueDate}</div>
                
                <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 700 }}>SHIP BY</div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#dc2626' }}>{shipBy}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Client info */}
        <div className="mb-6">
          <div style={{ 
            display: 'inline-block', 
            borderBottom: '2px solid #000', 
            marginBottom: '8px', 
            paddingBottom: '2px' 
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>BILL TO</h3>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{tenantInfo.name || "Client Name"}</p>
            <p style={{ fontSize: '13px', marginBottom: '3px' }}>{tenantInfo.address || "Client Address"}</p>
            <p style={{ fontSize: '13px' }}>LESOTHO</p>
          </div>
        </div>
        
        {/* Invoice table - with black table headers and rounded corners */}
        <div className="mb-6">
          <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', color: 'white' }}>
                <th style={{ 
                  padding: '10px 12px', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  width: '10%',
                  fontSize: '13px'
                }}>ITEM</th>
                <th style={{ 
                  padding: '10px 12px', 
                  textAlign: 'center', 
                  fontWeight: 700, 
                  width: '10%',
                  fontSize: '13px'
                }}>QTY</th>
                <th style={{ 
                  padding: '10px 12px', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  width: '40%',
                  fontSize: '13px'
                }}>DESCRIPTION</th>
                <th style={{ 
                  padding: '10px 12px', 
                  textAlign: 'right', 
                  fontWeight: 700, 
                  width: '20%',
                  fontSize: '13px'
                }}>UNIT PRICE</th>
                <th style={{ 
                  padding: '10px 12px', 
                  textAlign: 'right', 
                  fontWeight: 700, 
                  width: '20%',
                  fontSize: '13px'
                }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px' }}>
                      {item.name}{item.description ? `, ${item.description}` : ''}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px' }}>
                      {item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500, fontSize: '13px' }}>
                      {(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td colSpan={5} style={{ padding: '20px 12px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                    No items added to invoice
                  </td>
                </tr>
              )}

              {/* Empty rows for consistent spacing - reduced by 1 more row (from 6 to 5) */}
              {Array(Math.max(0, 5 - items.length)).fill(0).map((_, index) => (
                <tr key={`empty-${index}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', height: '28px', fontSize: '13px' }}>&nbsp;</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}></td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}></td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}></td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals and Bank details */}
        <div className="flex mb-6">
          {/* Bank details */}
          <div className="w-3/5 pr-6">
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: 700, 
              marginBottom: '10px', 
              borderBottom: '2px solid #000', 
              paddingBottom: '2px', 
              display: 'inline-block' 
            }}>PAYMENT DETAILS</h3>
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '14px', 
              borderRadius: '8px',
              border: '1px solid #eaeaea'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px' }}>
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>BANK:</div>
                <div style={{ fontSize: '13px' }}>NEDBANK</div>
                
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>ACCOUNT NAME:</div>
                <div style={{ fontSize: '13px' }}>KQS PROPERTY DEVELOPMENT</div>
                
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>ACCOUNT #:</div>
                <div style={{ fontSize: '13px' }}>11990265455</div>
                
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>BRANCH:</div>
                <div style={{ fontSize: '13px' }}>BUTHA-BUTHE</div>
                
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>BRANCH CODE:</div>
                <div style={{ fontSize: '13px' }}>390161</div>
                
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>SWIFT:</div>
                <div style={{ fontSize: '13px' }}>NEDLLSMX</div>
              </div>
            </div>
          </div>
          
          {/* Totals */}
          <div className="w-2/5">
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                borderBottom: '1px solid #eaeaea', 
              }}>
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>SUBTOTAL</div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>
                  {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                borderBottom: '1px solid #eaeaea', 
              }}>
                <div style={{ fontWeight: 500, color: '#666', fontSize: '13px' }}>VAT (0%)</div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>0.00</div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '10px',
                backgroundColor: '#000', 
                color: '#fff', 
                padding: '12px', 
                borderRadius: '8px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>TOTAL DUE</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>M {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and signature */}
        <div style={{ textAlign: 'center', paddingTop: '14px', borderTop: '1px solid #eaeaea' }}>
          <p style={{ color: '#666', marginBottom: '6px', fontSize: '13px' }}>Payment due within 30 days. Please include invoice number with your payment.</p>
          <p style={{ fontWeight: 500, color: '#dc2626', fontSize: '14px' }}>THANK YOU FOR YOUR BUSINESS</p>
        </div>
      </div>
    </div>
  );
} 