import {useEffect, useId, useRef, useState} from 'react';
import {partnerLevels, percent, type PartnerLevelId} from '../../config/partners';
import {formatRub, plans} from '../../config/pricing';
import './PartnerCalculator.css';

const paidPlans = plans.filter(p => p.monthly !== null);

/**
 * Recurring commission estimate. Formula is visible; the result is an estimate, not a promise.
 * Inputs are local state; the result is derived.
 */
export function PartnerCalculator({id}: {id?: string}) {
  const uid = useId();
  const [clients, setClients] = useState(5);
  const [planId, setPlanId] = useState(paidPlans[1].id);
  const [levelId, setLevelId] = useState<PartnerLevelId>('integrator');

  const plan = paidPlans.find(p => p.id === planId)!;
  const level = partnerLevels.find(l => l.id === levelId)!;
  const safeClients = Number.isFinite(clients) ? Math.min(Math.max(clients, 0), 1000) : 0;
  const monthly = Math.round(safeClients * (plan.monthly ?? 0) * level.rate);
  const shown = useCountUp(monthly);

  return (
    <div id={id} className="mk-calc">
      <div className="mk-calc__inputs">
        <label className="mk-calc__field" htmlFor={`${uid}-clients`}>
          <span>Сколько клиентов платят за Scrooty</span>
          <input
            id={`${uid}-clients`}
            type="number"
            inputMode="numeric"
            min={0}
            max={1000}
            step={1}
            value={Number.isFinite(clients) ? clients : ''}
            onChange={e => setClients(e.target.valueAsNumber)}
          />
        </label>
        <label className="mk-calc__field" htmlFor={`${uid}-plan`}>
          <span>Тариф клиентов</span>
          <select id={`${uid}-plan`} value={planId} onChange={e => setPlanId(e.target.value as typeof planId)}>
            {paidPlans.map(p => <option key={p.id} value={p.id}>{p.name} — {formatRub(p.monthly!)} в месяц</option>)}
          </select>
        </label>
        <label className="mk-calc__field" htmlFor={`${uid}-level`}>
          <span>Уровень партнёра</span>
          <select id={`${uid}-level`} value={levelId} onChange={e => setLevelId(e.target.value as PartnerLevelId)}>
            {partnerLevels.map(l => <option key={l.id} value={l.id}>{l.name} — {percent(l.rate)}</option>)}
          </select>
        </label>
      </div>

      <div className="mk-calc__result">
        <p className="mk-calc__label">Recurring-комиссия в месяц</p>
        {/* Visible number counts up; assistive tech gets only the final value, once. */}
        <p className="mk-calc__value" aria-hidden="true">{formatRub(shown)}</p>
        <p className="mk-visually-hidden" aria-live="polite">{formatRub(monthly)} в месяц</p>
        <p className="mk-calc__formula">
          {safeClients} × {formatRub(plan.monthly!)} × {percent(level.rate)} = {formatRub(monthly)}
        </p>
        <p className="mk-calc__note">Оценка, не гарантия дохода. Плюс 100% оплаты за внедрение, которую вы берёте с клиента сами.</p>
      </div>
    </div>
  );
}

/** Short count-up towards the target (≈400ms, rAF). Instant with reduced motion. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = from.current;
    if (reduce || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 400);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(start + (target - start) * eased);
      from.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}
