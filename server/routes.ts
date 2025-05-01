import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertClaimSchema,

  insertAcademicRecordSchema,
  insertCourseSchema,
  insertStudyPlanSchema,
  updateClaimStatusSchema
} from "@shared/schema";
import { sendEmail } from "./utils/email";
import { authenticateUser, isAdmin } from "./middleware/auth";
import { upload, getFileUrl, findFileByName } from "./utils/upload";
import "express-session";

// Extend Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Auth routes
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      console.log("Login request body:", req.body);
      const validatedData = loginSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const user = await storage.getUserByUsername(validatedData.username);
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user || user.password !== validatedData.password) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      console.log("Session set for user:", user.id, user.role);
      
      const { password, ...userWithoutPassword } = user;
      console.log("Login successful");
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login validation error:", error);
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.get("/auth/me", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Check if MARA ID already exists
      const existingUserByMaraId = await storage.getUserByMaraId(validatedData.maraId);
      if (existingUserByMaraId) {
        return res.status(400).json({ message: "MARA ID already exists" });
      }
      
      const newUser = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = newUser;
      
      // Send welcome email
      await sendEmail(
        newUser.email,
        "Welcome to MARA Claim System",
        `Dear ${newUser.fullName},\n\nYour account has been created successfully. You can now log in to the MARA Claim System with your username and password.\n\nBest regards,\nMARA Admin Team`
      );
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // Get all users (admin only)
  apiRouter.get("/users", authenticateUser, isAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Filter out passwords from all users
      const usersWithoutPasswords = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });

  apiRouter.put("/users/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile unless they're an admin
      if (req.session.userId !== userId && req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // Claim routes
  apiRouter.post("/claims", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertClaimSchema.parse({
        ...req.body,
        userId
      });
      
      const newClaim = await storage.createClaim(validatedData);
      
      // This is a simplified implementation since we can't easily get admin users from the claims
      // In a real application, you would have a separate query to get admin users
      try {
        // Manually get admin user
        const adminUser = await storage.getUserByUsername("admin");
        if (adminUser) {
          await storage.createNotification({
            userId: adminUser.id,
            title: "New Claim Submitted",
            message: `A new claim has been submitted by a student. Claim ID: ${newClaim.id}`
          });
        }
      } catch (error) {
        console.error("Error notifying admin:", error);
        // Continue even if notification fails
      }
      
      // Notify the user that their claim has been submitted
      await storage.createNotification({
        userId,
        title: "Claim Submitted",
        message: `Your claim for ${validatedData.claimType} has been submitted and is pending review.`
      });
      
      return res.status(201).json(newClaim);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  apiRouter.get("/claims", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const userRole = req.session.userRole!;
      
      // Admin can see all claims, students can only see their own
      let claims;
      if (userRole === "admin") {
        claims = await storage.getAllClaims();
      } else {
        claims = await storage.getClaimsByUser(userId);
      }
      
      return res.status(200).json(claims);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  apiRouter.get("/claims/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const claimId = parseInt(req.params.id);
      const claim = await storage.getClaim(claimId);
      
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      // Students can only view their own claims
      if (req.session.userRole !== "admin" && claim.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      return res.status(200).json(claim);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  apiRouter.put("/claims/:id/status", authenticateUser, isAdmin, async (req: Request, res: Response) => {
    try {
      const claimId = parseInt(req.params.id);
      const adminId = req.session.userId!;
      
      const validatedData = updateClaimStatusSchema.parse(req.body);
      
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      const updatedClaim = await storage.updateClaimStatus(claimId, validatedData, adminId);
      
      if (!updatedClaim) {
        return res.status(500).json({ message: "Failed to update claim status" });
      }
      
      // Get the student who submitted the claim
      const student = await storage.getUser(claim.userId);
      
      if (student) {
        // Notify the student about the claim status update
        await storage.createNotification({
          userId: student.id,
          title: `Claim ${validatedData.status.charAt(0).toUpperCase() + validatedData.status.slice(1)}`,
          message: `Your claim for ${claim.claimType} has been ${validatedData.status}.`
        });
        
        // Send email notification
        await sendEmail(
          student.email,
          `MARA Claim ${validatedData.status.charAt(0).toUpperCase() + validatedData.status.slice(1)}`,
          `Dear ${student.fullName},\n\nYour claim for ${claim.claimType} (€${claim.amount}) has been ${validatedData.status}.${validatedData.reviewComment ? `\n\nReviewer comments: ${validatedData.reviewComment}` : ""}\n\nBest regards,\nMARA Admin Team`
        );
      }
      
      return res.status(200).json(updatedClaim);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // Academic record routes
  apiRouter.post("/academic-records", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertAcademicRecordSchema.parse({
        ...req.body,
        userId
      });
      
      const newAcademicRecord = await storage.createAcademicRecord(validatedData);
      return res.status(201).json(newAcademicRecord);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  apiRouter.get("/academic-records", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const academicRecords = await storage.getAcademicRecordsByUser(userId);
      return res.status(200).json(academicRecords);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  // Course routes
  apiRouter.post("/courses", authenticateUser, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      
      // Ensure the academic record belongs to the user
      const academicRecord = await storage.getAcademicRecord(validatedData.academicRecordId);
      
      if (!academicRecord || academicRecord.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const newCourse = await storage.createCourse(validatedData);
      return res.status(201).json(newCourse);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  apiRouter.get("/academic-records/:id/courses", authenticateUser, async (req: Request, res: Response) => {
    try {
      const academicRecordId = parseInt(req.params.id);
      
      // Ensure the academic record belongs to the user
      const academicRecord = await storage.getAcademicRecord(academicRecordId);
      
      if (!academicRecord || (academicRecord.userId !== req.session.userId && req.session.userRole !== "admin")) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const courses = await storage.getCoursesByAcademicRecord(academicRecordId);
      return res.status(200).json(courses);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  // Study plan routes
  apiRouter.post("/study-plans", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertStudyPlanSchema.parse({
        ...req.body,
        userId
      });
      
      const newStudyPlan = await storage.createStudyPlan(validatedData);
      return res.status(201).json(newStudyPlan);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  apiRouter.get("/study-plans", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const studyPlans = await storage.getStudyPlansByUser(userId);
      return res.status(200).json(studyPlans);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  // Notification routes
  apiRouter.get("/notifications", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const notifications = await storage.getNotificationsByUser(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  apiRouter.put("/notifications/:id/read", authenticateUser, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Ensure the notification belongs to the user
      const notification = await storage.getNotification(notificationId);
      
      if (!notification || notification.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(500).json({ message: "Failed to mark notification as read" });
      }
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
  
  // File upload endpoint
  apiRouter.post("/upload", authenticateUser, upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Log uploaded file details for debugging
      console.log("File uploaded successfully:", {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });
      
      // Create the file URL that can be used to access the file
      const fileUrl = getFileUrl(req.file.filename);
      
      // Get server base URL
      const protocol = req.protocol;
      const host = req.get('host');
      
      console.log(`File saved at: ${req.file.path}`);
      console.log(`File URL: ${fileUrl}`);
      console.log(`Server base URL: ${protocol}://${host}`);
      
      // Return file information
      return res.status(201).json({
        fileName: req.file.originalname,
        // For backward compatibility, return both the original filename 
        // for display and the actual timestamped filename for storage
        fileUrl: req.file.filename, // This is the actual timestamped filename
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        // Include the original name to display to the user
        originalName: req.file.originalname,
        // Include full relative URL for direct access
        fullFileUrl: fileUrl
      });
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({ 
        message: "Error uploading file", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Helper endpoint to find a file by its original name (without timestamp prefix)
  apiRouter.get("/file-lookup/:filename", authenticateUser, (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      if (!filename) {
        return res.status(400).json({ message: "Filename is required" });
      }
      
      // Try to find the file with our helper function
      const foundFile = findFileByName(filename);
      
      if (!foundFile) {
        return res.status(404).json({ 
          message: "File not found", 
          requestedFilename: filename 
        });
      }
      
      // Return the matched file info
      return res.status(200).json({
        fileName: filename,
        fileUrl: `/uploads/${foundFile}`,
        success: true
      });
    } catch (error) {
      console.error("File lookup error:", error);
      return res.status(500).json({ 
        message: "Error looking up file", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
