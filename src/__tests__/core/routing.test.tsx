import { describe, it, expect } from 'vitest';
import { publicRoutes } from '@/routes/publicRoutes.config';
import { protectedRoutes } from '@/routes/routes.config';

describe('Routing Configuration', () => {
  it('should have all required public routes', () => {
    const requiredPublicPaths = [
      '/',
      '/login',
      '/register',
      '/quick-request/:propertyId',
      '/track-orders',
    ];

    requiredPublicPaths.forEach(path => {
      const route = publicRoutes.find(r => r.path === path);
      expect(route, `Route ${path} should exist`).toBeDefined();
      expect(route?.element, `Route ${path} should have element`).toBeDefined();
    });
  });

  it('should have all required protected routes', () => {
    const requiredProtectedPaths = [
      '/dashboard',
      '/requests',
      '/properties',
      '/vendors',
      '/reports',
    ];

    requiredProtectedPaths.forEach(path => {
      const route = protectedRoutes.find(r => r.path === path);
      expect(route, `Protected route ${path} should exist`).toBeDefined();
      expect(route?.element, `Protected route ${path} should have element`).toBeDefined();
    });
  });

  it('should have QuickRequest route configured correctly', () => {
    const quickRequestRoute = publicRoutes.find(
      r => r.path === '/quick-request/:propertyId'
    );
    
    expect(quickRequestRoute).toBeDefined();
    expect(quickRequestRoute?.element).toBeDefined();
  });

  it('should have NotFound fallback route', () => {
    const notFoundRoute = publicRoutes.find(r => r.path === '*');
    expect(notFoundRoute, 'NotFound route should exist').toBeDefined();
  });

  it('should not have duplicate paths in public routes', () => {
    const paths = publicRoutes.map(r => r.path);
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });

  it('should not have duplicate paths in protected routes', () => {
    const paths = protectedRoutes.map(r => r.path);
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });
});
