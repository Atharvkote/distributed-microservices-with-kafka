pipeline {
  agent any

  environment {
    DOCKERHUB_NAMESPACE = "atharvkote"
    DOCKERHUB_CRED_ID  = "DOCKERHUB_LOGIN"
    BASE_DIR = "micro-services"
    SERVICES = "payment-service analytics-service orders-service catalog-service messaging-service identity-service"
    TARGET_BRANCH = "master"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Detect Changes') {
      steps {
        script {
          def out = bat(returnStdout: true, script: """
            @echo off
            powershell -NoProfile -Command ^
              "git fetch origin %TARGET_BRANCH%:%TARGET_BRANCH% ; ^
               \$short = (git rev-parse --short=7 HEAD).Trim(); ^
               git rev-parse --verify origin/%TARGET_BRANCH% > \$null 2>&1; ^
               \$base = (git merge-base origin/%TARGET_BRANCH% HEAD).Trim(); ^
               \$changed = (git diff --name-only \$base..HEAD) -join \"`n\"; ^
               Set-Content git-info.txt \"SHORT_SHA=\$short\"; ^
               Add-Content git-info.txt \"CHANGED_FILES<<EOF\"; ^
               Add-Content git-info.txt \$changed; ^
               Add-Content git-info.txt \"EOF\";"
          """).trim()

          def props = readProperties file: "git-info.txt"
          env.IMAGE_TAG_SHA = props.SHORT_SHA
          env.CHANGED_FILES = props.CHANGED_FILES ?: ""
          echo "Changed:\n${env.CHANGED_FILES}"
        }
      }
    }

    stage('Decide Services') {
      steps {
        script {
          def changedSvcs=[]
          def list = env.CHANGED_FILES.split("\\r?\\n")

          for (svc in env.SERVICES.split()) {
            if (list.find{ it.startsWith("${env.BASE_DIR}/${svc}/") }) {
              changedSvcs << svc
            }
          }

          env.CHANGED_SERVICES = changedSvcs.join(" ")
          echo "Will build: ${env.CHANGED_SERVICES}"
        }
      }
    }

    stage('Kaniko Build & Push') {
      when { expression { env.CHANGED_SERVICES?.trim() } }
      steps {
        script {

          withCredentials([
            usernamePassword(
              credentialsId: env.DOCKERHUB_CRED_ID,
              usernameVariable: "DH_USER",
              passwordVariable: "DH_PASS"
            )
          ]) {

            env.AUTH_JSON = """
            {
              "auths": {
                "https://index.docker.io/v1/": {
                  "auth": "${DH_USER}:${DH_PASS}".bytes.encodeBase64().toString()
                }
              }
            }
            """

            writeFile file: 'kaniko-auth.json', text: env.AUTH_JSON

            for (svc in env.CHANGED_SERVICES.split()) {

              def dockerImage = "${env.DOCKERHUB_NAMESPACE}/${svc}"
              def context = "${env.BASE_DIR}/${svc}"

              echo "Building ${dockerImage}"

              bat """
                docker run ^
                  -v "%cd%/${context}:/workspace" ^
                  -v "%cd%/kaniko-auth.json:/kaniko/.docker/config.json:ro" ^
                  gcr.io/kaniko-project/executor:latest ^
                  --context=/workspace ^
                  --dockerfile=/workspace/Dockerfile ^
                  --destination=${dockerImage}:${env.IMAGE_TAG_SHA} ^
                  --destination=${dockerImage}:latest
              """
            }
          }

        }
      }
    }
  }
}
