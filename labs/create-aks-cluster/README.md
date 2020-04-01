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
   az account set --subscription <subscription_id>

   # Verify correct subscription is now set
   az account show

7. Create Azure Service Principal to use through the labs

   ```bash
   az ad sp create-for-rbac --skip-assignment > secrets.json
   ```
   This will save rbac credentials in **secrets.json** 
   
   Set the values from above as variables **(replace <appId> and <password> with your values from secrets.json)**.