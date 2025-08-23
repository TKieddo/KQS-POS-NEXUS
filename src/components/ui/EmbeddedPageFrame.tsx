import React from 'react'

interface EmbeddedPageFrameProps {
  pageUrl: string
  title: string
  className?: string
}

const EmbeddedPageFrame: React.FC<EmbeddedPageFrameProps> = ({ 
  pageUrl, 
  title, 
  className = "" 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">
          This content is embedded from the standalone page for better organization.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{title}</span>
            <a 
              href={pageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in new tab
            </a>
          </div>
        </div>
        
        <div className="h-96 overflow-hidden">
          <iframe
            src={pageUrl}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  )
}

export default EmbeddedPageFrame 