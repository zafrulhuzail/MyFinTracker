import { 
  users, 
  claims, 
  academicRecords, 
  courses, 
  studyPlans, 
  notifications,
  type User, 
  type InsertUser, 
  type Claim, 
  type InsertClaim, 
  type AcademicRecord, 
  type InsertAcademicRecord, 
  type Course, 
  type InsertCourse, 
  type StudyPlan, 
  type InsertStudyPlan, 
  type Notification, 
  type InsertNotification, 
  type UpdateClaimStatus
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMaraId(maraId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Claim operations
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimsByUser(userId: number): Promise<Claim[]>;
  getAllClaims(): Promise<Claim[]>;
  getClaimsByStatus(status: string): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaimStatus(id: number, data: UpdateClaimStatus, reviewedBy: number): Promise<Claim | undefined>;
  
  // Academic record operations
  getAcademicRecord(id: number): Promise<AcademicRecord | undefined>;
  getAcademicRecordsByUser(userId: number): Promise<AcademicRecord[]>;
  createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: number, data: Partial<AcademicRecord>): Promise<AcademicRecord | undefined>;
  
  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByAcademicRecord(academicRecordId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined>;
  
  // Study plan operations
  getStudyPlan(id: number): Promise<StudyPlan | undefined>;
  getStudyPlansByUser(userId: number): Promise<StudyPlan[]>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private claims: Map<number, Claim>;
  private academicRecords: Map<number, AcademicRecord>;
  private courses: Map<number, Course>;
  private studyPlans: Map<number, StudyPlan>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private claimId: number;
  private academicRecordId: number;
  private courseId: number;
  private studyPlanId: number;
  private notificationId: number;
  
  constructor() {
    this.users = new Map();
    this.claims = new Map();
    this.academicRecords = new Map();
    this.courses = new Map();
    this.studyPlans = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.claimId = 1;
    this.academicRecordId = 1;
    this.courseId = 1;
    this.studyPlanId = 1;
    this.notificationId = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@mara.gov.my",
      fullName: "MARA Administrator",
      nationalId: "admin-id",
      maraId: "ADMIN-1",
      phoneNumber: "+60123456789",
      currentAddress: "MARA Headquarters, Kuala Lumpur",
      countryOfStudy: "Malaysia",
      university: "MARA",
      fieldOfStudy: "Administration",
      degreeLevel: "N/A",
      maraGroup: "Admin",
      sponsorshipPeriod: "N/A",
      bankName: "N/A",
      bankAddress: "N/A",
      accountNumber: "N/A",
      swiftCode: "N/A",
      role: "admin"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByMaraId(maraId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.maraId === maraId
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Claim operations
  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }
  
  async getClaimsByUser(userId: number): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.userId === userId
    );
  }
  
  async getAllClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values());
  }
  
  async getClaimsByStatus(status: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.status === status
    );
  }
  
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.claimId++;
    const now = new Date();
    const claim: Claim = { 
      ...insertClaim, 
      id, 
      status: "pending", 
      reviewComment: null, 
      reviewedBy: null, 
      reviewedAt: null, 
      createdAt: now, 
      updatedAt: now 
    };
    this.claims.set(id, claim);
    return claim;
  }
  
  async updateClaimStatus(id: number, data: UpdateClaimStatus, reviewedBy: number): Promise<Claim | undefined> {
    const claim = await this.getClaim(id);
    if (!claim) return undefined;
    
    const now = new Date();
    const updatedClaim: Claim = { 
      ...claim,
      status: data.status,
      reviewComment: data.reviewComment || null,
      reviewedBy,
      reviewedAt: now,
      updatedAt: now
    };
    
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }
  
  // Academic record operations
  async getAcademicRecord(id: number): Promise<AcademicRecord | undefined> {
    return this.academicRecords.get(id);
  }
  
  async getAcademicRecordsByUser(userId: number): Promise<AcademicRecord[]> {
    return Array.from(this.academicRecords.values()).filter(
      (record) => record.userId === userId
    );
  }
  
  async createAcademicRecord(insertRecord: InsertAcademicRecord): Promise<AcademicRecord> {
    const id = this.academicRecordId++;
    const now = new Date();
    const record: AcademicRecord = { ...insertRecord, id, createdAt: now, updatedAt: now };
    this.academicRecords.set(id, record);
    return record;
  }
  
  async updateAcademicRecord(id: number, data: Partial<AcademicRecord>): Promise<AcademicRecord | undefined> {
    const record = await this.getAcademicRecord(id);
    if (!record) return undefined;
    
    const now = new Date();
    const updatedRecord: AcademicRecord = { ...record, ...data, updatedAt: now };
    this.academicRecords.set(id, updatedRecord);
    return updatedRecord;
  }
  
  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCoursesByAcademicRecord(academicRecordId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.academicRecordId === academicRecordId
    );
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, data: Partial<Course>): Promise<Course | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;
    
    const updatedCourse: Course = { ...course, ...data };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  // Study plan operations
  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    return this.studyPlans.get(id);
  }
  
  async getStudyPlansByUser(userId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values()).filter(
      (plan) => plan.userId === userId
    );
  }
  
  async createStudyPlan(insertPlan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.studyPlanId++;
    const plan: StudyPlan = { ...insertPlan, id };
    this.studyPlans.set(id, plan);
    return plan;
  }
  
  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const notification: Notification = { ...insertNotification, id, isRead: false, createdAt: now };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
