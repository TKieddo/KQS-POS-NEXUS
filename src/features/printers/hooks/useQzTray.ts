import { useCallback, useEffect, useRef, useState } from 'react'

// QZ Tray global type
declare const qz: any

type QzStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

export function useQzTray() {
  const [status, setStatus] = useState<QzStatus>('disconnected')
  const [printers, setPrinters] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const scriptLoaded = useRef(false)

  // Dynamically load all QZ Tray dependencies in order
  const loadQzScript = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/rsvp@4.8.5/dist/rsvp.min.js')
        await loadScript('https://cdn.jsdelivr.net/gh/qzind/tray@2.1.0/js/dependencies/sha-256.min.js')
        await loadScript('https://cdn.jsdelivr.net/gh/qzind/tray@2.1.0/js/qz-tray.js')
        scriptLoaded.current = true
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }, [])

  // Connect to QZ Tray
  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    setStatus('connecting')
    try {
      await loadQzScript()
      if (typeof qz === 'undefined') throw new Error('QZ Tray not available')
      await qz.websocket.connect()
      setStatus('connected')
      // List printers
      const found = await qz.printers.find()
      setPrinters(found)
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || 'Failed to connect to QZ Tray')
      setPrinters([])
    } finally {
      setIsConnecting(false)
    }
  }, [loadQzScript])

  // Auto-detect connection on mount
  useEffect(() => {
    let ignore = false
    loadQzScript()
      .then(() => {
        if (typeof qz === 'undefined') return
        if (qz.websocket.isActive()) {
          setStatus('connected')
          qz.printers.find().then(setPrinters).catch(() => setPrinters([]))
        }
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [loadQzScript])

  // Listen for disconnects
  useEffect(() => {
    if (typeof qz === 'undefined') return
    const onClose = () => {
      setStatus('disconnected')
      setPrinters([])
    }
    qz.websocket.setClosedCallbacks([onClose])
    return () => {
      if (typeof qz !== 'undefined') {
        qz.websocket.setClosedCallbacks([])
      }
    }
  }, [status])

  return {
    status,
    printers,
    error,
    connect,
    isConnecting,
  }
} 