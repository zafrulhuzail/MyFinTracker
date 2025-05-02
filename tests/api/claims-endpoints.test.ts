import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Types for testing
interface Claim {
  id: number;
  userId: number;
  claimType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: number | null;
  reviewNotes?: string | null;
  attachmentUrl?: string | null;
  selectedClaims?: Array<{ type: string; amount: number }>;
}

// Mock API handlers
const handlers = [
  // GET /api/claims - Get all claims for the user
  http.get('/api/claims', () => {
    return HttpResponse.json<Claim[]>([
      {
        id: 1,
        userId: 2,
        claimType: 'Books',
        amount: 250.75,
        description: 'Textbooks for Fall semester',
        status: 'pending',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15'),
        reviewedBy: null,
        reviewNotes: null,
        attachmentUrl: null,
        selectedClaims: [{ type: 'Books', amount: 250.75 }]
      },
      {
        id: 2,
        userId: 2,
        claimType: 'Multiple',
        amount: 1550.00,
        description: 'Insurance and accommodation expenses',
        status: 'approved',
        createdAt: new Date('2023-09-20'),
        updatedAt: new Date('2023-09-25'),
        reviewedBy: 1,
        reviewNotes: 'Approved as per policy guidelines',
        attachmentUrl: 'uploads/receipt-2.pdf',
        selectedClaims: [
          { type: 'Insurance', amount: 1000.00 },
          { type: 'Accommodation', amount: 550.00 }
        ]
      }
    ]);
  }),

  // GET /api/claims/:id - Get a specific claim
  http.get('/api/claims/:id', ({ params }) => {
    const id = Number(params.id);
    
    if (id === 1) {
      return HttpResponse.json<Claim>({
        id: 1,
        userId: 2,
        claimType: 'Books',
        amount: 250.75,
        description: 'Textbooks for Fall semester',
        status: 'pending',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15'),
        reviewedBy: null,
        reviewNotes: null,
        attachmentUrl: null,
        selectedClaims: [{ type: 'Books', amount: 250.75 }]
      });
    }
    
    if (id === 404) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json<Claim>({
      id,
      userId: 2,
      claimType: 'Other',
      amount: 150.00,
      description: 'Other expenses',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      selectedClaims: [{ type: 'Other', amount: 150.00 }]
    });
  }),

  // POST /api/claims - Create a new claim
  http.post('/api/claims', async ({ request }) => {
    const claimData = await request.json();
    
    return HttpResponse.json<Claim>({
      id: 3,
      userId: 2,
      ...claimData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  // PUT /api/claims/:id/status - Update claim status (admin only)
  http.put('/api/claims/:id/status', async ({ params, request }) => {
    const id = Number(params.id);
    const { status, reviewNotes } = await request.json();
    
    return HttpResponse.json<Claim>({
      id,
      userId: 2,
      claimType: 'Books',
      amount: 250.75,
      description: 'Textbooks for Fall semester',
      status,
      reviewNotes,
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date(),
      reviewedBy: 1
    });
  })
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Claims API Endpoints', () => {
  describe('GET /api/claims', () => {
    test('fetches all claims for the user', async () => {
      const response = await fetch('/api/claims');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].claimType).toBe('Books');
      expect(data[1].claimType).toBe('Multiple');
    });
  });
  
  describe('GET /api/claims/:id', () => {
    test('fetches a specific claim by ID', async () => {
      const response = await fetch('/api/claims/1');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(1);
      expect(data.claimType).toBe('Books');
      expect(data.amount).toBe(250.75);
    });
    
    test('returns 404 for non-existent claim', async () => {
      const response = await fetch('/api/claims/404');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/claims', () => {
    test('creates a new claim', async () => {
      const newClaim = {
        claimType: 'Travel',
        amount: 450.50,
        description: 'Flight tickets for winter break',
        selectedClaims: [{ type: 'Travel', amount: 450.50 }]
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
      expect(data.amount).toBe(450.50);
      expect(data.status).toBe('pending');
    });
  });
  
  describe('PUT /api/claims/:id/status', () => {
    test('updates a claim status (admin only)', async () => {
      const statusUpdate = {
        status: 'approved',
        reviewNotes: 'Approved after verification'
      };
      
      const response = await fetch('/api/claims/1/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(1);
      expect(data.status).toBe('approved');
      expect(data.reviewNotes).toBe('Approved after verification');
      expect(data.reviewedBy).toBe(1);
    });
  });
});