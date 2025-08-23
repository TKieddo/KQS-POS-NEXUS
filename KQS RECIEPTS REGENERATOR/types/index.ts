export interface StoreInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  taxRate: number;
  vatNumber: string;
  companyRegistration: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface Tenant {
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: Date;
  dueDate?: Date;
  tenantInfo: Tenant;
  items: ReceiptItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  notes: string;
} 