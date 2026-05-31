import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-smooth p-12 rounded-[3rem] border border-white/5 animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl mx-auto mb-8 flex items-center justify-center text-red-500">
              <AlertCircle size={40} />
            </div>

            <h1 className="text-3xl font-serif-display text-white mb-4">Algo deu errado</h1>
            <p className="text-white/40 font-light mb-10 leading-relaxed">
              Desculpe o transtorno. Ocorreu um erro inesperado na interface. Por favor, tente recarregar a página.
            </p>

            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-14 rounded-xl bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Recarregar página
            </Button>
            
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-8 p-4 bg-red-500/5 rounded-xl text-left text-[10px] text-red-400/50 overflow-auto max-h-40 font-mono">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
