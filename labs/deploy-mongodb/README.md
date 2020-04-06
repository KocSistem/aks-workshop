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
