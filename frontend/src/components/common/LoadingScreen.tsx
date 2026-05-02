import { Box, Typography } from '@mui/material';
import styles from './LoadingScreen.module.css';

export function LoadingScreen({ label = 'Loading GovAssist.AI...' }: { label?: string }) {
  return (
    <Box className={styles.screen}>
      <Box className={styles.content}>
        <div className={styles.brand}>
          GovAssist<span className={styles.brandAccent}>.AI</span>
        </div>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <Typography className={styles.label}>{label}</Typography>
      </Box>
    </Box>
  );
}
