Exercise - Create a private, highly available container registry
==

The Fruit Smoothies software development and operations teams decided to containerize all newly developed applications. Containerized applications provide teams with mutual benefits. For example,

* Ease of managing hosting environments.
* Guarantee of continuity in software delivery.
* Efficient use of server hardware.
* Portability of applications between environments.
* The teams made the decision to store all containers in a central and secure location and the decision made is to use Azure * Container Registry (ACR).

In this exercise, you will:

* Create a container registry by using the Azure CLI
* Build container images by using Azure Container Registry Tasks
* Verify container images in Azure Container Registry
* Configure an AKS cluster to authenticate to an Azure Container Registry

## Create a container registry

1. The container registry name must be unique       within Azure and contain between 5 and 50 alphanumeric characters.
   * Use the same resource group that was created for AKS (in lab 1)
   
   Use the UNIQUE_SUFFIX from the first section. Validate that the value is still set.
   
    ```bash
    echo $UNIQUE_SUFFIX
    # Set Azure Container Registry Name
    ACR_NAME=ks-acr$UNIQUE_SUFFIX
   
    echo export ACR_NAME=$ACR_NAME >> ~/.bashrc
    # Create Azure Container Registry
    az acr create \
        --resource-group $RESOURCE_GROUP  \
        --REGION_NAME  $REGION_NAME  \
        --name $ACR_NAME \
        --sku Standard
    ```

    Get ACR information
    ```
    az acr list -o table
    ```
## Build the container images by using ACR Tasks
The Fruit Smoothies rating app makes use of two container images: one for the front-end website, and one for the RESTful API web service. Your development teams use the local Docker tooling to build the container images for the website and API web service. A third container is used to deploy the document database provided by the database publisher and will not be stored in the database container in ACR.

You can use Azure Container Registry to build these containers using a standard Dockerfile to provide build instructions. With ACR, you can reuse any Dockerfile currently in your environment, which includes multi-staged builds.

## Build the ratings-api image
The ratings API is a Node.js application that's built using Express - a Node.js web framework. The source code is on GitHub and already includes a Dockerfile, which builds images based on the Node.js Alpine container image.

Here, you'll clone the repository and then build the Docker image using the included Dockerfile. Use the built-in ACR functionality to build and push the container image into your registry by running the `az acr build` command.

1. Clone the repository to your Cloud Shell.

    ```bash
    git clone https://github.com/KocSistem/aks-workshop.git
    ```
2. Change into the newly-cloned directory.

    ```bash
    cd aks-workshop/apps/ratings-api/
    ```

3. Run `az acr build`. This command builds a container image by using the Dockerfile. Then, it pushes the resulting image to the container registry.

    ```bash
    az acr build \
    --resource-group $RESOURCE_GROUP \
    --registry $ACR_NAME \
    --image ratings-api:v1 .
    ```
## Build the ratings-web image
The ratings front end is a Node.js application that was built by using the Vue JavaScript framework and WebPack to bundle the code. The source code is on GitHub and already includes a Dockerfile, which builds images based on the Node.js Alpine image.

The steps you follow are the same as you previously followed. Clone the repository, and then build the docker image using the included Dockerfile running the `az acr build` command.


1. First, change back to the home directory.

    ```bash
    cd ..
    ```
2. Clone the ratings-web repo.

    ```bash
    cd aks-workshop/apps/ratings-web/
    ```

3. Run `az acr build`. This command builds a container image by using the Dockerfile. Then, it pushes the resulting image to the container registry.

    ```bash
    az acr build \
    --resource-group $RESOURCE_GROUP \
    --registry $ACR_NAME \
    --image ratings-web:v1 .
    ```

## Verify the images
Run the following command in Cloud Shell to verify that the images were created and stored in the registry.

    
    az acr repository list \
    --name $ACR_NAME \
    --output table
    
The output from this command looks similar to this example.

    
    Result
    -----------
    ratings-api
    ratings-web
    
The images are now ready for use.



## Configure the AKS cluster to authenticate to the container registry

We need to set up authentication between your container registry and Kubernetes cluster to allow communication between the services.

Let's integrate the container registry with the existing AKS cluster by supplying valid values for AKS_CLUSTER_NAME and ACR_NAME. You can automatically configure the required service principal authentication between the two resources by running the following `az aks update` command.

    az aks update \
    --name $AKS_CLUSTER_NAME \
    --resource-group $RESOURCE_GROUP \
    --attach-acr $ACR_NAME
    

    >If you are getting error like this:

    Waiting for AAD role to propagate[################################ ] 90.0000%
    Could not create a role assignment for ACR. Are you an Owner on this subscription?   
    

    1. Enable your ACR Access keys > Admin user

![ACR Access keys ](/labs/azure-container-registry/enable-adminuser.png "ACR Access keys ")

    2. Docker login with your ACR username and password

        docker login $ACR_NAME.azurecr.io
        
    3. Create kubernetes secret


        kubectl create secret -n ratingsapp generic acrcred \
        --from-file=.dockerconfigjson=/home/<user-name>/.docker/config.json \
        --type=kubernetes.io/dockerconfigjson

    4. User this secret in api and web deployment yaml files.


        imagePullSecrets:
        - name: acrcred


## Summary

In this exercise, you created a container registry for the Fruit Smoothies application. You then built and added container images for the ratings-api and ratings-web to the container registry. You then verified the container images, and configured your AKS cluster to authenticate to the container registry.

Next, you'll take the first step to deploy your ratings app. The first component you'll deploy is MongoDB as your document store database, and you'll see how to use the HELM package manager for Kubernetes.

#### Next Lab: [Exercise - Deploy MongoDB](../deploy-mongodb/README.md)

## Docs / References
* https://docs.microsoft.com/en-us/azure/container-registry
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-aks
* https://docs.microsoft.com/en-us/azure/aks/cluster-container-registry-integration
* https://docs.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest#az-acr-build
* https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-reference-yaml#run-variables
* https://aksworkshop.io/
