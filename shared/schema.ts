import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  nationalId: text("national_id").notNull().unique(),
  maraId: text("mara_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  currentAddress: text("current_address").notNull(),
  countryOfStudy: text("country_of_study").notNull(),
  university: text("university").notNull(),
  fieldOfStudy: text("field_of_study").notNull(),
  degreeLevel: text("degree_level").notNull(),
  maraGroup: text("mara_group").notNull(),
  sponsorshipPeriod: text("sponsorship_period").notNull(),
  bankName: text("bank_name").notNull(),
  bankAddress: text("bank_address").notNull(),
  accountNumber: text("account_number").notNull(),
  swiftCode: text("swift_code").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  academicRecords: many(academicRecords),
  studyPlans: many(studyPlans),
  notifications: many(notifications),
  reviewedClaims: many(claims, { relationName: "reviewer" }),
}));

// Claims schema
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  claimType: text("claim_type").notNull(), // This will now store a comma-separated list of claim types
  claimDetails: jsonb("claim_details").notNull().default({}), // This will store the different claim types and their amounts
  amount: real("amount").notNull(), // Total amount (sum of all claim details)
  claimPeriod: text("claim_period").notNull(),
  description: text("description"),
  receiptFile: text("receipt_file").notNull(),
  supportingDocFile: text("supporting_doc_file"),
  bankName: text("bank_name").notNull(),
  bankAddress: text("bank_address").notNull(),
  accountNumber: text("account_number").notNull(),
  swiftCode: text("swift_code").notNull(),
  status: text("status").notNull().default("pending"),
  reviewComment: text("review_comment"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Claims relations
export const claimsRelations = relations(claims, ({ one }) => ({
  user: one(users, {
    fields: [claims.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [claims.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

// Academic records schema
export const academicRecords = pgTable("academic_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  semester: text("semester").notNull(),
  year: text("year").notNull(),
  gpa: real("gpa"),
  ectsCredits: integer("ects_credits"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Academic records relations
export const academicRecordsRelations = relations(academicRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [academicRecords.userId],
    references: [users.id],
  }),
  courses: many(courses),
}));

// Courses schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  academicRecordId: integer("academic_record_id").notNull().references(() => academicRecords.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  grade: text("grade"),
  status: text("status").notNull(),
});

// Courses relations
export const coursesRelations = relations(courses, ({ one }) => ({
  academicRecord: one(academicRecords, {
    fields: [courses.academicRecordId],
    references: [academicRecords.id],
  }),
}));

// Study plans schema
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  semester: text("semester").notNull(),
  year: text("year").notNull(),
  plannedCourses: jsonb("planned_courses").notNull(),
  totalCredits: integer("total_credits").notNull(),
});

// Study plans relations
export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
  user: one(users, {
    fields: [studyPlans.userId],
    references: [users.id],
  }),
}));

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  status: true,
  reviewComment: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicRecordSchema = createInsertSchema(academicRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Claim status update schema
export const updateClaimStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  reviewComment: z.string().optional(),
});

// Types for insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertAcademicRecord = z.infer<typeof insertAcademicRecordSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type UpdateClaimStatus = z.infer<typeof updateClaimStatusSchema>;

// Types for select operations
export type User = typeof users.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type AcademicRecord = typeof academicRecords.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
