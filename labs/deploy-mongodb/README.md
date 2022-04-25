Exercise - Deploy MongoDB
==
In this lab, you'll deploy MongoDB to the Azure Kubernetes Service (AKS) cluster using **Helm**. You'll also see how to use a Kubernetes secret to store the MongoDB connection username and password.

[Helm](https://helm.sh/) is an application package manager for Kubernetes such as apt or yum package managers, and a way to easily deploy applications and services into Kubernetes, via what are called charts. To use Helm you will need the helm command

> This is already installed if you're using the Azure Cloud Shell.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)


## Lab overview

![Architecture Diagram](/labs/deploy-mongodb/img/mongodb-architecture.svg "Architecture Diagram")

## Tools
* Use Helm and a standard provided Helm chart to deploy MongoDB.

* Be careful with the authentication settings when creating MongoDB. It is recommended that you create a standalone username/password. The username and password can be anything you like, but make a note of them for the next task.

    > **Important**: If you need to delete the Helm deployment and start over, make sure you delete the Persistent Volume Claims created otherwise you'll run into issues with authentication due to stale configuration. Find those claims using `kubectl get pvc` and use `kubectl delete pvc <pvc-name>`.

    > Helm will instal Persistent Volume with `delete` [reclaim policy](https://kubernetes.io/docs/concepts/storage/persistent-volumes/). So if you delete the persistent volume claim, it deletes persistent volume as well

## Configure the Helm client to use stable repository

1. Add bitnami repositories to helm

    > Helm version 3 does not come with any repositories predefined, so you’ll need initialize the [stable chart repository](https://v3.helm.sh/docs/intro/quickstart/#initialize-a-helm-chart-repository).

    Add the stable Helm charts repository 

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    ```

    Once this is installed, you will be able to list the charts you can install:

    ```bash
    helm search repo bitnami
    ```

    For update the repository use

    ```bash 
    helm repo update
    ```

2. Deploy an instance of MongoDB to your cluster

    You're now ready to install the MonogoDB instance. Recall from earlier, that you configured your cluster with a `ratingsapp` namespace. You'll specify the namespace as part of the `helm install` command, and a name for the database release. The release is called `ratings` and is deployed into the `ratingsapp` namespace.

    > **Note** The application expects a database named **ratingsdb**. Using a different database name will cause the application to fail!

    Initialize MongoDB with helm charts

    ```bash
    helm install ratings bitnami/mongodb \
        --namespace ratingsapp \
        --set auth.username="ratings-user",auth.password="ratings-password",auth.database=ratingsdb
    ```

## Create a Kubernetes secret to hold the MongoDB details

1. Create secret

    Kubernetes has a concept of `secrets`. Secrets let you store and manage sensitive information, such as passwords. Putting this information in a secret is safer and more flexible than hard coding it in a pod definition or a container image.
    
    Kubernetes stores secrets in `base64` format

    * A Kubernetes secret can hold several items and is indexed by a key. In this case, the secret contains only one key, called MONGOCONNECTION. The value is the constructed connection string from the previous step. Replace <username> and <password> with the ones you used when you created the database.

    * All services in Kubernetes get DNS names via kube-dns. You can use the fully qualified form **servicename.namespace.svc.cluster.local** In this demo it will be, `ratings-mongodb.ratingsapp.svc.cluster.local`

    To create a secret:

    ```bash
    kubectl create secret generic mongosecret \
        --namespace ratingsapp \
        --from-literal=MONGOCONNECTION="mongodb://ratings-user:ratings-password@ratings-mongodb.ratingsapp.svc.cluster.local:27017/ratingsdb"
    ```

    > **Note:** Helm chart may have installed another secret named **ratings-mongodb**. If its installed just delete it.

    ```bash
    kubectl delete secret ratings-mongodb -n ratingsapp
    ```

    --from-literal parameter allows you to provide the secret values directly on the command in plain text. Another way is provide values from file via using `--from-file` command.

    You will need to reference this secret when configuring Ratings API later on.

2. Run the `kubectl describe secret` command to validate that the secret.

    ```
    kubectl describe secret mongosecret --namespace ratingsapp
    ```

## Summary
In this exercise, you configured the Helm stable repository, then used a Helm chart to deploy MongoDB to your cluster. You then created a Kubernetes secret to hold database credentials.

Next, you'll deploy the Fruit Smoothies ratings-api to your AKS cluster.

#### Next Lab: [Exercise - Deploy the ratings API](../ratings-api/README.md)

## Docs / References
* https://helm.sh/docs/intro/using_helm/
* https://github.com/helm/charts/tree/master/stable/mongodb
* https://kubernetes.io/docs/concepts/configuration/secret/
* https://kubernetes.io/docs/concepts/storage/persistent-volumes/
* https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
* https://aksworkshop.io/