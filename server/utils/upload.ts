import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
// In production (Render.com), use a dedicated uploads directory that persists across deployments
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join(process.env.UPLOAD_DIR || '/var/uploads', 'mara-claims') 
  : path.join(process.cwd(), 'public/uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory at: ${uploadDir}`);
  } else {
    console.log(`Upload directory exists at: ${uploadDir}`);
  }
} catch (error) {
  console.error(`Error creating upload directory: ${error}`);
  // Fallback to temp directory if needed
  if (process.env.NODE_ENV === 'production') {
    console.log('Using fallback upload directory');
    const fallbackDir = path.join(process.cwd(), 'public/uploads');
    
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Create a filename with timestamp prefix to avoid collisions
    // but keep the original name to make it easier to identify
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedFilename}`);
  }
});

// Set up file filter to only allow certain types
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, GIF, and WEBP files are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Find a file by name in the uploads directory that matches the given filename
// This handles the case where the stored filename is different from the actual file on disk
// (like when timestamp prefixes are added)
export const findFileByName = (filename: string): string | null => {
  try {
    // If the file exists exactly as provided, return it as is
    const exactPath = path.join(uploadDir, filename);
    if (fs.existsSync(exactPath)) {
      return filename;
    }
    
    // Otherwise, try to find a file that contains the given filename
    // For example, if "file.pdf" is requested, look for "1234567890-file.pdf"
    const files = fs.readdirSync(uploadDir);
    const matchedFile = files.find(file => {
      // Look for files that end with the requested filename
      return file.endsWith(filename) || 
        // Also try to match if the filename is inside (when there could be sanitization)
        file.includes(filename);
    });
    
    return matchedFile || null;
  } catch (error) {
    console.error('Error finding file by name:', error);
    return null;
  }
};

// Helper to get web-accessible URL for a file
export const getFileUrl = (filename: string): string => {
  // First check if we need to find the actual file by name
  // This is for when we only have the original filename but not the timestamped one
  if (!filename.includes('-') && !fs.existsSync(path.join(uploadDir, filename))) {
    const foundFile = findFileByName(filename);
    if (foundFile) {
      console.log(`Found file '${foundFile}' for requested name '${filename}'`);
      return `/uploads/${foundFile}`;
    }
  }
  
  return `/uploads/${filename}`;
};