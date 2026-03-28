import { useEffect, useState } from 'react';
import api from '../api/client';
import NewsForm from '../components/NewsForm';
import './AddNews.css';

/**
 * Page wrapper: loads companies then renders NewsForm.
 */
export function AddNews() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/companies');
        if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.error ||
              e.message ||
              'Could not load companies. Is the API running?'
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

  return (
    <div className="page add-news">
      <div className="page__header">
        <h1 className="page__title">Add news</h1>
        <p className="page__subtitle">
          Paste or type an update; we&apos;ll classify it against the company&apos;s commitments.
        </p>
      </div>

      {loading ? <p className="page__muted">Loading companies…</p> : null}
      {error ? (
        <p className="page__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && companies.length === 0 ? (
        <p className="page__muted">Add a company first, then you can attach news to it.</p>
      ) : null}

      {!loading && !error && companies.length > 0 ? (
        <div className="add-news__form-wrap">
          <NewsForm companies={companies} />
        </div>
      ) : null}
    </div>
  );
}

export default AddNews;
