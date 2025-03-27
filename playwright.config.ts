import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true, // true로 설정해야 GitHub Actions에서 실행 가능 (깃헙 액션스는 GUI가 없는 서버 환경이기 떄문)
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
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
        headless: true, // Edge도 수정
      },
    },
  ],
});

