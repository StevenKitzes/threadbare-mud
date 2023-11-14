import { test, expect } from '@playwright/test';

test('Test inventory related activities', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // select inventory/item test character
  await page.getByTestId('character-row-activate-button-item-tester').click();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByTestId('character-row-active-item-tester').textContent()).toBe('Active');
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  await expect(page.getByTestId('player-input')).toBeVisible();
  // unequip tests
  await expect(await page.getByText('A cold bedroom')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove parliamentary');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You are wearing multiple/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove headgear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You remove a Parliamentary great helm from your head.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove armor');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You remove Parliamentary upper armor with attached cape.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove gloves');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You remove a set of Parliamentary plate gauntlets from your hands.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove legwear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You pull a set of Parliamentary plate greaves off of your legs.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove footwear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You pry a set of Parliamentary plated boots off of your feet.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove sword');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You put away a decorative Parliamentary longsword.')).toBeVisible();
  
  await page.getByTestId('player-input').pressSequentially('remove scepter');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You put an inspiring silver scepter away.')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('remove nonexistent');
  await page.keyboard.press('Enter');
  await expect(await page.getByText('You are not wearing or wielding any nonexistent.')).toBeVisible();

  // drop/get multiple
  await page.getByTestId('player-input').pressSequentially('drop parliamentary');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You have multiple items/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('drop headgear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You dropped a Parliamentary great helm.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('drop cape');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You dropped Parliamentary upper armor with attached cape.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get parliamentary');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^There are multiple items/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get headgear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You picked up a Parliamentary great helm.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get cape');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You picked up Parliamentary upper armor with attached cape.$/)).toBeVisible();

  // equip tests
  await page.getByTestId('player-input').pressSequentially('wear parliamentary');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You are carrying multiple/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear headgear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You wear .* on your head.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear armor');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You wear .* on your body.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear gloves');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You slip your hands into .*.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear legwear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You put on .*.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear footwear');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You slip your feet into .*.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear offhand');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You equip .*.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear sword');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You ready .* for combat.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('wear nonexistent');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You don't have any .* to equip.$/)).toBeVisible();

  // drop and get non-existent
  await page.getByTestId('player-input').pressSequentially('drop nonexistent');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You aren't carrying any .*.$/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('get nonexistent');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You can't get .* here.$/)).toBeVisible();

});
