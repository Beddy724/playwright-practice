import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: false, // 실제 브라우저 창을 띄우고 실행
    viewport: { width: 1280, height: 720 },
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
        viewport: { width: 1280, height: 720 },
        headless: false,
      },
    },
  ],
});

