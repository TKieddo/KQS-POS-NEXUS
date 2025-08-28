import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { testQzTrayConnection, printReceipt } from '@/lib/qz-printing'

export const QzTrayDebug: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [printResult, setPrintResult] = useState<string>('')

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const result = await testQzTrayConnection()
      setTestResult(result)
      console.log('🔍 QZ Tray test result:', result)
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestPrint = async () => {
    if (!testResult?.printers?.length) {
      setPrintResult('No printers available for testing')
      return
    }

    const testPrinter = testResult.printers[0]
    const testData = [
      '\x1B@', // Initialize printer
      '\x1B\x61\x01', // Center alignment
      'KQS Test Print',
      '\x1B\x61\x00', // Left alignment
      'Date: ' + new Date().toLocaleString(),
      'Printer: ' + testPrinter,
      '',
      'This is a test print from QZ Tray',
      'If you see this, printing is working!',
      '',
      '\x1B\x69' // Cut paper
    ]

    try {
      await printReceipt(testPrinter, testData)
      setPrintResult('✅ Test print sent successfully!')
    } catch (error) {
      setPrintResult('❌ Test print failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 QZ Tray Debug Tool
          <Badge variant={testResult?.success ? 'default' : 'destructive'}>
            {testResult?.success ? 'Connected' : 'Not Connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting}
            variant="outline"
          >
            {isTesting ? 'Testing...' : 'Test QZ Tray Connection'}
          </Button>
          
          {testResult?.success && testResult?.printers?.length > 0 && (
            <Button 
              onClick={handleTestPrint}
              variant="default"
            >
              Test Print
            </Button>
          )}
        </div>

        {testResult && (
          <div className="space-y-2">
            <h4 className="font-semibold">Test Results:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {printResult && (
          <div className="space-y-2">
            <h4 className="font-semibold">Print Test Result:</h4>
            <div className={`p-3 rounded text-sm ${
              printResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {printResult}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure QZ Tray is running and connected</li>
            <li>Check that your printer is properly installed in Windows</li>
            <li>Verify the printer is not set to "Print to File"</li>
            <li>Try restarting QZ Tray if connection fails</li>
            <li>Check Windows printer settings for any special configurations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
