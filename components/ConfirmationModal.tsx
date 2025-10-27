import React from 'react';
import { Icons } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'primary',
    icon,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  
  const iconBgClass = isDanger ? 'bg-red-100 dark:bg-red-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50';
  const iconColorClass = isDanger ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400';
  const confirmButtonClass = isDanger 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
  
  const defaultIcon = isDanger ? <Icons.Delete className="w-6 h-6" /> : <Icons.Check className="w-6 h-6" />;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="flex items-start mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0`}>
            <div className={iconColorClass}>
                {icon || defaultIcon}
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
          </div>
        </div>
        <div className="pl-16 rtl:pr-16">
            <div className="text-gray-600 dark:text-gray-300 mb-8">{message}</div>
            <div className="flex justify-end space-x-4 space-x-reverse">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform transform hover:scale-105"
            >
                {cancelText}
            </button>
            <button
                onClick={onConfirm}
                className={`px-6 py-2 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 ${confirmButtonClass}`}
            >
                {confirmText}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};
