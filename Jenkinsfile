pipeline {
  agent any

  triggers {
    cron('H H/3 * * *')  // 매 3시간마다 실행
  }

  environment {
    SLACK_TOKEN = credentials('slack-bot-token')
  }

  stages {
    stage('Playwright Test') {
      steps {
        sh 'npx playwright test'
      }
    }

    stage('Slack 알림') {
      when {
        always()
      }
      steps {
        script {
          def flightInfo = '❓ 최저가 항공권 정보를 찾을 수 없습니다.'
          def file = 'test-results/lowest-flight.txt'
          if (fileExists(file)) {
            flightInfo = readFile(file).trim()
          }

          slackSend(
            tokenCredentialId: 'slack-bot-token',
            channel: '#여행',
            message: ":white_check_mark: *도쿄 항공권 자동화 완료*\n\n${flightInfo}\n\n:arrow_right: <https://beddy724.github.io/playwright-practice/|Report 보러가기>"
          )
        }
      }
    }
  }
}



 