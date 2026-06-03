import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button/Button.jsx';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = true 
}) {
  if (!isOpen) return null;

  // Usa createPortal para saltar por cima de tudo no site
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.iconWrapper}>
          <AlertTriangle size={32} className={isDestructive ? styles.iconDanger : styles.iconWarning} />
        </div>
        
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        
        <div className={styles.actions}>
          <Button variant="outline" onClick={onClose} className={styles.btn}>
            {cancelText}
          </Button>
          {/* Se for destrutivo, usa a cor secundária escura (roxinho) para destacar */}
          <Button variant={isDestructive ? "secondary" : "primary"} onClick={onConfirm} className={styles.btn}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
