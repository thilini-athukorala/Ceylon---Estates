pipeline {
    agent { label 'rootless-docker' }

    options {
        timestamps()
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Verify Rootless Docker') {
            steps {
                sh '''
                    whoami
                    docker context show
                    docker info | grep -i rootless
                '''
            }
        }

        stage('Backend API Tests') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD/backend:/app" \
                        -w /app \
                        node:22-alpine \
                        sh -c "npm ci && node --test tests/*.test.js"
                '''
            }
        }

        stage('Build Frontend Image') {
	stage('Frontend Tests') {
    steps {
        sh '''
            docker run --rm \
                -v "$PWD/frontend:/source:ro" \
                -w /tmp \
                -e HOME=/tmp \
                -e npm_config_cache=/tmp/.npm \
                node:22-alpine \
                sh -c '
                    mkdir -p /tmp/frontend &&
                    cp -R /source/. /tmp/frontend/ &&
                    cd /tmp/frontend &&
                    npm ci &&
                    npm test
                '
        '''
    }
}
            steps {
                sh '''
                    docker build \
                        -t ceylon-estates-frontend:ci \
                        ./frontend
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                        -t ceylon-estates-backend:ci \
                        ./backend
                '''
            }
        }

    }

    post {
        success {
            echo 'Ceylon Estates CI build completed successfully!'
        }

        failure {
            echo 'Ceylon Estates CI build failed!'
        }
    }
}
