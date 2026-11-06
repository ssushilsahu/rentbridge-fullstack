const windows = new Map();

export function rateLimit({ windowMs, max, key }) {
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = `${key}:${req.ip}`;
    let bucket = windows.get(bucketKey);

    if (!bucket || bucket.expiresAt <= now) {
      if (windows.size >= 10000) {
        for (const [entryKey, value] of windows) {
          if (value.expiresAt <= now) windows.delete(entryKey);
        }
      }
      if (windows.size >= 10000) return res.status(429).json({ message: "Too many requests. Try again later." });
      bucket = { count: 0, expiresAt: now + windowMs };
      windows.set(bucketKey, bucket);
    }

    if (bucket.count >= max) {
      res.set("Retry-After", String(Math.ceil((bucket.expiresAt - now) / 1000)));
      return res.status(429).json({ message: "Too many requests. Try again later." });
    }

    bucket.count += 1;
    next();
  };
}
