Lab: Scaling Cluster and Applications
==
As the popularity of the application grows, the application needs to scale appropriately as demand changes. Ensure the application remains responsive as the number of order submissions increases.

In this lab we will scale our application in various ways including scaling our deployment and the AKS cluster.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Order Capture API](labs/ordercapture-api/README.md)
    * [Build and deploy fronted app](/labs/frontend-app/README.md)
    * [Deploy the frontend app using Ingress](/labs/ingress/README.md)
* [Kubernetes metric server](https://github.com/kubernetes-sigs/metrics-server)
    > If you are on Azure environment the metric server provisioned by AKS automatically

## Instructions

### Scale application manually

1. In this step, we will scale out our deployment manually

    ```
    kubectl scale deployment captureorder --replicas=3
    ```

2. Validate the number of pods is now 3

    ```
    kubectl get pod -l app=captureorder
    ```

### Horizontal Pod Autoscaler (HPA)

The Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales the number of pods in a `replication controller, deployment or replica set` based on observed CPU utilization (or, with custom metrics support, on some other application-provided metrics)

* [The Horizontal Pod Autoscaler (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) is a way for deployments to scale their pods out automatically based on metrics such as `CPU utilization`.

* There are two versions of the HPA object - `autoscaling/v1` and `autoscaling/v2beta2`. The `v2beta2` adds support for multiple metrics, custom metrics and other features. For this section though, the capabilities of the v1 version are sufficient.

* The `kubectl autoscale` command can easily set up a HPA for any deployment and you can easily get yaml definition by

    ```
    kubectl autoscale deployment <deployment-name> --cpu-percent=50 --min=1 --max=10 --dry-run -o yaml
    ```
* For the HPA to work, you must add resource limits to your captureorder deployment. Check `apps/captureorder/manifests/deployment.yaml`

1. Check kube metric server is enabled

    ```
    kubectl top nodes
    kubectl top pod

    kubectl cluster-info
    ```

2. Deploy the HPA resource

    ```
    kubectl apply -f apps/captureorder/manifests/hpa.yaml
    ```
    
    > **Important**: For the Horizontal Pod Autoscaler to work, you **MUST** define requests and limits in the Capture Order API’s deployment.

3. Check HPA object

    ```
    kubectl get hpa
    kubectl describe hpa captureorder
    ```

4. There is a container image on Docker Hub `(azch/loadtest)` that is preconfigured to run the load test. We will use this image for hpa seeing in action via Azure Container Instance

    ```
    az container create -g $RG_NAME -n loadtest --image azch/loadtest --restart-policy Never -e SERVICE_ENDPOINT=http://${LB_IP_ADDRESS}/v1/order
    ```

    to see container logs:

    ```
    az container logs -g $RG_NAME -n loadtest --follow
    ```

5. Observe your Kubernetes cluster reacting to the load by running

    ```
    kubectl get pods -l  app=captureorder
    ```

    > **NOTE:** HPA's min replica count will override the deployment replica count. So if you define 3 replicas on deployment and the hpa `minReplicas` count is 1; the deployment decreases replica count to 1 via `replicaset`

6. Delete load test container

    ```
    az container delete -g $RG_NAME -n loadtest
    ```
    Make note of results (sample below), figure out what is the breaking point for the number of users.

### Cluster scaling Manual

1. Scaling is super simple and can be performed in the portal or via the CLI. 

    If your AKS cluster is not configured with the cluster autoscaler, scale the cluster nodes using the command below to the required number of nodes

    ```
    az aks scale --name $CLUSTER_NAME --resource-group $RG_NAME --node-count 5
    ```

2. Validate that 5 nodes are now available in the cluster

    ```
    kubectl get nodes -o wide
    ```

### Cluster Autoscaler

As resource demands increase, the cluster autoscaler allows your cluster to grow to meet that demand based on constraints you set. The cluster autoscaler (CA) does this by scaling your agent nodes based on pending pods.

If you configured your AKS cluster with cluster autoscaler, you should see it dynamically adding and removing nodes based on the cluster utilization. To change the node count, use the az aks update command and specify a minimum and maximum value. The following example sets the `--min-count` to *1* and the `--max-count` to *5*:

```
az aks update \
  --resource-group $RG_NAME \
  --name $CLUSTER_NAME \
  --update-cluster-autoscaler \
  --min-count 1 \
  --max-count 5
```

To enable Cluster Autoscaler:

```
az aks update \
   --resource-group $RG_NAME \
   --name $CLUSTER_NAME \
   --enable-cluster-autoscaler \
   --min-count 3
   --max-count 5
```

To disable Cluster Autoscaler

```
az aks update \
  --resource-group $RG_NAME \
  --name $CLUSTER_NAME \
  --disable-cluster-autoscaler
```