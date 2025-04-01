import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150000, // 전체 테스트 타임아웃
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ HTML 리포트 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  // ✅ 결과 저장 디렉토리 (전역 설정)
  outputDir: 'test-results',

  use: {
    headless: !!process.env.CI,
    screenshot: 'on',           // 성공/실패 모두 스크린샷 저장
    video: 'on',                // 성공/실패 모두 비디오 저장
    launchOptions: {
      slowMo: 1000,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1300 }
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1300 }
      },
    }
  ],
});



