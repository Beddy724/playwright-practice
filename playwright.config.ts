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
    headless: false,
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
        screenshot: 'only-on-failure',
        viewport: { width: 1920, height: 2000 }
      },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        screenshot: 'only-on-failure',
        viewport: { width: 1920, height: 2000 }
      },
    }
  ],
});
