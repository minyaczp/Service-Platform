import type { CSSProperties, ReactNode } from 'react';
import styles from './ui.module.css';

/** `tone` is any CSS colour; the chip derives its background and border from it. */
const toneStyle = (tone: string): CSSProperties => ({ '--tone': tone }) as CSSProperties;

export function StatusChip({ tone, children }: { readonly tone: string; readonly children: ReactNode }) {
  return (
    <span className={styles.chip} style={toneStyle(tone)}>
      <span className={styles.dot} />
      {children}
    </span>
  );
}

export function StatusDot({ tone, className }: { readonly tone: string; readonly className?: string }) {
  return <span className={`${styles.statusDot} ${className ?? ''}`} style={toneStyle(tone)} />;
}

