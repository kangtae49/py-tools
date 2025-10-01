import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type {IncomingMessage, ServerResponse} from "node:http";
import * as url from "node:url";
import * as fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
              'Content-Type': 'audio/mpeg', // 필요에 따라 파일 종류에 맞게 변경
            });
            stream.pipe(res);
          } else {
            // Range 없으면 전체 전송
            const stream = fs.createReadStream(filePath);
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': 'audio/mpeg',
            });
            stream.pipe(res);
          }
        });
      },
    },
  ],
  base: './',

})
