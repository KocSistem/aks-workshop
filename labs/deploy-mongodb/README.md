Lab 2: Deploy MongoDB
==
You need to deploy MongoDB in a way that is scalable and production ready.

## Prerequisites

- [Helm version 3](https://helm.sh/blog/helm-3-released/)

Helm is an application package manager for Kubernetes, and a way to easily deploy applications and services into Kubernetes, via what are called charts. To use Helm you will need the helm command (This is already installed if you’re using the Azure Cloud Shell).

## Tools
* Use Helm and a standard provided Helm chart to deploy MongoDB.
* Be careful with the authentication settings when creating MongoDB. It is recommended that you create a standalone username/password. The username and password can be anything you like, but make a note of them for the next task.

> **Important**: If you install using Helm and then delete the release, the MongoDB data and configuration persists in a Persistent Volume Claim. You may face issues if you redeploy again using the same release name because the authentication configuration will not match. If you need to delete the Helm deployment and start over, make sure you delete the Persistent Volume Claims created otherwise you'll run into issues with authentication due to stale configuration. Find those claims using `kubectl get pvc`.

## Instructions

1. Helm version 3 does not come with any repositories predefined, so you’ll need initialize the [stable chart repository](https://v3.helm.sh/docs/intro/quickstart/#initialize-a-helm-chart-repository).

    Add the stable Helm charts repository 

    ```bash
    helm repo add stable https://kubernetes-charts.storage.googleapis.com/
    ```

    Once this is installed, you will be able to list the charts you can install:
    ```bash
    helm search repo stable
    ````

    For update the repository use `helm repo update`

2. Deploy an instance of MongoDB to your cluster

    ### Hints
    * When installing a chart, Helm uses a concept called a **release** and each release needs a name. We recommend you name your release orders-mongo to make it easier to follow later steps in this workshop
    * When deploying a chart you provide parameters with the --set switch and a comma separated list of key=value pairs. There are MANY parameters you can provide to the MongoDB chart, but pay attention to the mongodbUsername, mongodbPassword and mongodbDatabase parameters

    > **Note** The application expects a database named **akschallenge**. Using a different database name will cause the application to fail!

    ```bash
    helm install orders-mongo stable/mongodb --set mongodbUsername=orders-user,mongodbPassword=orders-password,mongodbDatabase=akschallenge
    ```
3. Create a Kubernetes secret to hold the MongoDB details

    ### Hints
    * The name of secrets are;
        > mongoHost

        > mongoUser
        
        > mongoPassword
    * All services in Kubernetes get DNS names vie kube-dns. You can use the fully qualified form **servicename.namespace.svc.cluster.local** In this demo it will be, `orders-mongo-mongodb.default.svc.cluster.local`

    ```bash
    kubectl create secret generic mongodb --from-literal=mongoHost="orders-mongo-mongodb.default.svc.cluster.local" --from-literal=mongoUser="orders-user" --from-literal=mongoPassword="orders-password"
    ```

    execute `kubectl get secret`. If the response includes **orders-mongo-mongodb** secret; just delete it

    ```bash
    kubectl delete secret orders-mongo-mongodb
    ```

    --from-literal parameter allows you to provide the secret values directly on the command in plain text. Another way is provide values from file via using `--from-file` command.

    You will need to refernce this secret when configuring Order Capture application later on.

## Architecture Diagram
Here’s a high level diagram of the components you will have deployed when you’ve finished this section

![Architecture Diagram](/labs/deploy-mongodb/img/mongo.png "Architecture Diagram")

* The **pod** holds the containers that run MongoDB
* The **deployment** supervisor of pod
* THe **service** exposes the pod to the Internet using a public IP address and a specified port