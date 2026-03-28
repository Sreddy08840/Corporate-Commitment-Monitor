/**
 * Seed MongoDB with companies & commitments from
 * "Corporate Commitment Monitor for Indian Food Companies" (PDF benchmark).
 * Safe to run multiple times: skips rows that already exist (by company name + commitment title).
 *
 * Usage (from backend folder): npm run seed:indian-food
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../src/models/Company');
const Commitment = require('../src/models/Commitment');
const NewsEvent = require('../src/models/NewsEvent');

const PDF_COMPANIES = [
  {
    name: 'Britannia Industries Ltd',
    industry: 'Food & Beverage / FMCG',
    website: 'https://www.britannia.co.in',
    description:
      'Indian bakery & dairy major. Benchmark data from the Indian Food Companies PDF (sustainability reporting).',
  },
  {
    name: 'Nestlé India',
    industry: 'Food & Beverage / FMCG',
    website: 'https://www.nestle.in',
    description: 'FMCG subsidiary aligned with Nestlé global climate & packaging goals (PDF benchmark).',
  },
  {
    name: 'Tata Consumer Products',
    industry: 'Food & Beverage / FMCG',
    website: 'https://www.tataconsumer.com',
    description: 'Tea, coffee, foods — Tata Group Aalingana & India Plastics Pact (PDF benchmark).',
  },
  {
    name: 'Amul (GCMMF)',
    industry: 'Dairy cooperative (FMCG)',
    website: 'https://www.amul.com',
    description: 'GCMMF — net-zero and clean energy commitments (PDF benchmark).',
  },
  {
    name: 'Parle Agro',
    industry: 'Food & Beverage / FMCG',
    website: 'https://www.parleagro.com',
    description: 'Beverages — PET collection & recycling programme (PDF benchmark).',
  },
];

// Deadlines: FY end ≈ March; PDF cites FY2025-26, FY2026-27, etc.
const PDF_COMMITMENTS = [
  {
    companyName: 'Britannia Industries Ltd',
    title: '57% renewable electricity by FY2025-26',
    description:
      'Raise renewable electricity from ~28% (FY2024) to 57% by FY2025-26 per Britannia sustainability disclosures (PDF §1).',
    category: 'Renewable energy',
    targetDate: new Date('2026-03-31'),
  },
  {
    companyName: 'Britannia Industries Ltd',
    title: '95% sustainable palm oil by FY2026-27',
    description:
      'Source 95% of palm from sustainable suppliers by FY2026-27 (PDF cites RSPO-style sourcing).',
    category: 'Sustainable sourcing',
    targetDate: new Date('2027-03-31'),
  },
  {
    companyName: 'Nestlé India',
    title: '50% GHG reduction by 2030; net-zero by 2050',
    description:
      'Nestlé global pathway: ~50% GHG cut by 2030 vs baseline; net-zero by 2050; renewable electricity in factories (PDF §1).',
    category: 'Emissions',
    targetDate: new Date('2030-12-31'),
  },
  {
    companyName: 'Tata Consumer Products',
    title: '100% recyclable packaging by 2030',
    description:
      'Tata Aalingana: 100% recyclable packaging by 2030; India Plastics Pact founding member (PDF §1).',
    category: 'Packaging',
    targetDate: new Date('2030-12-31'),
  },
  {
    companyName: 'Amul (GCMMF)',
    title: 'Net-zero emissions by 2035',
    description:
      'GCMMF net-zero by 2035 with clean energy & circularity (PDF §1; report cited there).',
    category: 'Net-zero',
    targetDate: new Date('2035-12-31'),
  },
  {
    companyName: 'Parle Agro',
    title: '100% PET bottle waste collection & recycling',
    description:
      'Zero PET-waste goal; ₹50 crore over 3 years from ~2019 for waste management (PDF §1).',
    category: 'Plastic / circularity',
    targetDate: new Date('2030-12-31'),
  },
];

// Sample “Progress” news aligned with PDF examples (no live LLM call).
const PDF_SAMPLE_NEWS = [
  {
    companyName: 'Britannia Industries Ltd',
    commitmentTitle: '57% renewable electricity by FY2025-26',
    title: 'Britannia achieved ~45% renewable electricity in FY2024',
    content:
      'Britannia sustainability reporting indicates renewable electricity around 45% in FY2024, on path toward the 57% FY2025-26 target (PDF benchmark scenario).',
    publishedAt: new Date('2024-09-15'),
    aiClassification: 'Progress',
    aiConfidence: 0.9,
    aiReason: 'Seeded sample matching PDF: progress toward renewable electricity goal.',
    alert: false,
  },
  {
    companyName: 'Tata Consumer Products',
    commitmentTitle: '100% recyclable packaging by 2030',
    title: 'Recyclable packaging share reported ~60%',
    content:
      'Illustrative progress update toward 100% recyclable packaging by 2030 (PDF mentions example reporting).',
    publishedAt: new Date('2024-11-01'),
    aiClassification: 'Progress',
    aiConfidence: 0.85,
    aiReason: 'Seeded sample: steps toward recyclable packaging pledge.',
    alert: false,
  },
];

async function ensureCompany(row) {
  let doc = await Company.findOne({ name: row.name });
  if (!doc) {
    doc = await Company.create(row);
    console.log('+ company', row.name);
  } else {
    console.log('= company exists', row.name);
  }
  return doc;
}

async function ensureCommitment(companyId, row) {
  const existing = await Commitment.findOne({ company: companyId, title: row.title });
  if (existing) {
    console.log('  = commitment exists', row.title.slice(0, 50));
    return existing;
  }
  const c = await Commitment.create({
    company: companyId,
    title: row.title,
    description: row.description,
    category: row.category,
    targetDate: row.targetDate,
    status: 'active',
  });
  console.log('  + commitment', row.title.slice(0, 60));
  return c;
}

async function ensureSampleNews(companyId, commitmentId, row) {
  const dup = await NewsEvent.findOne({ company: companyId, title: row.title });
  if (dup) {
    console.log('  = news exists', row.title.slice(0, 50));
    return;
  }
  await NewsEvent.create({
    company: companyId,
    commitment: commitmentId,
    title: row.title,
    content: row.content,
    publishedAt: row.publishedAt,
    aiClassification: row.aiClassification,
    aiConfidence: row.aiConfidence,
    aiReason: row.aiReason,
    alert: row.alert,
  });
  console.log('  + news', row.title.slice(0, 55));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  const companyByName = {};
  for (const c of PDF_COMPANIES) {
    const doc = await ensureCompany(c);
    companyByName[c.name] = doc._id;
  }

  const commitmentByKey = {};
  for (const row of PDF_COMMITMENTS) {
    const cid = companyByName[row.companyName];
    if (!cid) {
      console.warn('Skip commitment, unknown company:', row.companyName);
      continue;
    }
    const doc = await ensureCommitment(cid, row);
    commitmentByKey[`${row.companyName}||${row.title}`] = doc._id;
  }

  for (const n of PDF_SAMPLE_NEWS) {
    const cid = companyByName[n.companyName];
    const kid = commitmentByKey[`${n.companyName}||${n.commitmentTitle}`];
    if (!cid || !kid) {
      console.warn('Skip news (missing company/commitment):', n.title);
      continue;
    }
    await ensureSampleNews(cid, kid, n);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
