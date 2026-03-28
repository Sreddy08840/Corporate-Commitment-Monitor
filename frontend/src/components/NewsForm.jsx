import { useEffect, useState } from 'react';
import api from '../api/client';
import './NewsForm.css';

const emptyForm = {
  companyId: '',
  commitmentId: '',
  title: '',
  content: '',
  date: '',
};

/**
 * Form to add a news item; loads commitments when a company is selected.
 */
export function NewsForm({ companies, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [commitments, setCommitments] = useState([]);
  const [loadingCommitments, setLoadingCommitments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!form.companyId) {
      setCommitments([]);
      setForm((f) => ({ ...f, commitmentId: '' }));
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingCommitments(true);
      try {
        const { data } = await api.get('/api/commitments', {
          params: { companyId: form.companyId },
        });
        if (!cancelled) {
          setCommitments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setCommitments([]);
      } finally {
        if (!cancelled) setLoadingCommitments(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.companyId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
    setResult(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!form.companyId || !form.title.trim() || form.content === '') {
      setError('Company, title, and content are required.');
      return;
    }

    const payload = {
      companyId: form.companyId,
      title: form.title.trim(),
      content: form.content,
    };
    if (form.commitmentId) payload.commitmentId = form.commitmentId;
    if (form.date) payload.date = new Date(form.date).toISOString();

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/news', payload);
      setResult(data);
      setForm((f) => ({
        ...emptyForm,
        companyId: f.companyId,
      }));
      if (typeof onCreated === 'function') onCreated(data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Could not save news. Is the API running?';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="news-form card" onSubmit={handleSubmit}>
      <h2 className="news-form__heading">New article or update</h2>
      <p className="news-form__hint">
        The API will classify this item (Progress, Delay, Reversal, Unrelated) using your
        Hugging Face / OpenAI setup.
      </p>

      <label className="field">
        <span className="field__label">Company</span>
        <select
          name="companyId"
          className="field__input"
          value={form.companyId}
          onChange={handleChange}
          required
        >
          <option value="">Select a company…</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">
          Commitment <span className="field__optional">(optional)</span>
        </span>
        <select
          name="commitmentId"
          className="field__input"
          value={form.commitmentId}
          onChange={handleChange}
          disabled={!form.companyId || loadingCommitments}
        >
          <option value="">Use all commitments for this company</option>
          {commitments.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Title</span>
        <input
          type="text"
          name="title"
          className="field__input"
          value={form.title}
          onChange={handleChange}
          placeholder="Headline"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">Content</span>
        <textarea
          name="content"
          className="field__input field__input--area"
          rows={6}
          value={form.content}
          onChange={handleChange}
          placeholder="Article text or summary for classification"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">
          Published date <span className="field__optional">(optional)</span>
        </span>
        <input
          type="datetime-local"
          name="date"
          className="field__input"
          value={form.date}
          onChange={handleChange}
        />
      </label>

      {error ? (
        <p className="news-form__alert news-form__alert--error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save & classify'}
      </button>

      {result ? (
        <div className="news-form__result">
          {result.alert ? (
            <div className="news-form__critical" role="alert">
              <strong>Critical alert</strong>
              <span>
                {' '}
                This update is classified as <strong>{result.aiClassification}</strong> — review the
                commitment impact.
              </span>
            </div>
          ) : null}
          <p className="news-form__result-title">Classification</p>
          <div className="news-form__badges">
            <span className={`badge badge--${(result.aiClassification || 'unrelated').toLowerCase()}`}>
              {result.aiClassification || '—'}
            </span>
            {result.aiConfidence != null ? (
              <span className="badge badge--neutral">
                Confidence {(Number(result.aiConfidence) * 100).toFixed(0)}%
              </span>
            ) : null}
          </div>
          {result.aiReason ? (
            <p className="news-form__reason">{result.aiReason}</p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export default NewsForm;
