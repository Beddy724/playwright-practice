import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  use: {
    headless: true, // true로 설정해야 GitHub Actions에서 실행 가능 (깃헙 액션스는 GUI가 없는 서버 환경이기 때문)
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    screenshot: 'only-on-failure', // ✅ 실패 시 스크린샷 저장
    video: 'on', // ✅ 모든 테스트 비디오 저장
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

