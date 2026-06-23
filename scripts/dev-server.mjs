import { createReadStream } from "node:fs";
import { rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { Server } from "node:net";
import { join, normalize, sep } from "node:path";
import next from "next";

const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
const DISPLAY_HOSTNAME =
  HOSTNAME === "0.0.0.0" || HOSTNAME === "::" ? "localhost" : HOSTNAME;
const DEFAULT_PORT = Number(process.env.PORT || 3000);
const NEXT_STATIC_PREFIX = "/_next/static/";
const NEXT_STATIC_DIR = join(process.cwd(), ".next", "static");
const WEBPACK_CHUNK_FILE = join(NEXT_STATIC_DIR, "chunks", "webpack.js");
const WEBPACK_CACHE_DIR = join(process.cwd(), ".next", "cache", "webpack");
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=UTF-8"],
  [".js", "application/javascript; charset=UTF-8"],
  [".json", "application/json; charset=UTF-8"],
  [".map", "application/json; charset=UTF-8"],
  [".txt", "text/plain; charset=UTF-8"],
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(path) {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

async function waitForFile(path, timeoutMs = 5_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await fileExists(path)) {
      return true;
    }
    await sleep(100);
  }
  return false;
}

async function warmDevChunks(port) {
  try {
    await fetch(`http://127.0.0.1:${port}/login`, {
      headers: { "x-dev-warmup": "1" },
    });
  } catch {
    // The first real request can still compile the app; warmup is best effort.
  }

  await waitForFile(WEBPACK_CHUNK_FILE);
}

async function clearWebpackCache() {
  await rm(WEBPACK_CACHE_DIR, { recursive: true, force: true });
}

function contentTypeForPath(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? CONTENT_TYPES.get(match[0]) : undefined;
}

function nextStaticFileForPath(pathname) {
  if (!pathname.startsWith(NEXT_STATIC_PREFIX)) {
    return null;
  }

  const relativePath = decodeURIComponent(
    pathname.slice(NEXT_STATIC_PREFIX.length),
  );
  const normalizedPath = normalize(relativePath);

  if (
    normalizedPath.startsWith("..") ||
    normalizedPath.includes(`${sep}..${sep}`) ||
    normalizedPath.startsWith(sep)
  ) {
    return null;
  }

  return join(NEXT_STATIC_DIR, normalizedPath);
}

async function serveNextStaticWhenReady(req, res, pathname) {
  const filePath = nextStaticFileForPath(pathname);
  if (!filePath) {
    return false;
  }

  const ready = await waitForFile(filePath, 10_000);
  if (!ready) {
    return false;
  }

  res.setHeader("Cache-Control", "no-store, must-revalidate");
  const contentType = contentTypeForPath(filePath);
  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  if (req.method === "HEAD") {
    res.statusCode = 200;
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, HOSTNAME);
  });
}

async function canListen(port) {
  const probe = new Server();
  try {
    await listen(probe, port);
    await new Promise((resolve, reject) => {
      probe.close((error) => (error ? reject(error) : resolve()));
    });
    return true;
  } catch (error) {
    if (error?.code === "EADDRINUSE") {
      return false;
    }
    throw error;
  }
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 10; port += 1) {
    if (await canListen(port)) {
      return port;
    }
    if (port === preferredPort) {
      console.warn(`Port ${preferredPort} is in use, trying ${port + 1} instead.`);
    }
  }

  throw new Error(
    `No available dev port found from ${preferredPort} to ${preferredPort + 9}.`,
  );
}

async function main() {
  const port = await findAvailablePort(DEFAULT_PORT);
  const app = next({ dev: true, hostname: DISPLAY_HOSTNAME, port });
  const handle = app.getRequestHandler();

  await clearWebpackCache();
  await app.prepare();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (await serveNextStaticWhenReady(req, res, url.pathname)) {
      return;
    }

    try {
      await handle(req, res);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  await listen(server, port);
  await warmDevChunks(port);
  console.log(`Ready on http://${DISPLAY_HOSTNAME}:${port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
