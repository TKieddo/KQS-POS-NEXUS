import { useEffect, useState } from "react";

declare const qz: any;

export function useQzTray() {
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-connect on mount (like the demo)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof qz !== 'undefined') {
      startConnection();
    } else {
      // Wait for QZ Tray to be available
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      const checkQz = () => {
        if (typeof qz !== 'undefined') {
          startConnection();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkQz, 100);
        } else {
          setError("QZ Tray library not loaded after 5 seconds.");
        }
      };
      checkQz();
    }
  }, []);

  const startConnection = () => {
    if (typeof qz === 'undefined') {
      setError("QZ Tray library not loaded.");
      return;
    }

    if (qz.websocket.isActive()) {
      setIsConnected(true);
      listPrinters();
      return;
    }

    setIsConnecting(true);
    setError(null);

    qz.websocket.connect()
      .then(() => {
        setIsConnected(true);
        setIsConnecting(false);
        listPrinters();
      })
      .catch((err: any) => {
        setError("Could not connect to QZ Tray: " + err);
        setIsConnecting(false);
      });
  };

  const endConnection = () => {
    if (typeof qz !== 'undefined' && qz.websocket.isActive()) {
      qz.websocket.disconnect()
        .then(() => {
          setIsConnected(false);
          setPrinters([]);
        })
        .catch((err: any) => {
          setError("Error disconnecting: " + err);
        });
    }
  };

  const listPrinters = async () => {
    if (typeof qz === 'undefined' || !qz.websocket.isActive()) return;
    
    try {
      const printerList = await qz.printers.find();
      setPrinters(printerList);
    } catch (err) {
      setError("Failed to list printers: " + err);
    }
  };

  const findPrinter = async (query: string) => {
    if (typeof qz === 'undefined' || !qz.websocket.isActive()) return null;
    
    try {
      const printer = await qz.printers.find(query);
      return printer;
    } catch (err) {
      setError("Failed to find printer: " + err);
      return null;
    }
  };

  const getDefaultPrinter = async () => {
    if (typeof qz === 'undefined' || !qz.websocket.isActive()) return null;
    try {
      const printer = await qz.printers.getDefault();
      return printer;
    } catch (err) {
      setError("Failed to get default printer: " + err);
      return null;
    }
  };

  return { 
    isConnected, 
    isConnecting,
    printers, 
    listPrinters, 
    findPrinter,
    getDefaultPrinter,
    startConnection,
    endConnection,
    error 
  };
} 