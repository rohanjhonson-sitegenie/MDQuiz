// Extend Express Request type to include custom properties
declare namespace Express {
  export interface Request {
    userId?: string
    userEmail?: string
  }
}