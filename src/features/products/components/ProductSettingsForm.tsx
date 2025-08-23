import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export interface ProductSettings {
  defaultMarkup: number
  priceRounding: "nearest" | "up" | "down"
  enableBarcodeScanning: boolean
  autoGenerateSKU: boolean
  requireBarcode: boolean
  allowNegativeStock: boolean
  lowStockThreshold: number
  reorderPoint: number
}

export interface ProductSettingsFormProps {
  settings: ProductSettings
  onChange: (settings: ProductSettings) => void
}

export const ProductSettingsForm = ({
  settings,
  onChange
}: ProductSettingsFormProps) => {
  const handleChange = (field: keyof ProductSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Product Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Pricing Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Markup (%)</label>
              <Input
                type="number"
                value={settings.defaultMarkup}
                onChange={(e) => handleChange("defaultMarkup", parseFloat(e.target.value))}
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Rounding</label>
              <Select
                value={settings.priceRounding}
                onChange={(e) => handleChange("priceRounding", e.target.value)}
              >
                <option value="nearest">Nearest</option>
                <option value="up">Round Up</option>
                <option value="down">Round Down</option>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Inventory Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
              <Input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange("lowStockThreshold", parseInt(e.target.value))}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
              <Input
                type="number"
                value={settings.reorderPoint}
                onChange={(e) => handleChange("reorderPoint", parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-gray-900">Product Options</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableBarcodeScanning"
                checked={settings.enableBarcodeScanning}
                onChange={(checked) => handleChange("enableBarcodeScanning", checked)}
              />
              <label htmlFor="enableBarcodeScanning" className="text-sm font-medium text-gray-700">
                Enable barcode scanning
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoGenerateSKU"
                checked={settings.autoGenerateSKU}
                onChange={(checked) => handleChange("autoGenerateSKU", checked)}
              />
              <label htmlFor="autoGenerateSKU" className="text-sm font-medium text-gray-700">
                Auto-generate SKU
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireBarcode"
                checked={settings.requireBarcode}
                onChange={(checked) => handleChange("requireBarcode", checked)}
              />
              <label htmlFor="requireBarcode" className="text-sm font-medium text-gray-700">
                Require barcode for products
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowNegativeStock"
                checked={settings.allowNegativeStock}
                onChange={(checked) => handleChange("allowNegativeStock", checked)}
              />
              <label htmlFor="allowNegativeStock" className="text-sm font-medium text-gray-700">
                Allow negative stock
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 