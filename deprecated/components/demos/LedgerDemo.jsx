import { useId, useMemo, useState } from 'react';
import ledger from '../../content/ledger.json';
import { report, missed, misdated, within, share } from '../../lib/attribution.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// Drag the reporting window and watch the money disappear.
//
// The uploaders picked contacts by signup date. Move the window and the two
// columns come apart: everything a returning customer paid is real money that
// arrived, and none of it is reported. That is the whole bug, and it is much
// easier to see than to explain.
//
// The rows are invented. They have the SHAPE of the real data - new customers,
// returning customers, one payment that lands after its window, one test-mode
// row - and none of it is client data.

const { customers, window: DEFAULT } = ledger;

const money = n => '$' + n.toLocaleString('en-US');

export default function LedgerDemo() {
  const { t } = useI18n();
  const id = useId();
  const [from, setFrom] = useState(DEFAULT.from);
  const [to, setTo] = useState(DEFAULT.to);

  const view = useMemo(() => {
    const bug = report(customers, from, to, 'signup');
    const fix = report(customers, from, to, 'payment');
    const gone = missed(customers, from, to);
    const early = misdated(customers, from, to);
    const lost = gone.reduce((n, r) => n + r.amount, 0);
    return { bug, fix, gone, early, lost, pct: share(lost, fix.revenue) };
  }, [from, to]);

  // Matched on customer and date, not customer alone: one customer may pay
  // more than once, and only some of those payments fall in the window.
  const isMissed = (c, p) => view.gone.some(r => r.id === c.id && r.date === p.date);
  const isEarly = (c, p) => view.early.some(r => r.id === c.id && r.date === p.date);

  return (
    <div className="ledg">
      <div className="ledg__window">
        <div className="ledg__field">
          <label htmlFor={`${id}-from`}>{t('ledg.from')}</label>
          <input id={`${id}-from`} type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="ledg__field">
          <label htmlFor={`${id}-to`}>{t('ledg.to')}</label>
          <input id={`${id}-to`} type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      <p className="ledg__verdict" aria-live="polite">
        {view.pct > 0 ? (
          <>
            <strong className="ledg__pct">{view.pct}%</strong> {t('ledg.verdict')}
          </>
        ) : (
          t('ledg.clean')
        )}
      </p>

      <div className="ledg__cols">
        <div className="ledg__col ledg__col--bug">
          <h4>{t('ledg.bySignup')}</h4>
          <p className="ledg__num">{money(view.bug.revenue)}</p>
          <p className="ledg__sub">{view.bug.count} {t('ledg.conversions')}</p>
        </div>
        <div className="ledg__col ledg__col--fix">
          <h4>{t('ledg.byPayment')}</h4>
          <p className="ledg__num">{money(view.fix.revenue)}</p>
          <p className="ledg__sub">{view.fix.count} {t('ledg.conversions')}</p>
        </div>
      </div>

      <table className="ledg__table">
        <caption className="visually-hidden">{t('ledg.caption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('ledg.customer')}</th>
            <th scope="col">{t('ledg.signedUp')}</th>
            <th scope="col">{t('ledg.paid')}</th>
            <th scope="col">{t('ledg.amount')}</th>
            <th scope="col">{t('ledg.status')}</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => {
            const p = c.payments[0];
            const gone = isMissed(c, p);
            const early = isEarly(c, p);
            const counted = !c.test && within(p.date, from, to) && !gone;
            const state = c.test ? 'test' : gone ? 'missed' : early ? 'early' : counted ? 'ok' : 'out';
            return (
              <tr key={c.id} className={`is-${state}`}>
                <th scope="row">{c.name}</th>
                <td>{c.signup}</td>
                <td>{p.date}</td>
                <td>{money(p.amount)}</td>
                <td>{t(`ledg.state.${state}`)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="demo__note">{t('ledg.note')}</p>
    </div>
  );
}
