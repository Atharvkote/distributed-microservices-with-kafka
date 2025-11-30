/**
  * @file Jenkinsfile
  * @description Multi-service CI/CD pipeline for Dockerized microservices.
  *
  * OVERVIEW
  * This Jenkins multibranch pipeline detects which microservices changed in a commit,
  * builds only those services, and pushes Docker images only when running on a
  * primary branch (e.g., master) and the run is not a pull request. Designed to
  * minimize CI time and Docker registry usage by avoiding full-repo builds unless
  * repository-level trigger files change.
  *
  * KEY ENVIRONMENT VARIABLES
  * - DOCKERHUB_NAMESPACE: Docker Hub namespace used for image names.
  * - BASE_DIR: Path prefix containing microservice folders.
  * - SERVICES: Space-separated list of microservice directory names under BASE_DIR.
  * - DOCKER_CRED_ID: Jenkins credentials ID for Docker Hub username/password.
  * - PRIMARY_BRANCHES: Comma/space separated branches considered "primary" for pushes (e.g., "master").
 */

pipeline {
  agent { label 'docker-agent' }
  options { timestamps(); skipDefaultCheckout() }

  environment {
    DOCKERHUB_NAMESPACE = "atharvakote"
    BASE_DIR = "micro-services"
    SERVICES = "analytics-service catalog-service identity-service messaging-service orders-service payment-service"
    DOCKER_CRED_ID = "DOCKERHUB_LOGIN"
    PRIMARY_BRANCHES = "master"
  }

  stages {

    /** 
      * @stage Checkout
      *
      * 1) Checkout
      *    Purpose:
      *      - Retrieve repository contents using the configured SCM for the current multibranch run.
      *    Behavior:
      *      - Runs a single `checkout scm` which ensures Jenkins checks out the correct branch/commit
      *        associated with this build (including PR builds when applicable).
      *    Why it's important:
      *      - Subsequent stages use the working tree to compute diffs and to build Docker contexts
    */

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    /**
      * @stage Detect changes
      * 2) Detect changes
      *    Purpose:
      *      - Determine which files changed between the target branch and HEAD (or fallback to last commit),
      *        and map those changes to a list of microservices that require building.
      *    How it works (detailed):
      *      - Reads env.BRANCH_NAME (or 'unknown') and detects whether the build is a PR via env.CHANGE_ID.
      *      - Computes a short commit id (7 chars) and stores it in env.SHORT_COMMIT for image tags.
      *      - Runs a PowerShell block which:
      *         • Attempts a shallow fetch of origin/<branch> for a reliable diff base (reduces network cost).
      *         • Tries `git diff --name-only origin/<branch>...HEAD` to compare the branch tip with HEAD.
      *         • If that fails (e.g., no origin branch available), falls back to `git diff --name-only HEAD^ HEAD`.
      *         • If still no result, uses `git ls-files` as a last resort (which effectively marks many files changed).
      *         • Outputs a unique, sorted JSON array of file paths.
      *      - Parses the JSON into changedFiles using JsonSlurper and logs results.
      *      - Maintains a `rebuildAllTriggers` set (docker-compose.yaml, README variants) — changes to these files
      *        cause a repo-wide rebuild of all SERVICES to handle infra or docs changes that affect all services.
      *      - Otherwise, each changed path is matched against the pattern `${BASE_DIR}/${service}/` to decide if
      *        a specific service is impacted. Paths that start with that prefix cause that service to be added to the build list.
      *    Outputs:
      *      - env.CHANGED_SERVICES: comma-separated list of service names to build (empty string if none).
      *      - env.IS_PR, env.CURRENT_BRANCH, env.SHORT_COMMIT are also populated for use by later stages.
      *    Why it's important:
      *      - Avoids unnecessary builds by targeting only services with code changes, saving CI time and resources.
    */

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

          def changedFiles = []
          if (changedJson && changedJson.trim().length() > 0) {
            try {
              changedFiles = new groovy.json.JsonSlurper().parseText(changedJson)
            } catch (err) {
              echo "Failed to parse changedJson, falling back to empty list: ${err}"
              changedFiles = []
            }
          }
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

    /**
      * @stage Docker Login (if needed)
      * 3) Docker Login (if needed)
      *    Purpose:
      *      - Authenticate to Docker Hub (or configured registry) before pushing images.
      *    Execution condition:
      *      - Runs only when:
      *         • CHANGED_SERVICES is non-empty,
      *         • the build is NOT a PR (IS_PR == 'false'),
      *         • and the CURRENT_BRANCH is included in PRIMARY_BRANCHES.
      *    Behavior:
      *      - Uses Jenkins `withCredentials(usernamePassword(...))` with DOCKER_CRED_ID and runs docker login using the provided creds.
      *      - On Windows agents this uses `bat` to pipe the password into `docker login --password-stdin`.
      *    Why it's important:
      *      - Only authenticates when a push may occur; avoids exposing credentials or unnecessary logins for PR/testing-only builds.
    */

    stage('Docker Login (if needed)') {
      when { expression { return (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0 && env.IS_PR == 'false' && env.PRIMARY_BRANCHES.tokenize().contains(env.CURRENT_BRANCH)) } }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          bat 'echo %DH_PASS% | docker login -u %DH_USER% --password-stdin'
        }
      }
    }

    /**
      * @stage Build & (optionally) Push
      * 4) Build & (optionally) Push
      *    Purpose:
      *      - Build Docker images for the services listed in CHANGED_SERVICES and push them to Docker Hub when appropriate.
      *    Execution condition:
      *      - Runs only if CHANGED_SERVICES is non-empty.
      *    How it works (detailed):
      *      - Splits CHANGED_SERVICES into a list.
      *      - For each service:
      *         • Constructs an image tag of the form: `${DOCKERHUB_NAMESPACE}/${service}:${SHORT_COMMIT}-${BUILD_NUMBER}`.
      *         • Builds the Docker image using `docker build -t <tag> <context>` where context is `${BASE_DIR}\${service}` on Windows.
      *         • After a successful build, will push the image only if:
      *             - The build is not a PR (IS_PR == 'false'), and
      *             - CURRENT_BRANCH is contained in PRIMARY_BRANCHES (using .tokenize().contains()).
      *         • If push is skipped (PR or non-primary branch) an explanatory message is echoed.
      *      - Each service's build + push steps are executed in parallel using the Jenkins `parallel` construct to accelerate CI.
      *    Important notes:
      *      - The image tag contains both the short commit and the Jenkins BUILD_NUMBER to ensure immutability and traceability.
      *      - The build uses `bat` on Windows agents — if using *nix agents, adapt to `sh` (not required here as per your agent).
      *    Why it's important:
      *      - Keeps artifact creation fast (parallel builds) while preventing accidental pushes from PRs or feature branches.
    */

    stage('Build & (optionally) Push') {
      when { expression { return (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0) } }
      steps {
        script {
          def list = env.CHANGED_SERVICES.split(',').findAll{ it?.trim() }
          def tasks = [:]

          for (svc in list) {
            def service = svc.trim()
            def tag = "${env.DOCKERHUB_NAMESPACE}/${service}:1.0.${env.BUILD_NUMBER}"
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

  /**
      * @stage POST / CLEANUP
      * POST / CLEANUP
      * - In the `post` block, when the build had changed services and a push may have occurred, the pipeline attempts to `docker logout`
      *   to remove session credentials from the agent. This is executed in `always` to reduce leftover credential exposure.
      * - `success` and `failure` steps echo final statuses for easy log scanning.
      *
  */

  post {
    always {
      script {
        if (env.CHANGED_SERVICES && env.CHANGED_SERVICES.trim().length() > 0 && env.IS_PR == 'false' && env.PRIMARY_BRANCHES.tokenize().contains(env.CURRENT_BRANCH)) {
          bat 'docker logout || echo logout-failed'
        }
      }
    }

    /**
      @results_flag
      * - success: Echoes "Pipeline finished SUCCESS" on successful completion.
      * - failure: Echoes "Pipeline FAILED" if any stage fails.
    */

    success { echo "Pipeline finished SUCCESS" }
    failure { echo "Pipeline FAILED" }

    /**
      * SECURITY & OPERATIONAL CONSIDERATIONS
      * - Credentials: DOCKER_CRED_ID must be stored securely in Jenkins credentials store as username/password.
      * - Branch logic: PRIMARY_BRANCHES uses `.tokenize()` for membership testing. If you need multiple primary branches,
      *   set PRIMARY_BRANCHES = "master main release" (space or comma-separated depending on your usage).
      * - Agents: This Jenkinsfile expects a Windows-style agent (uses `bat`); if your agents are Linux, replace `bat` with `sh`.
      * - Git fetch/diff behavior: In shallow or sparse checkout environments, the diff logic may fall back to HEAD^ detection;
      *   this may not capture all historical changes — ensure the Jenkins SCM checkout includes sufficient history for correct diffs.
      *
      * USAGE EXAMPLES
      * - To force a repo-wide rebuild on infra changes, modify README or docker-compose.yaml in the repo root and the pipeline will rebuild all services.
      * - To test build-only behavior without pushing, run the pipeline for a branch not listed in PRIMARY_BRANCHES or run as a PR.
      *
      * LINKS
      * - GitHub repository: https://github.com/Atharvkote/Multi-Vendor-E-Commerce.git
      * - Docker Hub namespace: https://hub.docker.com/u/atharvakote
      *
      * AUTHOR
      * - Atharva Kote
    */
  }
}
