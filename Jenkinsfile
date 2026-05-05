pipeline {
    agent any
    environment {
        DOCKER_HUB_USERNAME = 'kbsanchai'
        IMAGE_NAME = "${DOCKER_HUB_USERNAME}/cicd-demo-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        FULL_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                git branch: 'main', url: 'https://github.com/KBSanchai/cicd-k8s-demo.git'
                echo "Build Number: ${BUILD_NUMBER}"
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${FULL_IMAGE}"
                sh "docker build -t ${FULL_IMAGE} ."
                sh "docker tag ${FULL_IMAGE} ${IMAGE_NAME}:latest"
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh "docker push ${FULL_IMAGE}"
                    sh "docker push ${IMAGE_NAME}:latest"
                    sh 'docker logout'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                sh "kubectl apply -f kube/deployment.yaml --kubeconfig=${KUBECONFIG}"
                sh "kubectl apply -f kube/service.yaml --kubeconfig=${KUBECONFIG}"
                sh "kubectl set image deployment/cicd-demo-app cicd-demo-app=${FULL_IMAGE} --kubeconfig=${KUBECONFIG}"
                sh "kubectl rollout status deployment/cicd-demo-app --timeout=300s --kubeconfig=${KUBECONFIG}"
            }
        }
        stage('Verify') {
            steps {
                sh "kubectl get pods -l app=cicd-demo-app --kubeconfig=${KUBECONFIG}"
                sh "kubectl get svc cicd-demo-service --kubeconfig=${KUBECONFIG}"
            }
        }
    }
    post {
        success {
            echo 'Pipeline succeeded! App is live.'
        }
        failure {
            echo 'Pipeline failed! Rolling back...'
            sh "kubectl rollout undo deployment/cicd-demo-app --kubeconfig=${KUBECONFIG} || true"
        }
        always {
            sh "docker rmi ${FULL_IMAGE} || true"
            cleanWs()
        }
    }
}