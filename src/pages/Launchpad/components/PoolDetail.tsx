import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Loader2, Wallet, X } from 'lucide-react';
import { type Allocation, type LaunchPool, type Portfolio, money, poolStatus, tokens } from '../data/types';
import { dateLabel, PoolLogo, StatusBadge } from './FeaturedPoolCard';
import { ProgressBar } from './ProgressBar';

interface Props {
  pool: LaunchPool;
  portfolio: Portfolio;
  onClose: () => void;
  onParticipate: (amountCents: number, requestId: string) => Promise<Allocation>;
  onClaim: (requestId: string) => Promise<Allocation>;
}
export function PoolDetail({ pool, portfolio, onClose, onParticipate, onClaim }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<'detail' | 'amount' | 'review' | 'success'>('detail');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ type: 'join' | 'claim'; tokens: number } | null>(null);
  const requestId = useRef('');
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  const allocation = portfolio.allocations.find(a => a.poolId === pool.id);
  const status = poolStatus(pool);
  const available = Math.max(0, Math.min(portfolio.balanceCents, pool.maxCents - (allocation?.amountCents ?? 0), pool.targetCents - pool.raisedCents));
  const validFormat = /^\d+(\.\d{1,2})?$/.test(amount);
  const cents = validFormat ? Math.round(Number(amount) * 100) : 0;
  const validation = amount === '' ? '' : !validFormat ? 'Enter an amount with up to 2 decimal places.' : cents < pool.minCents ? `Minimum contribution is ${money(pool.minCents)} USDT.` : cents > available ? `You can add up to ${money(available)} USDT.` : '';
  const canClaim = !!allocation && !allocation.claimed && Date.now() >= Date.parse(pool.claimAt);
  const canJoin = status === 'live' && available >= pool.minCents;
  const submit = async (claim: boolean) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const updated = claim ? await onClaim(requestId.current) : await onParticipate(cents, requestId.current);
      setResult({ type: claim ? 'claim' : 'join', tokens: claim ? updated.tokenAmount : cents / pool.priceCents });
      setStep('success');
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const goBack = () => { setStep(step === 'review' ? 'amount' : 'detail'); setError(''); requestId.current = ''; };
  useEffect(() => {
    const handleBack = (event: Event) => {
      event.preventDefault();
      if (busyRef.current) return;
      if (step === 'amount' || step === 'review') {
        setStep(step === 'review' ? 'amount' : 'detail');
        setError(''); requestId.current = '';
      } else onClose();
    };
    window.addEventListener('nolandev:back', handleBack);
    return () => window.removeEventListener('nolandev:back', handleBack);
  }, [step, onClose]);
  const buttonText = canClaim ? 'Claim tokens' : allocation?.claimed ? 'Tokens claimed' : status === 'upcoming' ? `Opens ${dateLabel(pool.startsAt)}` : status === 'ended' ? 'Sale ended' : pool.raisedCents >= pool.targetCents ? 'Pool filled' : !canJoin ? 'Allocation unavailable' : 'Participate';
  return createPortal(<dialog ref={dialog} className="lp-dialog" aria-labelledby="lp-detail-title" onCancel={event => { event.preventDefault(); if (!busyRef.current) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busyRef.current) onClose(); }}>
    <div className="lp-sheet">
      <div className="lp-sheet-handle" />
      <header className="lp-sheet-header">
        {step === 'amount' || step === 'review' ? <button className="lp-icon-button" aria-label="Go back" disabled={busy} onClick={goBack}><ArrowLeft size={20} /></button> : <span className="lp-eyebrow">PROJECT DETAILS</span>}
        <button className="lp-icon-button" aria-label="Close project details" disabled={busy} onClick={onClose}><X size={21} /></button>
      </header>
      <div className="lp-sheet-body">
        {step === 'success' && result ? <div className="lp-success" role="status"><div className="lp-success-icon"><Check size={34} /></div><span className="lp-eyebrow">ALL SET</span><h2 id="lp-detail-title">{result.type === 'join' ? 'You’re in.' : 'Tokens claimed.'}</h2><p>{result.type === 'join' ? 'Your allocation is reserved.' : 'Your claim is complete.'}</p><strong>{tokens(result.tokens)} <span>{pool.symbol}</span></strong><p>{result.type === 'join' ? `Claiming opens ${dateLabel(pool.claimAt)}. Find your allocation in My allocations.` : 'You can find this completed claim in My allocations.'}</p></div> : <>
          <div className="lp-detail-identity"><PoolLogo pool={pool} large /><StatusBadge pool={pool} /></div>
          <h2 id="lp-detail-title">{step === 'detail' ? pool.name : step === 'amount' ? 'Your allocation' : 'Review participation'}</h2>
          <p className="lp-detail-subtitle">{step === 'detail' ? `${pool.symbol} · ${pool.category} · ${pool.network}` : `${pool.name} · ${pool.symbol}`}</p>
          {step === 'detail' ? <>
            <p className="lp-description">{pool.description}</p>
            <div className="lp-detail-funding"><div className="lp-raise-label"><strong>{money(pool.raisedCents)} <small>USDT raised</small></strong><span>{Math.round(pool.raisedCents / pool.targetCents * 100)}%</span></div><ProgressBar progress={pool.raisedCents / pool.targetCents * 100} /><p>of {money(pool.targetCents)} USDT <span>{pool.participants.toLocaleString()} participants</span></p></div>
            <dl className="lp-facts"><div><dt>Token price</dt><dd>{money(pool.priceCents)} USDT</dd></div><div><dt>Contribution</dt><dd>{money(pool.minCents)}–{money(pool.maxCents)} USDT</dd></div><div><dt>Network</dt><dd>{pool.network}</dd></div><div><dt>Token unlock</dt><dd>100% at claim</dd></div></dl>
            {allocation && <div className="lp-existing"><CheckCircle2 size={19} /><div>Your allocation<strong>{tokens(allocation.tokenAmount)} {pool.symbol} <small>· {allocation.claimed ? 'Claimed' : `${money(allocation.amountCents)} USDT`}</small></strong></div></div>}
            <h3 className="lp-section-title">Sale timeline</h3>
            <ol className="lp-timeline">{[{ label: 'Sale opens', date: pool.startsAt }, { label: 'Sale closes', date: pool.endsAt }, { label: 'Claim tokens', date: pool.claimAt }].map(item => <li key={item.label} className={Date.now() >= Date.parse(item.date) ? 'is-complete' : ''}><span className="lp-timeline-dot" /><div><strong>{item.label}</strong><span>{new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div></li>)}</ol>
            <h3 className="lp-section-title">At a glance</h3><ul className="lp-highlights">{pool.highlights.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><p className="lp-note">{pool.vesting}</p>
          </> : step === 'amount' ? <>
            <label className="lp-input-label" htmlFor="lp-amount">You contribute</label>
            <div className={`lp-amount-input ${validation ? 'has-error' : ''}`}><input id="lp-amount" autoFocus inputMode="decimal" autoComplete="off" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); setError(''); requestId.current = ''; }} aria-invalid={!!validation} aria-describedby="lp-amount-help" /><span>USDT</span><button onClick={() => setAmount(String(available / 100))}>Max</button></div>
            <div className="lp-balance-line"><Wallet size={14} /> Available balance <strong>{money(portfolio.balanceCents)} USDT</strong></div>
            <p id="lp-amount-help" className={validation ? 'lp-error' : 'lp-input-help'}>{validation || `Min. ${money(pool.minCents)} · Available allocation ${money(available)} USDT`}</p>
            <div className="lp-presets">{[25, 50, 100].map(value => <button key={value} disabled={value * 100 > available || value * 100 < pool.minCents} onClick={() => setAmount(String(value))} className={amount === String(value) ? 'is-active' : ''}>{value} USDT</button>)}</div>
            <div className="lp-estimate"><span>You receive</span><strong>{tokens(cents / pool.priceCents)} <small>{pool.symbol}</small></strong><p>1 {pool.symbol} = {money(pool.priceCents)} USDT</p></div>
            <p className="lp-note">Your balance will be deducted after confirmation. Tokens become claimable {dateLabel(pool.claimAt)}.</p>
          </> : <>
            <dl className="lp-review"><div><dt>You contribute</dt><dd>{money(cents)} USDT</dd></div><div><dt>You receive</dt><dd>{tokens(cents / pool.priceCents)} {pool.symbol}</dd></div><div><dt>Network</dt><dd>{pool.network}</dd></div><div><dt>Claim opens</dt><dd>{dateLabel(pool.claimAt)}</dd></div><div><dt>Balance after</dt><dd>{money(portfolio.balanceCents - cents)} USDT</dd></div></dl>
          </>}
        </>}
        {error && <p className="lp-error" role="alert">{error}</p>}
      </div>
      <footer className="lp-sheet-footer">
        {step === 'detail' && <><span>{status === 'live' && !canClaim ? `From ${money(pool.minCents)} USDT` : canClaim ? `${tokens(allocation!.tokenAmount)} ${pool.symbol} ready to claim` : allocation && !allocation.claimed ? `Claim opens ${dateLabel(pool.claimAt)}` : 'Fixed-price public sale'}</span><button className="lp-button lp-primary" disabled={busy || (!canClaim && !canJoin)} onClick={() => canClaim ? void submit(true) : setStep('amount')}>{busy ? <Loader2 className="lp-spin" size={18} /> : null}{buttonText}{(canJoin || canClaim) && <ArrowRight size={17} />}</button></>}
        {step === 'amount' && <button className="lp-button lp-primary lp-full" disabled={!cents || !!validation || !canJoin} onClick={() => setStep('review')}>Review allocation <ChevronRight size={18} /></button>}
        {step === 'review' && <button className="lp-button lp-primary lp-full" disabled={busy || !canJoin || !!validation} onClick={() => void submit(false)}>{busy ? <Loader2 className="lp-spin" size={18} /> : null}{busy ? 'Confirming…' : 'Confirm participation'}</button>}
        {step === 'success' && <button className="lp-button lp-primary lp-full" onClick={onClose}>Done <Check size={18} /></button>}
      </footer>
    </div>
  </dialog>, document.body);
}
