/**
 * Rows distilled from “Corporate Commitment Monitor for Indian Food Companies” (PDF).
 * Used only for UI comparison with data returned from the API.
 */
export const INDIAN_FOOD_PDF_BENCHMARK = [
  {
    id: 'britannia-re',
    company: 'Britannia Industries Ltd',
    commitment: '57% renewable electricity by FY2025-26',
    deadline: 'FY2025-26',
    matchTitleIncludes: ['57%', 'renewable', 'FY2025'],
  },
  {
    id: 'britannia-palm',
    company: 'Britannia Industries Ltd',
    commitment: '95% sustainable / RSPO-style palm oil by FY2026-27',
    deadline: 'FY2026-27',
    matchTitleIncludes: ['95%', 'palm', 'FY2026'],
  },
  {
    id: 'nestle-ghg',
    company: 'Nestlé India',
    commitment: '50% GHG reduction by 2030; net-zero by 2050',
    deadline: '2030 / 2050',
    matchTitleIncludes: ['GHG', '2030', '2050', 'net-zero'],
  },
  {
    id: 'tata-pack',
    company: 'Tata Consumer Products',
    commitment: '100% recyclable packaging by 2030',
    deadline: '2030',
    matchTitleIncludes: ['recyclable', 'packaging', '2030'],
  },
  {
    id: 'amul-nz',
    company: 'Amul (GCMMF)',
    commitment: 'Net-zero emissions by 2035',
    deadline: '2035',
    matchTitleIncludes: ['Net-zero', '2035'],
  },
  {
    id: 'parle-pet',
    company: 'Parle Agro',
    commitment: '100% PET bottle waste collection & recycling',
    deadline: 'Ongoing / long-term',
    matchTitleIncludes: ['PET', 'recycl'],
  },
];
