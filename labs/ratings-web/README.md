Section 5: Build and deploy Ratings Web APP
==

In this guide, you will build our Ratings Web application and push to ACR. The ratings front end is a Node.js application that was built by using the Vue JavaScript framework and WebPack to bundle the code. With this image you will deploy frontend of Ratings API to Kubernetes cluster. 

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Ratings API](labs/ratings-api/README.md)

![Ratings Web Architecture](/labs/ratings-web/img/ratingsweb-architecture.svg "Ratings Web Architecture")

## Environment Variables
 The ratings front end expects to connect to the API endpoint configured in an API environment variable. If you used the defaults and deployed the ratings API service in the ratingsapp namespace, the value of that should be http://ratings-api.ratingsapp.svc.cluster.local.

* API="http://ratings-api.ratingsapp.svc.cluster.local" => servicename.namespace.svc.cluster.local

## Instructions

1. Build ratings web and push image to the ACR

    In this step we will create a Docker container image for ratings web APP. We will use ACR Builder functionality to build and store the image in the cloud.

    ```bash
    az acr build -t ksdemo/ratings-web:1.0 -r $ACR_NAME --no-logs -o json apps/ratings-web
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACR_NAME -o table

    az acr task logs -r $ACR_NAME --run-id {{ .ImageId }}
    ```

2. Deploy the ratings web APP

    ### Task Hints
    
    * As with the Ratings API deployment you will need to create a YAML file which describes your deployment. Making a copy of your Ratings API deployment YAML would be a good start, but beware you will need to change

    * The container listens on port 8080

    * If your pods are not starting, not ready or are crashing, you can view their logs and detailed status information using `kubectl logs <pod name> -n ratingsapp` and/or `kubectl describe pod <pod name> -n ratingsapp`

    * This time the deployment defines a [`readinessProbe` and `livenessProbe`](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) different from the order capture api using the `/` root url

    Deploy Ratings web APP with

    ```bash
    kubectl apply -f apps/ratings-web/manifests/deployment.yaml
    ```
    Verify that the pods are up and running

    ```bash
    kubectl get pods --namespace ratingsapp -l app=ratings-web -w
    ```
    Wait until you see pods are in the `Running` state.

## Create a Kubernetes service for the ratings web APP service

Your next step is to simplify the network configuration for your application workloads. Use a Kubernetes service to group your pods and provide network connectivity.

1. Create a service with LoadBalancer type

* A service can map an incoming port to `targetPort`. The incoming port is what the service responds to. The target port is what the pods are configured to listen to. For example, the service is exposed externally at port `80` and load balances the traffic to the ratings-web pods listening on port `8080`.

* A service of type `LoadBalancer` creates a public IP address in Azure and assigns it to Azure Load Balancer. Choosing this value makes the service reachable from outside the cluster.

    ```bash
    kubectl apply \
    -f apps/ratings-web/manifests/service.yaml
    ```
2. After deploying the service, it takes a few minutes for the service to acquire the public IP.

    ```bash
    kubectl get service ratings-web --namespace ratingsapp -w
    ```
3. Retrieve the External-IP of the Service

    ```bash
    kubectl get service ratings-web --namespace ratingsapp -o jsonpath="{.status.loadBalancer.ingress[*].ip}" -w
    ```

4. Store Loadbalancer IP in Environment variables

    Get Ip of Loadbalancer IP

    ```bash
    LB_IP_ADDRESS=$(kubectl get service ratings-web -n ratingsapp -o jsonpath="{.status.loadBalancer.ingress[*].ip}")

    echo export LB_IP_ADDRESS=$LB_IP_ADDRESS >> ~/.bashrc
    ```

## Test the application
Now that the ratings-web service has a public IP, open the IP in a web browser, for example, at http://[public ip LoadBalancer], to view and interact with the application.

![Ratings Web APP Test](/labs/ratings-web/img/ratings-web-test.png "Ratings Web APP Test")

#### Next Lab: [Deploy the Ratings web APP using Ingress](../ingress/README.md)