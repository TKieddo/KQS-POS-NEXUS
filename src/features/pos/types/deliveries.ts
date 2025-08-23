export interface DeliveryItem {
  name: string
  quantity: number
  price: number
}

export interface Delivery {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: DeliveryItem[]
  totalAmount: number
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'
  deliveryDate: string
  deliveryTime: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDeliveryData {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: DeliveryItem[]
  totalAmount: number
  deliveryDate: string
  deliveryTime: string
  notes?: string
} 