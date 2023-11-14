import { test, expect } from '@playwright/test';
import { writeLiteralForTest_DANGEROUS } from '../sqlite/sqlite';

test('Test selling rats, single', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // select inventory/item test character
  await page.getByTestId('character-row-activate-button-rat-tester').click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByTestId('character-row-active-rat-tester').textContent()).toBe('Active');
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  await expect(page.getByTestId('player-input')).toBeVisible();

  await expect(await page.getByText('Parliament Market Gate')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('talk officer');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^The peacekeeper officer jerks his head at the sign/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('look sign');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^The sign with the picture of the dead rat/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a dead rat/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell rats');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You hand in 1 dead rat, and in exchange, the peacekeeper officer hands you 5 coins.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a dead rat/)).toHaveCount(1);

  await page.getByTestId('player-input').pressSequentially('sell rats');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You hand in 0 dead rats, and in exchange, the peacekeeper officer hands you 0 coins.$/)).toBeVisible();

  writeLiteralForTest_DANGEROUS(`UPDATE characters SET inventory = '["80"]' WHERE id = 'rat-tester';`);
});

test('Test selling rats, multi', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // select inventory/item test character
  await page.getByTestId('character-row-activate-button-rats-tester').click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByTestId('character-row-active-rats-tester').textContent()).toBe('Active');
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  await expect(page.getByTestId('player-input')).toBeVisible();

  await expect(await page.getByText('Parliament Market Gate')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a dead rat x3/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell rat');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You hand in 3 dead rats, and in exchange, the peacekeeper officer hands you 15 coins.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a dead rat/)).toHaveCount(1);

  await page.getByTestId('player-input').pressSequentially('sell rat');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You hand in 0 dead rats, and in exchange, the peacekeeper officer hands you 0 coins.$/)).toBeVisible();

  writeLiteralForTest_DANGEROUS(`UPDATE characters SET inventory = '["80", "80", "80"]' WHERE id = 'rats-tester';`);
});

