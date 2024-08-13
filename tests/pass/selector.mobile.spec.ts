import { test, expect, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker/locale/en';

test('buying a full pass', async ({ page }: {page: Page}) => {
  await page.goto('/pricing');
  // Expect a title "to contain" a substring.
  await expect(page.getByRole('heading', { name: 'Pass Selector' })).toBeVisible();
  const fullPassButton = await page.getByRole('button', { name: 'Give me the Full Pass' });
  fullPassButton.click();
  // Check full pass is selected
  await expect(page.getByTitle("Full Pass")).toContainText('Currently Selected');
  // Check others are included
  await expect(page.getByTitle("Saturday Pass")).toContainText('Included');
  await expect(page.getByTitle("Class Pass")).toContainText('Included');
  await expect(page.getByTitle("Party Pass")).toContainText('Included');
  await expect(page.getByTitle("Dine and Dance Pass")).toContainText('Included');
  await expect(page.getByTitle("Sunday Pass")).toContainText('Included');
  // Check toggles are all set
  const checkBoxTable = page.getByRole('table');
  await checkBoxTable.screenshot({ path: './test-results/pass/full-pass-options-table.png' })
  const checkBoxSwitches = checkBoxTable.getByRole('switch');

  // const count = await checkBoxSwitches.count();
  // for (let i = 0; i < count; ++i)
  //   await checkBoxSwitches.nth(i).screenshot({ path: `./test-results/pass/siwtch-${i}.png` })

  await expect(checkBoxSwitches).toHaveCount(6);
  // Check card mentions Full pass
  const checkoutCard = page.getByTitle('Checkout')
  await expect(checkoutCard).toContainText('Full Pass');
  const checkoutButton = checkoutCard.getByRole('button')
  await expect(checkoutButton).toBeVisible()
  await expect(checkoutButton).toHaveText('Buy Now');
  checkoutButton.click()
  await expect(checkoutButton).toHaveText('Checking Out...')
  await page.waitForURL('**/checkout');
  await page.route('**/*', async (route, request) => {
    // Override headers
    const headers = {
      ...request.headers(),
      'x-vercel-protection-bypass': undefined, // Remove the headers for stripeRequest
      'x-vercel-set-bypass-cookie': undefined
    };
    await route.continue({ headers });
  });
  await page.screenshot({ path: './test-results/pass/checkout-page.png', fullPage: true })
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const email = faker.internet.email({firstName: firstName, lastName: lastName, provider: 'merseysidelatinfestival.com'});
  const phone = faker.phone.number('07#########');
  await page.getByLabel('name').fill(fullName);
  await page.getByLabel('email').fill(email);
  await page.getByLabel('phone').fill(phone);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: 'Terrine', }).check();
  await page.getByRole('radio', { name: 'Chicken Supreme', }).check();
  await page.getByRole('radio', { name: 'Butter', }).check();
  await page.getByRole('checkbox', { name: 'Other' }).check();
  await page.getByRole('textbox', { name: 'Please give more details' }).fill(` Allergic to ${faker.commerce.productMaterial()}`);
  await page.getByRole('button', { name: 'Continue' }).click();
  // await page.waitForTimeout(3000);
  await expect(page.locator('#checkout')).toBeVisible()
  
  // Getting rid off stripe test, we'll do that via API testing
  // const stripeIframe = await page.waitForSelector('#checkout iframe')
  // const stripeFrame = await stripeIframe.contentFrame()
  // await stripeFrame.getByLabel('Card number').fill('4111111111111111');
  // await stripeFrame.getByLabel('Expiration').fill('04/30');
  // await stripeFrame.getByPlaceholder('CVC').fill('242');
  // await stripeFrame.getByPlaceholder('Full name on card').fill(fullName);
  // await stripeFrame.getByLabel('Postal code').fill('AB12 3DE');
  // await page.screenshot({ path: './test-results/pass/checkout-page-filled-out.png', fullPage: true })
  
  // await stripeFrame.getByTestId('hosted-payment-submit-button').click(); // DEoesn't submit form, not sure why but also we can test other side of it without stripe

});
