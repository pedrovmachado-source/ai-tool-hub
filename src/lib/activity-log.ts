import { supabase } from '@/integrations/supabase/client';

export type ActivityAction =
  | 'create' | 'update' | 'delete'
  | 'plan_change' | 'role_grant' | 'role_revoke'
  | 'upload' | 'settings_update';

export type ActivityEntity =
  | 'user' | 'profile' | 'plan' | 'category' | 'tool'
  | 'module' | 'lesson' | 'lesson_pdf' | 'lesson_video'
  | 'niche_module' | 'niche_lesson'
  | 'site_product' | 'site_order'
  | 'content_section' | 'content_item'
  | 'site_settings' | 'role';

interface LogParams {
  action: ActivityAction;
  entity_type: ActivityEntity;
  entity_id?: string | null;
  entity_label?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Records an admin action in the activity_logs table.
 * Fails silently (logs to console) — never blocks the user action.
 */
export async function logActivity(params: LogParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase as any).from('activity_logs').insert({
      actor_id: user.id,
      actor_email: user.email ?? '',
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      entity_label: params.entity_label ?? null,
      metadata: params.metadata ?? {},
    });
    if (error) console.warn('[activity-log] insert failed', error.message);
  } catch (e) {
    console.warn('[activity-log] error', e);
  }
}
