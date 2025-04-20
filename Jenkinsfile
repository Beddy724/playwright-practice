pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  environment {
    SLACK_BOT_TOKEN = credentials('slack-bot-token')
  }

  triggers {
    cron('H H/3 * * *')  // 매 3시간마다 실행
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

    stage('Slack 알림') {
    steps {
    script {
      def slackFile = 'test-results/slack-message.txt'
      def message = ''

      if (fileExists(slackFile)) {
        message = readFile(slackFile).trim()
      } else {
        message = '❓ Playwright 테스트에서 슬랙 메시지가 생성되지 않았습니다.'
      }

      def escaped = message.replaceAll('"', '\\\\"').replaceAll('\n', '\\\\n')

      def payload = """{
        "channel": "#여행",
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "✈️ 도쿄 항공권 자동 검색 결과",
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "${escaped}"
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
      }"""

      writeFile file: 'slack.json', text: payload
      sh 'curl -X POST -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" -H "Content-Type: application/json" --data @slack.json https://slack.com/api/chat.postMessage'
    }
  }
}






 