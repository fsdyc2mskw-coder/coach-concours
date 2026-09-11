import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError(message: string): void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError(`${error.message}\n${info.componentStack ?? ''}`.trim());
  }

  public render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <main className="fatal-error">
        <div className="fatal-error__card">
          <p className="eyebrow">Erreur technique</p>
          <h1>L’écran ne peut pas être affiché.</h1>
          <p>{this.state.error.message}</p>
          <button className="button button--primary" onClick={() => window.location.reload()} type="button">
            Recharger l’application
          </button>
        </div>
      </main>
    );
  }
}
