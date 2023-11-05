import { test, expect } from '@playwright/test';

test('Test landing page loads asking user to log in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForURL('http://localhost:3000/login');
  expect(await page.getByTestId('page-title').textContent()).toBe('Please log in to continue.');
});
