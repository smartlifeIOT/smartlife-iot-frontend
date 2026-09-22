import { useTranslation } from 'react-i18next';
import { getDirection } from '@/i18n/i18n';

export function useRTL() {
  const { i18n } = useTranslation();
  const direction = getDirection(i18n.language);
  const isRTL = direction === 'rtl';

  return {
    isRTL,
    direction,
    align: isRTL ? 'right' : 'left',
    textAlign: isRTL ? 'text-right' : 'text-left',
    float: isRTL ? 'float-right' : 'float-left',
  };
}
