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

        stage('Build Frontend Image') {
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
