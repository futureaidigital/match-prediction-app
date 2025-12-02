/**
 * Loading Fallback Component
 *
 * Displayed while lazy-loaded route components are loading
 */

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Minimal Loading Spinner
 *
 * Smaller inline spinner for component-level loading
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`relative ${sizeClasses[size]} inline-block`}>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
}
