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
    ['html', { outputFolder: 'playwright-report' }]
  ],

  // ✅ 테스트 결과 파일 저장 경로
  outputDir: 'test-results',

  use: {
    headless: !!process.env.CI,
    screenshot: 'on',           // 성공/실패 상관없이 스크린샷 저장
    video: 'on',                // 성공/실패 상관없이 비디오 저장
    launchOptions: {
      slowMo: 1000,             // 느리게 보기
    }
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        viewport: { width: 1920, height: 1300 }
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        screenshot: 'on',
        viewport: { width: 1920, height: 1300 }
      },
    }
  ],
});
