"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceiptsTabProps {
  receipts: any[];
  tenants: any[];
  buildings: any[];
  onViewReceipt: (receipt: any) => void;
  onDownloadReceipt: (receipt: any) => void;
  isLoading?: boolean;
}

export default function ReceiptsTab({
  receipts,
  tenants,
  buildings,
  onViewReceipt,
  onDownloadReceipt,
  isLoading = false
}: ReceiptsTabProps) {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.building_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = selectedBuilding === 'all' || receipt.building_id === selectedBuilding;
    const matchesTenant = selectedTenant === 'all' || receipt.tenant_id === selectedTenant;
    
    const matchesDate = (!dateRange.from || new Date(receipt.date) >= dateRange.from) &&
                       (!dateRange.to || new Date(receipt.date) <= dateRange.to);

    return matchesSearch && matchesBuilding && matchesTenant && matchesDate;
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Receipts History</CardTitle>
            <CardDescription className="text-gray-600">View and manage all generated receipts</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
            />
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent">
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range: any) => setDateRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading receipts...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No receipts found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white/80 transition-all duration-300"
              >
                <div>
                  <h4 className="font-medium text-gray-900">Receipt #{receipt.receipt_number}</h4>
                  <p className="text-sm text-gray-600">{receipt.tenant_name}</p>
                  <p className="text-sm text-gray-500">{format(new Date(receipt.date), "PPP")}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-medium text-gray-900">M{receipt.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => onViewReceipt(receipt)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => onDownloadReceipt(receipt)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
