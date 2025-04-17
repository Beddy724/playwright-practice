pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  environment {
    SLACK_BOT_TOKEN = credentials('omSFZ2vIYKgF9T1fkfJERSwQ')  // Slack 토큰 Jenkins credentials 등록
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

            // ✅ 슬랙 메시지 포맷 (코드 블럭 + 링크 포함)
            def message = """
            ✈️ *도쿄 항공권 최저가 알림!*

            \`\`\`
            ${content}
            \`\`\`

           🔗 <https://beddy724.github.io/playwright-practice/> (HTML 리포트 보러가기)
           """.stripIndent()

            sh """
              curl -X POST https://slack.com/api/chat.postMessage \\
                -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \\
                -H "Content-Type: application/json" \\
                -d '{
                  "channel": "#여행",
                  "text": "${message.replaceAll('"', '\\"').replaceAll("\\n", "\\\\n")}"
                }'
            """
          } else {
            echo "❗ 최저가 파일이 존재하지 않음: ${summaryFile}"
          }
        }
      }
    }



 