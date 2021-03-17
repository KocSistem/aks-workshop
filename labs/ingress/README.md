Section 6: Deploy the Ratings web APP using Ingress
==

In this guide, you will deploy a Kubernetes Ingress Controller.

If you continue to use the load balancer solution, you'll need to deploy a separate load balancer on the cluster and map its IP address to a new fully qualified domain name (FQDN), for example, ks.ratings.com. To implement the required URL-based routing configuration, you'll need to install additional software outside of your cluster.

The extra effort is that a Kubernetes load balancer service is a Layer 4 load balancer. Layer 4 load balancers only deal with routing decisions between IPs addresses, TCP, and UDP ports. Kubernetes provides you with an option to simplify the above configuration by using an ingress controller.

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

![Ingress Controller Architecture](/labs/ingress/img/ingress-architecture.svg "Ingress Controller Architecture")

## Tools
* [nip.io](https://nip.io/) is reverse wildcard DNS resolver service to map our ingress controller's LoadBalancerIP to a proper DNS name.

# Deploy a Kubernetes ingress controller running NGINX
A Kubernetes ingress controller is software that provides layer 7 load balancer features. These features include reverse proxy, configurable traffic routing, and TLS termination for Kubernetes services. You install the ingress controller and configure it to replace the load balancer. With the ingress controller, you can now do all load balancing, authentication, TSL/SSL, and URL-based routing configuration without the need for extra software outside of the cluster.



## Instructions

1. Start by creating a namespace for the ingress.

    Namespaces allow you to group objects together so you can filter and control them as a unit.

    Creating a Namespace can be done with a single command.

    ```bash
    kubectl create namespace ingress
    ```

2. Deploy the NGINX ingress controller via Helm

    ## Task Hints
    
    * When placing services behind an ingress you don't expose them directly with the LoadBalancer type, instead you use a ClusterIP. In this network model, external clients access your service via public IP of the ingress controller, which then decides where to route the traffic within your Kubernetes cluster.


    * Use Helm to deploy The NGINX ingress controller. The Helm chart for the NGINX ingress controller requires no options/values when deploying it.

    * Place the ingress controller in a different namespace, e.g. `ingress` by using the `--namespace` option.

        Add the stable Helm charts repository

         ```bash
        helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
        ```
        
        For update the repository use

         ```bash
        helm repo update
        ``` 
         
        Deploy NGINX ingress with helm charts

        ```bash
        helm install nginx-ingress ingress-nginx/ingress-nginx \
            --namespace ingress \
            --set controller.replicaCount=2 \
            --set controller.nodeSelector."beta\.kubernetes\.io/os"=linux \
            --set defaultBackend.nodeSelector."beta\.kubernetes\.io/os"=linux
        ```

        In a couple of minutes, a public IP address will be allocated to the ingress controller, retrieve with:

        ```bash
        kubectl get svc  -n ingress    nginx-ingress-ingress-nginx-controller -o jsonpath="{.status.loadBalancer.ingress[*].ip}"
        ```

3. Store Ingress Loadbalancer IP in Environment variables

    ```bash
    INGRESS_LB_IP=$(kubectl get svc  -n ingress    nginx-ingress-ingress-nginx-controller -o jsonpath="{.status.loadBalancer.ingress[*].ip}")

    echo export INGRESS_LB_IP=$INGRESS_LB_IP >> ~/.bashrc
    ```

## Reconfigure the ratings web service to use ClusterIP
There's no need to use a public IP for the service because we're going to expose the deployment through ingress. Here, you'll change the service to use `ClusterIP` instead of `LoadBalancer`.

1. Delete the old service

    ```
    kubectl delete service \
        --namespace ratingsapp \
        ratings-web
    ```

2. Then, run the following command to re-create the service.

    ```
    kubectl apply \
        -f apps/ratings-web/manifests/ingress-service.yaml
    ```

4. Create an Ingress resource

    ```bash
    kubectl apply -f apps/ratings-web/manifests/ingress/ingress.yaml
    ```

5. Browse to the public hostname of the frontend and watch as the number of orders change

    Once the Ingress is deployed, you should be able to access the frontend at http://frontend.[cluster_specific_dns_zone], for example http://frontend.52.255.217.198.nip.io

    If it doesn’t work on the first attempt, give it a few more minutes or try a different browser.

    > Note: you might need to enable cross-site scripting in your browser; click on the shield icon on the address bar (for Chrome) and allow unsafe script to be executed.

![Output of Ingress Controller](/labs/ingress/img/ratings-web-ingress.png "Output of Ingress Controller")


## Docs / References

* https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
* https://kubernetes.io/docs/concepts/services-networking/service/
* https://kubernetes.io/docs/concepts/services-networking/ingress/
* https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
* https://nip.io/
* https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview
* https://aksworkshop.io/

#### Next Lab: [Enable SSL/TLS on the Ratings web APP Ingress](../tls-ingress/README.md)
