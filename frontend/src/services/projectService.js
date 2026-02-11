import { supabase } from './supabase';

export const projectService = {
  async listProjects() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, version, is_archived, created_at, updated_at')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getProject(projectId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    if (error) throw error;
    return data;
  },

  async createProject(name, config) {
    if (!supabase) throw new Error('Not authenticated');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        config,
      })
      .select()
      .single();
    if (error) {
      if (error.message?.includes('Free tier limited')) {
        throw new Error('FREE_TIER_LIMIT');
      }
      throw error;
    }
    return data;
  },

  async saveProject(projectId, config, currentVersion) {
    if (!supabase) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('projects')
      .update({
        config,
        version: currentVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('version', currentVersion)
      .select()
      .single();

    if (error || !data) {
      throw new Error('CONFLICT: Project was modified elsewhere. Please reload.');
    }
    return data;
  },

  async renameProject(projectId, name) {
    if (!supabase) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) throw error;
  },

  async deleteProject(projectId) {
    if (!supabase) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    if (error) throw error;
  },

  async archiveProject(projectId) {
    if (!supabase) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) throw error;
  },
};
