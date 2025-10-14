// Download a fixed data/chunks.json with spaces -> underscores in selected fields
const RAW_URL = 'https://raw.githubusercontent.com/AlvaRocruIT/chat-screening/main/data/chunks.json';

(async () => {
  const res = await fetch(RAW_URL);
  const data = await res.json();

  const slugify = s => typeof s === 'string' ? s.trim().replace(/\s+/g, '_') : s;

  let touched = 0, valueChanges = 0;

  const updated = data.map(chunk => {
    const out = { ...chunk };
    let localTouched = false;

    if (typeof out.context_type === 'string') {
      const nv = slugify(out.context_type);
      if (nv !== out.context_type) { out.context_type = nv; localTouched = true; valueChanges++; }
    }
    if (Array.isArray(out.semantic_tags)) {
      const before = JSON.stringify(out.semantic_tags);
      out.semantic_tags = out.semantic_tags.map(slugify);
      if (JSON.stringify(out.semantic_tags) !== before) { localTouched = true; valueChanges++; }
    }
    if (Array.isArray(out.keywords)) {
      const before = JSON.stringify(out.keywords);
      out.keywords = out.keywords.map(slugify);
      if (JSON.stringify(out.keywords) !== before) { localTouched = true; valueChanges++; }
    }

    if (localTouched) touched++;
    return out;
  });

  console.log(`Chunks touched: ${touched}, field updates: ${valueChanges}`);

  const blob = new Blob([JSON.stringify(updated, null, 2) + '\n'], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chunks.json'; // upload this to data/chunks.json in GitHub
  a.click();
})();
