import './CompanyCard.css';

/**
 * Card summarizing a company for the dashboard grid.
 */
export function CompanyCard({ company, commitmentCount }) {
  const { name, industry, website, description } = company;

  return (
    <article className="company-card">
      <h3 className="company-card__title">{name}</h3>
      {industry ? (
        <p className="company-card__meta">
          <span className="company-card__label">Industry</span> {industry}
        </p>
      ) : null}
      {website ? (
        <p className="company-card__meta">
          <span className="company-card__label">Web</span>{' '}
          <a href={website} target="_blank" rel="noreferrer" className="company-card__link">
            {website.replace(/^https?:\/\//i, '')}
          </a>
        </p>
      ) : null}
      {description ? (
        <p className="company-card__desc">{description}</p>
      ) : (
        <p className="company-card__desc company-card__desc--muted">No description yet.</p>
      )}
      {typeof commitmentCount === 'number' ? (
        <p className="company-card__footer">
          <span className="badge badge--neutral">{commitmentCount} commitments</span>
        </p>
      ) : null}
    </article>
  );
}

export default CompanyCard;
