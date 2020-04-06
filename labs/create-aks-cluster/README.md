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
	APP_ID=$(jq -r .appId secrets.json) && \
		echo export APP_ID=$APP_ID >> ~/.bashrc

	CLIENT_PASSWORD=$(jq -r .password secrets.json) && \
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
	echo export LOCATION=$LOCATION >> ~/.bashrc

	# Create Resource Group
	az group create --name $RG_NAME --location $LOCATION
	```
11. Create your AKS cluster in the resource group created above with 3 nodes. We will check for a recent version of kubnernetes before proceeding.

	Use Unique CLUSTERNAME

	```bash
	# Set AKS Cluster Name
	CLUSTER_NAME=aks${UNIQUE_SUFFIX}
	# Look at AKS Cluster Name for Future Reference
	echo $CLUSTER_NAME
	
	echo export CLUSTER_NAME=$CLUSTER_NAME>> ~/.bashrc
	```
	Get the latest available Kubernetes version for the region

	``` bash
	K8S_VERSION=$(az aks get-versions -l $LOCATION --query 'orchestrators[-1].orchestratorVersion' -o tsv)
	```
	The above command lists all versions of Kubernetes available to deploy using AKS. Newer Kubernetes releases are typically made available in “Preview”. To get the latest non-preview version of Kubernetes, use the following command instead

	``` bash
	K8S_VERSION=$(az aks get-versions -l $LOCATION --query 'orchestrators[?isPreview == null].[orchestratorVersion][-1]' -o tsv)

	TABLE VIEW

	az aks get-versions -l $LOCATION --output table
	```
	Set the version to one with available upgrades (in this case v 1.16.7)

	* The size and number of nodes in your cluster is not critical but two or more nodes of type **Standard_DS2_v2** or larger is recommended

	> The below command can take 7-9 minutes to run as it is creating the AKS cluster. Please be patient. You can visualize creation status from **Activity Log**

	```bash
	# Create AKS Cluster
	az aks create -n $CLUSTER_NAME -g $RG_NAME \
	--kubernetes-version $K8S_VERSION \
	--service-principal $APP_ID \
	--client-secret $CLIENT_PASSWORD \
	--generate-ssh-keys -l $LOCATION \
	--node-count 3 \
	--no-wait
	```
12. Verify your cluster status. The `ProvisioningState` should be `Succeeded`

	```bash
	az aks list -o table
	```
13. Get the Kubernetes config files for your new AKS cluster

	```bash
	az aks get-credentials -n $CLUSTER_NAME -g $RG_NAME
	```
14. Verify you have API access to your new AKS cluster

    > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.

    ```bash
    kubectl get nodes
    ```

    ```bash
    NAME                       STATUS   ROLES   AGE     VERSION
    aks-nodepool1-35396696-vmss000000   Ready    agent   113s    v1.12.8
    aks-nodepool1-35396696-vmss000001   Ready    agent   2m59s   v1.12.8
    aks-nodepool1-35396696-vmss000002   Ready    agent   2m1s    v1.12.8
    ```

    To see more details about your cluster:

    ```bash
    kubectl cluster-info
    ```

    ```bash
    Kubernetes master is running at https://******.hcp.westeurope.azmk8s.io:443

    CoreDNS is running at https://********.hcp.westeurope.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    
    Metrics-server is running at https://*******.hcp.westeurope.azmk8s.io:443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
    ```

    You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.