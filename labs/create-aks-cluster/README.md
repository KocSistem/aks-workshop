Exercise - Deploy Kubernetes with Azure Kubernetes Service
==
Fruit Smoothies wants to use Kubernetes as their compute platform. The development teams already use containers for application development and deployment, and using an orchestration platform will help them rapidly build, deliver, and scale their application.

To do this, you need to deploy the foundation of your Kubernetes environment.

In this exercise, you will:

* Create a new resource group.
* Configure cluster networking.
* Create an Azure Kubernetes Service cluster.
* Connect to the Kubernetes cluster by using kubectl.
* Create a Kubernetes namespace.

	>You need your own Azure subscription to run this exercise, and you might incur charges. If you don't already have an Azure subscription, create a free account before you begin.

## Tools
You can use the Azure Cloud Shell accessible at https://shell.azure.com once you login with an Azure subscription. The Azure Cloud Shell has the Azure CLI pre-installed and configured to connect to your Azure subscription as well as **kubectl** and **helm**.

## Create the storage account

1. Login to Azure Portal at http://portal.azure.com.

2. Open the Azure Cloud Shell and select **Bash** as your shell.

	![Azure Cloud Shell](/labs/create-aks-cluster/img/cloud-shell-bash.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

	![Create Storage Account](/labs/create-aks-cluster/img/create-storage-account.png "Create Storage Account")

4. Set the Storage account and File share names to your resource group name (all lowercase, without any special characters) **be careful to select your own region**, then hit Create storage

	![Advanced Storage Account](/labs/create-aks-cluster/img/advanced-storage-account.png "Advanced Storage Account")

## Create Azure service principle

1. Once your cloud shell is started, clone the workshop repo into the cloud shell environment

	```bash
	git clone https://github.com/KocSistem/aks-workshop
	```

2. Ensure you are using the correct Azure subscription you want to deploy AKS to

	To view your subscriptions

	```bash
	az account list
	```
	Verify selected subscription

	```bash
	az account show
	```
	If you need to switch another subscription, you should set subscription id (optional)

	```bash
	az account set --subscription <SUBSCRIPTION_ID>

	# Verify correct subscription is now set
	az account show
	```

3. Create Azure Service Principal to use through the labs

	store rbac credentials in **secrets.json**

	```bash
	az ad sp create-for-rbac --skip-assignment > secrets.json
	```

## Store credentials in `.bashrc`

1. Set APP_ID and CLIENT_PASSWORD via **jq** and persist for later sessions in case of timeout

	> **Note:** use `raw output (--raw-output /-r)` option of jq for get rid of quotes 

	```
	APP_ID=$(jq -r .appId secrets.json) && \
		echo export APP_ID=$APP_ID >> ~/.bashrc

	CLIENT_PASSWORD=$(jq -r .password secrets.json) && \
		echo export CLIENT_PASSWORD=$CLIENT_PASSWORD >> ~/.bashrc
	```

2. Create a unique identifier suffix for resources to be created in this lab. This is required due AKS and ACR name must be **unique**

	```bash
	UNIQUE_SUFFIX=$USER$RANDOM
	# Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
	UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
	UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"

	# Check Unique Suffix Value (Should be No Underscores or Dashes)
	echo $UNIQUE_SUFFIX

	echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
	```

## Create a new resource group

1. Create an Azure Resource Group for your resources to deploy into. (In this lab this will be `westeurope`)

	```bash
	RESOURCE_GROUP=ks-aksworkshop
	echo export RESOURCE_GROUP=$RESOURCE_GROUP >> ~/.bashrc

	# Set Region (REGION_NAME)
	REGION_NAME=westeurope
	echo export REGION_NAME=$REGION_NAME >> ~/.bashrc

	# Create Resource Group
	az group create --name $RESOURCE_GROUP --REGION_NAME $REGION_NAME
	```

## Configure networking

1. Create a virtual network and subnet. Pods deployed in your cluster will be assigned an IP from this subnet. Run the following command to create the virtual network.

	```bash
	SUBNET_NAME=aks-subnet
	echo export SUBNET_NAME=$SUBNET_NAME >> ~/.bashrc

	VNET_NAME=aks-vnet
	echo export VNET_NAME=$VNET_NAME >> ~/.bashrc

	az network vnet create \
    	--resource-group $RESOURCE_GROUP \
    	--REGION_NAME $REGION_NAME \
    	--name $VNET_NAME \
    	--address-prefixes 10.0.0.0/8 \
    	--subnet-name $SUBNET_NAME \
    	--subnet-prefix 10.240.0.0/16
	```
2. Retrieve, and store the subnet ID in a variable by running the command below.

	```bash
	SUBNET_ID=$(az network vnet subnet show \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $SUBNET_NAME \
    --query id -o tsv)

	echo export SUBNET_ID=$SUBNET_ID >> ~/.bashrc
	```

## Create the AKS cluster

1. Create your AKS cluster in the resource group created above with 3 nodes. We will check for a recent version of kubnernetes before proceeding.

	Use Unique CLUSTERNAME

	```bash
	# Set AKS Cluster Name
	AKS_CLUSTER_NAME=ks-aksworkshop${UNIQUE_SUFFIX}
	# Look at AKS Cluster Name for Future Reference
	echo $AKS_CLUSTER_NAME
	
	echo export AKS_CLUSTER_NAME=$AKS_CLUSTER_NAME>> ~/.bashrc
	```
	Get the latest available Kubernetes version for the region

	``` bash
	#In this lab this will be `1.22.6`#
	VERSION=1.22.6

	<!-- VERSION=$(az aks get-versions \
    --location $REGION_NAME \
    --query 'orchestrators[?!isPreview] | [-1].orchestratorVersion' \
    --output tsv) -->

	```
	# Create AKS Cluster
	```bash
	az aks create \
	--resource-group $RESOURCE_GROUP \
	--name $AKS_CLUSTER_NAME \
	--vm-set-type VirtualMachineScaleSets \
	--node-count 2 \
	--load-balancer-sku standard \
	--location $REGION_NAME \
	--kubernetes-version $VERSION \
	--network-plugin azure \
	--vnet-subnet-id $SUBNET_ID \
	--service-cidr 10.2.0.0/24 \
	--dns-service-ip 10.2.0.10 \
	--docker-bridge-address 172.17.0.1/16 \
	--generate-ssh-keys
	```
2. Verify your cluster status. The `ProvisioningState` should be `Succeeded`

	```bash
	az aks list -o table
	```
	

## Test cluster connectivity by using **kubectl**

1. Retrieve the cluster credentials by running the command below.

	```bash
	az aks get-credentials --name $AKS_CLUSTER_NAME --resource-group $RESOURCE_GROUP
	```

16. Verify you have API access to your new AKS cluster

    ```bash
    kubectl get nodes
    ```

    ```bash
    NAME                       STATUS   ROLES   AGE     VERSION
    aks-nodepool1-14089323-0   Ready    agent   113s    v1.16.7
    aks-nodepool1-14089323-1   Ready    agent   2m59s   v1.16.7
    aks-nodepool1-14089323-2   Ready    agent   2m1s    v1.16.7
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

## Create a Kubernetes namespace for the application

### What is a namespace

A namespace in Kubernetes creates a logical isolation boundary. Names of resources must be unique within a namespace but not across namespaces. If you don't specify the namespace when you work with Kubernetes resources, the default namespace is implied.

1. List the current namespaces in the cluster.

	```
	kubectl get namespace
	```
	You'll see a list of namespaces similar to this output.

	```
	NAME              STATUS   AGE
	default           Active   1h
	kube-node-lease   Active   1h
	kube-public       Active   1h
	kube-system       Active   1h
	```
2. Use the `kubectl create namespace` command to create a namespace for the application called **ratingsapp**.

	```
	kubectl create namespace ratingsapp
	```

## Summary
In this exercise, you created a resource group for your resources. You created a virtual network for your cluster to use. You then deployed your AKS cluster, including the Azure CNI networking mode. You then connected to your cluster with kubectl and created a namespace for your Kubernetes resources.

Next, you'll create and configure an Azure Container Registry (ACR) instance to use with your AKS cluster and store your containerized ratings app.

#### Next Lab: [Exercise - Create a private, highly available container registry](../azure-container-registry/README.md)

## Docs / References
* https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough
* https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az-aks-create
* https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal
* https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough#connect-to-the-cluster
* https://linuxacademy.com/site-content/uploads/2019/04/Kubernetes-Cheat-Sheet_07182019.pdf
* https://aksworkshop.io