import React, { useEffect, useState } from "react";
import { useQzTray } from "@/hooks/useQzTray";

const PrinterSelector = ({ onSelect }: { onSelect?: (printer: string) => void }) => {
  const { 
    isConnected, 
    isConnecting,
    printers, 
    listPrinters, 
    findPrinter,
    getDefaultPrinter,
    startConnection,
    endConnection,
    error 
  } = useQzTray();
  
  const [selected, setSelected] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSelect = (printer: string) => {
    setSelected(printer);
    window.localStorage.setItem('kqs_default_printer', printer);
    if (onSelect) onSelect(printer);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const found = await findPrinter(searchQuery);
      if (found) {
        handleSelect(found);
      }
    }
  };

  const handleGetDefault = async () => {
    const defaultPrinter = await getDefaultPrinter();
    if (defaultPrinter) {
      handleSelect(defaultPrinter);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 bg-red-50 p-3 rounded-lg">
          <strong>QZ Tray Error:</strong> {error}
        </div>
        <button
          onClick={startConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={`p-3 rounded-lg ${
        isConnected 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : isConnecting 
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-400'
          }`}></div>
          <span className="font-medium">
            {isConnected ? 'Connected to QZ Tray' : isConnecting ? 'Connecting...' : 'Not Connected'}
          </span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex gap-2">
        {!isConnected && !isConnecting && (
          <button
            onClick={startConnection}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Connect
          </button>
        )}
        {isConnected && (
          <button
            onClick={endConnection}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Disconnect
          </button>
        )}
        {isConnected && (
          <button
            onClick={listPrinters}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Refresh Printers
          </button>
        )}
      </div>

      {/* Printer Search */}
      {isConnected && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for printer..."
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Search
            </button>
            <button
              onClick={handleGetDefault}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Default
            </button>
          </div>
        </div>
      )}

      {/* Available Printers */}
      {isConnected && printers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Available Printers ({printers.length}):</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {printers.map((printer) => (
              <button
                key={printer}
                onClick={() => handleSelect(printer)}
                className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                  selected === printer 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {printer}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Printer */}
      {selected && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-700">
            <strong>Selected Printer:</strong> {selected}
          </div>
        </div>
      )}

      {/* No Printers Found */}
      {isConnected && printers.length === 0 && (
        <div className="text-gray-500 text-sm">
          No printers found. Make sure QZ Tray is running and printers are connected.
        </div>
      )}
    </div>
  );
};

export default PrinterSelector; 