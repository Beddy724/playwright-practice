pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  environment {
    SLACK_BOT_TOKEN = credentials('omSFZ2vIYKgF9T1fkfJERSwQ')
  }

  triggers {
    cron('H */3 * * *')  // 매 3시간마다 실행
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

    stage('Print lowest price (Slack 알림용)') {
      steps {
        script {
          def summaryFile = 'test-results/lowest-flight.txt'
          if (fileExists(summaryFile)) {
            def content = readFile(summaryFile).trim()
            echo "\n📦 최저가 알림 요약:\n${content}\n"

            // ✅ Slack 메시지 - Block 스타일
            def payload = """
              {
                "channel": "#여행",
                "blocks": [
                  {
                    "type": "header",
                    "text": {
                      "type": "plain_text",
                      "text": "✈️ 도쿄 항공권 최저가 알림!",
                      "emoji": true
                    }
                  },
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": "${content.replaceAll('"', '\\\\"').replaceAll('\n', '\\\\n')}"
                    }
                  },
                  {
                    "type": "context",
                    "elements": [
                      {
                        "type": "mrkdwn",
                        "text": "<https://beddy724.github.io/playwright-practice/|🔗 HTML 리포트 보러가기>"
                      }
                    ]
                  }
                ]
              }
            """.stripIndent()

            // ✅ Slack 메시지 전송
            writeFile file: 'slack-payload.json', text: payload
            sh 'curl -X POST -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" -H "Content-Type: application/json" --data @slack-payload.json https://slack.com/api/chat.postMessage'
          } else {
            echo "❗ 최저가 파일이 존재하지 않음: ${summaryFile}"
          }
        }
      }
    }
  }
}





 