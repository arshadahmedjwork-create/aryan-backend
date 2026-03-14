import { apiGetNpsScore, apiGetNpsFeedback } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';

const defaultNps = { score: 58, total_responses: 5, promoters: 1, passives: 1, detractors: 2 };
const defaultFeedback = [
  { id: '1', customer_id: 'c1', order_id: 'ORD-1001', score: 9, feedback_text: 'Excellent delivery, arrived early!', created_at: '2026-03-13T10:00:00Z' },
  { id: '2', customer_id: 'c4', order_id: 'ORD-1005', score: 4, feedback_text: 'Still waiting for delivery, very frustrating', created_at: '2026-03-13T09:00:00Z' },
  { id: '3', customer_id: 'c3', order_id: 'ORD-1003', score: 8, feedback_text: 'Good products, reasonable prices', created_at: '2026-03-13T08:00:00Z' },
  { id: '4', customer_id: 'c5', order_id: 'ORD-1006', score: 3, feedback_text: 'Had to cancel due to delay, poor experience', created_at: '2026-03-12T22:00:00Z' },
];

export default function OwnerNps() {
  const { data: nps } = useApiData(() => apiGetNpsScore(), defaultNps);
  const { data: feedback } = useApiData(() => apiGetNpsFeedback(), defaultFeedback);

  const promoterPct = nps.total_responses > 0 ? Math.round((nps.promoters / nps.total_responses) * 100) : 0;
  const detractorPct = nps.total_responses > 0 ? Math.round((nps.detractors / nps.total_responses) * 100) : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">NPS Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="rounded-lg border bg-card p-6 shadow-card text-center">
          <p className="text-sm text-muted-foreground">Current NPS</p>
          <p className={`mt-2 text-5xl font-bold font-display ${
            nps.score >= 50 ? 'text-status-success' : nps.score >= 0 ? 'text-status-warning' : 'text-status-danger'
          }`}>{nps.score}</p>
          <p className="mt-1 text-sm text-muted-foreground">{nps.total_responses} responses</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-card text-center">
          <p className="text-sm text-muted-foreground">Promoters</p>
          <p className="mt-2 text-5xl font-bold font-display text-status-success">{promoterPct}%</p>
          <p className="mt-1 text-sm text-muted-foreground">{nps.promoters} of {nps.total_responses}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-card text-center">
          <p className="text-sm text-muted-foreground">Detractors</p>
          <p className="mt-2 text-5xl font-bold font-display text-status-danger">{detractorPct}%</p>
          <p className="mt-1 text-sm text-muted-foreground">{nps.detractors} of {nps.total_responses}</p>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Recent Feedback</h2>
        <div className="space-y-3">
          {feedback.slice(0, 10).map((fb) => (
            <div key={fb.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                fb.score >= 9 ? 'bg-status-success/10 text-status-success' :
                fb.score >= 7 ? 'bg-status-warning/10 text-status-warning' :
                'bg-status-danger/10 text-status-danger'
              }`}>
                {fb.score}
              </div>
              <div>
                <p className="text-sm text-foreground">{fb.feedback_text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fb.order_id && `Order ${fb.order_id} • `}
                  {new Date(fb.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
