pipeline {
  agent { label 'linux' }

  environment {
    DOCKERHUB_NAMESPACE = "atharvkote"
    DOCKERHUB_CRED_ID  = "DOCKERHUB_LOGIN"
    SERVICES = "payment-service analytics-service order-service catalog-service messaging-service identity-service"
    BASE_DIR = "micro-services"
    TARGET_BRANCH = "master"
    IMAGE_TAG_LATEST = "latest"
  }

  stages {
    stage('Checkout & Detect Changes') {
      steps {
        checkout scm
        script {
          def target = env.TARGET_BRANCH ?: "master"

          def ps = sh(returnStdout: true, script: """bash -lc '
git fetch origin ${target}:${target} || git fetch origin master:master || true
SHORT=\$(git rev-parse --short=7 HEAD)
BASE=\$(git rev-parse --verify origin/${target} >/dev/null 2>&1 && git merge-base origin/${target} HEAD || git merge-base master HEAD)
CHANGED=\$(git diff --name-only \${BASE}..HEAD || true)
printf "%s\\n---GIT-CHANGED-START---\\n%s\\n---GIT-CHANGED-END---\\n" "\$SHORT" "\$CHANGED"
'""").trim()

          def markerStart = '---GIT-CHANGED-START---'
          def markerEnd = '---GIT-CHANGED-END---'
          def idx = ps.indexOf(markerStart)
          def shortSha = ps.substring(0, idx).trim()
          def changedBlock = ps.substring(idx + markerStart.length(), ps.indexOf(markerEnd)).trim()

          env.IMAGE_TAG_SHA = shortSha
          env.CHANGED_FILES = changedBlock
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
          def changedList = (env.CHANGED_FILES ?: "").split('\\n') as List

          for (svc in allServices) {
            if (changedList.find { it?.trim()?.startsWith("${env.BASE_DIR}/${svc}/") }) {
              changedServicesList << svc
            }
          }

          if ((env.CHANGED_FILES ?: "").toLowerCase().contains("jenkinsfile")) {
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
          sh 'echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin'
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
        sh 'docker logout || true'
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

          sh """
set -e
docker buildx create --use --name builder || true
docker buildx inspect --bootstrap
docker buildx build \\
  --builder builder \\
  --tag ${tagSha} \\
  --tag ${tagLatest} \\
  --cache-from=type=registry,ref=${image}:cache \\
  --cache-to=type=registry,ref=${image}:cache,mode=max \\
  --push .
"""
        }
      }
    }
  }
}
