import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  description 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6
        transition-[opacity,visibility] duration-300
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    >
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-zinc-950/60 backdrop-blur-xl
          transition-[opacity] duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative z-50 w-full max-w-lg transform rounded-2xl
          bg-[var(--theme-secondary)]/80 backdrop-blur-2xl p-6
          shadow-2xl transition-all duration-300
          border border-[var(--theme-tertiary)]/10
          ${isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="pr-8">
            {title && (
              <h3 className="text-xl font-semibold tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 text-sm text-[var(--theme-tertiary)]/70">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 
                     hover:bg-[var(--theme-tertiary)]/10 
                     transition-colors duration-200"
          >
            <X className="h-5 w-5 opacity-70" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
