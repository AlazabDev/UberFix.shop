import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Edge Functions Integration', () => {
  it('should invoke get-property-for-qr edge function', async () => {
    const testPropertyId = 'test-property-id';

    const { data, error } = await supabase.functions.invoke(
      'get-property-for-qr',
      {
        body: { propertyId: testPropertyId },
      }
    );

    // Edge function should respond (even if property not found)
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should handle edge function errors gracefully', async () => {
    const { data, error } = await supabase.functions.invoke(
      'get-property-for-qr',
      {
        body: { propertyId: '' }, // Invalid ID
      }
    );

    // Should not throw, should return error response
    expect(data).toBeDefined();
  });
});
