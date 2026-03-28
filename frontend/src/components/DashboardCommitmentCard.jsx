import './DashboardCommitmentCard.css';

/**
 * Card for one commitment: company name, pledge, deadline, news-based status badge.
 */
export function DashboardCommitmentCard({
  companyName,
  commitmentTitle,
  deadline,
  status,
  critical = false,
}) {
  const deadlineLabel =
    deadline != null && deadline !== ''
      ? new Date(deadline).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const badgeClass = statusBadgeClass(status);
  const cls = critical
    ? 'dash-commitment-card dash-commitment-card--critical'
    : 'dash-commitment-card';

  return (
    <article className={cls}>
      <p className="dash-commitment-card__company">{companyName}</p>
      <h3 className="dash-commitment-card__title">{commitmentTitle}</h3>
      <dl className="dash-commitment-card__meta">
        <div className="dash-commitment-card__row">
          <dt>Deadline</dt>
          <dd>{deadlineLabel}</dd>
        </div>
        <div className="dash-commitment-card__row">
          <dt>Status</dt>
          <dd>
            <span className={`dash-commitment-card__badge ${badgeClass}`}>{status}</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** Progress → green; Delay & Reversal → red; Unrelated → gray */
function statusBadgeClass(status) {
  if (status === 'Progress') return 'dash-commitment-card__badge--progress';
  if (status === 'Delay' || status === 'Reversal')
    return 'dash-commitment-card__badge--risk';
  return 'dash-commitment-card__badge--unrelated';
}

export default DashboardCommitmentCard;
