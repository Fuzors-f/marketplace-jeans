import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Standardized Modal component for admin pages
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (default: 'lg')
 * @param {boolean} props.showFooter - Whether to show footer (default: false)
 * @param {React.ReactNode} props.footer - Custom footer content
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  showFooter = false,
  footer
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    full: 'sm:max-w-full sm:mx-4'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div 
        className={`bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full ${sizeClasses[size] || sizeClasses.lg} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {showFooter && footer && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal Footer with standard button layout
 * Supports two usage patterns:
 * 1. Props-based: <ModalFooter onCancel={...} onSubmit={...} />
 * 2. Children-based: <ModalFooter><button>...</button></ModalFooter>
 */
export const ModalFooter = ({ 
  children,
  onCancel, 
  onSubmit, 
  cancelText = 'Batal', 
  submitText = 'Simpan',
  isLoading = false,
  submitDisabled = false
}) => {
  // If children are provided, render them directly in the footer layout
  if (children) {
    return (
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
        {children}
      </div>
    );
  }

  // Otherwise, render default props-based buttons
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || submitDisabled}
        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          submitText
        )}
      </button>
    </div>
  );
};

export default Modal;
