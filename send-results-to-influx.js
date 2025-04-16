const fs = require('fs');
const axios = require('axios');

const INFLUX_URL = 'http://localhost:8086';
const DB_NAME = 'qa_results';

const data = JSON.parse(fs.readFileSync('test-results/results.json', 'utf-8'));
console.log('✅ JSON 파일 로딩됨:', data);

let lines = [];

function escapeString(str) {
  return str.replace(/ /g, '\\ ').replace(/,/g, '\\,').replace(/=/g, '\\=');
}

data.suites.forEach((suite) => {
  suite.specs.forEach((spec) => {
    const testName = spec.title;
    const isPassed = spec.ok ? 1 : 0;
    const isFailed = spec.ok ? 0 : 1;
    const price = Math.floor(Math.random() * 200000 + 50000); // 💸 임의의 금액 생성
    const timestamp = Date.now() * 1000000; // ns

    lines.push(
      `test_result,test_name=${escapeString(testName)} passed=${isPassed},failed=${isFailed},price=${price} ${timestamp}`
    );
  });
});

const body = lines.join('\n');

axios
  .post(`${INFLUX_URL}/write?db=${DB_NAME}`, body)
  .then(() => console.log('✅ InfluxDB 전송 성공!'))
  .catch((err) => console.error('❌ InfluxDB 전송 실패:', err.message));

