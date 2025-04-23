pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  environment {
    SLACK_BOT_TOKEN = credentials('SLACK_BOT_TOKEN')
  }

  triggers {
    cron('H */3 * * *') // 매 3시간마다 실행
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

            def escapedContent = content.replaceAll('"', '\\\\"').replaceAll('\n', '\\\\n')
            def payload = """{
              "channel": "#여행",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "✈️ 도쿄 항공권 최저가 알림",
                    "emoji": true
                  }
                },
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "${escapedContent}"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "plain_text",
                      "text": "Jenkins 자동화 알림입니다."
                    }
                  ]
                }
              ]
            }"""

            slackSend(tokenCredentialId: 'SLACK_BOT_TOKEN', payload: payload)
          } else {
            echo "📭 summaryFile(${summaryFile}) 파일이 존재하지 않아 Slack 메시지를 생략합니다."
          }
        }
      }
    }
  }
}
