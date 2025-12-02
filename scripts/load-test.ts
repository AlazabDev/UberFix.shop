/**
 * Load Testing Script for UberFix.shop
 * 
 * Usage:
 *   deno run --allow-net --allow-env scripts/load-test.ts
 * 
 * Environment Variables:
 *   - SUPABASE_URL: Your Supabase URL
 *   - SUPABASE_ANON_KEY: Your Supabase anon key
 *   - TEST_DURATION: Duration in seconds (default: 60)
 *   - CONCURRENT_USERS: Number of concurrent users (default: 100)
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://zrrffsjbfkphridqyais.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const TEST_DURATION = parseInt(Deno.env.get('TEST_DURATION') || '60');
const CONCURRENT_USERS = parseInt(Deno.env.get('CONCURRENT_USERS') || '100');

interface TestResult {
  endpoint: string;
  status: number;
  duration: number;
  success: boolean;
  timestamp: number;
}

const results: TestResult[] = [];

// Test scenarios
const scenarios = [
  {
    name: 'Get Categories',
    weight: 20,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      return {
        endpoint: 'GET /categories',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
  {
    name: 'Get Services',
    weight: 20,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=*&limit=20`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      return {
        endpoint: 'GET /services',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
  {
    name: 'Get Cities',
    weight: 15,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cities?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      return {
        endpoint: 'GET /cities',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
  {
    name: 'Get Technicians',
    weight: 15,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=*&limit=10`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      return {
        endpoint: 'GET /technicians',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
  {
    name: 'Cache Service - Categories',
    weight: 10,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/cache-service?action=get&key=categories:`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      return {
        endpoint: 'GET /cache-service (categories)',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
  {
    name: 'Get Maintenance Requests',
    weight: 20,
    execute: async () => {
      const start = Date.now();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/maintenance_requests?select=*&limit=20&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        endpoint: 'GET /maintenance_requests',
        status: response.status,
        duration: Date.now() - start,
        success: response.ok,
        timestamp: Date.now(),
      };
    },
  },
];

// Select random scenario based on weight
function selectScenario() {
  const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const scenario of scenarios) {
    random -= scenario.weight;
    if (random <= 0) return scenario;
  }
  
  return scenarios[0];
}

// Run single user simulation
async function simulateUser(userId: number, endTime: number) {
  while (Date.now() < endTime) {
    try {
      const scenario = selectScenario();
      const result = await scenario.execute();
      results.push(result);
      
      // Random think time between 100ms and 2s
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 1900));
    } catch (error) {
      console.error(`User ${userId} error:`, error.message);
    }
  }
}

// Calculate and display statistics
function displayStats() {
  console.warn('\n=== Load Test Results ===\n');
  
  const totalRequests = results.length;
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / totalRequests;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  // Calculate percentiles
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)];
  const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
  const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)];
  
  // Requests per second
  const testDuration = (results[results.length - 1]?.timestamp - results[0]?.timestamp) / 1000;
  const rps = totalRequests / testDuration;
  
  console.warn(`Total Requests: ${totalRequests}`);
  console.warn(`Successful: ${successfulRequests} (${((successfulRequests / totalRequests) * 100).toFixed(2)}%)`);
  console.warn(`Failed: ${failedRequests} (${((failedRequests / totalRequests) * 100).toFixed(2)}%)`);
  console.warn(`\nRequest Rate: ${rps.toFixed(2)} req/s`);
  console.warn(`\nResponse Times:`);
  console.warn(`  Min: ${minDuration}ms`);
  console.warn(`  Max: ${maxDuration}ms`);
  console.warn(`  Avg: ${avgDuration.toFixed(2)}ms`);
  console.warn(`  P50: ${p50}ms`);
  console.warn(`  P95: ${p95}ms`);
  console.warn(`  P99: ${p99}ms`);
  
  // Breakdown by endpoint
  console.warn('\n=== Breakdown by Endpoint ===\n');
  const byEndpoint = results.reduce((acc, r) => {
    if (!acc[r.endpoint]) {
      acc[r.endpoint] = { count: 0, success: 0, totalDuration: 0 };
    }
    acc[r.endpoint].count++;
    if (r.success) acc[r.endpoint].success++;
    acc[r.endpoint].totalDuration += r.duration;
    return acc;
  }, {} as Record<string, { count: number; success: number; totalDuration: number }>);
  
  Object.entries(byEndpoint).forEach(([endpoint, stats]) => {
    const avgDuration = stats.totalDuration / stats.count;
    const successRate = (stats.success / stats.count) * 100;
    console.warn(`${endpoint}:`);
    console.warn(`  Requests: ${stats.count}`);
    console.warn(`  Success Rate: ${successRate.toFixed(2)}%`);
    console.warn(`  Avg Response Time: ${avgDuration.toFixed(2)}ms\n`);
  });
  
  // Performance rating
  console.warn('=== Performance Rating ===\n');
  if (p95 < 200 && successRate > 99.5) {
    console.warn('🟢 EXCELLENT - Ready for 5000+ users');
  } else if (p95 < 500 && successRate > 99) {
    console.warn('🟡 GOOD - Can handle current load, some optimization needed');
  } else if (p95 < 1000 && successRate > 95) {
    console.warn('🟠 FAIR - Needs optimization before scaling');
  } else {
    console.warn('🔴 POOR - Critical optimization required');
  }
}

// Main execution
async function main() {
  console.warn('🚀 Starting Load Test');
  console.warn(`Duration: ${TEST_DURATION}s`);
  console.warn(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.warn(`Target: ${SUPABASE_URL}\n`);
  
  const startTime = Date.now();
  const endTime = startTime + (TEST_DURATION * 1000);
  
  // Start user simulations
  const users = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i, endTime));
  }
  
  // Wait for all users to complete
  await Promise.all(users);
  
  // Display results
  displayStats();
}

// Run the test
if (import.meta.main) {
  main().catch(console.error);
}
