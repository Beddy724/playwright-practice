import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true, // GitHub Actions 실행용
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 0,

    // ✅ 성공/실패 모두 스크린샷 저장
    screenshot: 'on',
  },
  projects: [
    {
      name: 'Chromium (Chrome)',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
        headless: true,
      },
    },
  ],
});
