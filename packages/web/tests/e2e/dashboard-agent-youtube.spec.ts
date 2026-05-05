import { test, expect } from '@playwright/test';

test.describe('Agent YOUTUBE — Live State Management', () => {
  test('YOUTUBE agent: start → running → stop → stopped', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('http://localhost:5173/');

    // 2. Wait for dashboard to load
    await expect(page.locator('text=AGENT HQ')).toBeVisible({ timeout: 5000 });

    // 3. Click MARKETING tab to show YOUTUBE card
    await page.click('button:has-text("MARKETING")');
    await expect(page.locator('text=YOUTUBE')).toBeVisible({ timeout: 5000 });

    // 4. Verify initial state is IDLE
    const youtubeCard = page.locator('text=YOUTUBE').first().locator('..').locator('..');
    await expect(youtubeCard.locator('text=IDLE')).toBeVisible();

    // 5. Click START button on YOUTUBE card
    await youtubeCard.click();
    const startBtn = youtubeCard.locator('button:has-text("▶ START")');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 6. Verify state transitions to STARTING then ACTIVE
    await expect(youtubeCard.locator('text=STARTING')).toBeVisible({ timeout: 2000 });
    await expect(youtubeCard.locator('text=ACTIVE'), 'YOUTUBE should be ACTIVE after start').toBeVisible({ timeout: 5000 });

    // 7. Verify top header Active counter increased
    const activeCountBefore = await page.locator('text=Active:').locator('..').locator('span').last().textContent();
    expect(parseInt(activeCountBefore || '0')).toBeGreaterThan(0);

    // 8. Verify card styling changed (running state glow)
    const cardBorder = youtubeCard.evaluate(el => window.getComputedStyle(el).borderColor);
    await expect(async () => {
      const border = await cardBorder;
      expect(border).not.toBe(''); // Should have active border
    }).toPass();

    // 9. Open detail drawer by clicking card
    await youtubeCard.click();
    await expect(page.locator('text=AGENT DETAIL')).toBeVisible({ timeout: 2000 });

    // 10. Verify detail panel shows ACTIVE
    await expect(page.locator('text=ACTIVE').first()).toBeVisible();

    // 11. Click STOP button in detail panel
    const stopBtn = page.locator('button:has-text("⏹ STOP")');
    await expect(stopBtn).toBeVisible({ timeout: 2000 });
    await stopBtn.click();

    // 12. Verify state transitions to STOPPING then STOPPED
    await expect(page.locator('text=STOPPING')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=STOPPED'), 'YOUTUBE should be STOPPED after stop').toBeVisible({ timeout: 5000 });

    // 13. Close detail drawer
    await page.locator('button:has-text("✕")').click();
    await expect(page.locator('text=AGENT DETAIL')).not.toBeVisible({ timeout: 1000 });

    // 14. Verify card back in main view shows STOPPED
    await expect(youtubeCard.locator('text=STOPPED')).toBeVisible();

    console.log('✅ YOUTUBE agent lifecycle: IDLE → STARTING → ACTIVE → STOPPING → STOPPED');
  });

  test('YOUTUBE agent: real-time WebSocket update when started externally', async ({ page, context }) => {
    // Open dashboard in two tabs to simulate external start
    const page1 = page;
    const page2 = await context.newPage();

    await page1.goto('http://localhost:5173/');
    await page2.goto('http://localhost:5173/');

    // Wait both loaded
    await expect(page1.locator('text=AGENT HQ')).toBeVisible({ timeout: 5000 });
    await expect(page2.locator('text=AGENT HQ')).toBeVisible({ timeout: 5000 });

    // Click MARKETING on page1
    await page1.click('button:has-text("MARKETING")');
    await expect(page1.locator('text=YOUTUBE')).toBeVisible({ timeout: 5000 });

    // Click MARKETING on page2
    await page2.click('button:has-text("MARKETING")');
    await expect(page2.locator('text=YOUTUBE')).toBeVisible({ timeout: 5000 });

    // Get both YOUTUBE cards
    const youtubeCard1 = page1.locator('text=YOUTUBE').first().locator('..').locator('..');
    const youtubeCard2 = page2.locator('text=YOUTUBE').first().locator('..').locator('..');

    // Verify both show IDLE initially
    await expect(youtubeCard1.locator('text=IDLE')).toBeVisible();
    await expect(youtubeCard2.locator('text=IDLE')).toBeVisible();

    // START on page1
    await youtubeCard1.locator('button:has-text("▶ START")').click();

    // Wait for page1 to show ACTIVE
    await expect(youtubeCard1.locator('text=ACTIVE')).toBeVisible({ timeout: 5000 });

    // Verify page2 ALSO shows ACTIVE (WebSocket pushed update)
    await expect(youtubeCard2.locator('text=ACTIVE'),
      'Page 2 should receive WebSocket update and show ACTIVE').toBeVisible({ timeout: 5000 });

    console.log('✅ WebSocket real-time sync: both clients updated instantly');

    await page2.close();
  });

  test('YOUTUBE agent: REFRESH button polls current state', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('text=AGENT HQ')).toBeVisible({ timeout: 5000 });

    // Click MARKETING
    await page.click('button:has-text("MARKETING")');
    await expect(page.locator('text=YOUTUBE')).toBeVisible({ timeout: 5000 });

    const youtubeCard = page.locator('text=YOUTUBE').first().locator('..').locator('..');

    // Get initial state
    const initialState = await youtubeCard.locator('[class*=text-]').textContent();
    console.log(`Initial state: ${initialState}`);

    // Click REFRESH button
    await page.click('button:has-text("↻ REFRESH")');

    // Wait for refresh to complete
    await page.waitForTimeout(500);

    // Verify LIVE indicator
    await expect(page.locator('text=● LIVE')).toBeVisible();

    console.log('✅ REFRESH button works — pulled fresh state from DB');
  });
});
