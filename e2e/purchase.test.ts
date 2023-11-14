import { test, expect } from '@playwright/test';

test('Test buying and selling items', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // select inventory/item test character
  await page.getByTestId('character-row-activate-button-purchase-tester').click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByTestId('character-row-active-purchase-tester').textContent()).toBe('Active');
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  await expect(page.getByTestId('player-input')).toBeVisible();

  await expect(await page.getByText('Parliament Western Marketplace')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('talk baker');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^A baker beams at you/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You buy a fresh loaf of bread from a baker/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a fresh loaf of bread \(consumable\)$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You buy a fresh loaf of bread from a baker/)).toHaveCount(2);

  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^a fresh loaf of bread x2 \(consumable\)$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy elegant');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You cannot afford to buy an elegant doublet.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('drop bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You dropped a fresh loaf of bread.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('look');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There is a fresh loaf of bread laying here. \(consumable\)$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('drop bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You dropped a fresh loaf of bread.$/)).toHaveCount(2);

  await page.getByTestId('player-input').pressSequentially('look');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There is a fresh loaf of bread \(x2\) laying here. \(consumable\)$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You picked up a fresh loaf of bread.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You picked up a fresh loaf of bread.$/)).toHaveCount(2);

  await page.getByTestId('player-input').pressSequentially('sell bread');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There are multiple merchants here who might buy/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell bread to vendor');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There are multiple merchants here that could/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell bread to baker');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You sold a fresh loaf of bread to a baker/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell bread to baker');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You sold a fresh loaf of bread to a baker/)).toHaveCount(2);

  await page.getByTestId('player-input').pressSequentially('buy fruit');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There are multiple items for sale here/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy apple');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You buy a shiny/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('buy orange');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You buy an orange/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell fruit to baker');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You are wearing or carrying/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('sell apple to baker');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You sold a shiny/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('eat orange');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You eat an orange and feel a little rejuvenated./)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('eat orange');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You don't have any orange to eat/)).toBeVisible();

});
