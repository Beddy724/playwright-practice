import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 }, // 💡 기본 viewport도 설정
    actionTimeout: 0,
    screenshot: 'on', // 성공/실패 모두 스크린샷 저장
    video: 'on', // 모든 테스트에 대해 비디오 저장
  },
  projects: [
    {
      name: 'Chromium (Chrome)',
      use: {
        channel: 'chrome',
        headless: true,
        viewport: { width: 1920, height: 1080 }, 
        video: 'on',
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
        headless: true,
        viewport: { width: 1920, height: 1080 }, 
        video:'on'
      },
    },
  ],
});
