import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './AddCompany.css';

const initial = { name: '', industry: '', website: '', description: '' };

/**
 * Form to register a new company.
 */
export function AddCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/companies', {
        name: form.name.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        description: form.description.trim(),
      });
      setSuccess('Company saved.');
      setForm(initial);
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Could not save company. Is the API running?'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page add-company">
      <div className="page__header">
        <h1 className="page__title">Add company</h1>
        <p className="page__subtitle">
          Register an organization you want to monitor for sustainability commitments.
        </p>
      </div>

      <form className="card add-company__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="field__input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Northwind Energy"
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Industry</span>
          <input
            className="field__input"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="e.g. Utilities"
          />
        </label>
        <label className="field">
          <span className="field__label">Website</span>
          <input
            className="field__input"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://…"
            type="text"
          />
        </label>
        <label className="field">
          <span className="field__label">Description</span>
          <textarea
            className="field__input field__input--area"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Short note on what this company does."
          />
        </label>

        {error ? (
          <p className="add-company__alert add-company__alert--error" role="alert">
            {error}
          </p>
        ) : null}
        {success ? <p className="add-company__alert add-company__alert--ok">{success}</p> : null}

        <div className="add-company__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save company'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCompany;
