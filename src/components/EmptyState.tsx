import type { ReactNode } from 'react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">△</div>
      <h2>{title}</h2>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
