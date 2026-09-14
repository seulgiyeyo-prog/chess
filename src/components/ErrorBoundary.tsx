import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

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
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chess App ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              화면을 불러오는 중 문제가 발생했습니다
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              임시 브라우저 캐시나 저장소 데이터 충돌일 수 있습니다. 아래 버튼을 눌러 초기화하고 다시 시작해 보세요.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-left border border-zinc-200/60 dark:border-zinc-700/60">
                <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 break-all">
                  {this.state.error.message || '알 수 없는 오류'}
                </p>
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>데이터 리셋 후 새로고침</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
