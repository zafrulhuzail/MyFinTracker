import { z } from "zod";
import { insertClaimSchema, insertAcademicRecordSchema, insertCourseSchema, insertStudyPlanSchema } from "@shared/schema";

// Register form validation schema
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  nationalId: z.string().min(1, "National ID is required"),
  maraId: z.string().min(1, "MARA ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  countryOfStudy: z.string().min(1, "Country of study is required"),
  university: z.string().min(1, "University is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  maraGroup: z.string().min(1, "MARA group is required"),
  sponsorshipPeriod: z.string().min(1, "Sponsorship period is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bankAddress: z.string().min(1, "Bank address is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  swiftCode: z.string().min(1, "SWIFT code is required"),
});

// Login form validation schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Claim form validation schema with additional validations
export const claimFormSchema = insertClaimSchema.extend({
  userId: z.number().optional(),
  amount: z.number().positive("Amount must be positive"),
  claimType: z.enum([
    "Insurance",
    "Tuition Fee",
    "Practical Allowance",
    "End of Study Allowance",
    "Flight Ticket",
    "Other"
  ], {
    errorMap: () => ({ message: "Please select a claim type" })
  }),
  claimPeriod: z.string().min(1, "Please specify the claim period or semester"),
  receiptFile: z.string().min(1, "Receipt or proof of payment is required"),
  declaration: z.boolean().refine(val => val === true, {
    message: "You must agree to the declaration",
  }),
});

// Academic record form validation schema
export const academicRecordFormSchema = insertAcademicRecordSchema.extend({
  userId: z.number().optional(),
  semester: z.string().min(1, "Semester is required"),
  year: z.string().min(1, "Year is required"),
  gpa: z.number().optional().nullable(),
  ectsCredits: z.number().int().optional().nullable(),
});

// Course form validation schema
export const courseFormSchema = insertCourseSchema.extend({
  name: z.string().min(1, "Course name is required"),
  credits: z.number().int().positive("Credits must be a positive integer"),
  status: z.enum(["Passed", "Failed", "In Progress", "Planned"]),
});

// Study plan form validation schema
export const studyPlanFormSchema = insertStudyPlanSchema.extend({
  userId: z.number().optional(),
  semester: z.string().min(1, "Semester is required"),
  year: z.string().min(1, "Year is required"),
  totalCredits: z.number().int().positive("Total credits must be a positive integer"),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bankAddress: z.string().min(1, "Bank address is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  swiftCode: z.string().min(1, "SWIFT code is required"),
});
