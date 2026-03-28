/**
 * Classify news vs a sustainability commitment using Hugging Face, OpenAI, or a keyword mock.
 */
const NewsEvent = require('../models/NewsEvent');

const LABELS = NewsEvent.classificationValues;

/**
 * Build the user prompt exactly in the requested format (used for OpenAI and as context text for HF).
 */
function buildClassificationPrompt(companyName, commitmentText, newsText) {
  return `Company: ${companyName}
Commitment: ${commitmentText}
News: ${newsText}

Classify into one:
- Progress
- Delay
- Reversal
- Unrelated

Return JSON only with this shape (no markdown):
{
  "label": "",
  "confidence": "",
  "reason": ""
}

Use label exactly one of: Progress, Delay, Reversal, Unrelated.
confidence: a number from 0 to 1 as a string (e.g. "0.85").`;
}

/** Short text block for HF zero-shot (premise = company + commitment + news) */
function buildClassificationSequence(companyName, commitmentText, newsText) {
  return `Company: ${companyName}
Commitment: ${commitmentText}
News: ${newsText}`;
}

/**
 * Normalize model output to a valid label enum.
 */
function normalizeLabel(raw) {
  if (!raw || typeof raw !== 'string') return 'Unrelated';
  const t = raw.trim();
  const found = LABELS.find((l) => l.toLowerCase() === t.toLowerCase());
  return found || 'Unrelated';
}

/**
 * Parse confidence to 0–1 number; invalid values become a low default.
 */
function normalizeConfidence(raw) {
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return Math.min(1, Math.max(0, raw));
  }
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/%/g, '').trim(), 10);
    if (!Number.isNaN(n)) {
      const scaled = n > 1 ? n / 100 : n;
      return Math.min(1, Math.max(0, scaled));
    }
  }
  return 0.5;
}

/**
 * Keyword-based mock when cloud APIs are unavailable or fail.
 */
function mockClassify(newsText, commitmentText) {
  const text = (newsText || '').toLowerCase();

  const score = { Progress: 0, Delay: 0, Reversal: 0, Unrelated: 0 };

  const progressHits = ['progress', 'milestone', 'reduce', 'reduction', 'achieved', 'exceed', 'renewable', 'invest', 'expand', 'success', 'ahead of'];
  const delayHits = ['delay', 'postpone', 'extended', 'push back', 'setback', 'late', 'slower', 'reschedule'];
  const reversalHits = ['abandon', 'withdraw', 'rollback', 'scrap', 'repeal', 'u-turn', 'reverse', 'cancel commitment', 'dropped'];

  progressHits.forEach((w) => {
    if (text.includes(w)) score.Progress += 1;
  });
  delayHits.forEach((w) => {
    if (text.includes(w)) score.Delay += 1;
  });
  reversalHits.forEach((w) => {
    if (text.includes(w)) score.Reversal += 1;
  });

  let label = 'Unrelated';
  let best = 0;
  ['Progress', 'Delay', 'Reversal'].forEach((k) => {
    if (score[k] > best) {
      best = score[k];
      label = k;
    }
  });

  if (best === 0) {
    return {
      label: 'Unrelated',
      confidence: 0.55,
      reason:
        'Mock classifier: no strong keyword match in the news text; treating as unrelated (no cloud API).',
    };
  }

  const confidence = Math.min(0.95, 0.45 + best * 0.15);
  const commitmentNote =
    commitmentText && commitmentText.trim()
      ? ' Compared against the supplied commitment text.'
      : '';
  return {
    label,
    confidence,
    reason: `Mock classifier: matched ${best} keyword(s) in the news suggesting ${label.toLowerCase()} (no cloud API).${commitmentNote}`,
  };
}

/**
 * Hugging Face Inference API — zero-shot NLI (e.g. BART-MNLI) with our four labels.
 */
