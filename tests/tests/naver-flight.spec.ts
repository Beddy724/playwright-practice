import { test, expect } from '@playwright/test';

test('네이버 항공권 검색', async ({ page }) => {
  // 네이버 항공권 페이지 접속
  await page.goto('https://flight.naver.com/');

  // 출발지 선택
  await page.getByText('출발지를 선택해 주세요').click();
  await page.getByText('김포').click(); // 김포공항 선택

  // 도착지 선택
  await page.getByText('도착지를 선택해 주세요').click();
  await page.getByText('제주').click(); // 제주 선택

  // 날짜 선택 (오늘 날짜 기준으로 7일 뒤 선택)
  await page.locator('div[data-testid="searchInput__depart"]').click();
  await page.locator('button[aria-label*="7일 후"]').first().click();

  // 항공권 검색 버튼 클릭
  await page.getByRole('button', { name: '항공권 검색' }).click();

  // 검색 결과가 나타나는지 확인 (예: 결과 텍스트 또는 요소 존재 여부 확인)
  await expect(page.locator('div.result')).toBeVisible();
});
