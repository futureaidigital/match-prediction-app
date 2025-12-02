import { useState } from 'react';

interface ApiDebugInfoProps {
  endpoint: string;
  method?: string;
  response?: unknown;
  isLoading?: boolean;
  error?: string | null;
}

function StatusBadge({ isLoading, error, hasResponse }: { isLoading?: boolean; error?: string | null; hasResponse: boolean }) {
  if (isLoading) {
    return (
      <span className="flex items-center gap-2 text-yellow-400">
        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        Loading...
      </span>
    );
  }

  if (error) {
    return (
      <span className="flex items-center gap-2 text-red-400">
        <span className="w-2 h-2 bg-red-400 rounded-full" />
        Error: {error}
      </span>
    );
  }

  if (hasResponse) {
    return (
      <span className="flex items-center gap-2 text-green-400">
        <span className="w-2 h-2 bg-green-400 rounded-full" />
        Success
      </span>
    );
  }

  return <span className="text-gray-400">No data</span>;
}

export function ApiDebugInfo({ endpoint, method = 'GET', response, isLoading, error }: ApiDebugInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const responseJson = response !== undefined && response !== null
    ? JSON.stringify(response, null, 2)
    : null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center hover:bg-white/10 transition-colors text-xs font-bold"
        title="View API Debug Info"
      >
        i
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="absolute right-0 top-8 z-50 w-[400px] max-h-[500px] bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-xs font-mono rounded">{method}</span>
                <span className="text-sm font-medium">API Debug</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-auto max-h-[400px]">
              {/* Endpoint */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Endpoint</div>
                <code className="block bg-gray-800 px-3 py-2 rounded text-sm text-green-400 font-mono break-all">
                  {endpoint}
                </code>
              </div>

              {/* Status */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <StatusBadge isLoading={isLoading} error={error} hasResponse={responseJson !== null} />
                </div>
              </div>

              {/* Response */}
              {responseJson && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Response Data</div>
                  <pre className="bg-gray-800 px-3 py-2 rounded text-xs font-mono text-gray-300 overflow-auto max-h-[250px] whitespace-pre-wrap">
                    {responseJson}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
