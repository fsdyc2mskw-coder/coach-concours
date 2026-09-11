import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal" role="presentation" data-no-capture="true">
      <button className="modal__backdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <section className="modal__sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__handle" aria-hidden="true" />
        <header className="modal__header">
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </section>
    </div>
  );
}
