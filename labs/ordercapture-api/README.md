Lab 3: Build and deploy the Order Capture API
==

In this lab, you will build Order Capture API image and push to ACR. With this image you will deploy API to Kubernetes cluster. This will require an external endpoint, exposing the API so that it can be accessed on port 80. The application will need to write to the MongoDB instance you deployed earlier.

## Prerequisites
* Complete previous labs:
    * [Provision Azure Container Registry](../azure-container-registry/README.md)

## Environment Variables
The Order Capture API requires the following environment variables in order to connect to your MongoDB database. Make sure you set these environment variables in your deployment. You should use the Kubernetes secrets you created earlier to populate the values in the environment variables.

* MONGOHOST="[mongodb-hostname]"
* MONGOUSER="[mongodb-user]"
* MONGOPASSWORD="[mongodb-password]"

> The Order Capture API exposes the following endpoint for health-checks once you have completed the tasks below: http://[PublicEndpoint]:[port]/healthz

## Instructions

1.Build Order Capture API and store image to the ACR

In this step we will create a Docker container image for Capture Order API. We will use ACR Builder functionality to build and store the image in the cloud.

```bash
az acr build -t ksdemo/captureorder-api:1.0 -r $ACR_NAME --no-logs apps/captureorder
```

You can see the status of the builds by running the command below.

```bash
az acr task list-runs -r $ACR_NAME -o table

az acr task logs -r $ACR_NAME --run-id {{ .ImageId }}
```