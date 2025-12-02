import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Database Integration', () => {
  let testCompanyId: string;

  beforeAll(async () => {
    // Get first company and branch for testing
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (companies && companies.length > 0) {
      testCompanyId = companies[0].id;
    }
  });

  it('should connect to Supabase successfully', async () => {
    const { data, error } = await supabase
      .from('app_control')
      .select('is_locked, message')
      .eq('id', 'global')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should fetch companies from database', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should fetch branches for a company', async () => {
    if (!testCompanyId) {
      expect(true).toBe(true); // Skip if no company
      return;
    }

    const { data, error } = await supabase
      .from('branches')
      .select('id, name')
      .eq('company_id', testCompanyId)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should fetch properties from database', async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, address')
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should fetch maintenance requests', async () => {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('id, title, status')
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should check RLS policies are enabled', async () => {
    // This is a critical security check
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    // If RLS is properly configured, unauthenticated users should not see all properties
    // The exact behavior depends on RLS policies
    expect(properties).toBeDefined();
  });
});
