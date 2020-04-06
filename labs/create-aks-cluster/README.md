Lab 1: Create AKS Cluster
==
Azure has a managed Kubernetes service, AKS (Azure Kubernetes Service), we’ll use this to easily deploy and standup a Kubernetes cluster

## Tools
You can use the Azure Cloud Shell accessible at https://shell.azure.com once you login with an Azure subscription. The Azure Cloud Shell has the Azure CLI pre-installed and configured to connect to your Azure subscription as well as **kubectl** and **helm**.

## Instructions

1. Login to Azure Portal at http://portal.azure.com.
2. Open the Azure Cloud Shell and select **Bash** as your shell.

   ![Azure Cloud Shell](/labs/create-aks-cluster/img/cloud-shell-bash.png "Azure Cloud Shell")
3. The first time Cloud Shell is started will require you to create a storage account.

   ![Create Storage Account](/labs/create-aks-cluster/img/create-storage-account.png "Create Storage Account")
4. Set the Storage account and File share names to your resource group name (all lowercase, without any special characters) **be careful to select your own region**, then hit Create storage

   ![Advanced Storage Account](/labs/create-aks-cluster/img/advanced-storage-account.png "Advanced Storage Account")
5. Once your cloud shell is started, clone the workshop repo into the cloud shell environment

   ```bash
   git clone https://github.com/KocSistem/aks-workshop
   ```

   > Note: In the cloud shell, you are automatically logged into your Azure subscription.
6. Ensure you are using the correct Azure subscription you want to deploy AKS to.

   ```
   # View subscriptions
   az account list
   ```

   ```
   # Verify selected subscription
   az account show
   ```

   ```
   # Set correct subscription (if needed)
   az account set --subscription <SUBSCRIPTION_ID>

   # Verify correct subscription is now set
   az account show

7. Create Azure Service Principal to use through the labs

   sace rbac credentials in **secrets.json** 

   ```bash
   az ad sp create-for-rbac --skip-assignment > secrets.json
   ```

8. Set APP_ID and CLIENT_PASSWORD via **jq** and persist for Later Sessions in Case of Timeout

   ```
   APP_ID=$(jq .appId secrets.json) && \
      echo export APP_ID=$APP_ID >> ~/.bashrc

   CLIENT_PASSWORD=$(jq .password secrets.json) && \
      echo export CLIENT_PASSWORD=$CLIENT_PASSWORD >> ~/.bashrc
   ```

9. Create a unique identifier suffix for resources to be created in this lab.

   ```bash
   UNIQUE_SUFFIX=$USER$RANDOM
   # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"

   # Check Unique Suffix Value (Should be No Underscores or Dashes)
   echo $UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
   ```

10. Create an Azure Resource Group in West EU.

    ```bash
    RG_NAME=aks-rg-${UNIQUE_SUFFIX}
    echo export RG_NAME=$RG_NAME >> ~/.bashrc

    # Set Region (Location)
    LOCATION=westeurope
    echo export LOCATION=eastus >> ~/.bashrc

    # Create Resource Group
    az group create --name $RG_NAME --location $LOCATION
    ```