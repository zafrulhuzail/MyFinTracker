import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock server setup
const handlers = [
  http.get('/api/claims', () => {
    return HttpResponse.json([
      { 
        id: 1, 
        userId: 1, 
        claimType: "Books", 
        amount: 350, 
        description: "Textbooks for Spring semester", 
        status: "pending" 
      },
      { 
        id: 2, 
        userId: 1, 
        claimType: "Insurance", 
        amount: 1200, 
        description: "Health insurance premium", 
        status: "approved" 
      }
    ]);
  }),
  
  http.post('/api/claims', async ({ request }) => {
    const reqBody = await request.json();
    return HttpResponse.json({ 
      id: 3, 
      ...reqBody, 
      status: "pending" 
    });
  })
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any runtime handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Claims API', () => {
  test('should fetch claims successfully', async () => {
    const response = await fetch('/api/claims');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].claimType).toBe('Books');
    expect(data[1].claimType).toBe('Insurance');
  });
  
  test('should create a new claim successfully', async () => {
    const newClaim = {
      userId: 1,
      claimType: "Travel",
      amount: 500,
      description: "Flight tickets for conference"
    };
    
    const response = await fetch('/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClaim)
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.id).toBe(3);
    expect(data.claimType).toBe('Travel');
    expect(data.status).toBe('pending');
  });
});