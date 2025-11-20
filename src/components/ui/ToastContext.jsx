import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', ttl = 3500) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, message, type }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, ttl);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type ? `toast--${t.type}` : ''}`} role="status">
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" aria-label="Fermer" onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.showToast;
}

export default ToastContext;
