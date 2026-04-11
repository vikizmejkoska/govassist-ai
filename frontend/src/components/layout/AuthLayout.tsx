import { Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  accentLine?: string;
  description: string;
  bullets?: string[];
}

export function AuthLayout({ title, accentLine, description, bullets = [], children }: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className={styles.root}>
      <section className={styles.brandPane}>
        <div className={styles.brand}>
          GovAssist<span className={styles.brandAccent}>.AI</span>
        </div>
        <div className={styles.hero}>
          <Typography variant="h1" className={styles.heroTitle}>
            <span className={styles.heroTitleMain}>{title}</span>
            {accentLine ? (
              <>
                <br />
                <span className={styles.heroHighlight}>{accentLine}</span>
              </>
            ) : null}
          </Typography>
          <p className={styles.copy}>{description}</p>
          {bullets.length ? (
            <ul className={styles.bullets}>
              {bullets.map((bullet: string) => (
                <li key={bullet} className={styles.bullet}>
                  <span className={styles.bulletDot} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <section className={styles.formPane}>
        <Stack className={styles.formCard}>{children}</Stack>
      </section>
    </div>
  );
}
