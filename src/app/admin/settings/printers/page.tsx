import { PrinterSettingsForm } from '@/features/settings/components/printing/PrinterSettingsForm'

export default function PrintersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Printer Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure QZ Tray connection, set default printers, and manage receipt printing settings.
        </p>
      </div>
      
      <PrinterSettingsForm />
    </div>
  )
}
