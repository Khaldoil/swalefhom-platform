import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F2837] flex items-center justify-center px-4 sm:px-6 lg:px-8" dir="rtl">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-red-500/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              عذراً، حدث خطأ ما
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              واجهنا مشكلة غير متوقعة. نعتذر عن الإزعاج ونعمل على حل المشكلة.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-right">
                <h2 className="text-lg font-bold text-red-400 mb-3">تفاصيل الخطأ (للمطورين):</h2>
                <pre className="text-sm text-red-300 overflow-x-auto whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="group relative bg-gradient-to-r from-[#FF9619] to-[#FAC39B] text-[#0F2837] px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-[#FF9619]/30 transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FAC39B] to-[#FF9619] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6" />
                  <span>إعادة تحميل الصفحة</span>
                </div>
              </button>

              <button
                onClick={this.handleGoHome}
                className="group relative bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all duration-500 hover:scale-105 border border-white/20 hover:border-white/40"
              >
                <div className="flex items-center justify-center gap-3">
                  <Home className="w-6 h-6" />
                  <span>العودة للصفحة الرئيسية</span>
                </div>
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
