import { describe, test, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock form validation schemas
const claimFormSchema = z.object({
  claimType: z.string().min(1, "Claim type is required"),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be greater than zero"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  selectedClaims: z.array(z.object({
    type: z.string(),
    amount: z.number().positive("Claim amount must be greater than zero")
  })).min(1, "At least one claim type must be selected")
});

const userProfileSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  maraId: z.string().min(1, "MARA ID is required"),
  university: z.string().min(1, "University is required"),
  currentAddress: z.string().min(10, "Address must be at least 10 characters long")
});

describe('Form Validation', () => {
  describe('Claim Form Validation', () => {
    test('validates a valid claim form', () => {
      const validClaimData = {
        claimType: "Multiple",
        amount: 1250.75,
        description: "Claim for various expenses including books and insurance",
        selectedClaims: [
          { type: "Books", amount: 250.75 },
          { type: "Insurance", amount: 1000 }
        ]
      };
      
      const result = claimFormSchema.safeParse(validClaimData);
      expect(result.success).toBe(true);
    });
    
    test('rejects claim form with missing fields', () => {
      const invalidClaimData = {
        claimType: "",
        amount: 0,
        description: "Too short",
        selectedClaims: []
      };
      
      const result = claimFormSchema.safeParse(invalidClaimData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.claimType?._errors).toContain("Claim type is required");
        expect(formattedErrors.amount?._errors).toContain("Amount must be greater than zero");
        expect(formattedErrors.description?._errors).toContain("Description must be at least 10 characters long");
        expect(formattedErrors.selectedClaims?._errors).toContain("At least one claim type must be selected");
      }
    });
    
    test('rejects claim form with negative amount', () => {
      const invalidClaimData = {
        claimType: "Books",
        amount: -100,
        description: "This description is long enough to be valid",
        selectedClaims: [
          { type: "Books", amount: -100 }
        ]
      };
      
      const result = claimFormSchema.safeParse(invalidClaimData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.amount?._errors).toContain("Amount must be greater than zero");
        expect(formattedErrors.selectedClaims?.[0]?.amount?._errors).toContain("Claim amount must be greater than zero");
      }
    });
  });
  
  describe('User Profile Validation', () => {
    test('validates a valid user profile', () => {
      const validUserData = {
        fullName: "John Smith",
        email: "john.smith@example.com",
        phoneNumber: "1234567890",
        maraId: "M12345678",
        university: "Example University",
        currentAddress: "123 Main Street, Apartment 4B, City, Country"
      };
      
      const result = userProfileSchema.safeParse(validUserData);
      expect(result.success).toBe(true);
    });
    
    test('rejects profile with invalid email', () => {
      const invalidUserData = {
        fullName: "John Smith",
        email: "invalid-email",
        phoneNumber: "1234567890",
        maraId: "M12345678",
        university: "Example University",
        currentAddress: "123 Main Street, Apartment 4B, City, Country"
      };
      
      const result = userProfileSchema.safeParse(invalidUserData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.email?._errors).toContain("Invalid email address");
      }
    });
    
    test('rejects profile with invalid phone number', () => {
      const invalidUserData = {
        fullName: "John Smith",
        email: "john.smith@example.com",
        phoneNumber: "123", // too short
        maraId: "M12345678",
        university: "Example University",
        currentAddress: "123 Main Street, Apartment 4B, City, Country"
      };
      
      const result = userProfileSchema.safeParse(invalidUserData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.phoneNumber?._errors).toContain("Phone number must be 10 digits");
      }
    });
    
    test('rejects profile with empty required fields', () => {
      const invalidUserData = {
        fullName: "",
        email: "john.smith@example.com",
        phoneNumber: "1234567890",
        maraId: "",
        university: "",
        currentAddress: "Short"
      };
      
      const result = userProfileSchema.safeParse(invalidUserData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.fullName?._errors).toContain("Full name is required");
        expect(formattedErrors.maraId?._errors).toContain("MARA ID is required");
        expect(formattedErrors.university?._errors).toContain("University is required");
        expect(formattedErrors.currentAddress?._errors).toContain("Address must be at least 10 characters long");
      }
    });
  });
});