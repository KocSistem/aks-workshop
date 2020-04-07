Lab 2: Deploy MongoDB
==
In this section we will deploy MongoDB via using Helm.

[Helm](https://helm.sh/) is an application package manager for Kubernetes such as apt or yum package managers, and a way to easily deploy applications and services into Kubernetes, via what are called charts. To use Helm you will need the helm command

> This is already installed if you're using the Azure Cloud Shell.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)

* [Helm version 3](https://helm.sh/blog/helm-3-released/)

## Tools
* Use Helm and a standard provided Helm chart to deploy MongoDB.

* Be careful with the authentication settings when creating MongoDB. It is recommended that you create a standalone username/password. The username and password can be anything you like, but make a note of them for the next task.

    > **Important**: If you need to delete the Helm deployment and start over, make sure you delete the Persistent Volume Claims created otherwise you'll run into issues with authentication due to stale configuration. Find those claims using `kubectl get pvc` and use `kubectl delete pvc <pvc-name>`.

    > Helm will instal Persistent Volume with `delete` [reclaim policy](https://kubernetes.io/docs/concepts/storage/persistent-volumes/). So if you delete the pvc it deletes pv as well

## Instructions

1. Add stable repositories to helm

    > Helm version 3 does not come with any repositories predefined, so you’ll need initialize the [stable chart repository](https://v3.helm.sh/docs/intro/quickstart/#initialize-a-helm-chart-repository).

    Add the stable Helm charts repository 

    ```bash
    helm repo add stable https://kubernetes-charts.storage.googleapis.com/
    ```

    Once this is installed, you will be able to list the charts you can install:

    ```bash
    helm search repo stable
    ```

    For update the repository use

    ```bash 
    helm repo update
    ```

2. Deploy an instance of MongoDB to your cluster via helm

    ### Hints
    * When installing a chart, Helm uses a concept called a **release** and each release needs a name. We recommend you name your release orders-mongo to make it easier to follow later steps in this guide

    * When deploying a chart there are MANY parameters you can provide to the MongoDB chart, but pay attention mongodbUsername, mongodbPassword and mongodbDatabase parameters

    > **Note** The application expects a database named **akschallenge**. Using a different database name will cause the application to fail!

    Initialize MongoDB with helm charts

    ```bash
    helm install orders-mongo stable/mongodb --set mongodbUsername=orders-user,mongodbPassword=orders-password,mongodbDatabase=akschallenge
    ```

3. Create a Kubernetes secret to hold the MongoDB details

    A Secret is an object that contains a small amount of sensitive data such as a password, a token, or a key. Such information might otherwise be put in a Pod specification or in an image.
    
    Kubernetes stores secrets with `base64` format

    * The name of secrets are;
        * mongoHost
        * mongoUser
        * mongoPassword

    * All services in Kubernetes get DNS names via kube-dns. You can use the fully qualified form **servicename.namespace.svc.cluster.local** In this demo it will be, `orders-mongo-mongodb.default.svc.cluster.local`

    To create a secret:

    ```bash
    kubectl create secret generic mongodb --from-literal=mongoHost="orders-mongo-mongodb.default.svc.cluster.local" --from-literal=mongoUser="orders-user" --from-literal=mongoPassword="orders-password"
    ```
    > **Note:** Helm chart may have installed another secret named **orders-mongo-mongodb**. If its installed just delete it.

    ```bash
    kubectl delete secret orders-mongo-mongodb
    ```

    --from-literal parameter allows you to provide the secret values directly on the command in plain text. Another way is provide values from file via using `--from-file` command.

    You will need to refernce this secret when configuring Order Capture API later on.

## Architecture Diagram
Here's a high level diagram of the components you will have deployed when you’ve finished this section

![Architecture Diagram](/labs/deploy-mongodb/img/mongo.png "Architecture Diagram")

* The **pod** holds the containers that run MongoDB
* The **deployment** supervisor of pod
* THe **service** exposes the pod to the Internet using a public IP address and a specified port

## Docs / References

* https://helm.sh/docs/intro/using_helm/
* https://github.com/helm/charts/tree/master/stable/mongodb
* https://kubernetes.io/docs/concepts/configuration/secret/
* https://kubernetes.io/docs/concepts/storage/persistent-volumes/
* https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/

#### Next Lab: [Provision Azure Container Registry](../azure-container-registry/README.md)