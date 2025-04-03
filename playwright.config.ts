import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 150_000, // 전체 테스트 타임아웃 (2분 30초)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ HTML 리포트 설정 (리포트 자동 열지 않음)
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    headless: true,                     // CI 환경용
    screenshot: 'on',                   // 모든 테스트 결과 스크린샷 저장
    video: 'on',                        // 모든 테스트 결과 비디오 저장
    launchOptions: {
      slowMo: 1000                      // 느리게 실행 (디버깅 용이)
    },
    trace: 'retain-on-failure'         // 실패 시 trace 유지
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






