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
      steps {
        checkout scm
      }
    }

    stage('Detect Changes') {
      steps {
        script {
          powershell(returnStdout: true, script: '''
# Use the TARGET_BRANCH environment variable from Jenkins
$target = $env:TARGET_BRANCH

# Try fetching the target branch to have origin/$target locally (ignore fetch errors)
try { git fetch origin "$target":"$target" } catch {}

# Compute a short SHA for image tagging
$short = (git rev-parse --short=7 HEAD).Trim()

# Try to compute merge-base with origin/$target; if not available, fall back to master
try {
  git rev-parse --verify origin/$target > $null 2>&1
  $base = (git merge-base origin/$target HEAD).Trim()
} catch {
  $base = (git merge-base master HEAD).Trim()
}

# Produce a newline-separated list of changed files between base and HEAD
$changed = ''
try { $changed = (git diff --name-only $base..HEAD) -join "`n" } catch {}

# Create git-info.txt expected by the Groovy code
$gitInfo = @"
SHORT_SHA=$short
CHANGED_FILES<<EOF
$changed
EOF
"@

Set-Content -Path git-info.txt -Value $gitInfo -Encoding UTF8

# Emit a concise log for debugging the job output
Write-Host "SHORT_SHA=$short"
Write-Host "Changed files (preview):"
if ($changed) { Write-Host $changed } else { Write-Host "<none>" }
''')
          // Read the generated properties file and export env vars for subsequent stages
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
          // split the CHANGED_FILES into lines; handle empty safely
          def list = (env.CHANGED_FILES ?: "").split("\\r?\\n")

          for (svc in env.SERVICES.split()) {
            // look for files under BASE_DIR/<svc>/
            def prefix = "${env.BASE_DIR}/${svc}/"
            if (list.find{ it?.trim()?.startsWith(prefix) }) {
              changedSvcs << svc
            }
          }

          env.CHANGED_SERVICES = changedSvcs.join(" ")
          if (env.CHANGED_SERVICES?.trim()) {
            echo "Will build: ${env.CHANGED_SERVICES}"
          } else {
            echo "No services changed under ${env.BASE_DIR}; skipping build stage."
          }
        }
      }
    }

    stage('Kaniko Build & Push') {
      when { expression { return env.CHANGED_SERVICES?.trim() } }
      steps {
        script {
          // Use DockerHub credentials to produce a kaniko config json file.
          withCredentials([
            usernamePassword(
              credentialsId: env.DOCKERHUB_CRED_ID,
              usernameVariable: "DH_USER",
              passwordVariable: "DH_PASS"
            )
          ]) {
            // Build the auth JSON (simple base64 auth)
            env.AUTH_JSON = """{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "${DH_USER}:${DH_PASS}".bytes.encodeBase64().toString()
    }
  }
}"""
            writeFile file: 'kaniko-auth.json', text: env.AUTH_JSON, encoding: 'UTF-8'

            // Iterate over changed services and run kaniko inside Docker for each
            for (svc in env.CHANGED_SERVICES.split()) {
              def dockerImage = "${env.DOCKERHUB_NAMESPACE}/${svc}"
              def context = "${env.BASE_DIR}/${svc}"
              echo "Building ${dockerImage} from ${context}"

              // Run Kaniko inside a Docker container. Keep this as a single-line bat to avoid multiline parsing issues.
              // The %cd% expansion and Windows path separators are used because your agent is Windows.
              bat """
@echo off
if not exist "${context}\\Dockerfile" (
  echo "No Dockerfile found at ${context}\\Dockerfile - skipping ${svc}"
  exit /B 0
)
docker run --rm ^
  -v "%cd%\\\\${context}:/workspace" ^
  -v "%cd%\\\\kaniko-auth.json:/kaniko/.docker/config.json:ro" ^
  gcr.io/kaniko-project/executor:latest ^
  --context=/workspace ^
  --dockerfile=/workspace/Dockerfile ^
  --destination=${dockerImage}:${env.IMAGE_TAG_SHA} ^
  --destination=${dockerImage}:latest
"""
            } // end for
          } // end withCredentials
        } // end script
      } // end steps
    } // end stage
  } // end stages

  post {
    always {
      script {
        // print a short summary
        echo "Pipeline finished. IMAGE_TAG_SHA=${env.IMAGE_TAG_SHA ?: '<none>'}, CHANGED_SERVICES=${env.CHANGED_SERVICES ?: '<none>'}"
      }
    }
    failure {
      echo "Pipeline failed. Inspect console output for errors."
    }
  }
}
