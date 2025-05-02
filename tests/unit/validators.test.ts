import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  claimFormSchema,
  academicRecordFormSchema
} from '@/lib/validators';

describe('Validators', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        username: 'testuser',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject login with missing fields', () => {
      const invalidData = {
        username: 'testuser'
        // missing password
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });
    
    it('should reject login with empty fields', () => {
      const invalidData = {
        username: '',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  
  describe('claimFormSchema', () => {
    it('should validate valid claim data', () => {
      const validData = {
        userId: 1,
        amount: 1000,
        claimType: 'Tuition Fee',
        claimPeriod: 'Summer 2023',
        description: 'Tuition fee for summer semester',
        receiptFile: 'file://receipt.pdf',
        supportingDocFile: null,
        bankName: 'Test Bank',
        bankAddress: '123 Bank St',
        accountNumber: '12345678',
        swiftCode: 'TESTCODE',
        declaration: true
      };
      
      const result = claimFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject claim with zero amount', () => {
      const invalidData = {
        userId: 1,
        amount: 0,
        claimType: 'Tuition Fee',
        claimPeriod: 'Summer 2023',
        description: 'Tuition fee for summer semester',
        receiptFile: 'file://receipt.pdf',
        supportingDocFile: null,
        bankName: 'Test Bank',
        bankAddress: '123 Bank St',
        accountNumber: '12345678',
        swiftCode: 'TESTCODE',
        declaration: true
      };
      
      const result = claimFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive');
      }
    });
    
    it('should reject claim without declaration agreement', () => {
      const invalidData = {
        userId: 1,
        amount: 1000,
        claimType: 'Tuition Fee',
        claimPeriod: 'Summer 2023',
        description: 'Tuition fee for summer semester',
        receiptFile: 'file://receipt.pdf',
        supportingDocFile: null,
        bankName: 'Test Bank',
        bankAddress: '123 Bank St',
        accountNumber: '12345678',
        swiftCode: 'TESTCODE',
        declaration: false
      };
      
      const result = claimFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  
  describe('academicRecordFormSchema', () => {
    it('should validate valid academic record data', () => {
      const validData = {
        userId: 1,
        semester: 'Winter',
        year: '2023',
        gpa: 3.7,
        ectsCredits: 30
      };
      
      const result = academicRecordFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should accept null values for optional fields', () => {
      const validData = {
        userId: 1,
        semester: 'Winter',
        year: '2023',
        gpa: null,
        ectsCredits: null
      };
      
      const result = academicRecordFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject record with missing required fields', () => {
      const invalidData = {
        userId: 1,
        semester: '',
        year: '2023',
        gpa: 3.5,
        ectsCredits: 30
      };
      
      const result = academicRecordFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});