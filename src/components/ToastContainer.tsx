import React from 'react';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
  onClose: (id: number) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}