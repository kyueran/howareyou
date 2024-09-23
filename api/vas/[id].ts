import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query; // Get the id from the query string

  // Check if the ID is provided
  if (!id) {
    return res.status(400).json({ error: 'Visit ID is required' });
  }

  // Ensure that the ID is a string (or convert it if it's an array)
  const vasId = Array.isArray(id) ? id[0] : id;

  try {
    // Execute the query to fetch the specific visit by ID
    const result = await sql`SELECT * FROM volunteer_and_staff WHERE id = ${vasId};`;

    // If no rows are returned, send a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Send the first row (since id is unique, there will be only one record)
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching visit data:', error);
    return res.status(500).json({ error: 'Failed to fetch visit data' });
  }
}
