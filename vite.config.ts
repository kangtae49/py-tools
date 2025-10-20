import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import type {IncomingMessage, ServerResponse} from "node:http";
import * as url from "node:url";
import * as fs from "node:fs";
import path from "node:path";
import mime from "mime-types";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    viteTsconfigPaths(),
    {
      name: 'local-file-middleware',
      configureServer(server) {
        server.middlewares.use('/local/file', (req: IncomingMessage, res: ServerResponse, _next) => {
          const parsed = url.parse(req.url!, true);
          const filePath = parsed.query.path as string;

          if (!filePath || !fs.existsSync(filePath)) {
            res.writeHead(404);
            res.end('File not found');
            return;
          }

          const stat = fs.statSync(filePath);
          const range = req.headers.range;
          const mimeType = mime.lookup(filePath)
          let contentType = 'application/octet-stream';
          if (mimeType) {
            contentType = mimeType;
          }
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            const chunkSize = end - start + 1;

            const stream = fs.createReadStream(filePath, { start, end });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize,
              'Content-Disposition': `inline; filename=${encodeURIComponent(path.basename(filePath))}`,
              'Content-Type': contentType,
            });
            stream.pipe(res);
          } else {
            const stream = fs.createReadStream(filePath);
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Disposition': `inline; filename=${encodeURIComponent(path.basename(filePath))}`,
              'Content-Type': contentType,
            });
            stream.pipe(res);
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
    // port: 8097,
  },
  base: './',

})
