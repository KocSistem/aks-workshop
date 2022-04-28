Summary and cleanup
==
In this workshop, you deployed a multicontainer application to Azure Kubernetes Service (AKS). You used Azure Container Registry (ACR) to store your container images. You deployed MongoDB with Helm and learned about key Kubernetes concepts to make deployments easier, and support communication between applications and services. You set up TSL/SSL to ensure communication is encrypted, and also set up autoscaling to handle fluctuations in traffic.

You can now use what you learned to deploy container-based applications in your environment to AKS.

## Clean up resources

In this module, you created resources by using your Azure subscription. You want to clean up these resources so that there's no continued charge against your account for these resources.

1. Open the Azure portal.
   https://portal.azure.com/

2. In the top search bar, search for and select Resource groups.

3. Find the aksworkshop resource group, or the resource group name you used, and select it. The Resource group pane for that resource group appears.

4. On the top menu bar, select Delete resource group.

5. Enter the name of the resource group to confirm. Select Delete to delete all of the resources you created in this module.

6. Finally, run the kubectl config delete-context command to remove the deleted clusters context. Here is an example of the complete command. Remember to replace the name of the cluster with your cluster's name.

    ```bash
    kubectl config delete-context aksworkshop
    ```
    If successful, the command returns the following example output.
    ```bash
    deleted context aksworkshop from /home/user/.kube/config
    ```
