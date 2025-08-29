'use client'

import React from 'react'
import { Search, Bell, User, DollarSign, Package, Users, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  return (
    <div className="p-8 bg-[hsl(var(--background))] flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Welcome, Admin 👋</h1>
          <p className="text-base text-muted-foreground mt-1">Here's what's happening in your store.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-full bg-[hsl(var(--muted))]/60 text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] shadow"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <button className="rounded-full bg-[hsl(var(--muted))]/60 p-2 shadow hover:bg-[hsl(var(--accent))]/20 transition">
            <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
          </button>
          <button className="rounded-full bg-[hsl(var(--muted))]/60 p-2 shadow hover:bg-[hsl(var(--accent))]/20 transition">
            <User className="h-5 w-5 text-[hsl(var(--primary))]" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Stat Cards */}
        <div className="flex flex-col gap-2">
          <div className="rounded-2xl p-2 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-start justify-center pl-3 h-32">
            <DollarSign className="h-7 w-7 mb-1 text-[#E5FF29] drop-shadow" />
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-[hsl(var(--primary))]">
              {formatCurrency(125000)}
            </p>
            <span className="text-[10px] mt-1" style={{ color: '#E5FF29' }}>+10.5% from last day</span>
          </div>
          <div className="rounded-2xl p-2 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-start justify-center pl-3 h-32">
            <Package className="h-7 w-7 mb-1 text-[#E5FF29] drop-shadow" />
            <span className="text-xs font-medium text-white/80">Total Products</span>
            <span className="text-lg font-bold text-white mt-0.5">847</span>
            <span className="text-[10px] mt-1" style={{ color: '#E5FF29' }}>+10.5% from last day</span>
          </div>
          <div className="rounded-2xl p-2 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-start justify-center pl-3 h-32">
            <Users className="h-7 w-7 mb-1 text-[#E5FF29] drop-shadow" />
            <span className="text-xs font-medium text-white/80">Total Customers</span>
            <span className="text-lg font-bold text-white mt-0.5">1,429</span>
            <span className="text-[10px] mt-1" style={{ color: '#E5FF29' }}>+10.5% from last day</span>
          </div>
          <div className="rounded-2xl p-2 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-start justify-center pl-3 h-32">
            <ShoppingCart className="h-7 w-7 mb-1 text-[#E5FF29] drop-shadow" />
            <span className="text-xs font-medium text-white/80">Orders Today</span>
            <span className="text-lg font-bold text-white mt-0.5">47</span>
            <span className="text-[10px] mt-1" style={{ color: '#E5FF29' }}>+8% from yesterday</span>
          </div>
        </div>

        {/* Right Columns: Orders Overview, Sale Analytics, Top Products */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Orders Overview spans two columns */}
          <div className="rounded-2xl p-3 shadow-lg bg-[hsl(var(--primary))] flex flex-col min-h-[120px] w-full">
            <span className="text-base font-semibold text-white mb-2">Orders Overview</span>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-lg font-semibold">Chart Loading...</p>
                <p className="text-sm text-gray-300">Charts will be available soon</p>
              </div>
            </div>
          </div>
          {/* Sale Analytics and Top Products side by side, aligned with stat cards */}
          <div className="flex gap-3">
            <div className="rounded-2xl p-3 shadow-lg bg-[hsl(var(--primary))] flex flex-col items-center justify-center flex-1 min-h-[400px]">
              <span className="text-base font-semibold text-white mb-2">Sale Analytics</span>
              <div className="text-white text-center">
                <p className="text-sm">Payment Methods Chart</p>
                <p className="text-xs text-gray-300">Coming soon</p>
              </div>
            </div>
            <div className="rounded-2xl p-3 shadow-lg bg-[hsl(var(--primary))] flex flex-col flex-1 min-h-[400px]">
              <span className="text-base font-semibold text-white mb-2">Top Products</span>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between font-medium text-xs pb-1">
                  <span className="text-[#E5FF29]">Product</span>
                  <span className="text-[#E5FF29]">Orders</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Floral Midi Dress</span>
                    <span className="font-bold text-white">78</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Slim Fit Jeans</span>
                    <span className="font-bold text-white">65</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Classic T-Shirt</span>
                    <span className="font-bold text-white">52</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Leather Jacket</span>
                    <span className="font-bold text-white">48</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1">
                    <span>Running Shoes</span>
                    <span className="font-bold text-white">42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 