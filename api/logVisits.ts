import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// GET function to check if the server is working
export async function GET(): Promise<Response> {
  return new Response('LOG VISITS WORKING');
}

// POST function to insert a new visit into the 'visits' table
export async function POST(request: Request): Promise<Response> {
  // Create the PostgreSQL client
  const client = createClient();

  try {
    // Connect to the database
    await client.connect();

    // Parse the request body
    const { elderlyId, visitorId, status, comments, photoBase64 } =
      await request.json();

    // Basic validation
    if (!elderlyId || !visitorId || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Insert the new visit into the 'visits' table using @vercel/postgres
    await client.sql`
      INSERT INTO visits (elderly_id, visitor_id, status, comments, photo_base64, visit_time)
      VALUES (${elderlyId}, ${visitorId}, ${status}, ${comments || null}, ${
      photoBase64 || null
    }, NOW());
    `;

    // Return a success response
    return new Response(
      JSON.stringify({ success: true, message: 'Visit logged successfully.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('Error logging visit:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to log visit.',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } finally {
    // Ensure the database connection is closed
    await client.end();
  }
}

// Handler to route the request based on the method (GET/POST)
export async function handler(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    return GET();
  } else if (request.method === 'POST') {
    return POST(request);
  } else {
    return new Response(
      JSON.stringify({ message: 'Method not allowed. Use POST or GET.' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
