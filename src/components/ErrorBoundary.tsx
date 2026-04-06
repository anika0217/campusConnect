import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                The application encountered an unexpected error. This might be due to:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Network connectivity issues</li>
                <li>Image loading problems</li>
                <li>Database connection errors (non-critical)</li>
              </ul>
              
              {this.state.error && (
                <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto">
                  {this.state.error.message}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                If this persists, please contact support or check the browser console for details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
