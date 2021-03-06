Section 7: Enable SSL/TLS on the Ratings web APP Ingress
==

You want to enable secure connections to the Frontend website over TLS (SSL). In this guide, you'll use [Let's Encrypt's](https://letsencrypt.org/) free service to generate valid TLS certificates for your domains, and you’ll integrate the certificate issuance workflow into Kubernetes.

## Prerequisites
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Deploy MongoDB](../deploy-mongodb/README.md)
    * [Create a private highly available Container Registry](../azure-container-registry/README.md)
    * [Build and deploy Ratings API](labs/ratings-api/README.md)
    * [Build and deploy Ratings Web APP](/labs/ratings-web/README.md)
    * [Deploy the Ratings web APP using Ingress](/labs/ingress/README.md)

![TLS Ingress Controller Architecture](/labs/tls-ingress/img/tls-ingress-architecture.svg "TLS Ingress Controller Architecture")

# Deploy cert-manager
*cert-manager* is a Kubernetes certificate management controller that makes it possible to automate certificate management in cloud-native environments. cert-manager supports various sources including Let's Encrypt, HashiCorp Vault, Venafi, simple signing key pairs, or self-signed certificates. You'll use cert-managerto ensure your website's certificate is valid and up to date, and attempt to renew certificates at a configured time before the certificate expires.

cert-manager uses Kubernetes custom resources. A Kubernetes custom resource is an object that allows you to extend the Kubernetes API or to introduce your API into a cluster. You use custom resource definition (CRD) files to define your object kinds and the API Server manage the lifecycle of the object.

## Instructions

1. Let's start by creating a namespace for cert-manager.

    We will install helm chart to cert-manager namespace

    ```
    kubectl create namespace cert-manager
    ```

2. Install the Custom Resource Definition resources

    ```
    kubectl apply --validate=false -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.11/deploy/manifests/00-crds.yaml
    ```

3. Install cert-manager using Helm and configure it to use `letsencrypt` as the certificate issuer

    As with MongoDB and NGINX use Helm to deploy cert-manager. You need to do a little more than just `helm install`, however the [steps are documented in the GitHub repo for the cert-manager chart](https://github.com/helm/charts/tree/master/stable/cert-manager#installing-the-chart)

    Add the Jetstack Helm repository

    ```bash
    helm repo add jetstack https://charts.jetstack.io

    # Update your local Helm chart repository cache
    helm repo update

    # Install the cert-manager Helm chart
    helm install cert-manager \
        --namespace cert-manager \
        --version v0.14.0 \
        jetstack/cert-manager
    ```
4. Verify the installation by checking the `cert-manager` namespace for running pods.

    ```
    kubectl get pods --namespace cert-manager
    ```

5. Create a Let's Encrypt ClusterIssuer

    * cert-manager uses a custom Kubernetes object called an **Issuer** or **ClusterIssuer** to act as the interface between you and the certificate issuing service (in our case Let’s Encrypt). There are many ways to create an issuer, but the cert-manager docs provides a working example YAML for Let’s Encrypt. It will require some small modifications, **You must change the type to `ClusterIssuer` or it will not work.** The recommendation is you call the issuer letsencrypt

    * Check the status with `kubectl describe clusterissuer.cert-manager.io/letsencrypt` (or other name if you didn’t call your issuer letsencrypt)

        > Note Make sure to replace _YOUR_EMAIL_ from `letsencrypt-clusterissuer.yaml` with your email.

        ```
        kubectl apply \
            -f deploy/manifests/tls/letsencrypt-clusterissuer.yaml
        ```

6. Update the ingress resource to automatically request a certificate

    Issuing certificates can be done automatically by properly annotating the ingress resource.

    ## Task Hints
    
    * The quick start guide for cert-manager provides guidance on the changes you need to make. Note the following:

        * The annotation cert-manager.io/issuer: "letsencrypt-staging" in the metadata, you want that to refer to your issuer letsencrypt and use cluster-issuer rather than issuer, e.g. cert-manager.io/cluster-issuer: "letsencrypt"

        * The new tls: section, here the host field should match the host in your rules section, and the secretName can be anything you like, this will be the name of the certificate issued (see next step)
    * Reapply your changed frontend ingress using kubectl

        > Note Make sure to replace `<ingress ip>` with your cluster ingress controller external IP. Also make note of the secretName: ratings-web-cert as this is where the issued certificate will be stored as a Kubernetes secret.

        ```
        kubectl apply -f apps/ratings-web/manifests/ingress/tls/ingress.yaml
        ```

6. Verify the certificate is issued and test the website over SSL

    ## Task Hints

    * You can list custom objects such as certificates with regular kubectl commands, e.g. kubectl get cert and kubectl describe cert, use the describe command to validate the cert has been issued and is valid

    * Access the front end in your browser as before, e.g. http://frontend.{ingress-ip}.nip.io you might be automatically redirected to the https:// version, if not modify the URL to access using https://

    * You will probably see nothing in the Orders view, and some errors in the developer console (F12), to fix this you will need to do some work to make the Order Capture API accessible over HTTPS with TLS. See the next section for more details.


7. Verify the hostname

    Let’s Encrypt should automatically verify the hostname in a few seconds. Make sure that the certificate has been issued by running:

    ```
    kubectl describe cert ratings-web-cert --namespace ratingsapp
    ```
    
## Test the application
Open the host name you configured on the ingress in a web browser over SSL/TLS to view and interact with the application. For example, at https://frontend.13-68-177-68.nip.io.
    ![Frontend with TLS](/labs/tls-ingress/img/ratings-web-ingress-tls.png "Frontend with TLS")


## Docs / References

* https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
* https://kubernetes.io/docs/concepts/services-networking/service/define-environment-variable-container/
* https://kubernetes.io/docs/concepts/services-networking/ingress/
* https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
* https://letsencrypt.org/
* https://aksworkshop.io/
