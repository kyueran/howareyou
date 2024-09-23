import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Execute the query to fetch all records from the seniors table
    const result = await sql`SELECT * FROM volunteer_and_staff`;
    // Send the transformed data as a response
    response.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching seniors data:', error);
    response.status(500).json({ error: 'Failed to fetch seniors data' });
  }
}
