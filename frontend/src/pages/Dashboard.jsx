import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { DashboardCommitmentCard } from '../components/DashboardCommitmentCard';
import { PdfBenchmarkCompare } from '../components/PdfBenchmarkCompare';
import './Dashboard.css';

function normalizeId(ref) {
  if (ref == null) return null;
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref._id) return String(ref._id);
  return String(ref);
}

function newsTimestamp(item) {
  const t = item.date || item.createdAt;
  if (!t) return 0;
  const ms = new Date(t).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Latest AI label per commitment, from news that explicitly links to that commitment.
 * Commitments with no such news show "Unrelated".
 */
function buildStatusByCommitmentId(newsList) {
  const map = {};
  const sorted = [...newsList].sort((a, b) => newsTimestamp(b) - newsTimestamp(a));
  sorted.forEach((item) => {
    const cid = normalizeId(item.commitment);
    if (!cid) return;
    const label = item.aiClassification;
    if (!label) return;
    if (map[cid] == null) map[cid] = label;
  });
  return map;
}

/**
 * Dashboard: companies and their commitments with deadline + news-derived status.
 */
export function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [cRes, kRes, nRes] = await Promise.all([
          api.get('/api/companies'),
          api.get('/api/commitments'),
          api.get('/api/news'),
        ]);
        if (!cancelled) {
          setCompanies(Array.isArray(cRes.data) ? cRes.data : []);
          setCommitments(Array.isArray(kRes.data) ? kRes.data : []);
          setNews(Array.isArray(nRes.data) ? nRes.data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.error ||
              e.message ||
              'Could not load dashboard. Is the API running?'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusByCommitmentId = useMemo(() => buildStatusByCommitmentId(news), [news]);

  const companyNameById = useMemo(() => {
    const m = {};
    companies.forEach((c) => {
      m[String(c._id)] = c.name;
    });
    return m;
  }, [companies]);

  const commitmentsByCompany = useMemo(() => {
    const map = {};
    commitments.forEach((k) => {
      const cid = normalizeId(k.company);
      if (!cid) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push(k);
    });
    Object.keys(map).forEach((cid) => {
      map[cid].sort((a, b) => {
        const da = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
        const db = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;
        if (da !== db) return da - db;
        return (a.title || '').localeCompare(b.title || '');
      });
    });
    return map;
  }, [commitments]);

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [companies]
  );

  /** News items flagged critical (Delay / Reversal) — newest first */
  const alertItems = useMemo(() => {
    return [...news]
      .filter((n) => n.alert === true)
      .sort((a, b) => newsTimestamp(b) - newsTimestamp(a));
  }, [news]);

  return (
    <div className="dashboard page">
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__subtitle">
          Companies, sustainability commitments, deadlines, and how the latest linked news was
          classified.
        </p>
      </div>

      {!loading && !error && alertItems.length > 0 ? (
        <div className="dashboard-alert" role="alert">
          <div className="dashboard-alert__title-row">
            <span className="dashboard-alert__icon" aria-hidden="true">
              !
            </span>
            <h2 className="dashboard-alert__title">Critical updates</h2>
          </div>
          <p className="dashboard-alert__summary">
            {alertItems.length === 1
              ? '1 news item is classified as Delay or Reversal and needs attention.'
              : `${alertItems.length} news items are classified as Delay or Reversal and need attention.`}
          </p>
          <ul className="dashboard-alert__list">
            {alertItems.slice(0, 8).map((item) => (
              <li key={item._id} className="dashboard-alert__item">
                <span className="dashboard-alert__item-title">{item.title}</span>
                <span className="dashboard-alert__item-meta">
                  {companyNameById[String(item.companyId)] || 'Company'}{' '}
                  <span className="dashboard-alert__pill">{item.aiClassification}</span>
                </span>
              </li>
            ))}
          </ul>
          {alertItems.length > 8 ? (
            <p className="dashboard-alert__more">+ {alertItems.length - 8} more flagged items</p>
          ) : null}
        </div>
      ) : null}

      {loading ? <p className="page__muted">Loading…</p> : null}
      {error ? (
        <p className="page__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && companies.length === 0 ? (
        <p className="page__muted">No companies yet. Add one from the menu.</p>
      ) : null}

      {!loading && !error && sortedCompanies.length > 0 ? (
        <div className="dashboard__companies">
          {sortedCompanies.map((company) => {
            const id = String(company._id);
            const rows = commitmentsByCompany[id] || [];
            return (
              <section key={id} className="dashboard__company-block" aria-labelledby={`co-${id}`}>
                <h2 id={`co-${id}`} className="dashboard__company-name">
                  {company.name}
                </h2>
                {rows.length === 0 ? (
                  <p className="dashboard__empty">No commitments yet for this company.</p>
                ) : (
                  <div className="dashboard__card-list">
                    {rows.map((k) => {
                      const kid = String(k._id);
                      const rawStatus = statusByCommitmentId[kid];
                      const status = rawStatus || 'Unrelated';
                      const coName = companyNameById[id] || company.name;
                      const critical = status === 'Delay' || status === 'Reversal';
                      return (
                        <DashboardCommitmentCard
                          key={kid}
                          companyName={coName}
                          commitmentTitle={k.title}
                          deadline={k.targetDate}
                          status={status}
                          critical={critical}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : null}

      {!loading && !error ? (
        <PdfBenchmarkCompare companies={companies} commitments={commitments} />
      ) : null}
    </div>
  );
}

export default Dashboard;
