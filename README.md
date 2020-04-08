Azure Kubernetes Workshop Guide 
===

In this guide, you'll go through tasks that will help you master the basic and more advanced topics required to deploy a multi-container application to Kubernetes on [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/services/kubernetes-service/).

Some of the things you'll be going through:

* Create an Azure Kubernetes Service cluster
* Deploy a MongoDB document database using Helm version 3
* Kubernetes deployments, services and ingress
* Create a private, highly available container registry
* Azure Monitor for Containers, Horizontal Pod Autoscaler(HPA) and Cluster Autoscaler
* Logging with Elasticsearch / Fluentbit / Kibana stack
* Service Mesh with Linkerd

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
3. Deploy the three ratings application components.
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
1. [Create AKS Cluster](labs/create-aks-cluster/README.md)
2. [Deploy MongoDB via Helm 3](labs/deploy-mongodb/README.md)
3. [Create a private highly available Container Registry](labs/azure-container-registry/README.md)
4. [Build and deploy Ratings API](labs/ratings-api/README.md)
5. [Build and deploy Ratings Web APP](/labs/ratings-web/README.md)
6. [Deploy the Ratings web APP using Ingress](/labs/ingress/README.md)
7. [Enable SSL/TLS on the Ratings web APP Ingress](/labs/tls-ingress/README.md)

#### Additional exercises:
* [Enable TLS(SSL) on Ingress](labs/tls-ingress/README.md)
* [Scaling Cluster and Applications](labs/scaling/README.md)
* [CI/CD Automation](labs/cicd-automation/README.md)
* [Logging with EFK](labs/efk/README.md)
* [Networking](labs/networking/README.md)
* [Monitoring with prometheus/alertmanager/grafana](labs/monitoring/README.md)
* [Security](labs/security/README.md)
* [Monitoring and Logging](labs/monitoring-logging/README.md)
* [Best Practices for Cluster Operators](labs/best-practices/operators/README.md)
* [Best Practices for App Developers](labs/best-practices/appdev/README.md)

#### Coming soon:
* [Storage](labs/storage/README.md)
* [Provisioning via Terraform](labs/terraform-provisioning/README.md)
* [Service Broker](labs/service-broker/README.md)