import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { describe, it, beforeEach, afterEach } from "mocha";
import assert from "assert";

let driver: WebDriver;

describe('SauceDemo Happy Flow Test', function () {
  this.timeout(30000);

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it('should login, add items to cart, verify cart, and complete checkout', async () => {
    await driver.get('https://www.saucedemo.com/');
    await driver.findElement(By.name('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    await driver.findElement(By.id('login-button')).click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/inventory.html'), 5000);

    const backpackAddButton = await driver.findElement(By.xpath('//button[@id="add-to-cart-sauce-labs-backpack"]'));
    await backpackAddButton.click();

    const cartBadge = await driver.wait(
      until.elementLocated(By.css('.shopping_cart_badge')),
      5000
    );
    const cartCount = await cartBadge.getText();
    assert.strictEqual(cartCount, '1', 'Item should be added to the cart');

    const cartIcon = await driver.findElement(By.className('shopping_cart_link'));
    await cartIcon.click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/cart.html'), 5000);

    const itemName = await driver.findElement(By.css('.inventory_item_name')).getText();
    assert.strictEqual(itemName, 'Sauce Labs Backpack', 'The item in the cart should be the backpack');

    const checkoutButton = await driver.findElement(By.id('checkout'));
    await checkoutButton.click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/checkout-step-one.html'), 5000);

    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('last-name')).sendKeys('Doe');
    await driver.findElement(By.id('postal-code')).sendKeys('12345');
    const continueButton = await driver.findElement(By.id('continue'));
    await continueButton.click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/checkout-step-two.html'), 5000);

    const finishButton = await driver.findElement(By.id('finish'));
    await finishButton.click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/checkout-complete.html'), 5000);

    const confirmationHeader = await driver.wait(
      until.elementLocated(By.className('complete-header')),
      5000
    );
    const confirmationText = await confirmationHeader.getText();

    const cleanedConfirmationText = confirmationText.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
    const expectedText = 'THANK YOU FOR YOUR ORDER'.toUpperCase();
    assert.strictEqual(cleanedConfirmationText, expectedText, 'Order confirmation page should be displayed');
  });
});
