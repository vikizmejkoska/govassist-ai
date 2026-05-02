import { Chip } from '@mui/material';

import type { RequestStatus } from '@/api/types';
import { humanizeStatus } from '@/lib/format';

interface StatusTone {
  bg: string;
  fg: string;
  border: string;
}

const statusTones: Record<RequestStatus, StatusTone> = {
  SUBMITTED: {
    bg: 'rgba(59, 104, 245, 0.10)',
    fg: '#1F47C7',
    border: 'rgba(59, 104, 245, 0.22)',
  },
  IN_PROGRESS: {
    bg: 'rgba(217, 164, 30, 0.14)',
    fg: '#9C7510',
    border: 'rgba(217, 164, 30, 0.32)',
  },
  ADDITIONAL_DOCUMENTS_REQUIRED: {
    bg: 'rgba(127, 113, 248, 0.12)',
    fg: '#5C4FE0',
    border: 'rgba(127, 113, 248, 0.28)',
  },
  APPROVED: {
    bg: 'rgba(47, 168, 106, 0.12)',
    fg: '#1F7A4D',
    border: 'rgba(47, 168, 106, 0.28)',
  },
  REJECTED: {
    bg: 'rgba(224, 78, 78, 0.12)',
    fg: '#A23030',
    border: 'rgba(224, 78, 78, 0.28)',
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = statusTones[status];

  return (
    <Chip
      label={humanizeStatus(status)}
      size="small"
      sx={{
        backgroundColor: tone.bg,
        color: tone.fg,
        border: `1px solid ${tone.border}`,
        fontWeight: 600,
        fontSize: '0.74rem',
        height: 24,
        letterSpacing: '-0.005em',
        '& .MuiChip-label': {
          color: tone.fg,
          paddingInline: '10px',
        },
      }}
    />
  );
}
