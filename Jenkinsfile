pipeline {
  agent any

  environment {
    DOCKERHUB_NAMESPACE = "atharvkote"
    DOCKERHUB_CRED_ID  = "DOCKERHUB_LOGIN"
    SERVICES = "payment-service analytics-service order-service catalog-service messaging-service identity-service"
    BASE_DIR = "micro-services"
    TARGET_BRANCH = "master"
  }

  stages {
    stage('Checkout & Detect Changes') {
      steps {
        checkout scm
        script {
          def shortSha = ""
          def changedFilesRaw = ""
          def target = env.TARGET_BRANCH ?: "master"

          if (isUnix()) {
            sh """
              git fetch origin ${target}:${target} || git fetch origin master:master || true
            """
            shortSha = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
            def base = sh(script: "git rev-parse --verify origin/${target} >/dev/null 2>&1 && git merge-base origin/${target} HEAD || git merge-base master HEAD", returnStdout: true).trim()
            changedFilesRaw = sh(script: "git diff --name-only ${base}..HEAD || true", returnStdout: true).trim()
          } else {
            bat 'powershell -NoProfile -Command "git fetch origin %TARGET_BRANCH%:%TARGET_BRANCH% -ErrorAction SilentlyContinue"'
            shortSha = bat(returnStdout: true, script: 'powershell -NoProfile -Command "(git rev-parse --short=7 HEAD).Trim()"').trim()
            def base = bat(returnStdout: true, script:
              'powershell -NoProfile -Command "try { git rev-parse --verify origin/%TARGET_BRANCH% > $null 2>&1; (git merge-base origin/%TARGET_BRANCH% HEAD).Trim() } catch { (git merge-base master HEAD).Trim() }"'
            ).trim()
            changedFilesRaw = bat(returnStdout: true, script:
              "powershell -NoProfile -Command \"(git diff --name-only ${base}..HEAD) -join '\\n'\""
            ).trim()
          }

          env.IMAGE_TAG_SHA = shortSha
          env.IMAGE_TAG_LATEST = "latest"
          env.CHANGED_FILES = (changedFilesRaw ?: "").trim()

          echo "Short SHA: ${env.IMAGE_TAG_SHA}"
          echo "Changed files (base..HEAD):"
          echo "${env.CHANGED_FILES}"
        }
      }
    }

    stage('Decide services to build') {
      steps {
        script {
          def allServices = env.SERVICES.split()
          def changedServicesList = []
          def changedList = env.CHANGED_FILES?.split('\n') ?: []

          for (svc in allServices) {
            if (changedList.find { it?.trim()?.startsWith("${env.BASE_DIR}/${svc}/") }) {
              changedServicesList << svc
            }
          }

          if (env.CHANGED_FILES?.toLowerCase()?.contains("jenkinsfile")) {
            changedServicesList = allServices
          }

          env.CHANGED_SERVICES = changedServicesList.join(' ')

          if (changedServicesList.isEmpty()) {
            echo "No services changed"
          } else {
            echo "Services to build: ${changedServicesList}"
          }
        }
      }
    }

    stage('Docker Hub Login') {
      when { expression { return env.CHANGED_SERVICES?.trim() } }
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED_ID}",
          usernameVariable: 'DOCKERHUB_USERNAME',
          passwordVariable: 'DOCKERHUB_TOKEN')]) {
          script {
            if (isUnix()) {
              sh 'echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin'
            } else {
              bat """
                @echo off
                powershell -NoProfile -Command "('${DOCKERHUB_TOKEN}') | docker login -u '${DOCKERHUB_USERNAME}' --password-stdin"
              """
            }
          }
        }
      }
    }

    stage('Build & Push Changed Services') {
      when { expression { return env.CHANGED_SERVICES?.trim() } }
      steps {
        script {
          def list = env.CHANGED_SERVICES.split()
          if (list.size() > 1) {
            def branches = [:]
            for (svc in list) {
              def svcLocal = svc
              branches[svcLocal] = {
                buildAndPushService(svcLocal)
              }
            }
            parallel branches
          } else {
            buildAndPushService(list[0])
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isUnix()) {
          sh 'docker logout || true'
        } else {
          bat '@echo off & docker logout || exit 0'
        }
      }
    }
    success { echo "Pipeline completed successfully." }
    failure { echo "Pipeline failed." }
  }
}

def buildAndPushService(String svc) {
  node {
    stage("Build ${svc}") {
      dir("${env.BASE_DIR}/${svc}") {
        script {
          if (!fileExists("Dockerfile")) {
            echo "Skipping ${svc}: no Dockerfile"
            return
          }

          def image = "${env.DOCKERHUB_NAMESPACE}/${svc}".toLowerCase()
          def tagSha = "${image}:${env.IMAGE_TAG_SHA}"
          def tagLatest = "${image}:${env.IMAGE_TAG_LATEST}"

          if (isUnix()) {
            sh """
              docker build -t ${tagSha} .
              docker tag ${tagSha} ${tagLatest}
              docker push ${tagSha}
              docker push ${tagLatest}
              docker rmi ${tagLatest} || true
              docker rmi ${tagSha} || true
            """
          } else {
            bat """
              @echo off
              powershell -NoProfile -Command "docker build -t ${tagSha} .; docker tag ${tagSha} ${tagLatest}; docker push ${tagSha}; docker push ${tagLatest}; docker rmi ${tagLatest} -ErrorAction SilentlyContinue; docker rmi ${tagSha} -ErrorAction SilentlyContinue"
            """
          }
        }
      }
    }
  }
}
