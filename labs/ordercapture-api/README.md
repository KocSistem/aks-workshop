Section 4: Build and deploy the Ratings API
==

In this guide, you will build Order Capture API and push to ACR. With this image you will deploy API to Kubernetes cluster. This will require an external endpoint, exposing the API on **Azure LoadBalancer** so that it can be accessed on port 80. The application will need to write to the MongoDB instance you deployed earlier.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)

## Environment Variables
The Order Capture API requires the following environment variables in order to connect to your MongoDB database. You should use the Kubernetes secrets you created earlier to populate the values in the environment variables.

* MONGOHOST="[mongodb-hostname]"
* MONGOUSER="[mongodb-user]"
* MONGOPASSWORD="[mongodb-password]"

> The Order Capture API exposes the following endpoint for health-checks once you have completed the tasks below: http://[PublicEndpoint]:[port]/healthz

## Instructions

1. Build Order Capture API and push image to the ACR

    In this step we will create a Docker container image for Capture Order API. We will use ACR Builder functionality to build and store the image in the cloud.

    ```bash
    az acr build -t ksdemo/captureorder-api:1.0 -r $ACR_NAME --no-logs -o json apps/captureorder
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACR_NAME -o table

    az acr task logs -r $ACR_NAME --run-id {{ .ImageId }}
    ```

2. Deploy the Capture Order API

    ### Task Hints
    
    * You provide environment variables to your container using the env key in your container spec. By using `valueFrom` and `secretRef` you can reference values stored in a Kubernetes secret (i.e. the one you created earlier with the MongoDB host, username and password)

    * The container listens on port 8080

    * If your pods are not starting, not ready or are crashing, you can view their logs and detailed status information using `kubectl logs <pod name>` and/or `kubectl describe pod <pod name>`

    * The deployment defines a [`readinessProbe` and `livenessProbe`](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) using the `/healthz` endpoint exposed by the container and the port `8080`, this is optional but considered to be a best practice

    * The deployment also defines requests and limits to control the CPU and memory utilisation of your containers.

    Deploy Captureorder API with

    ```bash
    kubectl apply -f apps/captureorder/manifests/deployment.yaml
    ```
    Verify that the pods are up and running

    ```bash
    kubectl get pods -l app=captureorder -w
    ```

    Wait until you see pods are in the `Running` state.

3. Expose the Capture Order API deployment with service

    ### Task Hints

    * Kubernetes has several types of services (described in the docs), specified in the `type` field. You will need to create a service of type `LoadBalancer`

    * The service should expose port 80

        ```bash
        kubectl apply -f apps/captureorder/manifests/service.yaml
        ```

        Retrieve the External-IP of the Service

        Use the command below. **Make sure to allow a couple of minutes** for the Azure Load Balancer to assign a public IP.

        ```bash
        kubectl get service captureorder -o jsonpath="{.status.loadBalancer.ingress[*].ip}" -w
        ```
4. Ensure orders are successfully written to MongoDB

    * The IP of your service will be publicly available on the internet
    * The service has a Swagger/OpenAPI definition: http://[Loadbalancer IP]/swagger.
    * The service has an orders endpoint which accepts GET and POST: http://[Loadbalancer IP]/v1/order

5. Store Loadbalancer IP in Environment variables

    Get Ip of Loadbalancer IP
    ```bash
    LB_IP_ADDRESS=$(kubectl get service captureorder -o jsonpath="{.status.loadBalancer.ingress[*].ip}")

    echo export LB_IP_ADDRESS=$LB_IP_ADDRESS >> ~/.bashrc
    ```
    
6. Send a POST request to store some data

    Orders take the form {"EmailAddress": "email@domain.com", "Product": "prod-1", "Total": 100} (The values are not validated)

    Send a POST request using curl

    ```bash
    curl -d '{"EmailAddress": "email@domain.com", "Product": "prod-1", "Total": 100}' -H "Content-Type: application/json" -X POST http://${LB_IP_ADDRESS}/v1/order
    ```

    You can expect the order ID returned by API once your order has been written into Mongo DB successfully
    
    ```bash
    {
      "orderId": "5e8c79ea44c13a0001953dc6"
    }
    ```

## Architecture Diagram
Here’s a high level diagram of the components you will have deployed when you’ve finished this section

![Architecture Diagram](/labs/ordercapture-api/img/captureorder.png "Architecture Diagram")

## Docs / References

* https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
* https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
* https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#define-container-environment-variables-using-secret-data
* https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
* https://kubernetes.io/docs/concepts/services-networking/service/
* https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#configuration-file
* https://aksworkshop.io/

#### Next Lab: [Build and deploy fronted app](../frontend-app/README.md)