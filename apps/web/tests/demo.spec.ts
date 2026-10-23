import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('C10 public fictional sample journey, interactive demo and catalogue safety', async ({ page, request: api }) => {
  test.setTimeout(90000);

  // 1. Unauthenticated visitor explores /demo without signup
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fictional Sample Journey');
  await expect(page.getByRole('note')).toContainText('Demonstration Only');
  await expect(page.getByText('Amara Chen (Fictional Sample Profile)')).toBeVisible();
  await expect(page.getByText('BSc Computer Science (First Class Honours)')).toBeVisible();

  // 2. Interactive persona switching
  await page.getByRole('button', { name: 'Lucas (Brazil)' }).click();
  await expect(page.getByText('Lucas Silva (Fictional Sample Profile)')).toBeVisible();
  await expect(page.getByText('BSc Environmental Engineering')).toBeVisible();

  // Switch back to Amara
  await page.getByRole('button', { name: 'Amara (Kenya)' }).click();
  await expect(page.getByText('Amara Chen (Fictional Sample Profile)')).toBeVisible();

  // 3. Interactive milestone task checklist toggling
  const thesisCheckbox = page.getByLabel('Finalize 2-page Master’s thesis pre-proposal document');
  await expect(thesisCheckbox).not.toBeChecked();
  await thesisCheckbox.click();
  await expect(thesisCheckbox).toBeChecked();
  await thesisCheckbox.click();
  await expect(thesisCheckbox).not.toBeChecked();

  // 4. Interactive demo save / shortlist toggle
  const saveButton = page.getByRole('button', { name: 'Save Fictional Example University Fellowship in demo shortlist' });
  await expect(saveButton).toHaveText('+ Save in demo');
  await saveButton.click();
  await expect(page.getByRole('button', { name: 'Remove Fictional Example University Fellowship in demo shortlist' })).toHaveText('✓ Saved in demo');

  // 5. Shared catalogue protection: test in-browser protection button
  await page.getByRole('button', { name: 'Test catalogue mutation protection' }).click();
  await expect(page.getByRole('status')).toContainText('Protected');

  // 6. Direct API verification: unauthenticated visitor cannot mutate shared catalogue data
  const unauthorizedPost = await api.post('/api/v1/editor/opportunities', {
    data: { title: 'Hacked Listing' },
  });
  expect([401, 403]).toContain(unauthorizedPost.status());

  const unauthorizedSave = await api.put('/api/v1/me/saved/00000000-0000-0000-0000-000000000001');
  expect(unauthorizedSave.status()).toBe(401);

  // 7. Accessibility scan (WCAG 2.0 A, 2.0 AA, 2.1 AA)
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);

  // 8. Responsive viewport checks across 320px to 2560px
  for (const width of [320, 375, 480, 640, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Width ${width}px`).toBe(true);
  }

  // 9. Capture verification screenshots
  await page.setViewportSize({ width: 320, height: 900 });
  await page.screenshot({ path: 'test-results/c10-demo-320.png', fullPage: true });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'test-results/c10-demo-1280.png', fullPage: true });
});
