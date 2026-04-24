const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('capture app screenshot', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:8081');
  await expect(page.getByText('🛒 Shopping List')).toBeVisible();

  // Add multiple items to show a realistic list
  const input = page.getByPlaceholder('장바구니에 담을 물건...');
  const addButton = page.getByRole('button', { name: '추가' });

  const items = ['🍎 사과', '🍌 바나나', '🥛 우유', '🍞 식빵'];
  for (const item of items) {
    await input.fill(item);
    await addButton.click();
  }

  // Toggle one item to show the completed state
  await page.getByText('🍌 바나나').click();

  // Ensure screenshots directory exists
  const screenshotDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  // Take the screenshot
  const screenshotPath = path.join(screenshotDir, 'shopping-list-preview.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
});
