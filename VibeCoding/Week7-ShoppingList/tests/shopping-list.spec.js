const { test, expect } = require('@playwright/test');

test.describe('Shopping List App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (Expo web port defaults to 8081)
    await page.goto('http://localhost:8081');
    // Wait for the app to load
    await expect(page.getByText('🛒 Shopping List')).toBeVisible();
  });

  test('should add a new item', async ({ page }) => {
    const input = page.getByPlaceholder('장바구니에 담을 물건...');
    const addButton = page.getByRole('button', { name: '추가' });

    await input.fill('우유');
    await addButton.click();

    await expect(page.getByText('우유')).toBeVisible();
  });

  test('should toggle item completion', async ({ page }) => {
    const input = page.getByPlaceholder('장바구니에 담을 물건...');
    const addButton = page.getByRole('button', { name: '추가' });

    await input.fill('빵');
    await addButton.click();

    const item = page.getByText('빵');
    await expect(item).toBeVisible();

    // Click the item to toggle
    await item.click();

    // Verify the visual change. When completed, the text should have line-through decoration.
    // In React Native Web, this is often applied as a style attribute or a specific class.
    await expect(item).toHaveCSS('text-decoration-line', /line-through/);
    
    // Toggle back
    await item.click();
    await expect(item).not.toHaveCSS('text-decoration-line', /line-through/);
  });

  test('should delete an item', async ({ page }) => {
    const input = page.getByPlaceholder('장바구니에 담을 물건...');
    const addButton = page.getByRole('button', { name: '추가' });

    await input.fill('사과');
    await addButton.click();

    await expect(page.getByText('사과')).toBeVisible();

    // Find the delete button. Since we added accessibilityRole="button" and accessibilityLabel="삭제"
    // it should be accessible via getByRole.
    const deleteButton = page.getByRole('button', { name: '삭제' });
    
    await deleteButton.click();

    await expect(page.getByText('사과')).not.toBeVisible();
  });
});
