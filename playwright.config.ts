import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true,
    viewport: { width: 1920, height: 2000 }, // 💡 전역 기본값
    actionTimeout: 0,
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'Chromium (Chrome)',
      use: {
        channel: 'chrome',
        headless: true,
        viewport: { width: 1920, height: 2000 }, // 💡 명시적으로 지정
        screenshot: 'on',
        video: 'on',
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
        headless: true,
        viewport: { width: 1920, height: 2000 }, // 💡 명시적으로 지정
        screenshot: 'on',
        video: 'on',
      },
    },
  ],
});


