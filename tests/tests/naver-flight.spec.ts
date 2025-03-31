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

  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  // 기준 날짜: 오늘 이후의 첫 금요일 ~ 일요일
  const today = new Date();
  const baseDate = new Date(today);
  today.setHours(0, 0, 0, 0);
  while (baseDate.getDay() !== 5 || baseDate <= today) {
    baseDate.setDate(baseDate.getDate() + 1);
  }

  let departDate = new Date(baseDate);
  let returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + 2);

  // 달력 열기
  await page.getByRole('button', { name: '가는 날' }).click();
  await page.waitForTimeout(1000);

  let tryCount = 0;

  while (tryCount < 3) {
    const departStr = formatDate(departDate);
    const returnStr = formatDate(returnDate);
    const departDay = departDate.getDate();
    const returnDay = returnDate.getDate();
    const departMonthLabel = departStr.slice(0, 8); // ex: '2025.04.'

    // 달력이 보이는지 체크
    let visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
    visibleMonths = visibleMonths.map((text) => text.trim());

    // 원하는 달이 보일 때까지 '다음 달' 클릭
    while (!visibleMonths.includes(departMonthLabel)) {
      const nextBtn = page.locator('.awesome-calendar table thead tr th').filter({
        has: page.locator('svg'),
      }).last();
      await nextBtn.scrollIntoViewIfNeeded();
      await nextBtn.click();
      await page.waitForTimeout(500);

      visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
      visibleMonths = visibleMonths.map((text) => text.trim());
    }

    // 원하는 월 달력 찾기
    const monthHeader = page.locator(`.sc-dAlyuH:has-text("${departMonthLabel}")`).first();
    const calendarWrapper = monthHeader.locator('xpath=..'); // 상위 div
    const calendarTable = calendarWrapper.locator('table');

    // 해당 달 안에서 원하는 날짜 선택
    const departLocator = calendarTable.locator(`td:has-text("${departDay}")`).first();
    const returnLocator = calendarTable.locator(`td:has-text("${returnDay}")`).first();

    const departVisible = await departLocator.isVisible();
    const returnVisible = await returnLocator.isVisible();

    if (departVisible && returnVisible) {
      await departLocator.scrollIntoViewIfNeeded();
      await departLocator.click();
      await page.waitForTimeout(300);
      await returnLocator.scrollIntoViewIfNeeded();
      await returnLocator.click();
      console.log(`✅ 선택된 날짜: ${departStr} ~ ${returnStr}`);
      break;
    }

    console.log(`❌ ${departStr} 또는 ${returnStr} 선택 불가 → 다음 주로 이동`);

    // 다음 주 날짜로 변경
    departDate.setDate(departDate.getDate() + 7);
    returnDate.setDate(returnDate.getDate() + 7);
    tryCount++;
  }

  if (tryCount >= 3) {
    throw new Error('❌ 3주 동안 선택 가능한 금요일/일요일 조합을 찾지 못했습니다.');
  }

  // 항공권 검색
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
