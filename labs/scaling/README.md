Section: Scaling Cluster and Applications
==
As the popularity of the application grows, the application needs to scale appropriately as demand changes. Ensure the application remains responsive as the number of order submissions increases.

With increased traffic, the `ratings-api` container is unable to cope with the number of requests coming through. To fix the bottleneck, you can deploy more instances of that container.

In this lab we will `scale out` our application in various ways including scaling our deployment and the AKS cluster.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Ratings API](labs/ratings-api/README.md)
    * [Build and deploy Ratings Web APP](/labs/ratings-web/README.md)
    * [Deploy the Ratings web APP using Ingress](/labs/ingress/README.md)
    * [Enable SSL/TLS on the Ratings web APP Ingress](/labs/tls-ingress/README.md)

* The [Metrics Server](https://github.com/kubernetes-incubator/metrics-server) is used to provide resource utilization to Kubernetes, and is automatically deployed in AKS clusters versions 1.10 and higher.

![Cluster Autoscaler and HPA](/labs/scaling/img/cluster-autoscaler.png "Cluster Autoscaler and HPA")

## Instructions

### Scale application manually

1. In this step, we will scale out our deployment manually

    ```
    kubectl scale deployment ratings-api -n ratingsapp --replicas=3
    ```

2. Validate the number of pods is now 3

    ```
    kubectl get pod -n ratingsapp -l app=ratings-api -w
    ```

### Horizontal Pod Autoscaler (HPA)

The Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales the number of pods in a `replication controller, deployment or replica set` based on observed CPU utilization (or, with custom metrics support, on some other application-provided metrics)

* [The Horizontal Pod Autoscaler (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) is a way for deployments to scale their pods out automatically based on metrics such as `CPU utilization`.

* There are two versions of the HPA object - `autoscaling/v1` and `autoscaling/v2beta2`. The `v2beta2` adds support for multiple metrics, custom metrics and other features. For this section though, the capabilities of the v1 version are sufficient.

    > Note: `autoscaling/v1` only works for CPU based metrics, `autoscaling/v2beta2` works for both memory and cpu utilization

* The `kubectl autoscale` command can easily set up a HPA for any deployment and you can easily get yaml definition by

    ```
    kubectl autoscale deployment ratings-api -n ratingsapp --cpu-percent=30 --min=1 --max=10 --dry-run -o yaml
    ```
* For the HPA to work, you must add resource limits to your captureorder deployment.

    ```bash
    # Check ratings-api deployment's limits
    kubectl get deploy ratings-api -n ratingsapp -o jsonpath="{.spec.template.spec.containers[0].resources.limits}"

    # Check captureorder deployment's requests
    kubectl get deploy ratings-api -n ratingsapp -o jsonpath="{.spec.template.spec.containers[0].resources.requests}"
    ```

1. Check the metric server is enabled

    ```
    kubectl top nodes
    kubectl top pod

    kubectl cluster-info
    ```

2. Deploy the HPA resource

    ```
    kubectl apply -f apps/ratings-api/manifests/hpa/hpa-v2beta.yaml
    ```
    
    > **Important**: For the Horizontal Pod Autoscaler to work, you **MUST** define requests and limits in the Capture Order API’s deployment.

3. Check HPA object

    ```
    kubectl get hpa -n ratingsapp
    kubectl describe hpa ratings-api -n ratingsapp
    ```
## Run a load test with horizontal pod autoscaler enabled
To create the load test, you can use a prebuilt image called azch/artillery that's available on Docker hub. The image contains a tool called artillery that's used to send traffic to the API. Azure Container Instances can be used to run this image as a container.

1. In Azure Cloud Shell, store the front-end API load test endpoint in a Bash variable and replace `<frontend hostname>` with your exposed ingress host name, for example, https://frontend.13-68-177-68.nip.io.

    ```
    LOADTEST_API_ENDPOINT=https://<frontend hostname>/api/loadtest
    ```
2. Run the load test by using the following command, which sets the duration of the test to 120 seconds to simulate up to 500 requests per second.

    ```bash
    az container create \
        -g $RG_NAME \
        -n loadtest \
        --cpu 4 \
        --memory 1 \
        --image azch/artillery \
        --restart-policy Never \
        --command-line "artillery quick -r 500 -d 120 $LOADTEST_API_ENDPOINT"
    ```

    to see container logs:

    ```
    az container logs -g $RG_NAME -n loadtest --follow
    ```

3. Observe your Kubernetes cluster reacting to the load by running

    ```
    kubectl get pods -n ratingsapp -l  app=ratings-api
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

The cluster autoscaler may be unable to scale down if pods can't move, such as in the following situations:

 * A pod is directly created and isn't backed by a controller object, such as a deployment or replica set.
 * A pod disruption budget (PDB) is too restrictive and doesn't allow the number of pods to be fall below a certain threshold.
 * A pod uses node selectors or anti-affinity that can't be honored if scheduled on a different node.

 If you configured your AKS cluster with cluster autoscaler, you should see it dynamically adding and removing nodes based on the cluster utilization. To change the node count, use the az aks update command and specify a minimum and maximum value. The following example sets the `--min-count` to *1* and the `--max-count` to *5*:

### Updating Cluster Autoscaler

```
az aks update \
  --resource-group $RG_NAME \
  --name $CLUSTER_NAME \
  --update-cluster-autoscaler \
  --min-count 1 \
  --max-count 5
```

### Enable Cluster Autoscaler

```
az aks update \
   --resource-group $RG_NAME \
   --name $CLUSTER_NAME \
   --enable-cluster-autoscaler \
   --min-count 3
   --max-count 5
```

The cluster autoscaler will also write out health status to a `configmap` named `cluster-autoscaler-status`. To retrieve these logs, execute the following `kubectl` command. A health status will be reported for each node pool configured with the cluster autoscaler.

```
kubectl get configmap -n kube-system cluster-autoscaler-status -o yaml
```

### Disable Cluster Autoscaler

```
az aks update \
  --resource-group $RG_NAME \
  --name $CLUSTER_NAME \
  --disable-cluster-autoscaler
```

## Docs / References

* https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-scale
* https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale
* https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container
* https://docs.microsoft.com/en-us/azure/aks/autoscaler
* https://aksworkshop.io