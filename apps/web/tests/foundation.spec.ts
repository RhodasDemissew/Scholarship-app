import { test, expect } from '@playwright/test';

test('live database listing, search validation, clear and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByText('Fictional demo', { exact: true })).toBeVisible();
  await page.getByLabel('Search sample opportunities').fill('x'.repeat(81));
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Use 80 characters or fewer.');
  await page.getByLabel('Search sample opportunities').fill('no-such-opportunity');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('No matching opportunities', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('link', { name: 'About this preview' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your scholarship companion, in progress.');
  await page.getByRole('link', { name: 'Explore the sample' }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/listing-${width}.png`, fullPage: true });
  }
});

test('loading, failed request and retry recovery', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/opportunities', async route => { await gate; await route.fulfill({ status: 503, body: 'Unavailable' }); });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Loading opportunities...');
  release();
  await expect(page.getByRole('alert')).toContainText("We couldn't load opportunities");
  await page.unroute('**/api/v1/opportunities');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('empty API response and missing route', async ({ page }) => {
  await page.route('**/api/v1/opportunities', route => route.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByText('No opportunities are available yet', { exact: true })).toBeVisible();
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('Swagger serves and executes the documented listing', async ({ page }) => {
  await page.goto('http://127.0.0.1:5080/swagger');
  await page.getByRole('button', { name: /GET \/api\/v1\/opportunities/ }).click();
  await page.getByRole('button', { name: 'Try it out' }).click();
  await page.getByRole('button', { name: 'Execute', exact: true }).click();
  await expect(page.locator('.responses-inner')).toContainText('isFictional');
});
