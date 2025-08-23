'use client'

import React, { useState, useEffect } from 'react'
import { Truck, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SearchFilters } from '@/components/ui/search-filters'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter'
import { DeliveryCard } from './DeliveryCard'
import { CreateDeliveryModal } from './CreateDeliveryModal'
import { DeliveryDetailsModal } from './DeliveryDetailsModal'
import type { Delivery } from '@/features/pos/types/deliveries'

interface DeliveriesPageProps {
  deliveries: Delivery[]
  isLoading: boolean
  onCreateDelivery: (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateDeliveryStatus: (deliveryId: string, newStatus: Delivery['status']) => void
  onDeleteDelivery: (deliveryId: string) => void
}

export const DeliveriesPage: React.FC<DeliveriesPageProps> = ({
  deliveries,
  isLoading,
  onCreateDelivery,
  onUpdateDeliveryStatus,
  onDeleteDelivery
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-transit' | 'delivered' | 'cancelled'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Use the search and filter hook
  const filteredDeliveries = useSearchAndFilter({
    data: deliveries,
    searchFields: ['customerName', 'orderNumber', 'customerPhone'],
    searchQuery,
    filters: {
      status: {
        value: statusFilter,
        field: 'status'
      }
    }
  })

  // Calculate stats
  const stats = [
    { label: 'Pending', count: deliveries.filter(d => d.status === 'pending').length, color: 'bg-yellow-400' },
    { label: 'In Transit', count: deliveries.filter(d => d.status === 'in-transit').length, color: 'bg-blue-400' },
    { label: 'Delivered', count: deliveries.filter(d => d.status === 'delivered').length, color: 'bg-green-400' },
    { label: 'Cancelled', count: deliveries.filter(d => d.status === 'cancelled').length, color: 'bg-red-400' }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const handleCreateDelivery = (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreateDelivery(deliveryData)
    setShowCreateModal(false)
  }

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (deliveryId: string, newStatus: Delivery['status']) => {
    onUpdateDeliveryStatus(deliveryId, newStatus)
  }

  const handleDelete = (deliveryId: string) => {
    onDeleteDelivery(deliveryId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <PageHeader
        title="Deliveries"
        icon={<Truck className="h-4 w-4 text-black" />}
        actionButton={{
          label: 'New Delivery',
          icon: <Plus className="h-3 w-3 mr-2" />,
          onClick: () => setShowCreateModal(true)
        }}
      />

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search deliveries..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: filterOptions,
            placeholder: 'All Status'
          }
        ]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <LoadingSpinner text="Loading deliveries..." />
        ) : filteredDeliveries.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-8 w-8" />}
            title="No deliveries found"
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first delivery'
            }
            actionButton={
              !searchQuery && statusFilter === 'all'
                ? {
                    label: 'Create Delivery',
                    icon: <Plus className="h-3 w-3 mr-2" />,
                    onClick: () => setShowCreateModal(true)
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onViewDetails={() => handleViewDetails(delivery)}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateDeliveryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDelivery={handleCreateDelivery}
      />

      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedDelivery(null)
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  )
} 