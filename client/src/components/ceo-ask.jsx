import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Send, Loader2 } from 'lucide-react';
import { askCeoDashboard } from '@/lib/ceo-ask.functions';

const examples = ['Which product has the largest AUM share?', 'How healthy is our portfolio quality?', 'Are we on track against disbursement target?'];

export function CeoAsk({ metrics }) {
  const ask = askCeoDashboard;
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (question) => {
    if (question.trim().length < 3 || busy) return;
    setBusy(true);setError('');setAnswer('');
    try {
      const r = await ask({ data: { question, metrics: JSON.stringify(metrics) } });
      if (r.status === 200) setAnswer(r.answer);else setError(r.error);
    } catch (e) {console.error('ceo-ask', e);setError('Could not reach the assistant. Please try again.');} finally
    {setBusy(false);}
  };
  return <section className="ceo-card ceo-ask">
    <header className="ceo-card-head"><h2><MessageSquareText /> Ask about these KPIs</h2></header>
    <form onSubmit={(e) => {e.preventDefault();void submit(q);}} className="ceo-ask-form">
      <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={400} placeholder="e.g. Why is collection efficiency above 96%?" aria-label="Ask a question about the dashboard" />
      <Button variant="ceo" type="submit" disabled={busy || q.trim().length < 3}>{busy ? <Loader2 className="ceo-spin" /> : <Send />}Ask</Button>
    </form>
    <div className="ceo-ask-chips">{examples.map((x) => <Button variant="ceo" type="button" key={x} onClick={() => {setQ(x);void submit(x);}}>{x}</Button>)}</div>
    {busy && <p className="ceo-ask-wait">Reading the dashboard figures…</p>}
    {answer && <p className="ceo-ask-answer">{answer}</p>}
    {error && <p className="ceo-ask-error">{error}</p>}
  </section>;
}