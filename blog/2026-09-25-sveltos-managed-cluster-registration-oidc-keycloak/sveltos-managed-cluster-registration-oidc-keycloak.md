---
slug: sveltos-managed-cluster-registration-oidc-keycloak
title: "Sveltos: Register Managed Cluster using OIDC with Keycloak"
authors: [egrosdou01]
date: 2026-10-01
image: ../2025-01-06-sveltos-what's-new/sveltos_logo.jpg
description: Learn how to use OIDC authentication with Keycloak and register Kubernetes clusters with Sveltos.
tags: [kubernetes,sveltos,keycloak,rke2]
keywords: [Sveltos,Keycloak,RKE2]
---

**Summary**:

Sveltos release **v1.15.0** introduced [OpenID Connect (OIDC) Authentication](https://openid.net/developers/how-connect-works/) for on-prem Kubernetes cluster registration. Instead of providing a valid `kubeconfig` for cluster registration, we will use an existing [Keycloak](https://www.keycloak.org/) instance to register them with Sveltos. An RKE2 cluster will be used for the registration process, running on Proxmox.

<!--truncate-->

## Introduction

Since the beginning, Sveltos has provided a [manual and an automated way of registering managed Kubernetes clusters](https://projectsveltos.io/main/register/register-cluster/) with Sveltos. For the manual process, the `sveltosctl` utility was used, while for the automated one used heavily in DevOps/GitOps pipelines, a `Secret` resource holding the kubeconfig details in a base64 format, alongside a `SveltosCluster` resource to actually register the cluster, was required.

Using the mentioned approach, a long-lived kubeconfig was stored as a Kubernetes `Secret` in the management cluster. While this might be fine for some cases, when we have to deal with a fleet of clusters spread between on-prem and Cloud setups, we want to have the flexibility of automatically refreshing the provided credentials before they expire. To cover these use-cases, we introduced [Workload Identity Registration](https://projectsveltos.io/main/register/workload_identity/) using a Cloud provider workload identity (EKS, AKS, GKE) or a generic OIDC setup like Dex, Keycloak, Okta, or any RFC 6749-compliant identity provider.

In today's post, we will demonstrate how to register an RKE2 cluster in Proxmox using a Keycloak instance as our identity provider. In a [previous post](../2026-09-20-sveltos-oidc-keycloak/sveltos-oidc-keycloak.md), we outlined some of the key Keycloak settings. We will use the existing setup and simply create a new Client ID for the `test` cluster registration.

:::note
In this post, we touch only a few settings and capabilities of Keycloak for the demo purposes. If you would like a deeper dive into Keycloak configuration itself, contact me, and I will create a blog post on it.
:::

To understand more in-depth how the flow of OAuth2 and OIDC works together, I would highly recommend watching the [OAuth and OpenID Connect Explained video by Okta](https://www.youtube.com/watch?v=t18YB3xDfXI).

## Lab Setup

```bash
+-------------------------+--------------+------------------+
|        Resources        |     Type     |     Version      |
+-------------------------+--------------+------------------+
|  Management Cluster     |     RKE2     | v1.35.6+rke2r1   |
|   Managed Cluster       |     RKE2     | v1.35.6+rke2r1   |
|        Sveltos          |  Helm Chart  |     v1.15.0      |
+-------------------------+--------------+------------------+
```

## Prerequisites

1. A Kubernetes cluster with Keycloak already in place
1. A recent Helm version installed
1. **kubectl** installed/available. Find the guide [here](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/).

## Keycloak Deployment

The Keycloak instance is exposed via a Gateway API `HTTPRoute` resource. More details on how that works, take a look at a [previous blog post](../2024-12-29-experimenting-with-vCluster-and-multitenancy/vcluster-updates-05.md). Since we want to register managed clusters with Sveltos using Keycloak, a few things need to happen on the Keycloak side. We will try to summarize the details as well as possible; however, I would recommend having a look at the [official Keycloak documentation](https://www.keycloak.org/) for details on the topics and configurations covered below.

1. We will re-use the Realm `test-realm`. If the Realm does not exist, simply create a new one. Feel free to choose the name of your preference; however, on this guide, we will stick with the names provided in this section.
1. Create a Client ID `test-env-auth`
1. Under **Capability config**: Enable `Client authentication` and enable `Service account roles` in the **Authentication flow** section
1. Save the configuration

Once the configuration is saved, from the top menu of the client, navigate to the **Credentials** tab and copy the `Client Secret` value. This will be used at a later step to register the RKE2 cluster with Sveltos. Going through the [official Sveltos documentation about workload identity](https://projectsveltos.io/main/register/workload_identity/#end-to-end-setup-guides), there is an end-to-end example of Dex. We will use the example as a basis to complete the Keycloak setup.

Since Dex and Keycloak operate differently, we need to set two **mappers** to the **test-env-auth-dedicated** `Client scope` of our Client ID.

Create a **Hardcoded claim** and fill out the following details. The mapper is used to give us a clean username string. 

1. Set **Name** to `test-env-user`
1. Set **Token Claim Name** to `test-env-user`
1. Set **Claim value** to `sveltos`
1. Set **Claim JSON Type** to `string`
1. Enable `Add to access token`
1. Save the configuration

:::note
The **Claim value** string will be used for the `ClusterRoleBinding` resource in the **managed** cluster.
:::

Create an **Audience** mapper so aud carries what the `--oidc-client-id` field expects. Fill out the following details.

1. Set **Name** to `test-env-audience`
1. Set **Included Custom Audience** to `test-env-auth`
1. **Disable** `Add to ID token`
1. **Enable** `Add to access token`
1. Save the configuration

For more information on how to set up Keycloak, take a look at the [official documentation](https://www.keycloak.org/documentation) and [Sveltos documentation](https://projectsveltos.io/main/getting_started/optional/dashboard/#oidc-authentication).

## Managed Cluster - Update Kubernetes API Server Values

The Kubernetes API server should accept and validate OIDC tokens. Thus, we will update the controller configuration to include the arguments listed below. On an RKE2 installation, the server configuration is stored under `/etc/rancher/rke2/config.yaml`. We will update the existing configuration to add the OIDC details. Then, we will restart the `rke2-server` service using `systemctl`.

```yaml showLineNumbers
kube-apiserver-arg:
  - "oidc-issuer-url=https://<Your Keycloak Domain>/realms/test-realm"
  - "oidc-client-id=test-env-auth"
  - "oidc-username-claim=test-env-user"
  - "oidc-username-prefix=-"
  - "oidc-ca-file=/var/lib/rancher/rke2/server/tls/keycloak-ca.crt"
```

:::note
The `oidc-username-claim=test-env-user` value resolves to **sveltos**. Remember, this comes from the **Hardcoded claim** created in a previous step. The `oidc-username-prefix=-` field means no prefix is added. The Kubernetes **username** is **sveltos**.

The trusted CA used for Keycloak needs to be copied to `/var/lib/rancher/rke2/server/tls/`. The directory is already mounted for the static RKE2 pods. If the CA is not copied over, we will get issues when contacting the Keycloak instance.
:::

Once the changes are done, go ahead and restart the `rke2-server` service.

```bash
$ systemctl restart rke2-server
$ systemctl status rke2-server
```

## RBAC - ClusterRoleBinding - Managed Cluster

This is the part where we grant the identity the permissions Sveltos needs to perform the registration and thus the management of the cluster. For this example, we will create a new `ClusterRoleBinding` with the role set to `cluster-admin`. The `subjects.name` is set to **sveltos**. The name needs to match the value defined in the **Hardcoded claim** created in a previous step.

```yaml showLineNumbers
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: sveltos-oidc-workload-identity
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: User
    name: sveltos
    apiGroup: rbac.authorization.k8s.io
```

```bash
$ export KUBECONFIG=/path/to/managed/cluster
$ kubectl apply -f sveltos-clusterrolebind-admin.yaml
```

## Configuration - Management Cluster

Once the RBAC details are set for the **managed** cluster, it is time to continue with the **management** cluster where Sveltos is installed. We will deploy a `Secret` and a `SveltosCluster` resource. On top of the basic details provided in the official guide, we will create a secret dedicated to the root CA used for the Keycloak TLS certificate.

### Kubernetes API Server CA -  Managed Cluster

Use the command below and save the Kubernetes API Server CA to a file named `managed-ca.crt`.

```bash
$ export KUBECONFIG=/path/to/managed/cluster
$ kubectl config view --raw  -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'   | base64 -d > managed-ca.crt
```

Create a new secret with the name `oidc-managed-ca` in the `test` namespace. This will be applied to the **management** cluster. 

```bash
$ export KUBECONFIG=/path/to/management/cluster
$ kubectl create secret generic oidc-managed-ca -n test --from-file=ca.crt=managed-ca.crt
```

### Keycloak Root CA

Extract the CA that signed the Keycloak TLS certificate and save it as a `keycloak-ca.crt` file. Then, create a secret in the `test` namespace with name `keycloak-ca`.

```bash
$ export KUBECONFIG=/path/to/management/cluster
$ kubectl create secret generic keycloak-ca -n test --from-file=ca.crt=keycloak-ca.crt
```

:::tip
If the Keycloak TLS cert is from a publicly trusted CA, there is no need to create the keycloak-ca secret or add the `oidc.caSecretRef.name` to `keycloak-ca`.
:::

### Register Managed Cluster

```yaml showLineNumbers
apiVersion: v1
kind: Secret
metadata:
  name: oidc-test-managed-creds
  namespace: test
stringData:
  client_id: test-env-auth
  client_secret: <Paste here the Client Secret value from the Keycloak UI>
---
apiVersion: lib.projectsveltos.io/v1beta1
kind: SveltosCluster
metadata:
  name: pve1-test01
  namespace: test
spec:
  workloadIdentity:
    provider: OIDC
    endpoint: "https://<IP Address of the RKE2 cluster>:6443"
    caSecretRef:
      name: oidc-managed-ca # Set the key ca.crt of the managed cluster API server CA
    oidc:
      tokenURL: "https://<Your Keycloak Domain>/realms/test-realm/protocol/openid-connect/token"
      secretRef:
        name: oidc-test-managed-creds
      caSecretRef:
        name: keycloak-ca # This is required for the setup as the Keycloak root CA is not trusted by default. If you have a trusted root CA, feel free to skip this part.
```

```bash
$ export KUBECONFIG=/path/to/management/cluster
$ kubectl apply -f sveltos-test-registration.yaml
```

### Validation

The moment of truth comes when we apply the `Secret` and the `SveltosCluster` resources to the **management** cluster. Double-check the section [Configuration - Management Cluster](./sveltos-managed-cluster-registration-oidc-keycloak.md#configuration---management-cluster) and ensure the details provided there are correct and based on your setup!

```bash
$ kubectl get sveltosclusters -A
NAMESPACE   NAME          READY   VERSION          AGE     SHARD
mgmt        mgmt          true    v1.35.6+rke2r1   5d17h
test        pve1-test01   true    v1.35.6+rke2r1   13h

$ kubectl get sveltoscluster pve1-test01 -n test -o yaml
...
status:
  connectionFailures: 0
  connectionStatus: Healthy
  ready: true
  version: v1.35.6+rke2r1
```

The cluster was successfully registered with Sveltos. We can add a label to the cluster and deploy Kyverno using a `ClusterProfile` resource.

```bash
$ kubectl label sveltoscluster pve1-test01 -n test env=test
```

```yaml showLineNumbers
apiVersion: config.projectsveltos.io/v1beta1
kind: ClusterProfile
metadata:
  name: deploy-kyverno
spec:
  clusterSelector:
   matchExpressions:
   - { key: env, operator: In, values: [ test, staging ] } 
  syncMode: Continuous
  helmCharts:
  - repositoryURL:    https://kyverno.github.io/kyverno/
    repositoryName:   kyverno
    chartName:        kyverno/kyverno
    chartVersion:     v3.6.3
    releaseName:      kyverno-latest
    releaseNamespace: kyverno
    helmChartAction:  Install
```

```bash
$ kubectl apply -f kyverno-cp-test-staging.yaml

$ kubectl get clusterprofile,clustersummary -A
NAME                                                     AGE
clusterprofile.config.projectsveltos.io/deploy-kyverno   4d14h

NAMESPACE   NAME                                                                           AGE
test     clustersummary.config.projectsveltos.io/deploy-kyverno-sveltos-pve1-test01        3m23s
```

```bash
$ kubectl get clustersummary.config.projectsveltos.io/deploy-kyverno-sveltos-pve1-test01 -n test -o yaml
...
status:
  dependencies: no dependencies
  featureSummaries:
  - featureID: Helm
    hash: 0XGIaHgIpqcj32L2IRelJULL644UE/vCscDo7tCcf9k=
    lastAppliedTime: "2026-09-26T10:48:53Z"
    resourceSummaryDeployed: false
    status: Provisioned
  helmReleaseSummaries:
  - chartName: kyverno/kyverno
    chartVersion: 3.6.3
    releaseName: kyverno-latest
    releaseNamespace: kyverno
    repoURL: https://kyverno.github.io/kyverno/
    repositoryName: kyverno
    status: Managing
    valuesHash: yj0WO6sFU4GCciYUBWjzvvfqrBh869doeOC2Pp5EI1Y=
```

## Common Issues

While the process should be straightforward and error-proof, I faced a few gotchas because of typos in the Keycloak configuration or while creating the resources required to perform a cluster registration. A few cases or issues noticed are outlined below.

### Client ID Service Account

#### Error

```bash
failureMessage: 'failed to obtain OIDC access token: oauth2: "unauthorized_client"
    "Client not enabled to retrieve service account"'
```

If this error pops up, ensure the **Service account roles** in the `Authentication flow` section of the Client ID are **enabled**. And save the configuration!

### Incorrect Kubernetes API Server Details

#### Error

```bash
status:
  connectionFailures: 2
  failureMessage: the server has asked for the client to provide credentials
```

The error simply means that the OIDC configuration provided in the **managed** cluster is not correct. Double-check the section [Managed cluster Update Kube API Server Values](./sveltos-managed-cluster-registration-oidc-keycloak.md#managed-cluster---update-kubernetes-api-server-values).

### Keycloak CA Required

#### Error

```bash
failureMessage: 'failed to obtain OIDC access token: Post "https://<Your Keycloak Domain>/realms/test-realm/protocol/openid-connect/token":
tls: failed to verify certificate: x509: certificate signed by unknown authority'
```

This is where the root CA of the Keycloak TLS is required for the cluster registration. Simply add the `oidc.caSecretRef.name` value to the `SveltosCluster` resource. Take a look at the [Keycloak root CA](./sveltos-managed-cluster-registration-oidc-keycloak.md#keycloak-root-ca) section.

### Identity Authenticated but Not Authorized

#### Error

```bash
helmReleaseSummaries:
- failureMessage: 'query: failed to query with labels: secrets is forbidden: User
    "sveltos" cannot list resource "secrets" in API group "" in the namespace "kyverno"'
```

The previous errors had to do with the registration of the managed cluster itself. However, this one is a bit different as it occurs after a successful registration. The add-on deployment fails. Authentication is working, the username in the error message is exactly what the managed cluster's Kubernetes API server resolved from the token, but no RBAC rule grants that identity anything. The most common cause is a mismatch in the `subjects.name` field. The value must be the **Claim value** of the Hardcoded claim mapper (`sveltos`), not the Client ID (`test-env-auth`) and not the claim name (`test-env-user`). Also confirm the [`ClusterRoleBinding`](./sveltos-managed-cluster-registration-oidc-keycloak.md#rbac---clusterrolebinding---managed-cluster) was applied to the **managed** cluster.

## Conclusion

If you look for ways to use an existing Workload Identity provider to register Kubernetes clusters with Sveltos, now you have the possibility. You can use a native Cloud Provider authenticator or, if you work with on-prem clusters, a local Identity like Keycloak, Okta, or DEX. In this post, we provided an extended guide on how to configure a Keycloak instance to allow registration of managed clusters with Sveltos.

## Resources

- [Sveltos Quick Start](https://projectsveltos.io/main/getting_started/install/quick_start/)
- [OAuth and OpenID Connect Explained](https://www.youtube.com/watch?v=t18YB3xDfXI)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
