import { useErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/atoms'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="AlertTriangle" className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-sm text-red-600 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetErrorBoundary}>
              <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button variant="outline" onClick={handleReload}>
              <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            
            <Button variant="outline" onClick={handleGoHome}>
              <Icon name="Home" className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ErrorBoundary } from 'react-error-boundary'
export { ErrorFallback }