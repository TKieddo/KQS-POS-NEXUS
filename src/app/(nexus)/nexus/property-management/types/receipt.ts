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

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: Date;
  dueDate?: Date;
  tenantId: string;
  buildingId: string;
  items: ReceiptItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptFormData {
  receiptNumber: string;
  date: Date;
  dueDate: Date;
  tenantId: string;
  buildingId: string;
  items: ReceiptItem[];
  paymentMethod: string;
  notes: string;
}
