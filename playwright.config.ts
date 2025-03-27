import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 }, // 고정 해상도
    actionTimeout: 0,
    screenshot: 'on', //  성공/실패 모두 저장
    video: 'on',      //  항상 비디오 저장
  },
  projects: [
    {
      name: 'Chromium (Chrome)',
      use: {
        channel: 'chrome',
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
      },
    },
  ],
});

