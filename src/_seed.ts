import { CATEGORIES } from '../src/data/tools-data';

function escapeStr(s: any) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

let sql = '';

CATEGORIES.forEach((cat: any, i: number) => {
  sql += `INSERT INTO public.categories (key, label, accent, accent_light, accent_dark, intro_title, intro_text, when_tags, stats, prompts_extra, sort_order) VALUES (${escapeStr(cat.key)}, ${escapeStr(cat.label)}, ${escapeStr(cat.accent)}, ${escapeStr(cat.accentLight)}, ${escapeStr(cat.accentDark)}, ${escapeStr(cat.introTitle)}, ${escapeStr(cat.introText)}, ${escapeStr(JSON.stringify(cat.whenTags))}::jsonb, ${escapeStr(JSON.stringify(cat.stats))}::jsonb, ${cat.promptsExtra ? escapeStr(JSON.stringify(cat.promptsExtra)) + '::jsonb' : 'NULL'}, ${i});\n`;
});

CATEGORIES.forEach((cat: any) => {
  cat.tools.forEach((tool: any, i: number) => {
    const { key, name, url, urlLabel, badge, desc, ...rest } = tool;
    sql += `INSERT INTO public.tools (category_key, key, name, url, url_label, badge, description, data, sort_order) VALUES (${escapeStr(cat.key)}, ${escapeStr(key)}, ${escapeStr(name)}, ${escapeStr(url)}, ${escapeStr(urlLabel)}, ${escapeStr(badge)}, ${escapeStr(desc)}, ${escapeStr(JSON.stringify(rest))}::jsonb, ${i});\n`;
  });
});

console.log(sql);
