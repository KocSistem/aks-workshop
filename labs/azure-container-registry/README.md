Lab 3: Provision Azure Container Registry
==
In this lab we will provision Azure Container Registry(ACR)

## Prerequisites
* Complete previous labs:
    * [Deploy MongoDB](../deploy-mongodb/README.md)

## Instructions

1. Create Azure Container Registry (ACR)
   * Use the same resource group that was created for AKS (in lab 1)
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

2. Run bash script to authenticate with Azure Container Registry from AKS

    Running this script will grant the Service Principal created at cluster creation time access to ACR.

    ```bash
    sh labs/build-application/reg-acr.sh $RG_NAME $CLUSTER_NAME $ACR_NAME
    ```