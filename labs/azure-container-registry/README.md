Lab 3: Create a private highly available Container Registry
==
In this guide we will provision Azure Container Registry. Instead of using the public Docker Hub registry, create your own private container registry using Azure Container Registry (ACR).

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)

## Task Hints
* se the Azure CLI to create the ACR instance. There is [a guide in the Azure documentation on creating a new ACR](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-azure-cli?wt.mc_id=aksworkshop)

* There is no need to run `az acr login` when working the the Cloud Shell.

* When running `az acr build` be careful with the last parameter which is the Docker build context directory, it's usual to `cd` into the directory where the `Dockerfile` is situated, and pass . (a single dot) as the build context

## Instructions

1. Create Azure Container Registry (ACR)
   * Use the same resource group that was created for AKS (in section 1)
   * In this step, you will need a unique name for your ACR instance. Use the following step to provision the ACR

   Use the UNIQUE_SUFFIX from the first lab. Validate that the value is still set.
   
    ```bash
    echo $UNIQUE_SUFFIX
    # Set Azure Container Registry Name
    export ACR_NAME=acrks$UNIQUE_SUFFIX
   
    echo export ACR_NAME=$ACR_NAME >> ~/.bashrc
    # Create Azure Container Registry
    az acr create --resource-group $RG_NAME --name $ACR_NAME --sku Basic
    ```

2. Configure your application to pull from your private registry

    > Before you can use an image stored in a private registry you need to ensure your Kubernetes cluster has access to that registry.

    #### Grant AKS generated Service Principal to ACR

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
    az role assignment create --assignee $CLIENT_ID --role Contributor --scope $ACR_ID
    ```

3. Check ACR

    To check repositories in your registry

    ```bash
    az acr repository list --name <acrName> --output table
    ```

## Docs / References

* https://docs.microsoft.com/en-us/azure/container-registry
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-aks
* https://docs.microsoft.com/en-us/azure/aks/cluster-container-registry-integration
* https://docs.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest#az-acr-build
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-reference-yaml#run-variables
* https://aksworkshop.io/

#### Next Lab: [Build and deploy Order Capture API](../ordercapture-api/README.md)