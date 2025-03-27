import { test, expect } from '@playwright/test';

test('네이버 항공권 검색', async ({ page }) => {
  await page.goto('https://flight.naver.com/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 팝업 닫기 (있을 경우에만)
  const closeButton = page.getByRole('button', { name: '닫기' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  // 출발지 선택
  await page.getByRole('button', { name: 'ICN 인천' }).click();
  await page.getByRole('button', { name: '인천', exact: true }).click();

  // 도착지 선택 
  await page.getByRole('button', { name: '도착 선택' }).click();
  await page.getByRole('textbox', { name: '국가, 도시, 공항명 검색' }).fill('도쿄');
  await page.locator('a').filter({ hasText: '나리타국제공항 NRT' }).click();

  // 오늘 기준으로 "무조건 미래 금요일~일요일" 계산
  const today = new Date();
  const baseDate = new Date(today);

  // 다음 금요일 구하기 (오늘이 금요일 이후라도 무조건 다음 주 금요일)
  while (baseDate.getDay() !== 5 || baseDate <= today) {
    baseDate.setDate(baseDate.getDate() + 1);
  }

  const departDate = new Date(baseDate); // 금요일
  const returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + 2); // 일요일

  const departDay = departDate.getDate();
  const returnDay = returnDate.getDate();

  // 가는 날 달력 열기
  await page.getByRole('button', { name: '가는 날' }).click();
  await page.waitForTimeout(1000);

  // 금요일 클릭 (가는 날)
  await page.locator('.sc-jlZhew', { hasText: `${departDay}` }).first().click();
  await page.waitForTimeout(500);

  // 일요일 클릭 (오는 날)
  await page.locator('.sc-jlZhew', { hasText: `${returnDay}` }).first().click();

  // 항공권 검색 버튼 클릭
  const searchButton = page.getByRole('button', { name: '항공권 검색' });
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  // 인기 항공편 리스트: 15초 동안 기다리며 나타나는지 확인
  const popular = page.locator('div[class*="popular_flight_list"]');

  try {
    await expect(popular.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ 인기 항공편 리스트 확인됨');
  } catch {
    console.log('⚠️ 인기 항공편 리스트 없음 (15초 안에 로딩되지 않음)');
  }

  // 결과가 로딩되었는지: "왕복 동시 선택" 버튼이 보이면 성공
  await expect(page.getByRole('button', { name: '왕복 동시 선택' })).toBeVisible({ timeout: 100000 });
});
