"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreInfo, ReceiptItem, Tenant } from '@/types';
import ReceiptForm from './ReceiptForm';
import ReceiptPreview from './ReceiptPreview';
import { useSettings } from '@/hooks/useSettings';

interface ReceiptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
  paymentAmount?: number;
  onGenerate?: (receiptData: any) => void;
}

export default function ReceiptGeneratorModal({
  isOpen,
  onClose,
  tenant,
  paymentAmount,
  onGenerate
}: ReceiptGeneratorModalProps) {
  // Store info would come from global settings
  const { settings } = useSettings();
  const storeInfo: StoreInfo = {
    name: "KQS Property Development",
    address: "P.O.BOX 3",
    city: "MOKHOTLONG 500",
    postalCode: "",
    phone: "+266 27004584/ +266 62001684",
    email: "kqspropertydevelopment@yahoo.com",
    website: "",
    taxRate: 15,
    vatNumber: "",
    companyRegistration: ""
  };

  // Form state
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [tenantInfo, setTenantInfo] = useState<Tenant>(tenant || {
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const [shipBy, setShipBy] = useState('');

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (storeInfo.taxRate / 100);
  const total = subtotal + taxAmount;

  // Handle receipt generation
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({
        items,
        receiptNumber,
        tenantInfo,
        paymentMethod,
        notes,
        invoiceDate,
        invoiceDueDate,
        shipBy,
        subtotal,
        taxAmount,
        total
      });
    }
    onClose();
  };

  return (
    <Modal
      title="Generate Receipt"
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-7xl w-full"
    >
      <div className="mt-4">
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Receipt Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-4">
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
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
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
          </TabsContent>
        </Tabs>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleGenerate}>
          Generate Receipt
        </Button>
      </div>
    </Modal>
  );
}
