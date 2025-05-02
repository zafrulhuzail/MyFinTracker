import { http, HttpResponse } from 'msw';
import { Claim, User, AcademicRecord, Course, Notification } from '../../shared/schema';

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
  http.post('/api/auth/login', () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),
  
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
  
  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),
  
  // Claims endpoints
  http.get('/api/claims', () => {
    return HttpResponse.json([mockClaim], { status: 200 });
  }),
  
  http.get('/api/claims/:id', () => {
    return HttpResponse.json(mockClaim, { status: 200 });
  }),
  
  http.post('/api/claims', () => {
    return HttpResponse.json(mockClaim, { status: 201 });
  }),
  
  http.put('/api/claims/:id/status', () => {
    const updatedClaim = { ...mockClaim, status: 'approved' };
    return HttpResponse.json(updatedClaim, { status: 200 });
  }),
  
  // Academic records endpoints
  http.get('/api/academic-records', () => {
    return HttpResponse.json([mockAcademicRecord], { status: 200 });
  }),
  
  http.post('/api/academic-records', () => {
    return HttpResponse.json(mockAcademicRecord, { status: 201 });
  }),
  
  // Course endpoints
  http.get('/api/academic-records/:id/courses', () => {
    return HttpResponse.json([mockCourse], { status: 200 });
  }),
  
  http.post('/api/courses', () => {
    return HttpResponse.json(mockCourse, { status: 201 });
  }),
  
  // Notifications endpoints
  http.get('/api/notifications', () => {
    return HttpResponse.json([mockNotification], { status: 200 });
  }),
  
  http.put('/api/notifications/:id/read', () => {
    const updatedNotification = { ...mockNotification, isRead: true };
    return HttpResponse.json(updatedNotification, { status: 200 });
  })
];