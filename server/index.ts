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

// Determine upload path based on environment
const uploadsPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.env.UPLOAD_DIR || '/var/uploads', 'mara-claims')
  : path.join(process.cwd(), 'public/uploads');

// Also set up a fallback path in case the primary path is unavailable in production
const fallbackUploadsPath = path.join(process.cwd(), 'public/uploads');

// Make sure we serve both paths in production
if (process.env.NODE_ENV === 'production' && uploadsPath !== fallbackUploadsPath) {
  console.log(`Setting up static file serving from production path: ${uploadsPath}`);
  app.use('/uploads', express.static(uploadsPath, {
    maxAge: '1h',
    setHeaders: setupFileHeaders
  }));
  
  // Add fallback static serving for files that might be in the fallback directory
  console.log(`Setting up fallback static file serving from: ${fallbackUploadsPath}`);
  app.use('/uploads', express.static(fallbackUploadsPath, {
    maxAge: '1h',
    setHeaders: setupFileHeaders
  }));
} else {
  console.log(`Setting up static file serving from: ${uploadsPath}`);
  app.use('/uploads', express.static(uploadsPath, {
    maxAge: '1h',
    setHeaders: setupFileHeaders
  }));
}

// Helper function for setting appropriate headers
function setupFileHeaders(res: express.Response, filePath: string) {
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
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    httpOnly: true,
    // Allow Render.com domains and custom domains
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
  },
  // Set proxy for correct cookie handling behind load balancers (Render.com uses them)
  proxy: process.env.NODE_ENV === "production"
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

  // Use PORT from environment variable for production (Render.com) or default to 5000
  const port = process.env.PORT || 5000;
  
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
