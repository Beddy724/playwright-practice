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

  // ✅ 날짜 계산: 다음 가능한 금요일 ~ 그 일요일
  const today = new Date();
  const baseDate = new Date(today);
  today.setHours(0, 0, 0, 0);

  if (today.getDay() === 6 || today.getDay() === 0) {
    const daysUntilNextFriday = (12 - today.getDay()) % 7;
    baseDate.setDate(baseDate.getDate() + daysUntilNextFriday);
  } else {
    while (baseDate.getDay() !== 5 || baseDate <= today) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
  }

  let departDate = new Date(baseDate); // 금요일
  let returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + 2); // 일요일

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
    const returnMonthLabel = returnStr.slice(0, 8);

    console.log(`🔍 시도 ${tryCount + 1}: ${departStr} ~ ${returnStr}`);

    // 현재 보이는 달 체크
    let visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
    visibleMonths = visibleMonths.map((text) => text.trim());

    // 원하는 달이 보일 때까지 '다음 달' 버튼 클릭
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

    // 해당 달에서 가는 날 선택
    const departHeader = page.locator(`.sc-dAlyuH:has-text("${departMonthLabel}")`).first();
    const calendarWrapper = departHeader.locator('xpath=..');
    const calendarTable = calendarWrapper.locator('table');
    const departLocator = calendarTable.locator(`.sc-jlZhew:has-text("${departDay}")`).first();

    await departLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    if (!(await departLocator.isVisible())) {
      console.log(`❌ ${departStr} 보이지 않음 (가는 날)`);
      departDate.setDate(departDate.getDate() + 7);
      returnDate.setDate(returnDate.getDate() + 7);
      tryCount++;
      continue;
    }

    await departLocator.click();
    await expect(page.getByText('오는 날 선택')).toBeVisible({ timeout: 3000 });

    // 오는 날 달력 스크롤
    visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
    visibleMonths = visibleMonths.map((text) => text.trim());

    while (!visibleMonths.includes(returnMonthLabel)) {
      const nextBtn = page.locator('.awesome-calendar table thead tr th').filter({
        has: page.locator('svg'),
      }).last();
      await nextBtn.scrollIntoViewIfNeeded();
      await nextBtn.click();
      await page.waitForTimeout(500);

      visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
      visibleMonths = visibleMonths.map((text) => text.trim());
    }

    const returnHeader = page.locator(`.sc-dAlyuH:has-text("${returnMonthLabel}")`).first();
    const returnTable = returnHeader.locator('xpath=../..').locator('table');
    const returnLocator = returnTable.locator(`.sc-jlZhew:has-text("${returnDay}")`).first();

    await returnLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    if (!(await returnLocator.isVisible())) {
      console.log(`❌ ${returnStr} 보이지 않음 (오는 날)`);
      departDate.setDate(departDate.getDate() + 7);
      returnDate.setDate(returnDate.getDate() + 7);
      tryCount++;
      continue;
    }

    await returnLocator.click();

    console.log(`✅ 선택된 날짜: ${departStr} ~ ${returnStr}`);
    break;
  }

  if (tryCount >= 3) {
    throw new Error('❌ 3주 동안 선택 가능한 금요일/일요일 조합을 찾지 못했습니다.');
  }

  // 항공권 검색 클릭
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
