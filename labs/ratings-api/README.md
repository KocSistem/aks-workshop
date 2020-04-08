Section 4: Build and deploy the Ratings API
==

In this guide, you will build Ratings API and push to ACR. The ratings API is a Node.js application that's built using Express, a Node.js web framework. With this image you will deploy API to Kubernetes cluster.The application will need to write to the MongoDB instance you deployed earlier.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)

![Ratings API Architecture](/labs/ratings-api/img/ratingsapi-architecture.svg "Ratings API Architecture")

## Environment Variables
The Ratings API requires mongodb uri to connect to your MongoDB database. You should use the Kubernetes secrets you created earlier to populate the values in the environment variables.

* MONGODB_URI="[mongodb-hostname]"

> The application exposes a health check endpoint at `/healthz`. If the API is unable to connect to MongoDB, the health check endpoint returns a failure. You can use these probes to configure Kubernetes and check whether the container is healthy and ready to receive traffic.

## Instructions

1. Build the Ratings API image

    In this step we will create a Docker container image for Ratings API. We will use ACR builder functionality to build and store the image in the cloud.

    ```bash
    az acr build -t ksdemo/ratings-api:1.0 -r $ACR_NAME --no-logs -o json apps/ratings-api
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACR_NAME -o table

    az acr task logs -r $ACR_NAME --run-id {{ .ImageId }}
    ```
2. Run the following command in Cloud Shell to verify that the images were created and stored in the registry.

    ```bash
    az acr repository list \
    --name $ACR_NAME \
    --output table
    ```

3. Deploy the Capture Order API

    ### Task Hints
    
    * The ratings API expects to find the connection details to the MongoDB database in an environment variable named `MONGODB_URI`. By using `valueFrom` and `secretKeyRef`, you can reference values stored in mongosecret, the Kubernetes secret that was created when you deployed MongoDB.

    * The container listens on port 3000

    * If your pods are not starting, not ready or are crashing, you can view their logs and detailed status information using `kubectl logs <pod name> -n ratingsapp` and/or `kubectl describe pod <pod name> -n ratingsapp`

    * The deployment defines a [`readinessProbe` and `livenessProbe`](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) using the `/healthz` endpoint exposed by the container and the port `3000`, this is optional but considered to be a best practice

    * The deployment also defines requests and limits to control the CPU and memory utilisation of your containers.

    Deploy Ratings API with

    ```bash
    kubectl apply \
        -f apps/ratings-api/manifests/deployment.yaml
    ```
    Verify that the pods are up and running

    ```bash
    kubectl get pods \
        --namespace ratingsapp \
        -l app=ratings-api -w
    ```

    Wait until you see pods are in the `Running` state.

4. Check the status of the deployment.

    ```
    kubectl get deployment ratings-api --namespace ratingsapp
    ```

    The deployment should show that one replica is ready.

    ```
    NAME          READY   UP-TO-DATE   AVAILABLE   AGE
    ratings-api   1/1     1            1           2m
    ```

5. Expose the Capture Order API deployment with service

    ### Task Hints

    * A service is a Kubernetes object that provides stable networking for Pods by exposing them as a network service. You use Kubernetes Services to enable communication between nodes, pods, and users of your application, both internal and external, to your cluster. A Service, just like a node or Pod, gets an IP address assigned by Kubernetes when you create them. Services are also assigned a DNS name based on the service name, and a TCP port.

    * Create a service with type `ClusterIP`

        ```bash
        kubectl apply -f apps/ratings-api/manifests/service.yaml
        ```

6. Check the status of the service.

    ```bash
    kubectl get service ratings-api --namespace ratingsapp
    ```
    The service should show an internal IP where it would be accessible. By default, Kubernetes creates a DNS entry that maps to [service name].[namespace].svc.cluster.local, which means this service is also accessible at `ratings-api.ratingsapp.svc.cluster.local`. Notice how CLUSTER-IP comes from the Kubernetes service address range you defined when you created the cluster.

7. Finally, let's validate the endpoints. Services load balance traffic to the pods through endpoints. The endpoint has the same name as the service. Validate that the service points to one endpoint that corresponds to the pod. As you add more replicas, or as pods come and go, Kubernetes automatically keeps the endpoints updated. Run the kubectl get endpoints command to fetch the endpoint information.

    ```bash
    kubectl get endpoints ratings-api --namespace ratingsapp
    ```

## Docs / References

* https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
* https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
* https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#define-container-environment-variables-using-secret-data
* https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
* https://kubernetes.io/docs/concepts/services-networking/service/
* https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#configuration-file
* https://aksworkshop.io/

#### Next Lab: [Build and deploy ratings web app](../ratings-web/README.md)