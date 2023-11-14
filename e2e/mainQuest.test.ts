import { test, expect } from '@playwright/test';
import { v4 } from 'uuid';

test('Test quest progression', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByTestId('page-title')).toHaveText('Please log in to continue.');
  await page.locator('#username-input').pressSequentially("testUserUsername");
  await page.locator('#password-input').pressSequentially("let's kick gravel");
  await page.click('#login-button');
  await page.waitForURL('http://localhost:3000/character-select');
  // create character
  const name: string = v4().substring(0, 20);
  await page.locator('#new-character-name').pressSequentially(name);
  await page.click('#create-new-character-button');
  await expect(page.getByTestId('page-title')).toHaveText('Choose your active character.');
  await expect(await page.getByText('Active', { exact: true }).count()).toBe(1);
  await expect(await page.getByText(name)).toBeVisible();
  // get into the game
  expect(page.locator('#game-button')).toBeVisible();
  await page.locator('#game-button').click();
  await page.waitForURL('http://localhost:3000/game');
  await expect(page.getByTestId('page-title')).toHaveText('Threadbare');
  expect(page.getByTestId('player-input')).toBeVisible();
  // detect and handle character class selection
  await expect(await page.getByText('Select your character class')).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('rogue');
  await page.keyboard.press('Enter');

  await page.getByTestId('player-input').pressSequentially('quest');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^Finding Yourself: You woke up/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('door');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^Sitting in the library with/)).toBeVisible();

  await page.getByTestId('player-input').pressSequentially('stairs');
  await page.keyboard.press('Enter');

  await page.getByTestId('player-input').pressSequentially('door');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('stairs');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('talk old man');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^"Welcome, my friend!"/)).toBeVisible();
  
  await page.getByTestId('player-input').pressSequentially('inv');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You have 50 coins/)).toBeVisible();
  
  await page.getByTestId('player-input').pressSequentially('stairs');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('door');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('e');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('e');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('e');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('s');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('buy kit');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/^You buy a/)).toBeVisible();
  await expect(await page.getByText(/^traveling kit/)).toBeVisible();
  
  await page.getByTestId('player-input').pressSequentially('n');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('w');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('w');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('w');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('w');
  await page.keyboard.press('Enter');
  
  await page.getByTestId('player-input').pressSequentially('stairs');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/sits on a luxurious/)).toBeVisible();
  
  await page.getByTestId('player-input').pressSequentially('give kit to audric');
  await page.keyboard.press('Enter');
  await expect(await page.getByText(/accepts it graciously/)).toBeVisible();
  
});
