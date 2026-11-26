import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Sau khi build xong, sinh ra dist/sw.js chứa danh sách mọi tệp của app để lưu sẵn
 * trên thiết bị. Tên bộ nhớ đệm gắn với nội dung, nên mỗi bản build mới sẽ thay bản cũ.
 */
function offlineServiceWorker(): Plugin {
  let outDir = 'dist';
  return {
    name: 'lvs-offline-sw',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name !== 'sw.js') files.push(full);
        }
      };
      walk(outDir);
      files.sort();

      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(f));
      const version = hash.digest('hex').slice(0, 12);
      const urls = ['./', ...files.map((f) => './' + relative(outDir, f).replace(/\\/g, '/'))];

      writeFileSync(join(outDir, 'sw.js'), swSource(version, urls));
    },
  };
}

function swSource(version: string, urls: string[]): string {
  return `// Tệp sinh tự động khi build (xem vite.config.ts). Không sửa tay.
const CACHE = 'lvs-${version}';
const FILES = ${JSON.stringify(urls)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('lvs-') && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Mở trang: ưu tiên mạng để nhận bản mới, mất mạng thì dùng bản đã lưu.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html', { cacheName: CACHE, ignoreVary: true }),
      ),
    );
    return;
  }
  // Các tệp khác: dùng bản đã lưu nếu có. Bỏ qua tiêu đề Vary, vì thẻ <script crossorigin>
  // gửi kèm Origin còn lúc lưu sẵn thì không, khiến so khớp trượt dù cùng một tệp.
  event.respondWith(
    caches
      .match(request, { cacheName: CACHE, ignoreVary: true })
      .then((hit) => hit || fetch(request)),
  );
});
`;
}

export default defineConfig({
  base: './',
  plugins: [react(), offlineServiceWorker()],
  server: { port: 5173 },
  preview: { port: 4173 },
});
