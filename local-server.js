const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const rawDocument = path.resolve(root, 'index.html');
const contentTypes = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.mp4': 'video/mp4',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webm': 'video/webm', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.html': 'text/html; charset=utf-8'
};

const svgReplacements = [
  ['/build-ui-bits/carousel-top.png', '/build-ui-bits/carousel-top.svg'],
  ['/build-ui-bits/carousel-top-big.png', '/build-ui-bits/carousel-top.svg'],
  ['/build-ui-bits/carousel-bottom.png', '/build-ui-bits/carousel-bottom.svg'],
  ['/build-ui-bits/carousel-bottom-1000.png', '/build-ui-bits/carousel-bottom.svg'],
  ['/build-ui-bits/carousel-bottom-big.png', '/build-ui-bits/carousel-bottom.svg'],
  ['/build-ui-bits/carousel-bottom-mobile.png', '/build-ui-bits/carousel-bottom.svg'],
  ['/build-ui-bits/right-top-decor.png', '/build-ui-bits/right-top-decor.svg'],
  ['/build-ui-bits/right-bottom-decor.png', '/build-ui-bits/right-bottom-decor.svg'],
  ['/build-ui-bits/right-small-decor.png', '/build-ui-bits/right-small-decor.svg'],
  ['/homepage/product-ui-1/col-bg.png', '/homepage/product-ui-1/col-bg.svg'],
  ['/homepage/product-ui-1/icon-bank.png', '/homepage/product-ui-1/icon-bank.svg'],
  ['/homepage/product-ui-1/icon-brand-spec.png', '/homepage/product-ui-1/icon-brand-spec.svg'],
  ['/homepage/product-ui-1/icon-buy-domain.png', '/homepage/product-ui-1/icon-buy-domain.svg'],
  ['/homepage/product-ui-1/icon-codebase.png', '/homepage/product-ui-1/icon-codebase.svg'],
  ['/homepage/product-ui-1/icon-company-name.png', '/homepage/product-ui-1/icon-company-name.svg'],
  ['/homepage/product-ui-1/icon-idea-new.png', '/homepage/product-ui-1/icon-idea-new.svg'],
  ['/homepage/product-ui-1/icon-llc.png', '/homepage/product-ui-1/icon-llc.svg'],
  ['/homepage/product-ui-1/icon-social-presence.png', '/homepage/product-ui-1/icon-social-presence.svg']
];

const imageRepair = `<script>
(() => {
  const replacements = {
    '/books-covers/UI 04/Frame 2147239727test-img-2.png': '/books-covers/UI%2004/Frame%202147239727test-img-2.png',
    '/books-covers/UI 04/Frame 2147239728.png': '/books-covers/UI%2004/Frame%202147239728.png',
    '/books-covers/UI 04/Frame 2147239727test-img.png': '/books-covers/UI%2004/Frame%202147239727test-img.png',
    '/books-covers/UI 04/Frame 2147239727.png': '/books-covers/UI%2004/Frame%202147239727.png'
  };
  const svgMap = ${JSON.stringify(svgReplacements)};
  const repair = () => document.querySelectorAll('img').forEach((image) => {
    const source = decodeURIComponent(image.getAttribute('src') || '');
    let done = false;
    const entry = Object.entries(replacements).find(([key]) => source.includes(key));
    if (entry && !image.dataset.referenceAssetFixed) {
      image.dataset.referenceAssetFixed = 'true';
      image.removeAttribute('srcset');
      image.loading = 'eager';
      image.src = entry[1];
      done = true;
    }
    const svgEntry = svgMap.find(([key]) => source.includes(key));
    if (svgEntry && !image.dataset.svgAssetFixed) {
      image.dataset.svgAssetFixed = 'true';
      image.removeAttribute('srcset');
      image.loading = 'eager';
      const cur = image.getAttribute('src') || '';
      image.setAttribute('src', cur.replace(svgEntry[0], svgEntry[1]));
      done = true;
    }
  });
  repair();
  new MutationObserver(repair).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(repair, 100);
  setTimeout(repair, 700);
  setTimeout(repair, 2200);
})();
</script>`;

function sendFile(res, filePath) {
  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    if (path.extname(filePath).toLowerCase() === '.png') {
      const svgFallback = filePath.slice(0, -4) + '.svg';
      fs.stat(svgFallback, (e2, s2) => {
        if (!e2 && s2.isFile()) {
          res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
          fs.createReadStream(svgFallback).pipe(res);
          return;
        }
        res.writeHead(404); res.end('Not found');
      });
      return;
    }
    res.writeHead(404); res.end('Not found');
  });
}

function safePath(relativePath) {
  const candidate = path.resolve(root, '.' + relativePath);
  return candidate.startsWith(root) ? candidate : null;
}

function cachedOptimizerAsset(targetPath, width) {
  const encodedTarget = encodeURIComponent(targetPath);
  const startsWith = `_next/image?url=${encodedTarget}&w=${width || ''}`;
  const alternative = `_next/image?url=${encodeURIComponent(targetPath)}&w=`;
  return fs.readdirSync(root).find((entry) => entry.startsWith(startsWith)) ||
    fs.readdirSync(root).find((entry) => entry.startsWith(alternative));
}

http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://127.0.0.1');
  if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
    fs.readFile(rawDocument, 'utf8', (error, document) => {
      if (error) { res.writeHead(500); res.end('Unable to read the reference document'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(document.replace('</body>', imageRepair + '</body>'));
    });
    return;
  }

  if (requestUrl.pathname === '/_next/image') {
    const targetPath = requestUrl.searchParams.get('url');
    if (!targetPath || !targetPath.startsWith('/')) { res.writeHead(400); res.end('Invalid image request'); return; }
    const directAsset = safePath(targetPath);
    if (directAsset && fs.existsSync(directAsset)) { sendFile(res, directAsset); return; }
    const cachedAsset = cachedOptimizerAsset(targetPath, requestUrl.searchParams.get('w'));
    if (cachedAsset) { sendFile(res, path.join(root, cachedAsset)); return; }
    res.writeHead(404); res.end('Image asset not found'); return;
  }

  let decoded;
  try { decoded = decodeURIComponent(requestUrl.pathname); }
  catch (e) { decoded = requestUrl.pathname; }
  const staticAsset = safePath(decoded);
  if (!staticAsset) { res.writeHead(403); res.end('Forbidden'); return; }
  sendFile(res, staticAsset);
}).listen(3000, "0.0.0.0", () => console.log('Reference clone ready at http://0.0.0.0:3000'));
