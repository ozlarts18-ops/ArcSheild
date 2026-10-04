import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128)
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  trade: z.string().max(80).optional().default('Welding'),
  workshop: z.string().max(80).optional().default('Welding Bay 01'),
  phoneNumber: z.string().max(25).optional().default('')
});

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid administrative email').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128)
});

export const sensorIngestionSchema = z.object({
  helmetId: z.string().min(3).max(30),
  timestamp: z.string().optional(),
  temperature: z.object({
    current: z.number().min(-40).max(120),
    ambient: z.number().min(-40).max(80).optional()
  }).optional(),
  humidity: z.object({
    current: z.number().min(0).max(100)
  }).optional(),
  uvArcExposure: z.object({
    level: z.string().max(30).optional(),
    numeric: z.number().min(0).max(100).optional()
  }).optional(),
  gasExposure: z.object({
    level: z.string().max(30).optional(),
    numeric: z.number().min(0).max(100).optional()
  }).optional(),
  motion: z.object({
    movement: z.string().max(30).optional(),
    fallDetected: z.boolean().optional()
  }).optional(),
  helmetWearing: z.object({
    isWorn: z.boolean().optional()
  }).optional()
});

export const alertLifecycleSchema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']),
  notes: z.string().max(500).optional().default('')
});

export const createIncidentSchema = z.object({
  type: z.enum(['NEAR_MISS', 'INCIDENT']),
  title: z.string().min(3, 'Title is required').max(150),
  description: z.string().min(5, 'Description is required').max(2000),
  affectedUser: z.string().max(100).optional().default('Active Worker'),
  helmetId: z.string().max(30).optional().default('ARC-001'),
  workshop: z.string().max(100).optional().default('Welding Bay 01'),
  actionTaken: z.string().max(1000).optional().default('')
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(100),
  phoneNumber: z.string().max(25).optional().default(''),
  trade: z.string().max(80).optional().default('Welding'),
  workshop: z.string().max(80).optional().default('Welding Bay 01'),
  zone: z.string().max(50).optional().default('Zone A'),
  assignedHelmetId: z.string().max(30).optional().default(''),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
  password: z.string().min(6).max(128).optional(),
  isActive: z.boolean().optional().default(true)
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(100).optional(),
  phoneNumber: z.string().max(25).optional(),
  trade: z.string().max(80).optional(),
  workshop: z.string().max(80).optional(),
  zone: z.string().max(50).optional(),
  assignedHelmetId: z.string().max(30).optional(),
  isActive: z.boolean().optional()
});

export const assignHelmetSchema = z.object({
  helmetId: z.string().max(30).optional().default('')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required').max(128),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128)
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().max(25).optional(),
  workshop: z.string().max(80).optional(),
  trade: z.string().max(80).optional()
});

