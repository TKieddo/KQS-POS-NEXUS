import * as React from 'react'
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface QzStatusCardProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  error: string | null
  onConnect: () => void
  isConnecting: boolean
}

export const QzStatusCard: React.FC<QzStatusCardProps> = ({ status, error, onConnect, isConnecting }) => {
  let statusIcon, statusText, statusColor
  switch (status) {
    case 'connected':
      statusIcon = <Wifi className="w-5 h-5 text-green-600" />
      statusText = 'Connected to QZ Tray'
      statusColor = 'text-green-700'
      break
    case 'connecting':
      statusIcon = <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      statusText = 'Connecting...'
      statusColor = 'text-blue-600'
      break
    case 'error':
      statusIcon = <AlertTriangle className="w-5 h-5 text-destructive" />
      statusText = 'Connection Error'
      statusColor = 'text-destructive'
      break
    default:
      statusIcon = <WifiOff className="w-5 h-5 text-muted-foreground" />
      statusText = 'Not Connected'
      statusColor = 'text-muted-foreground'
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-[hsl(var(--border))] flex items-center gap-4">
      <div>{statusIcon}</div>
      <div className="flex-1">
        <div className={`font-medium text-base ${statusColor}`}>{statusText}</div>
        {error && <div className="text-xs text-destructive mt-1">{error}</div>}
      </div>
      {(status === 'disconnected' || status === 'error') && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-4"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Connect
        </Button>
      )}
    </div>
  )
} 