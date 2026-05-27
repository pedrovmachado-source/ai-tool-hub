UPDATE site_settings 
SET value = '[
  {"key": "menu", "color": "text-brand-amber", "icon": "Sparkles", "label": "Ais", "target": "ferramentas", "enabled": true, "sort_order": 1},
  {"key": "offers", "color": "text-brand-amber", "icon": "Sparkles", "label": "Ofertas validadas", "target": "ofertas", "enabled": true, "sort_order": 2},
  {"key": "site-creation", "color": "text-brand-blue-medium", "icon": "Globe2", "label": "Comprar Site", "target": "site-creation", "enabled": true, "sort_order": 3},
  {"key": "creative-edit", "color": "text-brand-teal", "icon": "Wand2", "label": "Comprar Criativo", "target": "creative-edit", "enabled": true, "sort_order": 4},
  {"key": "lessons", "color": "text-brand-blue-medium", "icon": "GraduationCap", "label": "Aulas gravadas", "target": "mentorias", "enabled": true, "sort_order": 5},
  {"key": "alunos", "color": "text-brand-purple", "icon": "Users", "label": "Área do Mentorado", "target": "alunos", "enabled": true, "sort_order": 6}
]'::jsonb
WHERE key = 'nav_menu_items';