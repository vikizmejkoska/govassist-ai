import type { ReactElement } from 'react';

import { AssistantIcon, RequestsIcon, ServicesIcon } from '@/components/icons/AppIcons';

const presetMap: Array<{
  match: RegExp;
  category: string;
  eta: string;
  fee: string;
  accent: string;
  icon: ReactElement;
}> = [
  {
    match: /vehicle|transport|car/i,
    category: 'Transport',
    eta: '3-5 business days',
    fee: '$75',
    accent: '#D6B460',
    icon: <ServicesIcon />,
  },
  {
    match: /health|medical|healthcare/i,
    category: 'Health',
    eta: '2-3 business days',
    fee: '$0',
    accent: '#F18A8A',
    icon: <AssistantIcon />,
  },
  {
    match: /passport|travel/i,
    category: 'Travel',
    eta: '10-15 business days',
    fee: '$80',
    accent: '#7FC4E8',
    icon: <RequestsIcon />,
  },
  {
    match: /identity|id/i,
    category: 'Identity',
    eta: '3-5 business days',
    fee: '$0',
    accent: '#82D1A9',
    icon: <ServicesIcon />,
  },
  {
    match: /tax|finance/i,
    category: 'Finance',
    eta: 'Immediate',
    fee: '$0',
    accent: '#D78686',
    icon: <RequestsIcon />,
  },
  {
    match: /social/i,
    category: 'Social',
    eta: '5-7 business days',
    fee: '$0',
    accent: '#74C7B8',
    icon: <AssistantIcon />,
  },
  {
    match: /permit|construction/i,
    category: 'Permits',
    eta: '3-5 business days',
    fee: '$500-3000',
    accent: '#D0C15A',
    icon: <ServicesIcon />,
  },
  {
    match: /business/i,
    category: 'Business',
    eta: '7-10 business days',
    fee: '$150',
    accent: '#73AEE2',
    icon: <RequestsIcon />,
  },
];

export function getServicePresentation(title: string) {
  return (
    presetMap.find((item) => item.match.test(title)) ?? {
      category: 'General',
      eta: '3-5 business days',
      fee: '$0',
      accent: '#5D89FF',
      icon: <ServicesIcon />,
    }
  );
}
