"use client";

import { useState } from 'react';
import { ReceiptItem, Tenant } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface ReceiptFormProps {
  items: ReceiptItem[];
  setItems: (items: ReceiptItem[]) => void;
  receiptNumber: string;
  setReceiptNumber: (num: string) => void;
  tenantInfo: Tenant;
  setTenantInfo: (tenant: Tenant) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  taxRate: number;
  invoiceDate: Date;
  setInvoiceDate: (date: Date) => void;
  invoiceDueDate: Date;
  setInvoiceDueDate: (date: Date) => void;
  shipBy: string;
  setShipBy: (shipBy: string) => void;
}

export default function ReceiptForm({ 
  items, 
  setItems, 
  receiptNumber, 
  setReceiptNumber,
  tenantInfo,
  setTenantInfo,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes,
  taxRate,
  invoiceDate,
  setInvoiceDate,
  invoiceDueDate,
  setInvoiceDueDate,
  shipBy,
  setShipBy
}: ReceiptFormProps) {
  const [newItem, setNewItem] = useState<Omit<ReceiptItem, 'id'>>({
    name: '',
    price: 0,
    quantity: 1,
    description: ''
  });

  const handleAddItem = () => {
    if (!newItem.name || newItem.price <= 0) return;
    
    setItems([...items, { ...newItem, id: uuidv4() }]);
    setNewItem({
      name: '',
      price: 0,
      quantity: 1,
      description: ''
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'price' || name === 'quantity' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTenantInfo({
      ...tenantInfo,
      [name]: value
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (date: Date) => void) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setter(date);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Invoice Information</h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="e.g., KQSPD0001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md bg-white",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            >
              <option value="Cash">Cash</option>
              <option value="EFT">EFT</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={invoiceDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e, setInvoiceDate)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md bg-white",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={invoiceDueDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e, setInvoiceDueDate)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md bg-white",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship By
            </label>
            <input
              type="text"
              value={shipBy}
              onChange={(e) => setShipBy(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="e.g., Kabeli Tuke"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Tenant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name
            </label>
            <input
              type="text"
              name="name"
              value={tenantInfo.name}
              onChange={handleTenantChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="e.g., LEWIS SHOP NO:2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={tenantInfo.contactPerson}
              onChange={handleTenantChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="Contact person name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={tenantInfo.address}
              onChange={handleTenantChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="e.g., MOKHOTLONG BRANCH"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={tenantInfo.phone}
              onChange={handleTenantChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={tenantInfo.email}
              onChange={handleTenantChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="Email address"
            />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Items</h3>
      
      {items.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 font-medium text-gray-700 mb-2 text-sm">
            <div className="col-span-1">Item</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>
          
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-1 text-center">{index + 1}</div>
              <div className="col-span-1 text-center">{item.quantity}</div>
              <div className="col-span-5">
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500">{item.description}</div>
                )}
              </div>
              <div className="col-span-2 text-right">{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="col-span-2 text-right">{(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="col-span-1 text-center">
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="h-px bg-gray-200 my-4"></div>
          
          <div className="grid grid-cols-12 gap-2 mb-1">
            <div className="col-span-9 text-right font-medium">Subtotal:</div>
            <div className="col-span-2 text-right font-medium">
              {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="grid grid-cols-12 gap-2 mb-1">
            <div className="col-span-9 text-right font-medium">VAT:</div>
            <div className="col-span-2 text-right font-medium">
              {(items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (taxRate / 100)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="grid grid-cols-12 gap-2 text-lg">
            <div className="col-span-9 text-right font-bold">Total:</div>
            <div className="col-span-2 text-right font-bold">
              M{(
                items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 
                (1 + (taxRate / 100))
              ).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="text-md font-medium mb-3">Add New Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={handleItemChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
              placeholder="e.g., Rent for December 2024, Mokhotlong branch."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={newItem.price || ''}
                onChange={handleItemChange}
                min="0"
                step="0.01"
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={newItem.quantity}
                onChange={handleItemChange}
                min="1"
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details (Optional)
          </label>
          <textarea
            name="description"
            value={newItem.description}
            onChange={handleItemChange}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
            rows={2}
            placeholder="Additional details about this item"
          ></textarea>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!newItem.name || newItem.price <= 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-white rounded-md",
            "bg-primary hover:opacity-90 disabled:bg-gray-400"
          )}
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          )}
          rows={3}
          placeholder="Additional notes or payment instructions"
        ></textarea>
      </div>
    </div>
  );
}
