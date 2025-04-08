import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150_000, // 전체 테스트 타임아웃 (2분 30초)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report'}]
  ],

  // ✅ 여기에는 outputDir 빼야 오류 안 남
  use: {
    headless: true,
    screenshot: 'on',  // always 저장
    video: 'on',       // always 저장
    launchOptions: {
      slowMo: 1000,   // 느리게 실행 (디버깅 용이)
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







