import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';
import { IncomingMessage, ServerResponse } from 'http';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Create the PostgreSQL client
  const client = createClient();

  try {
    // Connect to the database
    await client.connect();

    // Fetch all visits from the database
    const visits = await client.sql`
    SELECT id, elderly_id, visitor_id, status, comments, photo_base64, visit_time
    FROM visits
    ORDER BY visit_time DESC;
    `;

    // Set status code and return the visits data as JSON
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, data: visits.rows }));
  } catch (error) {
    console.error('Error fetching visits:', error);

    // Handle errors
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to fetch visits',
      error: (error as Error).message // Type assertion for the error object
    }));
  } finally {
    // Ensure the database connection is closed
    await client.end();
  }
}