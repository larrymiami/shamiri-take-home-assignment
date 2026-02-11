const SSL_ENFORCED_IN_PRODUCTION_MESSAGE =
  "DATABASE_URL must use SSL in production (sslmode=require, verify-ca, or verify-full)";

function normalizeSslParams(url: URL): void {
  const sslmode = url.searchParams.get("sslmode");

  if (!sslmode) {
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("uselibpqcompat", "true");
    return;
  }

  if (sslmode === "prefer") {
    // "prefer" can downgrade to plaintext; normalize to encrypted transport.
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("uselibpqcompat", "true");
    return;
  }

  if (sslmode === "require") {
    // Suppress pg v8 alias warning while preserving libpq-compatible behavior.
    if (!url.searchParams.get("uselibpqcompat")) {
      url.searchParams.set("uselibpqcompat", "true");
    }
    return;
  }
}

function assertProductionSslMode(url: URL): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const sslmode = url.searchParams.get("sslmode");
  const encryptedModes = new Set(["require", "verify-ca", "verify-full"]);

  if (!sslmode || !encryptedModes.has(sslmode)) {
    throw new Error(SSL_ENFORCED_IN_PRODUCTION_MESSAGE);
  }
}

export function getDatabaseUrlFromEnv(): string {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is required");
  }

  const url = new URL(value);
  normalizeSslParams(url);
  assertProductionSslMode(url);

  return url.toString();
}
