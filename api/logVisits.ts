import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export async function POST(request: Request): Promise<Response> {
  const client = createClient();

  try {
    await client.connect();

    // Parse the request body
    const { elderlyId, visitorId, status, comments, photoUrls, location } = await request.json();

    if (!elderlyId || !visitorId || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert the new visit into the 'visits' table using the photo URL
    await client.sql`
      INSERT INTO visits (elderly_id, visitor_id, status, comments, photo_urls, location, visit_time)
      VALUES (${elderlyId}, ${visitorId}, ${status}, ${comments || null}, ${photoUrls || null}, ${location}, NOW());
    `;

    return new Response(
      JSON.stringify({ success: true, message: 'Visit logged successfully.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error logging visit:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to log visit.',
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await client.end();
  }
}
