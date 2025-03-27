import { test, expect } from '@playwright/test';

test('네이버 항공권 검색', async ({ page }) => {
  await page.goto('https://flight.naver.com/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 팝업 닫기 (있을 경우에만)
  const closeButton = page.getByRole('button', { name: '닫기' });
  if (await closeButton.isVisible())  {
    await closeButton.click();
  }

  // 출발지 선택
  await page.getByRole('button', { name: 'ICN 인천' }).click();
  await page.getByRole('button', { name: '인천', exact: true }).click();


  // 도착지 선택 
  await page.getByRole('button', { name: '도착 선택'}).click();
  await page.getByRole('textbox', { name: '국가, 도시, 공항명 검색'}).fill('도쿄'); 
  await page.locator('a').filter({ hasText: '나리타국제공항 NRT'}).click();


  // 날짜 선택 (오늘 날짜 기준으로 7일 뒤 선택)
  await page.getByRole('button', { name: '가는 날' }).click();

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const y = nextWeek.getFullYear();
  const m = nextWeek.getMonth() + 1;
  const d = nextWeek.getDate();
  const formattedDate = `${y}년 ${m}월 ${d}일`;
  
  await page.getByLabel(formattedDate).click();

  // 항공권 검색 버튼 클릭
  const searchButton = page.getByRole('button', { name: '항공권 검색' });
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  // 검색 결과가 나타나는지 확인 (예: 결과 텍스트 또는 요소 존재 여부 확인)
  await expect(page.locator('div.result')).toBeVisible();
});
