#!/usr/bin/env node
/**
 * Tiny HTTP client so you can try any request against the running dev server
 * (the preview pane can only do simple GET requests).
 *
 * Usage:
 *   npm run http -- <METHOD> <PATH> [JSON_BODY] [-H "Name: value"]...
 *
 * Examples:
 *   npm run http -- GET /
 *   npm run http -- POST /some/path '{"name":"value"}'
 *   npm run http -- GET /some/path -H "Authorization: Bearer my-token"
 */
const args = process.argv.slice(2);
const headers = { 'content-type': 'application/json' };
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-H' && args[i + 1]) {
    const [name, ...rest] = args[++i].split(':');
    headers[name.trim().toLowerCase()] = rest.join(':').trim();
  } else {
    positional.push(args[i]);
  }
}

const [method = 'GET', path = '/', body] = positional;
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}${path.startsWith('/') ? path : '/' + path}`;

(async () => {
  try {
    const res = await fetch(url, { method: method.toUpperCase(), headers, body, redirect: 'manual' });
    console.log(`\n${method.toUpperCase()} ${path} -> ${res.status} ${res.statusText}`);
    for (const h of ['location', 'x-request-id', 'x-response-time']) {
      if (res.headers.get(h)) console.log(`${h}: ${res.headers.get(h)}`);
    }
    const text = await res.text();
    if (text) {
      try {
        console.log(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        console.log(text);
      }
    }
  } catch (err) {
    console.error(`Request failed: ${err.message}. Is the dev server running on port ${port}?`);
    process.exitCode = 1;
  }
})();
