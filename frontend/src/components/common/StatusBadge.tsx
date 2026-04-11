import { Chip } from '@mui/material';

import type { RequestStatus } from '@/api/types';
import { humanizeStatus, statusColor } from '@/lib/format';

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Chip
      label={humanizeStatus(status)}
      color={statusColor(status)}
      size="small"
      sx={{
        color: '#131A2F',
        '& .MuiChip-label': {
          color: '#131A2F',
        },
      }}
    />
  );
}
