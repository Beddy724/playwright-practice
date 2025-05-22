pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  environment {
    SLACK_BOT_TOKEN = credentials('SLACK_BOT_TOKEN')
    CHANNEL = '#여행'
    INFLUX_URL = 'http://influxdb:8086'
  }

  triggers {
    cron('H/3 * * * *') // 매 3분마다 실행
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run Playwright tests') {
      steps {
        sh 'npx playwright install'
        sh 'npx playwright test'
      }
    }

    stage('Slack 알림 전송 (GitHub 스타일)') {
      steps {
        script {
          def status = currentBuild.currentResult
          def emoji = '✅'
          def text = 'PASS'

          if (status != 'SUCCESS') {
            emoji = '❌'
            text = 'FAIL'
          }

          def flightInfo = '❓ 최저가 항공권 정보를 찾을 수 없습니다.'
          def summaryFile = 'test-results/lowest-flight.txt'
          if (fileExists(summaryFile)) {
            flightInfo = readFile(summaryFile).trim()
          }

          def payload = """{
            "channel": "${env.CHANNEL}",
            "text": "${emoji} ${text}\\n\\n${flightInfo}\\n\\n👉 <https://beddy724.github.io/playwright-practice/|Report 보러가기>"
          }"""

          sh """
            curl -X POST https://slack.com/api/chat.postMessage \\
              -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \\
              -H "Content-Type: application/json" \\
              -d '${payload}'
          """
        }
      }
    }
  }
}
