import { test, expect } from '@playwright/test';

test('네이버 항공권 검색', async ({ page }) => {
  await page.goto('https://flight.naver.com/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // 팝업 닫기
  const closeButton = page.getByRole('button', { name: '닫기' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  // 출발지 선택
  const departAirportBtn = page.getByRole('button', { name: 'ICN 인천' });
  await expect(departAirportBtn).toBeVisible({ timeout: 10000 });
  await departAirportBtn.click();
  await page.getByRole('button', { name: '인천', exact: true }).click();

  // 도착지 선택
  await page.getByRole('button', { name: '도착 선택' }).click();
  await page.getByRole('textbox', { name: '국가, 도시, 공항명 검색' }).fill('도쿄');
  await page.locator('a').filter({ hasText: '나리타국제공항 NRT' }).click();

  // 금요일~일요일 계산
  const today = new Date();
  const baseDate = new Date(today);
  today.setHours(0, 0, 0, 0);

  while (baseDate.getDay() !== 5 || baseDate <= today) {
    baseDate.setDate(baseDate.getDate() + 1);
  }

  const departDate = new Date(baseDate);
  const returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + 2);

  // 달력 열기
  await page.getByRole('button', { name: '가는 날' }).click();
  await page.waitForTimeout(1000);

  // 날짜 선택 반복 시도 (최대 3주)
  let tryCount = 0;
  let departDateToTry = new Date(departDate);
  let returnDateToTry = new Date(returnDate);

  while (tryCount < 3) {
    const departDay = departDateToTry.getDate();
    const returnDay = returnDateToTry.getDate();

    let departLocator = page.locator('.sc-jlZhew', { hasText: `${departDay}` }).first();
    let returnLocator = page.locator('.sc-jlZhew', { hasText: `${returnDay}` }).first();

    const departEnabled = await departLocator.isEnabled();
    const returnEnabled = await returnLocator.isEnabled();

    if (departEnabled && returnEnabled) {
      await departLocator.click();
      await page.waitForTimeout(300);
      await returnLocator.click();
      console.log(`✅ 선택된 날짜: ${departDateToTry.toDateString()} ~ ${returnDateToTry.toDateString()}`);
      break;
    }

    console.log(`❌ ${departDay}일 또는 ${returnDay}일 선택 불가 → 다음 달로 이동`);

    const nextMonthSelector = 'button[aria-label="다음 달"]';

    try {
      await page.waitForSelector(nextMonthSelector, { timeout: 10000 });
      const nextMonthButton = page.locator(nextMonthSelector);
      await nextMonthButton.scrollIntoViewIfNeeded(); // 💡 뷰포트로 스크롤
      await nextMonthButton.click();
      await page.waitForTimeout(500);
    } catch {
      throw new Error('❌ "다음 달" 버튼이 보이지 않아 날짜 선택 불가');
    }

    departDateToTry.setDate(departDateToTry.getDate() + 7);
    returnDateToTry.setDate(returnDateToTry.getDate() + 7);
    tryCount++;
  }

  if (tryCount >= 3) {
    throw new Error('❌ 3주 동안 선택 가능한 금요일/일요일 조합을 찾지 못했습니다.');
  }

  // 항공권 검색 버튼 클릭
  const searchButton = page.getByRole('button', { name: '항공권 검색' });
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  // 인기 항공편 확인
  const popularList = page.locator('div[class*="popular_flight_list"]');
  const popularTitle = page.getByRole('heading', { name: '인기 항공편' });

  try {
    await expect(popularList.first()).toBeVisible({ timeout: 60000 });
    await expect(popularTitle).toBeVisible({ timeout: 60000 });
    console.log('✅ 인기 항공편 섹션과 리스트가 모두 확인됨');
  } catch (err) {
    console.log('⚠️ ❌ 인기 항공편이 1분 안에 리스트가 보이지 않았음');
    throw err;
  }

  // 왕복 동시 선택 버튼 확인
  await expect(page.getByRole('button', { name: '왕복 동시 선택' })).toBeVisible({ timeout: 100000 });
});
