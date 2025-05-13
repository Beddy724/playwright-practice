import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import axios from 'axios';
import { ElementHandle } from '@playwright/test';

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
    await calendarWrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const calendarTable = calendarWrapper.locator('table');
    const departLocator = calendarTable.locator(`button:has(b:has-text("${departDay}"))`).first();

    if (!(await departLocator.isVisible())) {
      console.log(`❌ ${departStr} 보이지 않음 (가는 날)`);
      departDate.setDate(departDate.getDate() + 7);
      returnDate.setDate(returnDate.getDate() + 7);
      tryCount++;
      continue;
    }

    await departLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
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
    const returnWrapper = returnHeader.locator('xpath=..');
    await returnWrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const returnTable = returnWrapper.locator('table');
    const returnLocator = returnTable.locator(`button:has(b:has-text("${returnDay}"))`).first();

    if (!(await returnLocator.isVisible())) {
      console.log(`❌ ${returnStr} 보이지 않음 (오는 날)`);
      departDate.setDate(departDate.getDate() + 7);
      returnDate.setDate(returnDate.getDate() + 7);
      tryCount++;
      continue;
    }

    await returnLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
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

  const filteredCards = await page.locator('i.item_num__aKbk4').all();

  type CardInfo = {
    airline: string;
    price: number;
    goTime: string;
    goArrive: string;
    backTime: string;
    backArrive: string;
  };

  const tempList: CardInfo[] = [];

  for (const priceEl of filteredCards) {
    const rawPrice = await priceEl.innerText();
    const price = parseInt(rawPrice.replace(/[^\d]/g, ''), 10);

    if (price >= 100000 && price <= 400000) {
      const cardRoot = await priceEl.evaluateHandle(el =>
        el.closest('div[class*="concurrent_ConcurrentItemContainer"]')
      );

      const airlineEl = await cardRoot.asElement()?.$('b.airline_name__0Tw5w');
      const airportSpans = await cardRoot.asElement()?.$$('span.route_airport__tBD9o');

      if (airlineEl && airportSpans && airportSpans.length >= 4) {
        const airline = (await airlineEl.innerText()).trim();

        const getTimeByCode = async (code: string, spans: ElementHandle<Element>[]) => {
          for (const span of spans) {
            const codeEl = await span.$('i.route_code__S07WE');
            const timeEl = await span.$('b.route_time__xWu7a');
            if (codeEl && timeEl) {
              const codeText = await codeEl.innerText();
              if (codeText === code) {
                return await timeEl.innerText();
              }
            }
          }
          return '';
        };

        const goTime = await getTimeByCode('ICN', airportSpans);
        const goArrive = await getTimeByCode('NRT', airportSpans);
        const backTime = await getTimeByCode('NRT', airportSpans.slice(2));
        const backArrive = await getTimeByCode('ICN', airportSpans.slice(2));

        const toMinutes = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };

        if (toMinutes(goTime) < 540 && toMinutes(backTime) < 840) {
          tempList.push({ airline, price, goTime, goArrive, backTime, backArrive });
        }
      }
    }
  }

  const filteredList = Array.from(
    new Map(tempList.map(item => [`${item.airline}_${item.price}_${item.goTime}_${item.backTime}`, item])).values()
  ).slice(0, 10);
  
  let influxPrice = 0;
  let influxAirline = 'none';

  if (filteredList.length > 0) {
    const rowsText = filteredList
    .map((item, idx) =>
        `${idx + 1}. ${item.airline} - ${item.price.toLocaleString()}원\n   🛫 ${item.goTime} (인천 출발) / ${item.goArrive} (나리타 도착)\n   🛬 ${item.backTime} (나리타 출발) / ${item.backArrive} (인천 도착)`
      )
      .join('\n');

    test.info().annotations.push({
      type: '📦 1인 도쿄 왕복 항공권 (10~40만원 + 시간)',
      description: `총 ${filteredList.length}건 검색되었습니다. (조건: 오전 9시 이전 인천 출발 / 오후 2시 이전 나리타 출발)\n\n${rowsText}`
    });

    // ✅ 슬랙 알림용 최저가 추출
    const lowest = filteredList.reduce((min, item) => (item.price < min.price ? item : min), filteredList[0]);
    influxPrice = lowest.price;
    influxAirline = lowest.airline;

    const slackText =
     `✈️ *최저가 도쿄 항공권 안내!*\n\n` +
     `*항공사:* ${lowest.airline}\n` +
     `*가격:* ${lowest.price.toLocaleString()}원\n` +
     `*인천 출발:* ${lowest.goTime} / *나리타 도착:* ${lowest.goArrive}\n` +
     `*나리타 출발:* ${lowest.backTime} / *인천 도착:* ${lowest.backArrive}`;

    // ✅ 파일로 저장
     if (!existsSync('test-results')) {
      mkdirSync('test-results', { recursive: true });
    }
  
    writeFileSync('test-results/lowest-flight.txt', slackText);

          
    } else {
    test.info().annotations.push({
      type: '📦 1인 도쿄 왕복 항공권 (20~40만원 + 시간)',
      description: '❌ 조건에 맞는 항공권을 찾을 수 없습니다.'
     });
    }
  
    // ✅ 조건에 관계없이 항상 Influx 전송
    console.log('📡 Influx 전송 준비:', influxAirline, influxPrice);
    try {
    const influxData = `flight_price,direction=roundtrip,airline=${influxAirline},week=1 price=${influxPrice}`;
    await axios.post(
    'http://host.docker.internal:8086/write?db=qa_results',
    influxData,
    { headers: { 'Content-Type': 'application/octet-stream' } }
  );
  } catch (err) {
    console.error('⚠️ Influx 전송 실패:', err.message);
} 
});