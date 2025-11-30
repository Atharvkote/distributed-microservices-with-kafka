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
          // Windows-safe PowerShell one-liner (no caret continuation)
          bat '''
            @echo off
            powershell -NoProfile -Command "try { git fetch origin %TARGET_BRANCH%:%TARGET_BRANCH% } catch {}; $short = (git rev-parse --short=7 HEAD).Trim(); try { git rev-parse --verify origin/%TARGET_BRANCH% > $null 2>&1; $base = (git merge-base origin/%TARGET_BRANCH% HEAD).Trim() } catch { $base = (git merge-base master HEAD).Trim() }; $changed = ''; try { $changed = (git diff --name-only $base..HEAD) -join \"`n\" } catch { }; Set-Content -Path git-info.txt -Value \"SHORT_SHA=$short\"; Add-Content -Path git-info.txt -Value \"CHANGED_FILES<<EOF\"; Add-Content -Path git-info.txt -Value $changed; Add-Content -Path git-info.txt -Value \"EOF\";"
          '''

          def props = readProperties file: "git-info.txt"
          env.IMAGE_TAG_SHA = props.SHORT_SHA
          env.CHANGED_FILES = props.CHANGED_FILES ?: ""
          echo "Detected short SHA: ${env.IMAGE_TAG_SHA}"
          echo "Changed files:\n${env.CHANGED_FILES}"
        }
      }
    }

    stage('Decide Services') {
      steps {
        script {
          def changedSvcs = []
          def list = (env.CHANGED_FILES ?: "").split("\\r?\\n")

          for (svc in env.SERVICES.split()) {
            if (list.find{ it?.trim()?.startsWith("${env.BASE_DIR}/${svc}/") }) {
              changedSvcs << svc
            }
          }

          env.CHANGED_SERVICES = changedSvcs.join(" ")
          echo "Will build: ${env.CHANGED_SERVICES}"
        }
      }
    }

    stage('Kaniko Build & Push') {
      when { expression { return env.CHANGED_SERVICES?.trim() } }
      steps {
        script {
          withCredentials([
            usernamePassword(
              credentialsId: env.DOCKERHUB_CRED_ID,
              usernameVariable: "DH_USER",
              passwordVariable: "DH_PASS"
            )
          ]) {
            env.AUTH_JSON = """{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "${DH_USER}:${DH_PASS}".bytes.encodeBase64().toString()
    }
  }
}"""
            writeFile file: 'kaniko-auth.json', text: env.AUTH_JSON

            for (svc in env.CHANGED_SERVICES.split()) {
              def dockerImage = "${env.DOCKERHUB_NAMESPACE}/${svc}"
              def context = "${env.BASE_DIR}/${svc}"
              echo "Building ${dockerImage} from ${context}"

              // run kaniko inside a docker container (this requires Docker installed and running)
              bat """
                @echo off
                docker run --rm ^
                  -v "%cd%\\${context}:/workspace" ^
                  -v "%cd%\\kaniko-auth.json:/kaniko/.docker/config.json:ro" ^
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
