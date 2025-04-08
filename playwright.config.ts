import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150_000, // 전체 테스트 타임아웃 (2분 30초)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ Slack 알림용 reporter 추가됨!
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/json-report.json' }],
    ['json-summary', { outputFile: 'playwright-report/json-summary.json' }]
  ],

  use: {
    headless: true,
    screenshot: 'on',  // 항상 저장
    video: 'on',       // 항상 저장
    launchOptions: {
      slowMo: 1000,
    }
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1300 },
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1300 },
      },
    }
  ],
});








