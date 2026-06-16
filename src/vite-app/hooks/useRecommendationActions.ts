import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import type { RecommendationCard } from '../types';

/**
 * @hook useRecommendationActions
 * @description
 * [Developer] Encapsulates reusable business logic and side effects for recommendation cards,
 * such as copying prices to the clipboard, simulating broker redirects, and setting alerts.
 * Triggers corresponding debug events for analytics.
 * 
 * [AI Agent] When adding new interactive features to recommendation cards, add the handler logic 
 * here to keep the UI components pure and ensure analytics/debug events are properly fired.
 */
export function useRecommendationActions() {
  const { addDebugEvent } = useApp();

  const handleCopyPrice = (rec: RecommendationCard, pageContext: string = 'home') => {
    const priceText = rec.entryPrice
      ? `$${rec.entryPrice}`
      : `$${rec.entryRangeMin} - $${rec.entryRangeMax}`;
    navigator.clipboard.writeText(priceText);
    toast.success('가격이 복사되었습니다.');
    addDebugEvent('price_copy', { ticker: rec.ticker, page: pageContext });
  };

  const handleBrokerRedirect = (ticker: string, pageContext: string = 'home') => {
    addDebugEvent('broker_redirect', { ticker, page: pageContext });
    toast.success('브로커 이동을 시뮬레이션했습니다. 실제 연동 시 증권사 딥링크가 연결됩니다.');
  };

  const handleSetAlert = (ticker: string, pageContext: string = 'home') => {
    toast.success('알림이 설정되었습니다.');
    addDebugEvent('alert_set', { ticker, page: pageContext });
  };

  return {
    handleCopyPrice,
    handleBrokerRedirect,
    handleSetAlert,
  };
}