async function classifyWithHuggingFace(newsText, commitmentText, companyName) {
  const token = (process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN || '').trim();
  if (!token) return null;

  const model = (process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-mnli').trim();
  const sequence = buildClassificationSequence(companyName, commitmentText, newsText);

  // Legacy api-inference.huggingface.co returns 410; use the inference router.
  const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: sequence,
      parameters: {
        // Same four classes the app uses
        candidate_labels: [...LABELS],
      },
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HF ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();

  if (data && !Array.isArray(data) && data.error) {
    throw new Error(String(data.error));
  }

  // Router returns [{ label, score }, ...] sorted by score (highest first).
  if (Array.isArray(data) && data.length && data[0].label !== undefined && data[0].score !== undefined) {
    const top = data[0];
    const rawLabel = top.label;
    const confidence = Math.min(1, Math.max(0, Number(top.score) || 0));
    const rest = data
      .slice(1, 4)
      .map((row) => `${row.label}=${Number(row.score).toFixed(3)}`)
      .join(', ');
    return {
      label: normalizeLabel(rawLabel),
      confidence,
      reason: `Hugging Face zero-shot (${model}): top label "${rawLabel}" with score ${confidence.toFixed(3)}${rest ? `; ${rest}` : ''}`,
    };
  }

  // Older payloads used { labels: [], scores: [] } on a single object
  const row = Array.isArray(data) ? data[0] : data;
  if (row && Array.isArray(row.labels) && Array.isArray(row.scores) && row.labels.length) {
    const rawLabel = row.labels[0];
    const confidence = Math.min(1, Math.max(0, Number(row.scores[0]) || 0));
    return {
      label: normalizeLabel(rawLabel),
      confidence,
      reason: `Hugging Face zero-shot (${model}): top label "${rawLabel}" with score ${confidence.toFixed(
        3
      )}; other scores: ${row.labels.slice(1, 4).map((l, i) => `${l}=${row.scores[i + 1]?.toFixed(3)}`).join(', ')}`,
    };
  }

  throw new Error('Unexpected Hugging Face response shape');
}

/**
 * OpenAI Chat Completions — JSON object with label, confidence, reason.
 */
async function classifyWithOpenAI(newsText, commitmentText, companyName) {
  const OpenAI = require('openai');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey: apiKey.trim() });

  const userContent = buildClassificationPrompt(companyName, commitmentText, newsText);

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You classify sustainability news against a company commitment. Reply with only one JSON object: label, confidence, reason. label must be exactly Progress, Delay, Reversal, or Unrelated.',
      },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  return {
    label: normalizeLabel(parsed.label),
    confidence: normalizeConfidence(parsed.confidence),
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
}

/**
 * One retry after a short wait (HF cold starts sometimes return 503 despite wait_for_model).
 */
async function classifyWithHuggingFaceRetry(newsText, commitmentText, companyName) {
  try {
    return await classifyWithHuggingFace(newsText, commitmentText, companyName);
  } catch (first) {
    if (!String(first.message).includes('503')) throw first;
    await new Promise((r) => setTimeout(r, 15_000));
    return classifyWithHuggingFace(newsText, commitmentText, companyName);
  }
}

/**
 * Classify news text against a commitment and company name.
 * Order: Hugging Face token → OpenAI key → keyword mock.
 *
 * @param {string} newsText
 * @param {string} commitmentText
 * @param {string} companyName
 * @returns {Promise<{ label: string, confidence: number, reason: string }>}
 */
async function classifyNews(newsText, commitmentText, companyName) {
  const safeNews = typeof newsText === 'string' ? newsText : '';
  const safeCommitment = typeof commitmentText === 'string' ? commitmentText : '';
  const safeCompany = typeof companyName === 'string' ? companyName : 'Unknown company';

  const hasHf = Boolean((process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN || '').trim());
  const hasOpenAi = Boolean((process.env.OPENAI_API_KEY || '').trim());

  if (hasHf) {
    try {
      const hf = await classifyWithHuggingFaceRetry(safeNews, safeCommitment, safeCompany);
      if (hf) return hf;
    } catch (err) {
      console.warn('classifyNews Hugging Face fallback:', err.message);
    }
  }

  if (hasOpenAi) {
    try {
      const ai = await classifyWithOpenAI(safeNews, safeCommitment, safeCompany);
      if (ai) return ai;
    } catch (err) {
      console.warn('classifyNews OpenAI fallback:', err.message);
    }
  }

  return mockClassify(safeNews, safeCommitment);
}

module.exports = {
  classifyNews,
  mockClassify,
  buildClassificationPrompt,
  buildClassificationSequence,
  normalizeLabel,
  normalizeConfidence,
  classifyWithHuggingFace,
  classifyWithOpenAI,
};
