Lab 5: Build and deploy fronted app
==

In this guide, you will build our frontedn application and push to ACR. With this image you will deploy frontend of Capture Order API to Kubernetes cluster.  This requires an external endpoint, exposing the website on port 80 and it needs to connect to the Order Capture API's public IP address so that it can display the number of orders in the system.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Order Capture API](labs/ordercapture-api/README.md)

## Environment Variables
The frontend requires the `CAPTUREORDERSERVICEIP` environment variable to be set to the external public IP address of the `captureorder` [service deployed in the previous guide](../ordercapture-api/README.md). **Make sure you set this environment variable in your deployment manifest**.

* CAPTUREORDERSERVICEIP="[public ip of order capture api]"

## Instructions

1. Build frontend app and push image to the ACR

    In this step we will create a Docker container image for frontend app. We will use ACR Builder functionality to build and store the image in the cloud.

    ```bash
    az acr build -t ksdemo/frontend-app:1.0 -r $ACR_NAME --no-logs apps/frontend
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACR_NAME -o table

    az acr task logs -r $ACR_NAME --run-id {{ .ImageId }}
    ```

2. Deploy the frontend app

    ### Task Hints
    
    * As with the captureorder deployment you will need to create a YAML file which describes your deployment. Making a copy of your captureorder deployment YAML would be a good start, but beware you will need to change

    * The container listens on port 8080

    * If your pods are not starting, not ready or are crashing, you can view their logs and detailed status information using `kubectl logs <pod name>` and/or `kubectl describe pod <pod name>`

    * This time the deployment defines a [`readinessProbe` and `livenessProbe`](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) different from the order capture api using the `/` root url

    Deploy frontend app with

    ```bash
    kubectl apply -f apps/frontend/manifests/deployment.yaml
    ```
    Verify that the pods are up and running

    ```bash
    kubectl get pods -l app=frontend  -w
    ```
    Wait until you see pods are in the `Running` state.

#### Next Lab: [Deploy the frontend app using Ingress](../ingress/README.md)