import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
        studyProgram: "Administration",
        courseLevel: "N/A",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
        role: "admin"
      });
      console.log("Admin user created:", adminUser.id);
    } else {
      console.log("Admin user already exists:", adminUser.id);
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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
