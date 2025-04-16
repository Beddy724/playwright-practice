import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }], // Jenkins에서도 HTML 리포트 확인 가능
    ['json', { outputFile: 'test-results/results.json' }] // InfluxDB로 전송할 테스트 결과 파일 생성 (필수)
  ],

  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    launchOptions: {
      slowMo: 1000,
    }
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 5000 },
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 5000 },
      },
    }
  ],
});








