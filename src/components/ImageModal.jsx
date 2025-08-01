import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const ImageModal = ({ isOpen, onClose, imageUrl, alt }) => {
  const modalRef = useRef();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl transition-all duration-300"
      onClick={onClose}
      ref={modalRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-0 max-w-3xl w-full flex flex-col items-center animate-fadeIn"
        style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* X button at modal top right, outside image */}
        <button
          className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-red-500 text-gray-700 hover:text-white shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 z-20"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-4 w-full flex flex-col items-center">
          <Image
            src={imageUrl}
            alt={alt || ''}
            width={900}
            height={600}
            className="w-full h-auto rounded-xl object-contain max-h-[80vh] transition-all duration-300"
            style={{ background: '#f3f4f6' }}
            priority
          />
          {alt && (
            <div className="mt-4 text-center text-gray-600 text-lg font-medium w-full break-words px-2">
              {alt}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeInModal 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ImageModal;