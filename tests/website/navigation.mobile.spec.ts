import { test, expect, type Page } from '@playwright/test';


test('has title', async ({ page }: {page: Page}) => {
  await page.goto('/accomodation');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MLF 2024/);
});

test('has navigation show button', async ({ page }: {page: Page}) => {
  await page.goto('/accomodation');
  // Mobile menu shown
  await expect(page.getByRole('button', { includeHidden: true, name: "Open main menu" })).toBeVisible();
  await page.getByRole('button', { includeHidden: true, name: "Open main menu" }).click();
  // Linsk that should be there after opening menu
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Meal' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Early Bird' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Hotel' })).toBeVisible();
  // Check draft links hidden
  await expect(page.getByRole('link', { name: 'Passes' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Artist' })).toHaveCount(0);
});

test('has navigation with draft content', async ({ page }: {page: Page}) => {
  await page.goto('/accomodation?draft=yahboi');
  await page.getByRole('button', { includeHidden: true, name: "Open main menu" }).click();
  // Linsk that should be there
  await expect(page.getByRole('link', { name: 'Passes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Artist' })).toBeVisible();
});

test('Draft content hider', async ({ page }: {page: Page}) => {
  await page.goto('/accomodation?draft=yahboi');
  // Check there is a header that hides draft content
  // const draftHeader = await page.getByText('showing Draft Content')
  await expect(page.getByText('showing Draft Content')).toBeVisible()

  // // Click dropdown and check links there
  await page.getByRole('button', { includeHidden: true, name: "Open main menu" }).click();
  await expect(page.getByRole('link', { name: 'Passes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Artist' })).toBeVisible();
  await page.getByRole('button', { includeHidden: true, name: "Close menu" }).click();

  await page.getByText('showing Draft Content').click();
  
  await expect(page.getByText('showing Draft Content')).not.toBeVisible();
  // Links taht should no longer be there
  await page.getByRole('button', { includeHidden: true, name: "Open main menu" }).click();
  await expect(page.getByRole('link', { name: 'Passes' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Artist' })).toHaveCount(0);
});