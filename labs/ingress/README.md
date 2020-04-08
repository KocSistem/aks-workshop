Lab 6: Deploy the frontend app using Ingress
==

In this guide, you will deploy a Kubernetes Ingress Controller.

Instead of accessing the frontend through an IP address, you would like to expose the frontend using a hostname. Explore using [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) to achieve this.

There are many options when considering Kubernetes ingress controllers, including the [Azure Application Gateway Ingress Controller](https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview) The most commonly used is the [nginx-ingress](https://github.com/helm/charts/tree/master/stable/nginx-ingress) controller.

> The Ingress controller is exposed to the internet by using a Kubernetes service of type `LoadBalancer`. The Ingress controller watches and implements Kubernetes Ingress resources, which creates routes to application endpoints.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Ratings API](labs/ratings-api/README.md)
    * [Build and deploy Ratings Web APP](/labs/ratings-web/README.md)

## Tools
* [nip.io](https://nip.io/) is reverse wildcard DNS resolver service to map our ingress controller's LoadBalancerIP to a proper DNS name.

## Instructions

1. Create a namespace for the ingress

    Namespaces allow you to group objects together so you can filter and control them as a unit.

    Creating a Namespace can be done with a single command.

    ```bash
    kubectl create namespace ingress
    ```

2. Deploy the NGINX ingress controller via helm

    ## Task Hints
    
    * When placing services behind an ingress you don't expose them directly with the LoadBalancer type, instead you use a ClusterIP. In this network model, external clients access your service via public IP of the ingress controller, which then decides where to route the traffic within your Kubernetes cluster.

        ![Kubernetes Ingress Architecture](/labs/ingress/img/ingress.png "Kubernetes Ingress Architecture")

    * Use Helm to deploy The NGINX ingress controller. The Helm chart for the NGINX ingress controller requires no options/values when deploying it.

    * Place the ingress controller in a different namespace, e.g. `ingress` by using the `--namespace` option.

        > we already updated helm repo. But in case, let's execute update command again.`helm repo update`
    
        Deploy NGINX ingress with helm charts

        ```bash
        helm install ingress stable/nginx-ingress --namespace ingress
        ```

        In a couple of minutes, a public IP address will be allocated to the ingress controller, retrieve with:

        ```bash
        kubectl get svc  -n ingress    ingress-nginx-ingress-controller -o jsonpath="{.status.loadBalancer.ingress[*].ip}"
        ```
3. Store Ingress Loadbalancer IP in Environment variables

    ```bash
    INGRESS_LB_IP=$(kubectl get svc  -n ingress    ingress-nginx-ingress-controller -o jsonpath="{.status.loadBalancer.ingress[*].ip}")

    echo export INGRESS_LB_IP=$INGRESS_LB_IP >> ~/.bashrc

    ```

4. Create an Ingress resource

    Make sure to replace _INGRESS_CONTROLLER_EXTERNAL_IP_ with the IP address you retrieved from the previous command.

    ```bash
    kubectl apply -f deploy/manifests/ingress/frontend-ingress.yaml
    ```
5. Browse to the public hostname of the frontend and watch as the number of orders change

    Once the Ingress is deployed, you should be able to access the frontend at http://frontend.[cluster_specific_dns_zone], for example http://frontend.52.255.217.198.nip.io

    If it doesn’t work on the first attempt, give it a few more minutes or try a different browser.

    > Note: you might need to enable cross-site scripting in your browser; click on the shield icon on the address bar (for Chrome) and allow unsafe script to be executed.

    ![Frontend Ingress output](/labs/ingress/img/ordersfrontend.png "Frontend Ingress output")

    ## Docs / References

* https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
* https://kubernetes.io/docs/concepts/services-networking/service/
* https://kubernetes.io/docs/concepts/services-networking/ingress/
* https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
* https://nip.io/
* https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview
* https://aksworkshop.io/

        