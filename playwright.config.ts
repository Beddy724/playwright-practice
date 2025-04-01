import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // html 결과 보여주기
  reporter: [
    ['html', { outputFolder: 'playwright-report' }]
  ],

  use: {
    baseURL: 'https://flight.naver.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
    slowMo: 1000,
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: true,
        viewport: { width: 1920, height: 2000 }
      },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
        headless: true,
        viewport: { width: 1920, height: 2000 }
      },
    }
  ],
});
