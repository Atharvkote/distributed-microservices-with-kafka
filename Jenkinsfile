pipeline {
  agent { label 'docker-node' }
  options { timestamps(); ansiColor('xterm'); skipDefaultCheckout(true) }

  environment {
    DOCKERHUB_NAMESPACE = "atharvkote"
    BASE_DIR = "micro-services"
    SERVICES = "analytics-service catalog-service identity-service messaging-service orders-service payment-service"
    DOCKER_CRED_ID = "DOCKERHUB_LOGIN"
    PRIMARY_BRANCHES = "master"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Detect changes') {
      steps {
        script {
          def branch = env.BRANCH_NAME ?: 'unknown'
          def isPR = env.CHANGE_ID ? true : false
          echo "Branch: ${branch}  |  IsPR: ${isPR}"

          def shortCommit = powershell(returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()
          env.SHORT_COMMIT = shortCommit
          echo "Short commit: ${shortCommit}"

          def changedJson = powershell(returnStdout: true, script: """
            Set-StrictMode -Off
            \$branch = "${branch}"
            try { git fetch origin \$branch --depth=1 2>\$null } catch {}
            \$diff = ""
            try { \$diff = git diff --name-only origin/\$branch...HEAD 2>\$null } catch {}
            if ([string]::IsNullOrWhiteSpace(\$diff)) { \$diff = git diff --name-only HEAD^ HEAD 2>\$null }
            if ([string]::IsNullOrWhiteSpace(\$diff)) { \$diff = git ls-files }
            \$diff -split "`n" | ForEach-Object { \$_.Trim() } | Where-Object { \$_.Length -gt 0 } | Sort-Object -Unique | ConvertTo-Json
          """).trim()

          def changedFiles = readJSON text: changedJson
          echo "Changed files: ${changedFiles}"

          def services = env.SERVICES.split()
          def rebuildAllTriggers = ['docker-compose.yaml','docker-compose.yml','README.md','README.MD','README']
          def rebuildAll = false
          def toBuild = []

          for (f in changedFiles) {
            for (t in rebuildAllTriggers) {
              if (f.equalsIgnoreCase(t) || f == t) {
                rebuildAll = true
                echo "Repo-wide trigger changed file: ${f}"
              }
            }
          }

          if (rebuildAll) {
            toBuild = services as List
          } else {
            for (svc in services) {
              def prefix = "${BASE_DIR}/${svc}/"
              for (f in changedFiles) {
                if (f.startsWith(prefix) || f.startsWith(prefix.replace('/','\\\\'))) {
                  toBuild.add(svc)
                  break
                }
              }
            }
          }

          toBuild = toBuild.unique()
          if (toBuild.size() == 0) {
            echo "No microservice changes detected."
            env.CHANGED_SERVICES = ""
          } else {
            echo "Services to build: ${toBuild}"
            env.CHANGED_SERVICES = toBuild.join(',')
          }

          env.IS_PR = isPR.toString()
          env.CURRENT_BRANCH = branch
        }
      }
    }

    stage('Docker Login (if needed)') {
      when { expression { return (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0 && env.IS_PR == 'false' && env.PRIMARY_BRANCHES.tokenize().contains(env.CURRENT_BRANCH)) } }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          bat 'echo %DH_PASS% | docker login -u %DH_USER% --password-stdin'
        }
      }
    }

    stage('Build & (optionally) Push') {
      when { expression { return (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0) } }
      steps {
        script {
          def list = env.CHANGED_SERVICES.split(',').findAll{ it?.trim() }
          def tasks = [:]

          for (svc in list) {
            def service = svc.trim()
            def tag = "${env.DOCKERHUB_NAMESPACE}/${service}:${env.SHORT_COMMIT}-${env.BUILD_NUMBER}"
            def ctxWindows = "${env.BASE_DIR}\\${service}"
            def tService = service
            def tTag = tag
            def tCtx = ctxWindows

            tasks[tService] = {
              stage("Build ${tService}") {
                echo "Building ${tTag} from ${tCtx}"
                bat "docker build -t ${tTag} ${tCtx}"
              }
              stage("Push ${tService}") {
                if (env.IS_PR == 'false' && env.PRIMARY_BRANCHES.tokenize().contains(env.CURRENT_BRANCH)) {
                  echo "Pushing ${tTag}"
                  bat "docker push ${tTag}"
                } else {
                  echo "Skipping push for ${tService} (IS_PR=${env.IS_PR}, branch=${env.CURRENT_BRANCH})"
                }
              }
            }
          }

          if (tasks.size() > 0) {
            parallel tasks
          } else {
            echo "Nothing to build."
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0 && env.IS_PR == 'false' && env.PRIMARY_BRANCHES.tokenize().contains(env.CURRENT_BRANCH)) {
          bat 'docker logout || echo logout-failed'
        }
      }
    }
    success { echo "Pipeline finished SUCCESS" }
    failure { echo "Pipeline FAILED" }
  }
}
