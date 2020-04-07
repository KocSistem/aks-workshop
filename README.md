Azure Kubernetes Workshop Guide 
===

In this guide, you'll go through tasks that will help you master the basic and more advanced topics required to deploy a multi-container application to Kubernetes on [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/services/kubernetes-service/?wt.mc_id=aksworkshop).

Some of the things you'll be going through:

* Kubernetes deployments, services and ingress
* Deploying MongoDB using Helm version 3
* Provision Azure Container Registry and push / pull your private docker images
* Azure Monitor for Containers, Horizontal Pod Autoscaler(HPA) and Cluster Autoscaler
* Service Mesh with Linkerd

## Prerequisites 
The following are the basic requirements to **start** the labs. Individual labs may have other requirements that will be listed within the lab.

* Azure Account [Azure Portal](https://portal.azure.com)
* Git [Git SCM](https://git-scm.com/downloads)
* Azure Cloud Shell [Cloud Shell](https://shell.azure.com)

## Application Overview
You will be deploying a customer-facing order placement and fulfillment application that is containerized and is architected for a microservice implementation.

![Application overview](/assets/img/application-overview.png "Application overview")

The application consists of 3 components:

* A public facing Order Capture swagger enabled API
* A public facing frontend
* A MongoDB database

## Labs

#### Start with:
1. [Create AKS Cluster](labs/create-aks-cluster/README.md)
2. [Deploy MongoDB via Helm 3](labs/deploy-mongodb/README.md)
3. [Provision Azure Container Registry](labs/azure-container-registry/README.md)
4. [Build and deploy Order Capture API](labs/ordercapture-api/README.md)

#### Additional exercises:
* [CI/CD Automation](labs/cicd-automation/README.md)
* [Networking](labs/networking/README.md)
* [Monitoring with prometheus/alertmanager/grafana](labs/monitoring/README.md)
* [Security](labs/security/README.md)
* [Monitoring and Logging](labs/monitoring-logging/README.md)
* [Scaling Cluster and Applications](labs/scaling/README.md)
* [Best Practices for Cluster Operators](labs/best-practices/operators/README.md)
* [Best Practices for App Developers](labs/best-practices/appdev/README.md)

#### Coming soon:
* [Storage](labs/storage/README.md)
* [Provisioning via Terraform](labs/terraform-provisioning/README.md)
* [Service Broker](labs/service-broker/README.md)

## Overall Architecture

At the end of guide; 

* You will have an ingress controller with TLS/SSL enabled.
* A Nodejs application and golang application which they implemented as containerized applications
* A MongoDB which installed via Helm version 3
* Azure Container Registry for storing your docker images
* Horizontal Pod Autoscaler with CPU based rule
* Monitoring your **Nodes** and **Containers** via Prometheus / Alertmanager /cAdvisor and Grafana visualization

![Overall architecture](/assets/img/overall-architecture.png "Overall architecture diagram")