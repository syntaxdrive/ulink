import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-100 shadow-xl text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
                        <p className="text-stone-500 mb-6 text-sm">
                            We encountered an unexpected error. Try refreshing the page or return to the dashboard.
                        </p>

                        {this.state.error && (
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left mb-6 overflow-hidden">
                                <p className="text-xs font-mono text-red-600 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload
                            </button>
                            <button
                                onClick={() => window.location.href = '/app'}
                                className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-lg shadow-stone-200"
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
