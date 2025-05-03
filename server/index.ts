import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from /public/uploads directory
const uploadsPath = path.join(process.cwd(), 'public/uploads');
console.log(`Setting up static file serving from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath, {
  // Increase caching to improve performance
  maxAge: '1h',
  // Set proper content types for common file types
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      // Set content disposition for PDFs to improve embedding
      res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(filePath));
      // Add headers needed for PDF embedding
      res.setHeader('X-Content-Type-Options', 'nosniff');
    } else if (filePath.match(/\.(jpe?g)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.match(/\.(png)$/i)) {
      res.setHeader('Content-Type', 'image/png');
    }
    // Enable CORS for file access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Set up session middleware with PostgreSQL storage
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: "session", // Default table name
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "mara-claim-system-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure admin user exists
  const { storage } = await import("./storage");
  try {
    let adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      console.log("Creating admin user...");
      adminUser = await storage.createUser({
        username: "admin",
        password: "admin123",
        email: "admin@mara.example.com",
        fullName: "MARA Admin",
        nationalId: "ADMIN123",
        maraId: "MARA-ADMIN-001",
        phoneNumber: "+1234567890",
        currentAddress: "MARA HQ",
        countryOfStudy: "Malaysia",
        university: "MARA Administration",
        fieldOfStudy: "Administration",
        degreeLevel: "N/A",
        maraGroup: "Administrative",
        sponsorshipPeriod: "2023-2028",
        bankName: "MARA Bank",
        bankAddress: "MARA HQ, Kuala Lumpur",
        accountNumber: "ADMIN-ACCOUNT-001",
        swiftCode: "MARABANKXXX",
        role: "admin"
      });
      console.log("Admin user created:", adminUser.id);
    } else {
      console.log("Admin user already exists:", adminUser.id);
    }

     // Ensure student user exists
     let studentUser = await storage.getUserByUsername("student");
     if (!studentUser) {
       console.log("Creating student user...");
       studentUser = await storage.createUser({
         username: "student",
         password: "student123",
         email: "student@mara.example.com",
         fullName: "MARA Student",
         nationalId: "STUDENT123",
         maraId: "MARA-STUDENT-001",
         phoneNumber: "+1234567891",
         currentAddress: "Student Dormitory",
         countryOfStudy: "Malaysia",
         university: "MARA University",
         fieldOfStudy: "Engineering",
         degreeLevel: "Bachelor",
         maraGroup: "Engineering",
         sponsorshipPeriod: "2023-2027",
         bankName: "Student Bank",
         bankAddress: "Student Bank HQ, Kuala Lumpur",
         accountNumber: "STUDENT-ACCOUNT-001",
         swiftCode: "STUDENTBANKXXX",
         role: "student"
       });
       console.log("Student user created:", studentUser.id);
     } else {
       console.log("Student user already exists:", studentUser.id);
     }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, 'localhost', () => {
    log(`serving on port ${port}`);
  });
})();
