import https from "https";
import { parse } from "node-html-parser";
import redisCache from "../services/redisCache";

export default async function checkEmailDomain(domain: string): Promise<null | string> {
  // Check cache first
  const cacheKey = `email_domain:${domain}`;
  const cachedResult = await redisCache.get(cacheKey);

  if (cachedResult !== null) {
    const isBlocked = cachedResult === 'true';
    return isBlocked ? "Domain previously flagged" : null;
  }

  const url = `https://${domain}`;

  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      const validStatusCodes = [200, 301, 302, 307, 308];
      if (!validStatusCodes.includes(res.statusCode || 0)) {
        redisCache.set(cacheKey, 'true', 86400).finally(() => {
          resolve("Email domain doesn't return a valid HTTP response");
        });
        return;
      }

      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        const root = parse(raw);
        const title = root.querySelector("title")?.innerText.toLowerCase() || "";
        const text = root.text.toLowerCase();

        const spammyWords = ["fake", "temporary", "spam", "prevent", "anonymous", "disposable", "hacking", "attacking"];

        const hasSpamWords = spammyWords.some((word) => title.includes(word) || text.includes(word));
        if (hasSpamWords) {
          redisCache.set(cacheKey, 'true', 86400).finally(() => {
            resolve("Email domain page contains spammy content");
          });
          return;
        }

        redisCache.set(cacheKey, 'false', 86400).finally(() => {
          resolve(null);
        });
      });
    });

    req.on("error", () => {
      redisCache.set(cacheKey, 'true', 86400).finally(() => {
        resolve("Email domain does not support HTTPS or is invalid");
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      redisCache.set(cacheKey, 'true', 86400).finally(() => {
        resolve("Email domain timed out");
      });
    });
  });
}
