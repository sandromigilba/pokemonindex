import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
          <div className="w-full max-w-md p-8 text-center glass-morphism card-radius border border-red-500/20">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-500/10 text-red-400">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 font-display text-white">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We encountered a glitch in the Pokémon Universe. Don't worry, your data is safe. Let's get you back on track.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-black/40 text-left text-xs font-mono text-red-300 max-h-40 overflow-y-auto border border-white/5">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-5 card-radius flex items-center justify-center gap-2 bg-[#FFCB05] hover:bg-[#FFD700] text-slate-900 font-semibold transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-5 card-radius flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-200 border border-white/5"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
