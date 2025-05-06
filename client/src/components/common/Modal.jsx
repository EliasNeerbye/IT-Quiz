import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ title, children, onClose }) => {
  const modalRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    
    document.body.style.overflow = 'hidden';

    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;