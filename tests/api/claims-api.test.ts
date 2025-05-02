import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { rest, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiRequest } from '../../client/src/lib/queryClient';
import { Claim } from '../../shared/schema';

// Mock data
const mockClaim: Claim = {
  id: 1,
  userId: 1,
  claimType: 'Tuition Fee',
  amount: 1000,
  status: 'pending',
  claimPeriod: 'Summer 2023',
  description: 'Tuition fee for summer semester',
  receiptFile: 'file://test-receipt.pdf',
  supportingDocFile: null,
  bankName: 'Test Bank',
  bankAddress: '456 Bank Street, City',
  accountNumber: '1234567890',
  swiftCode: 'TESTCODE',
  reviewedBy: null,
  reviewedAt: null,
  reviewComment: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockClaims = [mockClaim];

// Setup MSW server
const server = setupServer(
  rest.get('/api/claims', () => {
    return HttpResponse.json(mockClaims, { status: 200 });
  }),
  
  rest.get('/api/claims/1', () => {
    return HttpResponse.json(mockClaim, { status: 200 });
  }),
  
  rest.post('/api/claims', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockClaim, ...body }, { status: 201 });
  }),
  
  rest.put('/api/claims/1/status', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockClaim, ...body }, { status: 200 });
  }),
  
  rest.get('/api/claims/error', () => {
    return HttpResponse.json({ message: 'Error fetching claim' }, { status: 500 });
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Claims API', () => {
  it('should fetch all claims', async () => {
    const response = await apiRequest('GET', '/api/claims');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(mockClaim.id);
  });
  
  it('should fetch a single claim by id', async () => {
    const response = await apiRequest('GET', '/api/claims/1');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.id).toBe(mockClaim.id);
    expect(data.claimType).toBe(mockClaim.claimType);
  });
  
  it('should create a new claim', async () => {
    const newClaim = {
      userId: 1,
      claimType: 'Living Allowance',
      amount: 500,
      claimPeriod: 'Fall 2023',
      description: 'Monthly living expenses',
      receiptFile: 'file://living-receipt.pdf',
      bankName: 'Test Bank',
      bankAddress: '456 Bank Street, City',
      accountNumber: '1234567890',
      swiftCode: 'TESTCODE'
    };
    
    const response = await apiRequest('POST', '/api/claims', newClaim);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.claimType).toBe(newClaim.claimType);
    expect(data.amount).toBe(newClaim.amount);
  });
  
  it('should update claim status', async () => {
    const statusUpdate = {
      status: 'approved',
      reviewComment: 'Approved after verification'
    };
    
    const response = await apiRequest('PUT', '/api/claims/1/status', statusUpdate);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe(statusUpdate.status);
    expect(data.reviewComment).toBe(statusUpdate.reviewComment);
  });
  
  it('should handle API errors', async () => {
    try {
      await apiRequest('GET', '/api/claims/error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});