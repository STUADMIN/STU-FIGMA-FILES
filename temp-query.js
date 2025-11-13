const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('env set?', !!url, !!anon);
const supabase = createClient(url, anon);

async function run() {
  const slug = 'TEN-20251110-0I0G';
  const cleaned = slug.replace(/[\r\n]+/g, '');
  const candidateValues = new Set([
    cleaned,
    cleaned.toUpperCase(),
    cleaned.toLowerCase(),
    cleaned.replace(/\s+/g, ''),
  ]);
  const orFilters = [];
  for (const value of candidateValues) {
    if (!value) continue;
    const escaped = value.replace(/,/g, '\\,');
    orFilters.push(`tender_id.eq.${escaped}`);
    orFilters.push(`tender_id.ilike.${escaped}`);
  }
  console.log('filters', orFilters);
  const { data, error } = await supabase
    .from('tenders')
    .select('id, tender_id')
    .or(orFilters.join(','));
  console.log('error', error);
  console.log('data', data);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
