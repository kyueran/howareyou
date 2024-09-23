import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { IncomingMessage, ServerResponse } from 'http';

// POST function to handle the file upload with UmiJS
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'POST') {
    try {
      // Parse the request body as JSON
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        const body: HandleUploadBody = JSON.parse(
          Buffer.concat(chunks).toString(),
        );

        // Use handleUpload from '@vercel/blob/client' to generate the token and manage the upload flow
        const jsonResponse = await handleUpload({
          body,
          request: req,
          onBeforeGenerateToken: async (pathname) => {
            // Optional: Authenticate and authorize before generating the token
            return {
              allowedContentTypes: ['image/jpeg', 'image/png', 'image/heic'],
              tokenPayload: JSON.stringify({
                // Optionally include metadata, like user ID, etc.
              }),
            };
          },
          onUploadCompleted: async ({ blob, tokenPayload }) => {
            // Notify when upload is completed (this doesn't work on localhost)
            console.log('Blob upload completed:', blob, tokenPayload);

            try {
              // Run any logic after the file upload completed (e.g., updating the database)
              // const { userId } = JSON.parse(tokenPayload);
              // await db.update({ avatar: blob.url, userId });
            } catch (error) {
              throw new Error('Could not update user');
            }
          },
        });

        // Send success response back to the client
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(jsonResponse));
      });
    } catch (error: any) {
      console.error('Error handling upload:', error);

      // Send error response back to the client
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    // Handle unsupported HTTP methods
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Method not allowed. Use POST.' }));
  }
}
