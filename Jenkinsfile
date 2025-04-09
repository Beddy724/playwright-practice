pipeline {
  agent any

  tools {
    nodejs "NodeJS"  // Jenkins에 등록된 NodeJS 이름과 일치시켜야 함
  }

  stages {
    stage('Checkout') {
      steps {
        git credentialsId: 'jadelight9724', url: 'https://github.com/Beddy724/playwright-practice.git'
      }
    }

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
  }
}
