Azure Kubernetes Service Workshop 
===

In this workshop, you'll go through tasks that will help you master the basic and more advanced topics required to deploy a multi-container application to Kubernetes on [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/services/kubernetes-service/)

Some of the things you'll be going through:

* Create an Azure Kubernetes Service cluster
*Choose the best deployment options for your Pods
*Expose Pods to internal and external network users
*Configure SSL/TLS for Azure Kubernetes Service ingress
*Monitor the health of an Azure Kubernetes Service cluster
*Scale your application in an Azure Kubernetes Service cluster

## Prerequisites 
The following are the basic requirements to **start** the labs. Individual labs may have other requirements that will be listed within the lab.

* Azure Account [Azure Portal](https://portal.azure.com)
* Git [Git SCM](https://git-scm.com/downloads)
* Azure Cloud Shell [Cloud Shell](https://shell.azure.com)

## Application Architecture
Our goal is to deploy an Azure managed Kubernetes service that runs the Fruit Smoothies ratings website in the following series of exercises.

![Application Architecture](/assets/img/application-architecture.svg "Application Architecture")

There are several tasks that you'll complete to show how Kubernetes abstracts away complex container management and provides you with declarative configuration to orchestrate containers.

1. Use AKS to deploy a Kubernetes cluster.
2. Configure an Azure Container Registry to store application container images.
3. Deploy the rating application components.
4. Deploy Azure Kubernetes ingress using Helm
5. Configure SSL/TLS on the controller using `cert-manager`
6. Configure Azure Monitor for containers to monitor the Fruit Smoothies website deployment.
7. Configure cluster autoscaler and horizontal pod autoscaler for the Fruit Smoothies cluster.

## Application Overview

![Application Overview](/assets/img/application-overview.svg "Application Overview")

The application consists of 3 components:
* A MongoDB document database
* A public facing Rating RESTFul API
* A public facing frontend application

## Labs

#### Start with:
1. [Exercise - Deploy Kubernetes with Azure Kubernetes Servicer](labs/create-aks-cluster/README.md)
2. [Exercise - Create a private, highly available container registry](labs/azure-container-registry/README.md)
3. [Exercise - Deploy MongoDB](labs/deploy-mongodb/README.md)
4. [Exercise - Deploy the ratings API](labs/ratings-api/README.md)
5. [Exercise - Deploy the ratings front end](/labs/ratings-web/README.md)
6. [Exercise - Deploy an ingress for the front end](/labs/ingress/README.md)
7. [Exercise - Enable SSL/TLS on the front-end ingress](/labs/tls-ingress/README.md)
8. [Exercise - Configure monitoring for your application](/labs/monitoring/README.md)
9. [Exercise - Scale your application to meet demand](/labs/scaling/README.md)
10. [Summary and cleanup](/labs/cleanup/README.md)