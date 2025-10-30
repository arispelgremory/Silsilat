import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';

// Extend Express Request type to include files
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

// Use absolute path that works in both local dev and Docker
const uploadsPath = process.env.UPLOADS_PATH || path.resolve(process.cwd(), 'public', 'uploads');

// Ensure the uploads directory exists
async function ensureUploadsDirectory(): Promise<void> {
  try {
    await fs.access(uploadsPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(uploadsPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb) => {
    await ensureUploadsDirectory();
    cb(null, uploadsPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
  }
};

// Configure multer for multiple files (max 10 files)
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum number of files
  }
}).array('images', 10);

export const handleUpload = (req: MulterRequest, res: Response): void => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File size is too large. Max size is 5MB per file.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, error: 'Too many files. Maximum 10 files allowed.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, error: 'Unexpected field name. Use "images" field.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    // Check if files were uploaded
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    // Process all uploaded files
    const uploadedFiles = files.map((file) => {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return {
        url: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  });
};

// Function to delete a single file (for cleanup if needed)
export const deleteFile = async (filename: string): Promise<boolean> => {
  try {
    await fs.unlink(path.join(uploadsPath, filename));
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Function to delete multiple files at once
export const deleteFiles = async (filenames: string[]): Promise<{ success: string[]; failed: string[] }> => {
  const result = { success: [] as string[], failed: [] as string[] };
  
  for (const filename of filenames) {
    try {
      await fs.unlink(path.join(uploadsPath, filename));
      result.success.push(filename);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      result.failed.push(filename);
    }
  }
  
  return result;
};
