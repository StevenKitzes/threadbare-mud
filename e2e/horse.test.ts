import { test, expect } from '@playwright/test';
import { writeCharacterData, writeLiteralForTest_DANGEROUS } from '../sqlite/sqlite';
import { Character } from '@/types';

test('Test character creation and selection', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // select inventory/item test character
  await page.getByTestId('character-row-activate-button-horse-tester').click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByTestId('character-row-active-horse-tester').textContent()).toBe('Active');
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  await expect(page.getByTestId('player-input')).toBeVisible();
  // unequip tests
  await expect(await page.getByText('Parliament Northwestern Marketplace')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('talk stablemaster');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You watch as the groom nods/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You are the proud new owner/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You already have/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('give fruit to horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You have multiple items that can/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('give apple to horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You put a shiny/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('give orange to horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You put an orange/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get fruit from horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^.* is carrying multiple items/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get apple from horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You grabbed a shiny/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get orange from horse');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You grabbed an orange/)).toBeVisible();

  writeLiteralForTest_DANGEROUS("UPDATE characters SET horse = NULL WHERE id = 'horse-tester';");
});
