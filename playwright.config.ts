import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150000, // 2분 30초
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
    screenshot: 'on',  // 성공,실패 상관없이 스크린샷 저장 (실패한 테스트만 찍고 싶을 경우 "only-on-failure")
    video: 'on',     // 성공,실패 상관없이 비디오 저장 (실패한 테스트만 찍고 싶을 경우 "retain-on-failure")
    launchOptions: {
    slowMo: 1000,
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        viewport: { width: 1920, height: 1500 }
      },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        screenshot: 'on',
        viewport: { width: 1920, height: 1500 }
      },
    }
  ],
});
