import { test, expect } from '@playwright/test';

test('Test catching wrong credentials', async({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("wrong creds");
  await page.click('#login-button');
  await expect(page.getByTestId('login-error-elements')).toContainText('Unable to log you in');
});

test('Test log in flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await page.goto('http://localhost:3000');
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toContainText('Welcome, ');
  await page.click('#logout-button');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
});
