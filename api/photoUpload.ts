import { put } from '@vercel/blob';
import dotenv from 'dotenv';
import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.development.local' });
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing to handle file uploads
  },
};

// Helper function to stream request body to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// POST function to handle the file upload to Vercel Blob Storage
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'POST') {
    try {
      // Parse the URL to get the 'filename' query parameter
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const filename = url.searchParams.get('filename');

      if (!filename) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Filename is required' }));
        return;
      }

      // Convert the request body stream to a Buffer
      const fileBuffer = await streamToBuffer(req);

      // Upload the file to Vercel Blob Storage
      const blob = await put(filename, fileBuffer, {
        access: 'public', // Make the uploaded file publicly accessible
      });

      // Return the URL of the uploaded file as a JSON response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(blob));
    } catch (error) {
      console.error('File upload error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to upload file' }));
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed. Use POST.' }));
  }
}
