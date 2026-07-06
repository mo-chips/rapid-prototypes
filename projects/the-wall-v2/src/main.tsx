import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DesktopNotification from './components/DesktopNotification.tsx';
import MiniTimerWindow from './components/MiniTimerWindow.tsx';
import './index.css';

type EBProps = { children: React.ReactNode };
type EBState = { error: Error | null };

class ErrorBoundary extends React.Component<EBProps, EBState> {
  declare props: EBProps;
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error): EBState { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'black', height: '100vh' }}>
          <h1>Fatal React Error</h1>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


const urlParams = new URLSearchParams(window.location.search);
const isNotification = urlParams.get('notification') === 'true';
const isMini = urlParams.get('mini') === 'true';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    {isNotification ? <DesktopNotification /> : isMini ? <MiniTimerWindow /> : <App />}
  </ErrorBoundary>
);
