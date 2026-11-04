'use client'
import { useEffect, useRef, useState } from 'react';

export default function TerminalDebug({ paymentIntentId, onReaderReleased, selection }: {
  paymentIntentId: string | null, onReaderReleased: () => void, selection: unknown,
}) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const lastState = useRef('');

  async function refresh() {
    try {
      const response = await fetch('/api/admin/epos/terminal?debug=true', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reader status unavailable.');
      setSnapshot(data);
      setError('');
      const state = JSON.stringify([data.reader.status, data.reader.action, data.payment]);
      if (state !== lastState.current) {
        lastState.current = state;
        record(`${data.reader.status}; action ${data.reader.action?.type || 'none'} / ${data.reader.action?.status || 'idle'}; payment ${data.payment?.id || 'none'} / ${data.payment?.status || 'none'}`);
      }
    } catch (err) { setError(err.message); }
  }

  function record(text: string) {
    setEvents(previous => [`${new Date().toLocaleTimeString()} — ${text}`, ...previous].slice(0, 30));
  }

  useEffect(() => {
    if (!open) return;
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [open]);

  async function action(name: string) {
    setWorking(true);
    try {
      const response = await fetch('/api/admin/epos/terminal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: name, paymentIntentId: snapshot?.payment?.id,
          expectedAction: JSON.stringify(snapshot?.reader.action) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reader action failed.');
      record(name === 'simulate' ? 'Simulated card presented.' : 'Reader recovery completed.');
      if (name !== 'simulate') onReaderReleased();
      await refresh();
    } catch (err) { setError(err.message); record(err.message); }
    finally { setWorking(false); }
  }

  const reader = snapshot?.reader;
  const payment = snapshot?.payment;
  const button = 'rounded border border-gray-400 px-3 py-2 disabled:opacity-40';
  return <details className="col-span-full rounded-lg border border-gray-500 bg-richblack-700 p-4 text-white" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer font-bold">Advanced: reader and payment debug</summary>
    <p className="mt-3 text-sm">Live status refreshes every 3 seconds while open. This panel can release an action left by another page or session.</p>
    {error && <p role="alert" className="mt-3 rounded bg-red-900 p-3">{error}</p>}
    <div className="my-3 flex flex-wrap gap-3">
      <button type="button" className={button} disabled={working} onClick={refresh}>Refresh status</button>
      <button type="button" className={button} disabled={working || reader?.action?.status !== 'in_progress'} onClick={() => action('cancel_reader')}>Release reader action</button>
      <button type="button" className={button} disabled={working || payment?.source !== 'mlf_till' || ['succeeded', 'canceled'].includes(payment?.status)} onClick={() => action('cancel_reader_payment')}>Cancel reader payment</button>
      {snapshot?.simulated && <button type="button" className={button} disabled={working || reader?.action?.status !== 'in_progress' || payment?.id !== paymentIntentId} onClick={() => action('simulate')}>Simulate card tap</button>}
    </div>
    <p className="text-sm">Release stops the reader prompt without canceling the PaymentIntent. Cancel reader payment also cancels the attached unpaid MLF payment. Neither button refunds a completed payment.</p>
    {reader && <dl className="my-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
      <div><dt className="font-bold">Reader</dt><dd className="break-all">{reader.label} — {reader.id}</dd></div>
      <div><dt className="font-bold">Connection / mode</dt><dd>{reader.status} / {reader.livemode ? 'LIVE' : 'TEST'} / {reader.deviceType}</dd></div>
      <div><dt className="font-bold">Reader action</dt><dd>{reader.action?.type || 'none'} / {reader.action?.status || 'idle'}</dd></div>
      <div><dt className="font-bold">Current page payment</dt><dd className="break-all">{paymentIntentId || 'none'}</dd></div>
      <div><dt className="font-bold">Reader payment</dt><dd className="break-all">{payment?.id || 'none'} / {payment?.status || 'none'}{payment && ` / ${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}`}</dd></div>
      <div><dt className="font-bold">Last checked</dt><dd>{snapshot.checkedAt}</dd></div>
    </dl>}
    {payment?.id && paymentIntentId && payment.id !== paymentIntentId && <p className="rounded bg-amber-900 p-3">The reader is attached to a different payment from this page. Release or cancel that action, then retry the current payment.</p>}
    {(reader?.action?.failure_message || payment?.lastError) && <p role="status">{reader?.action?.failure_message || payment?.lastError}</p>}
    <details className="mt-4"><summary className="cursor-pointer">Reader response details</summary><pre className="overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(snapshot, null, 2)}</pre></details>
    <details className="mt-4"><summary className="cursor-pointer">Till selection details</summary><pre className="overflow-auto text-xs">{JSON.stringify(selection, null, 2)}</pre></details>
    <h3 className="mt-4 font-bold">Activity in this page</h3>
    <ul className="mt-2 space-y-1 text-xs">{events.map((event, index) => <li key={index}>{event}</li>)}</ul>
  </details>;
}
