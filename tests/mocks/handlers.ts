import { rest } from 'msw';
import { Claim, User, AcademicRecord, Course, Notification } from '@shared/schema';

// Mock data
export const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed_password',
  fullName: 'Test User',
  nationalId: 'ID123456',
  maraId: 'MARA123456',
  phoneNumber: '+123456789',
  currentAddress: '123 Test Street, City',
  countryOfStudy: 'Germany',
  university: 'Test University',
  fieldOfStudy: 'Computer Science',
  degreeLevel: 'Bachelors',
  maraGroup: 'A',
  sponsorshipPeriod: '2022-2025',
  role: 'student',
  bankName: 'Test Bank',
  bankAddress: '456 Bank Street, City',
  accountNumber: '1234567890',
  swiftCode: 'TESTCODE',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockClaim: Claim = {
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

export const mockAcademicRecord: AcademicRecord = {
  id: 1,
  userId: 1,
  semester: 'Winter',
  year: '2023',
  gpa: 3.8,
  ectsCredits: 30,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockCourse: Course = {
  id: 1,
  academicRecordId: 1,
  name: 'Introduction to Computer Science',
  credits: 6,
  grade: 'A',
  status: 'Passed',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockNotification: Notification = {
  id: 1,
  userId: 1,
  title: 'Claim Status Update',
  message: 'Your claim has been updated',
  isRead: false,
  createdAt: new Date()
};

// Define handlers
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser));
  }),
  
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser));
  }),
  
  // Claims endpoints
  rest.get('/api/claims', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockClaim]));
  }),
  
  rest.get('/api/claims/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockClaim));
  }),
  
  rest.post('/api/claims', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockClaim));
  }),
  
  rest.put('/api/claims/:id/status', (req, res, ctx) => {
    const updatedClaim = { ...mockClaim, status: 'approved' };
    return res(ctx.status(200), ctx.json(updatedClaim));
  }),
  
  // Academic records endpoints
  rest.get('/api/academic-records', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockAcademicRecord]));
  }),
  
  rest.post('/api/academic-records', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockAcademicRecord));
  }),
  
  // Course endpoints
  rest.get('/api/academic-records/:id/courses', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockCourse]));
  }),
  
  rest.post('/api/courses', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockCourse));
  }),
  
  // Notifications endpoints
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockNotification]));
  }),
  
  rest.put('/api/notifications/:id/read', (req, res, ctx) => {
    const updatedNotification = { ...mockNotification, isRead: true };
    return res(ctx.status(200), ctx.json(updatedNotification));
  })
];