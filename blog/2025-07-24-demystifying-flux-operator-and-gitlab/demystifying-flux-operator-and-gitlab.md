---
slug: flux-operator-and-gitlab-demystifying
title: "Demystifying the Flux Operator Installation for Self-Managed Source Control System"
authors: [egrosdou01]
date: 2025-07-24
description: A step-by-step guide working with the Flux Operator helm chart.
tags: [open-source,flux-operator,gitlab,gitops,devops,beginner-guide,"2025"]
---

**Summary**:

Learn how to install and use the Flux Operator in a Kubernetes environment and connect it to an on-prem GitLab instance.
<!--truncate-->

## Scenario

On a daily basis, as DevOps engineers, we usually interact and work with different tools to provide the best experience to the engineers and people who use the setups we build. The use case at hand covered [Sveltos](https://projectsveltos.github.io/sveltos/main/) as the main tool for Kubernetes add-ons and deployments while utilising the [FluxCD](https://fluxcd.io/flux/) integration to achieve GitOps deployments.

In the past, I worked with deployments that combined the power of Sveltos and FluxCD, but most of them were performed using the Flux CLI. This time, I did not want to have yet another CLI installed. I wanted to keep my custom images as neat as possible.

In today's post, I will share my experience and describe how to bootstrap Flux using the **Flux Operator** in a Kubernetes management cluster and connect it with a repository stored in a self-managed GitLab instance in the hope of saving headaches and further confusion.

## Lab Setup

```bash
+-------------------------------+---------------------+
|          Deployment           |       Version       |
+-------------------------------+---------------------+
|            RKE2               |   v1.31.9+rke2r1    |
|       Flux Operator           |       v0.24.1       |
|            Flux               |       v2.6.4        |
| Self Managed GitLab Instance  |        v18.1        |
+-------------------------------+---------------------+
```

## Prerequisites

1. A Kubernetes cluster
1. Familiarity with Kubernetes manifest files
1. Familiarity with GitLab and GitLab Tokens

## Flux Operator

FluxCD is a CNCF graduate project that offers users a set of continuous and progressive delivery solutions for Kubernetes, which are open and extensible. FluxCD monitors defined repositories for changes and takes over reconciliation tasks. Effectively, changes are automatically deployed to Kubernetes clusters after they have been committed to the repositories of interest.

The [Flux Operator](https://fluxcd.control-plane.io/operator/) is a Kubernetes Custom Resource Definition (CRD) controller and an alternative to the Flux CLI bootstrap. It provides a declarative API for the lifecycle management of the Flux controller.

### Helm Chart Installation

As I do heavy work with Helm charts, I decided to install the Flux Operator using this approach. Benefits: reduced complexity, better scalability, ease of updates, streamlined CI/CD pipelines.

**Install Flux Operator with Version**

```bash
$ helm install flux-operator oci://ghcr.io/controlplaneio-fluxcd/charts/flux-operator \
  --namespace flux-system \
  --create-namespace \
  --version <your prefered version>
```

Check out the [page](https://artifacthub.io/packages/helm/flux-operator/flux-operator) for more information about the Helm chart, installation details and available versions.

### Flux Instance

The `FluxInstance` resource is the brains of the GitOps lifecycle. Based on the [official documentation](https://fluxcd.control-plane.io/operator/fluxinstance/): "FluxInstance is a declarative API for the installation, configuration and automatic upgrade of the Flux distribution."

The resource itself includes many sections that can be defined and configured; however, we will focus on what matters for our use case. We want to synchronise Helm charts and Kubernetes manifest files. If you want to go deeper into the resource definition, have a look [here](https://fluxcd.control-plane.io/operator/fluxinstance/#example).

```yaml showLineNumbers
cat <<EOF > flux_instance.yaml
---
apiVersion: fluxcd.controlplane.io/v1
kind: FluxInstance
metadata:
  name: flux
  namespace: flux-system
  annotations:
    fluxcd.controlplane.io/reconcileEvery: "1h"
    fluxcd.controlplane.io/reconcileTimeout: "5m"
spec:
  distribution:
    version: "2.x" # We will install the latest Flux minor version available. You can define your prefered version like "2.6.4"
    registry: "ghcr.io/fluxcd"
    artifact: "oci://ghcr.io/controlplaneio-fluxcd/flux-operator-manifests"
  components:
    - source-controller # Responsible for monitoring Sources for changes
    - kustomize-controller # Manages and reconciles a cluster's state against the configured sources
    - helm-controller # Enables declarative management of Helm charts
    - notification-controller # Responsible for handling inbound and outbound events
    - image-reflector-controller # Responsible to update a Git repository when a new container image is available
    - image-automation-controller # Responsible to update a Git repository when a new container image is available
  cluster: # Define how the Kubernetes cluster configuration looks like. The defaults are left
    type: kubernetes
    multitenant: false
    networkPolicy: false # By default, a few Kubernetes Network Policies will get deployed to the Kubernetes clusters. For Production environments, have a look on those. 
    domain: "cluster.local"
EOF
```

The different Controllers can be found [here](https://fluxcd.io/flux/components/). For this demonstration the default ones are used, but feel free to update the resource based on your setup. Once we are happy with the above manifest, we can apply it to the Kubernetes management cluster.

```bash
$ kubectl apply -f flux_instance.yaml

$ kubectl get fluxinstance -n flux-system
NAME   AGE   READY   STATUS                           REVISION
flux   10m   True    Reconciliation finished in 24s   v2.6.4@sha256:85c6d91b58013025d6b55151ff68b85f0d2a7c0a7dcbb0dd0c39d3c4a2fd1722
```

After deployment, we can see multiple pods popping up in the `flux-system` namespace. It includes all the controllers defined in the section _spec.components_. The mentioned Pods should be in a "Running" state.

```bash
$ kubectl get pods -n flux-system
NAME                                           READY   STATUS    RESTARTS   AGE
flux-operator-5b5f668cd9-pbhvv                 1/1     Running   0          11m
helm-controller-7cc745b46-ts6mg                1/1     Running   0          9m54s
image-automation-controller-7f8cc84879-4r8nb   1/1     Running   0          9m54s
image-reflector-controller-665c56d6d5-6xdg9    1/1     Running   0          9m54s
kustomize-controller-67c6c6db46-msgzk          1/1     Running   0          9m54s
notification-controller-7b95dc57bc-cjxct       1/1     Running   0          9m54s
source-controller-6f8b6746f5-qgfxr             1/1     Running   0          9m5
```

### GitLab Secret

This is the most important aspect of the deployment. Create a [GitLab Token](https://docs.gitlab.com/security/tokens/). The preferred option is a Group or a Project Token. Once available, proceed with the `secret` creation and ensure it is created in the **same namespace** as the Flux operator and the Flux controllers!

```yaml showLineNumbers
cat <<EOF > flux_git_creds.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: gitlab-creds
  namespace: flux-system
type: Opaque
stringData:
  username: "<Token name>" # Define the token name
  password: "<Token ID>" # Define the token ID
EOF
```

```bash
$ kubectl apply -f flux_git_creds.yaml

$ kubectl get secret gitlab-creds -n flux-system
NAME                                  TYPE                 DATA   AGE
gitlab-creds                          Opaque               2      6s
```

:::note
Check out the different secret options described [here](https://fluxcd.control-plane.io/operator/fluxinstance/#sync-configuration) and decide which one is suitable for your setup.
:::

### Flux Repositories

As we did not use the _sync_ field in the `FluxInstance` resource, we can create our `GitRepository` resources and define which sources we want Flux to watch for and synchronise.

```yaml showLineNumbers
cat <<EOF > flux_repo.yaml
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: staging-env
  namespace: flux-system
spec:
  interval: 1m0s
  ref:
    branch: main
  secretRef:
    name: gitlab-creds # The secret name created in previous step
  timeout: 60s
  url: https://<your GitLab domain>/<group name>/<repository name>.git # Define your GitLab instance and the location of the Repository
                                                                      # If it is within a Group, append the <group name> to the URL
                                                                      # Else just add the <repository name>.git to the URL
EOF
```

:::tip
Ensure the name defined in the _secretRef_ section is the same as the `secret` created above. For this demonstration, it is defined as **gitlab-creds**.
:::

```bash
$ kubectl apply -f flux_repo.yaml

$ kubectl get gitrepository.source.toolkit.fluxcd.io -A
NAMESPACE     NAME          URL                                                                                 AGE   READY   STATUS
flux-system   staging-env   https://<your GitLab domain>/<group name>/<repository name>.git              16m   True    stored artifact for revision 'main@sha1:cc80'
```

If the READY state is not set to "True", continue with the Troubleshooting section.

## Troubleshooting

### Unable to clone

```yaml
failed to checkout and determine revision: unable to clone 'https://gitlab.test.<your domain>/<group name>/<repository name>.git': authentication required: HTTP Basic: Access denied. If a password was provided for Git authentication, the password was incorrect or you're required to use a token instead of a password. If a token was provided, it was either incorrect, expired, or improperly scoped.
```

- A common reason for the error above can be an incorrect password provided in the secret named `gitlab-creds`. Double-check that the provided password or Token ID is correct. For the credentials, the username is the name of the Token, and the password is the Token ID.

- Another reason is the limited permissions to the target source/repository. The Token should be defined with complete read/write access to the GitLab API. I defined `API` permissions for the Token.

- There are cases where the secret created in a previous step is incorrectly defined. Try to edit the secret, collect the encoded values and try to decode them just to ensure the values match.
  - ```echo "username encoded value" | base64 -d```
  - An alternative and a last resort troubleshooting option is to use the Flux CLI to create the secret for you. Check for similar GitHub issues like [this](https://github.com/fluxcd/flux2/issues/4292).
    - ```bash
      $ flux -n flux-system create secret git gitlab-creds \
      --url=https://<your GitLab domain>/<group name> \
      --username=<Token name> \
      --password=<Token ID>
      ```

### Common Troubleshooting Commands

```bash
$ kubectl get events -n flux-system --field-selector type=Warning
$ kubectl get gitrepositories.source.toolkit.fluxcd.io -A
$ kubectl get helmrepositories.source.toolkit.fluxcd.io -A
```

## Conclusion

We bootstraped and deployed Flux using the Flux operator on a Kubernetes cluster while connecting a GitLab repository on a self-hosted installation. In the next blog post, we will showcase how to use Sveltos to automatically bootstrap and deploy Flux alongside dynamic application deployment using the upcoming Sveltos EventFramework features! Stay tuned!

## Resources

- [FluxCD Installation Details](https://fluxcd.io/flux/installation/)
- [Flux Operator Documentation](https://fluxcd.control-plane.io/operator/)
- [Flux and Gitlab bootstrap](https://fluxcd.io/flux/installation/bootstrap/gitlab/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!