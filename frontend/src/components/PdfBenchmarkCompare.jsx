import { useMemo } from 'react';
import { INDIAN_FOOD_PDF_BENCHMARK } from '../data/indianFoodPdfBenchmark';
import './PdfBenchmarkCompare.css';

function norm(s) {
  return (s || '').toLowerCase().trim();
}

/**
 * Link a PDF benchmark row to a commitment from the API (same company + title hints).
 */
function matchRow(pdfRow, companies, commitments) {
  const co = companies.find((c) => c.name === pdfRow.company);
  if (!co) return { status: 'missing-company', commitment: null };

  const cid = String(co._id);
  const ours = commitments.filter((k) => {
    const kc = typeof k.company === 'object' && k.company?._id ? String(k.company._id) : String(k.company);
    return kc === cid;
  });

  const titleN = (t) => norm(t);
  const hit = ours.find((k) => {
    const t = titleN(k.title);
    return pdfRow.matchTitleIncludes.every((frag) => t.includes(norm(frag)));
  });

  if (hit) return { status: 'ok', commitment: hit };

  const loose = ours.find((k) => {
    const t = titleN(k.title);
    return pdfRow.matchTitleIncludes.some((frag) => t.includes(norm(frag)));
  });
  if (loose) return { status: 'partial', commitment: loose };

  return { status: 'missing-commitment', commitment: null };
}

/**
 * Side-by-side PDF reference vs loaded API data.
 */
export function PdfBenchmarkCompare({ companies, commitments }) {
  const rows = useMemo(() => {
    return INDIAN_FOOD_PDF_BENCHMARK.map((pdf) => {
      const { status, commitment } = matchRow(pdf, companies, commitments);
      return { pdf, status, commitment };
    });
  }, [companies, commitments]);

  const ok = rows.filter((r) => r.status === 'ok').length;
  const partial = rows.filter((r) => r.status === 'partial').length;

  return (
    <section className="pdf-compare" aria-labelledby="pdf-compare-title">
      <h2 id="pdf-compare-title" className="pdf-compare__title">
        Compare with PDF benchmark (Indian food companies)
      </h2>
      <p className="pdf-compare__intro">
        These rows summarize the design PDF you added. Load the same records into MongoDB with{' '}
        <code className="pdf-compare__code">npm run seed:indian-food</code> from the{' '}
        <strong>backend</strong> folder, then refresh. Green checkmarks mean the API has a matching
        commitment for that PDF line.
      </p>
      <p className="pdf-compare__summary">
        <span className="pdf-compare__stat">
          Exact match: <strong>{ok}</strong> / {rows.length}
        </span>
        {partial ? (
          <span className="pdf-compare__stat">
            Partial: <strong>{partial}</strong>
          </span>
        ) : null}
      </p>

      <div className="pdf-compare__table-wrap">
        <table className="pdf-compare__table">
          <thead>
            <tr>
              <th scope="col">PDF (reference)</th>
              <th scope="col">In this app</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pdf, status, commitment }) => (
              <tr key={pdf.id}>
                <td>
                  <div className="pdf-compare__pdf-co">{pdf.company}</div>
                  <div className="pdf-compare__pdf-text">{pdf.commitment}</div>
                  <div className="pdf-compare__pdf-deadline">Deadline: {pdf.deadline}</div>
                </td>
                <td>
                  <div className="pdf-compare__app-row">
                    {status === 'ok' ? (
                      <span className="pdf-compare__pill pdf-compare__pill--ok" title="Matches PDF row">
                        Loaded ✓
                      </span>
                    ) : null}
                    {status === 'partial' ? (
                      <span className="pdf-compare__pill pdf-compare__pill--warn" title="Close match">
                        Partial ✓
                      </span>
                    ) : null}
                    {status === 'missing-company' ? (
                      <span className="pdf-compare__pill pdf-compare__pill--bad">Company missing</span>
                    ) : null}
                    {status === 'missing-commitment' ? (
                      <span className="pdf-compare__pill pdf-compare__pill--bad">Commitment missing</span>
                    ) : null}
                  </div>
                  {commitment ? (
                    <>
                      <div className="pdf-compare__app-title">{commitment.title}</div>
                      {commitment.targetDate ? (
                        <div className="pdf-compare__app-meta">
                          Target:{' '}
                          {new Date(commitment.targetDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="pdf-compare__app-empty">—</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PdfBenchmarkCompare;
