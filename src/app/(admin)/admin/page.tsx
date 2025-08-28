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
                    <span>Classic Blazer</span>
                    <span className="font-bold text-white">54</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Silk Scarf</span>
                    <span className="font-bold text-white">49</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Denim Jacket</span>
                    <span className="font-bold text-white">44</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Leather Handbag</span>
                    <span className="font-bold text-white">41</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1 border-b" style={{ borderBottom: '0.5px solid rgba(83,83,84,0.28)' }}>
                    <span>Chiffon Blouse</span>
                    <span className="font-bold text-white">39</span>
                  </div>
                  <div className="flex justify-between text-white text-xs py-1">
                    <span>Wrap Skirt</span>
                    <span className="font-bold text-white">36</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase Analytics Chart - full width */}
      <div className="rounded-2xl p-6 shadow-lg bg-[hsl(var(--primary))] flex flex-col min-h-[180px] w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-white">Sales & Laybye Analytics</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFB300' }}></span>
              <span className="text-xs text-white/80">Sold</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full ml-4" style={{ backgroundColor: '#00CFFF' }}></span>
              <span className="text-xs text-white/80">Laybye</span>
            </div>
            <select className="ml-4 bg-[hsl(var(--primary))] border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 focus:outline-none">
              <option>2024</option>
            </select>
          </div>
        </div>
        <div className="w-full h-full min-h-[180px] flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-lg font-semibold">Analytics Chart</p>
            <p className="text-sm text-gray-300">Chart will be available soon</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl p-6 shadow-lg bg-[hsl(var(--primary))] w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold text-white">Recent Orders</span>
          <select className="bg-[hsl(var(--primary))] border border-white/10 rounded-md px-3 py-1 text-xs text-white/80 focus:outline-none">
            <option>Today</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-l-xl">Order ID</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Customer Name</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Total Quantity</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-r-xl">Total Amount</th>
                <th className="px-2 bg-[#232325] rounded-r-xl"></th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5,6].map((_, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 text-white font-normal">147895954</td>
                  <td className="px-3 py-2 text-white font-normal">Customer Full Name</td>
                  <td className="px-3 py-2 text-white font-normal">74</td>
                  <td className="px-3 py-2 text-white font-semibold">$1475</td>
                  <td className="px-2 text-right text-white/40 font-bold text-lg align-middle">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
