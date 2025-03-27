import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true, // true로 설정해야 깃헙 액션스에서 실행 가능
    viewport: { width: 1500, height: 1200 },
    actionTimeout: 0,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Chromium (Chrome)',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge', // 엣지 브라우저
        viewport: { width: 1500, height: 1200 },
        headless: false,
      },
    },
  ],
});

