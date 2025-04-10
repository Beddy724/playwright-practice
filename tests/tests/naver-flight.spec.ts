import { test, expect } from '@playwright/test';

test('네이버 도쿄 항공권 검색', async ({ page }) => {
  await page.goto('https://flight.naver.com/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const closeButton = page.getByRole('button', { name: '닫기' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  const departAirportBtn = page.getByRole('button', { name: 'ICN 인천' });
  await expect(departAirportBtn).toBeVisible({ timeout: 10000 });
  await departAirportBtn.click();
  await page.getByRole('button', { name: '인천', exact: true }).click();

  await page.getByRole('button', { name: '도착 선택' }).click();
  await page.getByRole('textbox', { name: '국가, 도시, 공항명 검색' }).fill('도쿄');
  await page.locator('a').filter({ hasText: '나리타국제공항 NRT' }).click();

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

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

  let departDate = new Date(baseDate);
  let returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + 2);

  await page.getByRole('button', { name: '가는 날' }).click();
  await page.waitForTimeout(1000);

  let tryCount = 0;

  while (tryCount < 3) {
    const departStr = formatDate(departDate);
    const returnStr = formatDate(returnDate);
    const departDay = departDate.getDate();
    const returnDay = returnDate.getDate();
    const departMonthLabel = departStr.slice(0, 8);
    const returnMonthLabel = returnStr.slice(0, 8);

    console.log(`🔍 시도 ${tryCount + 1}: ${departStr} ~ ${returnStr}`);

    let visibleMonths = await page.locator('.sc-dAlyuH').allTextContents();
    visibleMonths = visibleMonths.map((text) => text.trim());

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

    const departHeader = page.locator(`.sc-dAlyuH:has-text("${departMonthLabel}")`).first();
    const calendarWrapper = departHeader.locator('xpath=..');
    const calendarTable = calendarWrapper.locator('table');

    const departLocator = calendarTable.locator(`button:has(b:has-text("${departDay}"))`).first();
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
    const returnLocator = returnTable.locator(`button:has(b:has-text("${returnDay}"))`).first();

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

  const searchButton = page.getByRole('button', { name: '항공권 검색' });
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  const popularList = page.locator('div[class*="international_popular_flight_list"]');
  const popularTitle = page.getByRole('heading', { name: '인기 항공편' });

  try {
    await page.waitForSelector('div[class*="international_popular_flight_list"]', { timeout: 1200000 });
    await expect(popularList.first()).toBeVisible({ timeout: 1200000 });
    await expect(popularTitle).toBeVisible({ timeout: 1200000 });
    console.log('✅ 인기 항공편 섹션과 리스트가 모두 확인됨');
  } catch (err) {
    console.log('⚠️ ❌ 인기 항공편이 시간 내에 표시되지 않음');
    throw err;
  }

  await expect(page.getByRole('button', { name: '왕복 동시 선택' })).toBeVisible({ timeout: 100000 });
});

