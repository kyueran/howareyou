import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { Pool } from 'pg';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === 'production';

// Log environment variables for debugging
console.log(`Environment: ${process.env.NODE_ENV}`);
if (isProduction) {
  console.log('Running in production mode.');
  // Avoid logging DATABASE_URL in production to protect sensitive data
} else {
  console.log('Running in development mode.');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
}

// Initialize a connection pool with environment-based configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Uses DATABASE_URL from environment variables
  ssl: {
    rejectUnauthorized: false, // Required for certain PostgreSQL setups
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { residentId, visitorId, status, comments, photoUrl } = req.body;

    // Basic validation
    if (!residentId || !visitorId || !status) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields.' });
    }

    try {
      const client = await pool.connect();

      const query = `
        INSERT INTO visits (resident_id, visitor_id, status, comments, photo_url, visit_time)
        VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
      `;
      const values = [
        residentId,
        visitorId,
        status,
        comments || null,
        photoUrl || null,
      ];

      const result = await client.query(query, values);
      client.release();

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      console.error('Error logging visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log visit.',
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }
}
