// Jenkinsfile — CI/CD Pipeline for Kubernetes Deployment
pipeline {
    agent any
    // Environment variables
    environment {
        DOCKER_HUB_USERNAME = 'your-dockerhub-username'  // CHANGE THIS
        IMAGE_NAME          = "${DOCKER_HUB_USERNAME}/cicd-demo-app"
        IMAGE_TAG           = "${BUILD_NUMBER}"
        FULL_IMAGE          = "${IMAGE_NAME}:${IMAGE_TAG}"
        KUBECONFIG          = '/var/lib/jenkins/.kube/config'
    }
    stages {
        //  Stage 1: Checkout 
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                git branch: 'main',
                    url: 'https://github.com/<your-username>/cicd-k8s-demo.git'
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Commit: ${GIT_COMMIT}"
            }
        }
        //  Stage 2: Test 
        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'npm test'
            }
        }
        //  Stage 3: Build Docker Image 
        stage('Build Docker Image') {
 steps {
                echo "Building Docker image: ${FULL_IMAGE}"
                sh "docker build -t ${FULL_IMAGE} ."
                sh "docker tag ${FULL_IMAGE} ${IMAGE_NAME}:latest"
                echo 'Docker image built successfully!'
            }
        }
        //  Stage 4: Push to Docker Hub 
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh "docker push ${FULL_IMAGE}"
                    sh "docker push ${IMAGE_NAME}:latest"
                    sh 'docker logout'
                }
            }
        }
        //  Stage 5: Deploy to Kubernetes 
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes cluster...'
                sh """
                    # Update image in deployment
                    kubectl set image deployment/cicd-demo-app \\
                        cicd-demo-app=${FULL_IMAGE} \\
                        --record \\
                        --kubeconfig=${KUBECONFIG} || true
 # If deployment doesn't exist, apply the manifests
                    kubectl apply -f kube/deployment.yaml \\
                        --kubeconfig=${KUBECONFIG}
                    kubectl apply -f kube/service.yaml \\
                        --kubeconfig=${KUBECONFIG}
                    # Force update image tag
                    kubectl set image deployment/cicd-demo-app \\
                        cicd-demo-app=${FULL_IMAGE} \\
                        --kubeconfig=${KUBECONFIG}
                    # Wait for rollout to complete
                    kubectl rollout status deployment/cicd-demo-app \\
                        --timeout=300s \\
                        --kubeconfig=${KUBECONFIG}
                """
            }
        }
        //  Stage 6: Verify Deployment 
        stage('Verify') {
            steps {
                sh """
                    echo '=== Pod Status ==='
                    kubectl get pods -l app=cicd-demo-app \\
                        --kubeconfig=${KUBECONFIG}
                    echo '=== Service Status ==='
                    kubectl get svc cicd-demo-service \\
                        --kubeconfig=${KUBECONFIG}
                    echo '=== Recent Events ==='
                    kubectl get events --sort-by=.lastTimestamp \\
                        --kubeconfig=${KUBECONFIG} | tail -10
                """
            }
        }
 }
    //  Post-build actions 
    post {
        success {
            echo "Deployment successful! App running at:"
            echo "http://<K8s-Worker-IP>:30080"
        }
        failure {
            echo 'Pipeline failed! Rolling back...'
            sh "kubectl rollout undo deployment/cicd-demo-app \\
                --kubeconfig=${KUBECONFIG} || true"
        }
        always {
            sh 'docker rmi ${FULL_IMAGE} || true'
            cleanWs()
        }
    }
}