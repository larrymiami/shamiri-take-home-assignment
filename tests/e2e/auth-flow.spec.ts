import { expect, test, type Page } from "@playwright/test";

interface LoginCredentials {
  email: string;
  password: string;
}

const SEEDED_DEMO_CREDENTIALS: LoginCredentials = {
  email: "supervisor@shamiri.demo",
  password: "Password123!"
};
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password. Please try again.";
const AUTH_RESULT_TIMEOUT_MS = 35_000;
const NEXTAUTH_SESSION_COOKIES = new Set([
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token"
]);

async function gotoHandlingRedirectAbort(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: "domcontentloaded" });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("net::ERR_ABORTED")) {
      throw error;
    }
  }

  await page.waitForLoadState("domcontentloaded");
}

async function waitForLoginFormHydration(page: Page): Promise<void> {
  await expect(page.locator("form")).toBeVisible();
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const form = document.querySelector("form");
          if (!form) return false;

          return Object.keys(form).some(
            (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactProps$")
          );
        }),
      {
        timeout: 20_000,
        message: "Login form did not hydrate in time"
      }
    )
    .toBe(true);
}

function resolveCredentialCandidates(): LoginCredentials[] {
  const configuredEmail = process.env.E2E_SUPERVISOR_EMAIL?.trim();
  const configuredPassword = process.env.E2E_SUPERVISOR_PASSWORD;

  const configured =
    configuredEmail && configuredPassword
      ? [{ email: configuredEmail, password: configuredPassword }]
      : [];

  const allCandidates = [...configured, SEEDED_DEMO_CREDENTIALS];
  const seen = new Set<string>();

  return allCandidates.filter((candidate) => {
    const key = `${candidate.email}::${candidate.password}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function tryLogin(page: Page, credentials: LoginCredentials): Promise<boolean> {
  await gotoHandlingRedirectAbort(page, "/login");
  await waitForLoginFormHydration(page);
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click({ noWaitAfter: true });

  const deadline = Date.now() + AUTH_RESULT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (/\/dashboard(\?|$)/.test(page.url())) {
      return true;
    }

    const cookies = await page.context().cookies();
    const hasSessionCookie = cookies.some(
      (cookie) => NEXTAUTH_SESSION_COOKIES.has(cookie.name) && cookie.value.length > 0
    );
    if (hasSessionCookie) {
      await gotoHandlingRedirectAbort(page, "/dashboard");
      if (/\/dashboard(\?|$)/.test(page.url())) {
        return true;
      }
    }

    if (await page.getByText(INVALID_CREDENTIALS_MESSAGE).isVisible()) {
      return false;
    }

    if (page.url().includes("/login?error=") || page.url().includes("/login#error=")) {
      return false;
    }

    await page.waitForTimeout(250);
  }

  try {
    await page.waitForURL(/\/dashboard(\?|$)/, { timeout: 1_500 });
    return true;
  } catch {
    return false;
  }
}

test.describe("authentication smoke flows", () => {
  test("renders login page with required fields", async ({ page }) => {
    await gotoHandlingRedirectAbort(page, "/login");

    await expect(page.getByRole("heading", { name: "Supervisor Login" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("redirects unauthenticated dashboard requests to login", async ({ page }) => {
    await gotoHandlingRedirectAbort(page, "/dashboard");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("authenticates with configured credentials (fallback to seeded demo)", async ({ page }) => {
    const candidates = resolveCredentialCandidates();
    let loggedIn = false;

    for (const candidate of candidates) {
      if (await tryLogin(page, candidate)) {
        loggedIn = true;
        break;
      }
    }

    expect(
      loggedIn,
      `Could not authenticate with provided credentials. Tried: ${candidates
        .map((item) => item.email)
        .join(", ")}. Final URL: ${page.url()}`
    ).toBe(true);

    await expect(page).toHaveURL(/\/dashboard(\?|$)/);
    await expect(page.getByText("Supervisor Dashboard")).toBeVisible();
    await expect(
      page.getByText("Completed Sessions").or(page.getByText("No completed sessions yet")).first()
    ).toBeVisible();
  });
});
