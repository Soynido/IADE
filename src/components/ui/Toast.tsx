import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  duration?: number;
  onClose: () => void;
  icon?: React.ReactNode;
}

const typeClasses = {
  success: 'bg-iade-green-500 border-iade-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-yellow-500 border-yellow-600',
  info: 'bg-iade-blue-500 border-iade-blue-600',
  achievement: 'bg-gradient-to-r from-iade-purple-500 to-iade-blue-500 border-iade-purple-600',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${
        isExiting ? 'slide-out-right' : 'slide-in-right'
      }`}
    >
      <div
        className={`${typeClasses[type]} text-white px-6 py-4 rounded-xl shadow-iade-xl border-2 flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 300);
          }}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'achievement';
    icon?: React.ReactNode;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            icon={toast.icon}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

