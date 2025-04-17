pipeline {
  agent any

  tools {
    nodejs "NodeJS"
  }

  triggers {
    cron('H */3 * * *')  // 매 3시간마다 실행 (랜덤 offset H)
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run Playwright tests') {
      steps {
        sh 'npx playwright install --with-deps'
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
          } else {
            echo "❗ 최저가 파일이 존재하지 않음: ${summaryFile}"
          }
        }
      }
    }
  }
}




 