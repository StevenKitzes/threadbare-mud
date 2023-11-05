import { test, expect } from '@playwright/test';
import { v4 } from 'uuid';

test('Test character creation and selection', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await page.getByText('Activate').first().click();
  await expect(await page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByText('Active', { exact: true }).count()).toBe(1);
  // creation
  await page.waitForTimeout(1000);
  const name: string = v4().substring(0, 20);
  await page.locator('#new-character-name').pressSequentially(name);
  await page.click('#create-new-character-button');
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByText('Active', { exact: true }).count()).toBe(1);
  await expect(await page.getByText(name)).toBeVisible();
  // click back on the first character in the list
  await page.getByText('Activate').first().click();
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByText('Active', { exact: true }).count()).toBe(1);
  // wrap up by logging out
  await page.waitForTimeout(1000);
  expect(page.locator('#logout-cta-button')).toBeVisible();
  await page.locator('#logout-cta-button').click();
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
});
