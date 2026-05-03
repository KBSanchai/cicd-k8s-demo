pipeline {
    agent any

    environment {
        IMAGE = "kbsanchai/ecommerce-app"
    }

    stages {

        stage('Clone Code') {
            steps {
                echo "Code already cloned from SCM"
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE%:v1 .'
            }
        }

        stage('Login DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat 'echo %PASS% | docker login -u %USER% --password-stdin'
                }
            }
        }

        stage('Push Image') {
            steps {
                bat 'docker push %IMAGE%:v1'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f deployment.yaml'
            }
        }
    }
}
