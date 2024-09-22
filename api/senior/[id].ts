import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query; // Get the id from the query string

  // Check if the ID is provided
  if (!id) {
    return res.status(400).json({ error: 'Elderly ID is required' });
  }

  // Ensure that the ID is a string (or convert it if it's an array)
  const elderlyId = Array.isArray(id) ? id[0] : id;

  try {
    // Execute the query to fetch the specific elderly by ID
    const result = await sql`SELECT * FROM seniors WHERE id = ${elderlyId};`;

    // If no rows are returned, send a 404 response
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elderly not found' });
    }

    // Send only the rows (actual data)
    return res.status(200).json(result.rows); // Assuming you only want one elderly's data
  } catch (error) {
    console.error('Error fetching seniors data:', error);
    return res.status(500).json({ error: 'Failed to fetch seniors data' });
  }
}
