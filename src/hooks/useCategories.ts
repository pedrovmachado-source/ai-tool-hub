import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Category, Tool } from '@/data/tools-data';
import { toast } from '@/hooks/use-toast';

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

async function fetchCategoriesData(): Promise<Category[]> {
  const [catFull, toolFull] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('tools').select('*').order('sort_order'),
  ]);

  let catData: any[] | null = null;
  let toolData: any[] | null = null;

  if (!catFull.error && catFull.data && catFull.data.length > 0) catData = catFull.data;
  if (!toolFull.error && toolFull.data && toolFull.data.length > 0) toolData = toolFull.data;

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

  return (catData || []).map((c: any) => mapDbCategoryToCategory(c, toolData || []));
}

const CATEGORIES_KEY = ['categories'] as const;

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategoriesData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const fetchCategories = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const setCategories = useCallback((updater: Category[] | ((prev: Category[]) => Category[])) => {
    queryClient.setQueryData<Category[]>(CATEGORIES_KEY, (prev = []) =>
      typeof updater === 'function' ? (updater as any)(prev) : updater
    );
  }, [queryClient]);

  const updateCategory = useCallback(async (cat: Category) => {
    try {
      const { error } = await supabase.from('categories').update({
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

      if (error) throw error;
      setCategories(prev => prev.map(c => c.key === cat.key ? { ...cat, tools: c.tools } : c));
    } catch (err: any) {
      console.error('Falha ao atualizar categoria:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar categoria',
        description: err.message
      });
    }
  }, [setCategories]);

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
    await refetch();
  }, [refetch]);

  const deleteTool = useCallback(async (toolKey: string) => {
    await supabase.from('tools').delete().eq('key', toolKey);
    setCategories(prev =>
      prev.map(c => ({ ...c, tools: c.tools.filter(t => t.key !== toolKey) }))
    );
  }, [setCategories]);

  return {
    categories,
    loading: isLoading,
    error: error instanceof Error ? error.message : (error ? 'Não foi possível carregar o conteúdo.' : null),
    fetchCategories,
    updateCategory,
    saveTool,
    deleteTool,
    setCategories,
  };
}
