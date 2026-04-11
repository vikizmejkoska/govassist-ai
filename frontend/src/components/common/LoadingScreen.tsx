import { Box, CircularProgress, Typography } from '@mui/material';
import styles from './LoadingScreen.module.css';

export function LoadingScreen({ label = 'Loading GovAssist.AI...' }: { label?: string }) {
  return (
    <Box className={styles.screen}>
      <Box className={styles.content}>
        <CircularProgress />
        <Typography color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  );
}
