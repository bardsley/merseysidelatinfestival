import { test, expect, type Page } from '@playwright/test';

test('Homepage', async ({ page }: {page: Page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Biggest & Best SRBK Event' })).toBeVisible();
  await page.goto('/meal');
  await expect(page.getByRole('heading', { name: 'Dinner' })).toBeVisible();
  await page.goto('/tickets');
  await expect(page.getByRole('heading', { name: 'tickets' })).toBeVisible();
  await page.goto('/accomodation');
  await expect(page.getByRole('heading', { name: 'The Adelphi' })).toBeVisible();
})