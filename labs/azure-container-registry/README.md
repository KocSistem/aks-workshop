Create a private highly available Container Registry
==

Azure Container Registry is a managed Docker registry service based on the open-source Docker Registry 2.0. Container Registry is private and hosted in Azure. You use it to build, store, and manage images for all types of container deployments.

Azure Container Registry Tasks can also build container images in Azure. Tasks use a standard Dockerfile to create and store a container image in Azure Container Registry without the need for local Docker tooling. With Azure Container Registry Tasks, you can build on-demand or fully automate container image builds by using DevOps processes and tooling.

## Prerequisites
* Complete previous labs:
    * [Create AKS Cluster](../create-aks-cluster/README.md)
    * [Deploy MongoDB via Helm3](../deploy-mongodb/README.md)

## Important

* When running `az acr build` be careful with the last parameter which is the Docker build context directory, it's usual to `cd` into the directory where the `Dockerfile` is situated, and pass . (a single dot) as the [build context](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#understand-build-context)

## Create a container registry

1. The container registry name must be unique       within Azure and contain between 5 and 50 alphanumeric characters.
   * Use the same resource group that was created for AKS (in lab 1)
   
   Use the UNIQUE_SUFFIX from the first section. Validate that the value is still set.
   
    ```bash
    echo $UNIQUE_SUFFIX
    # Set Azure Container Registry Name
    ACR_NAME=acrks$UNIQUE_SUFFIX
   
    echo export ACR_NAME=$ACR_NAME >> ~/.bashrc
    # Create Azure Container Registry
    az acr create \
        --resource-group $RG_NAME  \
        --location $LOCATION \
        --name $ACR_NAME \
        --sku Standard
    ```

    Get ACR information
    ```
    az acr list -o table
    ```

## Grant AKS generated Service Principal to ACR

1. Configure the AKS cluster to authenticate to the container registry

    > Before you can use an image stored in a private registry you need to ensure your Kubernetes cluster has access to that registry.

    Authorize the AKS cluster to connect to the Azure Container Registry.

    ```bash
    AKS_RESOURCE_GROUP=$RG_NAME
    AKS_CLUSTER_NAME=$CLUSTER_NAME
    ACR_NAME=$ACR_NAME

    # Get the id of the service principal configured for AKS
    CLIENT_ID=$(az aks show --resource-group $AKS_RESOURCE_GROUP --name $AKS_CLUSTER_NAME --query "servicePrincipalProfile.clientId" --output tsv)

    # Get the ACR registry resource id
    ACR_ID=$(az acr show --name $ACR_NAME --resource-group $AKS_RESOURCE_GROUP --query "id" --output tsv)

    # Create role assignment
    az role assignment create \
        --assignee $CLIENT_ID \
        --role Contributor \
        --scope $ACR_ID
    ```

3. Verify Azure Container Registry

    To check repositories in your registry

    ```bash
    az acr repository list --name $ACR_NAME --output table

    az acr list -o table
    ```

## Docs / References

* https://docs.microsoft.com/en-us/azure/container-registry
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-aks
* https://docs.microsoft.com/en-us/azure/aks/cluster-container-registry-integration
* https://docs.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest#az-acr-build
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-reference-yaml#run-variables
* https://aksworkshop.io/

#### Next Lab: [Build and deploy Ratings API](../ratings-api/README.md)