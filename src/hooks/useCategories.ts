import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category, Tool } from '@/data/tools-data';

function mapDbToolToTool(dbTool: any): Tool {
  const data = dbTool.data || {};
  return {
    key: dbTool.key,
    name: dbTool.name,
    url: dbTool.url,
    urlLabel: dbTool.url_label,
    badge: dbTool.badge,
    desc: dbTool.description,
    ...data,
  };
}

function mapDbCategoryToCategory(dbCat: any, tools: any[]): Category {
  return {
    key: dbCat.key,
    label: dbCat.label,
    accent: dbCat.accent,
    accentLight: dbCat.accent_light,
    accentDark: dbCat.accent_dark,
    introTitle: dbCat.intro_title,
    introText: dbCat.intro_text,
    whenTags: dbCat.when_tags || [],
    stats: dbCat.stats || [],
    promptsExtra: dbCat.prompts_extra || undefined,
    tools: tools
      .filter((t: any) => t.category_key === dbCat.key)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map(mapDbToolToTool),
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch full data first (Pro/admin will succeed)
      const [catFull, toolFull] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('tools').select('*').order('sort_order'),
      ]);

      let catData: any[] | null = null;
      let toolData: any[] | null = null;

      if (!catFull.error && catFull.data && catFull.data.length > 0) {
        catData = catFull.data;
      }
      if (!toolFull.error && toolFull.data && toolFull.data.length > 0) {
        toolData = toolFull.data;
      }

      // Fall back to public (safe-fields only) RPCs for Free / unauthenticated visitors
      if (!catData) {
        const { data, error } = await (supabase as any).rpc('list_categories_public');
        if (error) throw error;
        catData = data || [];
      }
      if (!toolData) {
        const { data, error } = await (supabase as any).rpc('list_tools_public');
        if (error) throw error;
        toolData = data || [];
      }

      setCategories(
        (catData || []).map((c: any) => mapDbCategoryToCategory(c, toolData || []))
      );
    } catch (err) {
      console.error('Falha ao carregar categorias e ferramentas', err);
      setCategories([]);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o conteúdo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateCategory = useCallback(async (cat: Category) => {
    await supabase.from('categories').update({
      label: cat.label,
      accent: cat.accent,
      accent_light: cat.accentLight,
      accent_dark: cat.accentDark,
      intro_title: cat.introTitle,
      intro_text: cat.introText,
      when_tags: cat.whenTags as any,
      stats: cat.stats as any,
      prompts_extra: (cat.promptsExtra || null) as any,
    }).eq('key', cat.key);

    setCategories(prev => prev.map(c => c.key === cat.key ? { ...cat, tools: c.tools } : c));
  }, []);

  const saveTool = useCallback(async (tool: Tool, categoryKey: string, isNew: boolean) => {
    const { key, name, url, urlLabel, badge, desc, ...rest } = tool;
    const row = {
      category_key: categoryKey,
      key,
      name,
      url,
      url_label: urlLabel,
      badge,
      description: desc,
      data: rest as any,
    };

    if (isNew) {
      await supabase.from('tools').insert(row);
    } else {
      await supabase.from('tools').update(row).eq('key', key);
    }
    await fetchCategories();
  }, [fetchCategories]);

  const deleteTool = useCallback(async (toolKey: string) => {
    await supabase.from('tools').delete().eq('key', toolKey);
    setCategories(prev =>
      prev.map(c => ({ ...c, tools: c.tools.filter(t => t.key !== toolKey) }))
    );
  }, []);

  return { categories, loading, error, fetchCategories, updateCategory, saveTool, deleteTool, setCategories };
}
