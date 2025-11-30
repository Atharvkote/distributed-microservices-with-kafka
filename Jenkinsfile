pipeline {
  agent {
    docker {
      image 'docker:24.0-cli'
      args '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  environment {
    DOCKERHUB_NAMESPACE = "atharvkote"
    DOCKERHUB_CRED_ID  = "DOCKERHUB_LOGIN"
    SERVICES = "payment-service analytics-service orders-service catalog-service messaging-service identity-service"
    BASE_DIR = "micro-services"
    TARGET_BRANCH = "master"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Detect Changes') {
      steps {
        script {
          def result = sh(returnStdout: true, script: """
            git fetch origin ${TARGET_BRANCH}:${TARGET_BRANCH} || true
            SHORT=\$(git rev-parse --short=7 HEAD)
            BASE=\$(git merge-base origin/${TARGET_BRANCH} HEAD)
            CHANGED=\$(git diff --name-only \$BASE..HEAD || true)

            echo "SHORT_SHA=\$SHORT" > git-info.txt
            echo "CHANGED_FILES<<EOF" >> git-info.txt
            echo "\$CHANGED" >> git-info.txt
            echo "EOF" >> git-info.txt
          """).trim()

          def props = readProperties file: "git-info.txt"
          env.IMAGE_TAG_SHA = props.SHORT_SHA

          env.CHANGED_FILES = props.CHANGED_FILES.trim()
          echo "Changed files:\n${env.CHANGED_FILES}"
        }
      }
    }

    stage('Decide Services To Build') {
      steps {
        script {
          def changedSvcs = []
          def changedList = env.CHANGED_FILES.split("\\r?\\n")

          for (svc in env.SERVICES.split()) {
            if (changedList.find { it.startsWith("${env.BASE_DIR}/${svc}/") }) {
              changedSvcs << svc
            }
          }

          if (env.CHANGED_FILES.toLowerCase().contains("jenkinsfile")) {
            changedSvcs = env.SERVICES.split()
          }

          env.CHANGED_SERVICES = changedSvcs.join(" ")
          echo "Services to Build: ${env.CHANGED_SERVICES}"
        }
      }
    }

    stage('Docker Login') {
      when { expression { env.CHANGED_SERVICES?.trim() } }
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED_ID}",
            usernameVariable: 'USER',
            passwordVariable: 'PASS')]) {
          sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
        }
      }
    }

    stage('Build & Push') {
      when { expression { env.CHANGED_SERVICES?.trim() } }
      steps {
        script {
          def svcs = env.CHANGED_SERVICES.split()

          def branches = [:]

          for (svc in svcs) {
            def svcName = svc
            branches[svcName] = {
              buildAndPushService(svcName)
            }
          }

          parallel branches
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}

def buildAndPushService(String svc) {
  stage("Build ${svc}") {
    dir("${env.BASE_DIR}/${svc}") {
      script {
        def image = "${env.DOCKERHUB_NAMESPACE}/${svc}".toLowerCase()
        def tagSha = "${image}:${env.IMAGE_TAG_SHA}"
        def tagLatest = "${image}:latest"

        sh """
          docker buildx create --use builder || true
          docker buildx build \\
            --tag ${tagSha} \\
            --tag ${tagLatest} \\
            --push .
        """
      }
    }
  }
}
