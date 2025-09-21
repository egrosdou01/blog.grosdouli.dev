---
slug: sveltos-whats-new-part-2
title: "Sveltos Latest Kubernetes Deployments Pt.2"
authors: [egrosdou01]
date: 2025-01-23
image: ./sveltos_logo.jpg
description: Sveltos post-update release feedback - Part 2.
tags: [sveltos,open-source,beginner-guide,"2025"]
---

## Introduction

In [Part 1](sveltos-what's-new-part-1.md) of the series, we demonstrated how to install [Sveltos](https://github.com/projectsveltos) on a Kubernetes **management** cluster, deploy [Kyverno](https://kyverno.io/docs/) and afterwards use the [sveltosctl](https://projectsveltos.github.io/sveltos/getting_started/sveltosctl/sveltosctl/), the [Sveltos Dashboard](https://projectsveltos.github.io/sveltos/getting_started/install/dashboard/), alongside the [Grafana Dashboard](https://projectsveltos.github.io/sveltos/getting_started/install/grafanadashboard/) for observability. In today's post, we will take the next step and talk about the `Dry-run` feature, how to express a Sveltos `ClusterProfile` as a `template` and what the latest `templateResourceRefs` are.
<!--truncate-->

## Pre-requisites

Go through [Part 1](sveltos-what's-new-part-1.md) before continuing with the rest of the post.

## Sveltos Dry-run Feature

Imagine we would like to update the Kyverno Helm chart values due to changes in our use case. Before we proceed with the deployment, we would like to see what will change from a Helm chart point of view.

To do that, we can utilise the [Dry-run](https://projectsveltos.github.io/sveltos/features/dryrun/) feature of Sveltos. Simply, include the `syncMode: DryRun` to the `ClusterProfile`.

### Dry-run ClusterProfile

```yaml
apiVersion: config.projectsveltos.io/v1beta1
kind: ClusterProfile
metadata:
  name: kyverno
spec:
  syncMode: DryRun
  clusterSelector:
    matchLabels:
      env: staging
  helmCharts:
  - repositoryURL:    https://kyverno.github.io/kyverno/
    repositoryName:   kyverno
    chartName:        kyverno/kyverno
    chartVersion:     v3.3.4
    releaseName:      kyverno-latest
    releaseNamespace: kyverno
    helmChartAction:  Install
    values: |
      admissionController:
        replicas: 3
```

Once we apply the `dry-run` `ClusterProfile`, we will see what changed on the Helm chart deployment in comparison to the one deployed in Part 1.

```bash
$ kubectl apply -f <clusterprofile name>
```

```bash
$ sveltosctl show dryrun
+-------------------+---------------+-----------+----------------+---------------+--------------------------------+------------------------+
|      CLUSTER      | RESOURCE TYPE | NAMESPACE |      NAME      |    ACTION     |            MESSAGE             |        PROFILE         |
+-------------------+---------------+-----------+----------------+---------------+--------------------------------+------------------------+
| staging/cluster01 | helm release  | kyverno   | kyverno-latest | Update Values | use --raw-diff to see full     | ClusterProfile/kyverno |
+-------------------+---------------+-----------+----------------+---------------+--------------------------------+------------------------+

$ sveltosctl show dryrun --raw-diff 
Profile: ClusterProfile:kyverno Cluster: staging/cluster01
--- deployed values
+++ proposed values
@@ -1,2 +1,2 @@
 admissionController:
-    replicas: 1
+    replicas: 3
```

From the `--raw-diff` output it is clear that the replica count of the `admissionController` changed from the value of `1` to the value of `3`. Once we are happy with the changes, we can move ahead, remove the `syncMode: DryRun` and apply the updated `ClusterProfile`.

## Express Kyverno ClusterProfile as a Template

With the latest Sveltos [release](https://github.com/orgs/projectsveltos/discussions/893), we can express a Sveltos `ClusterProfile` as a **template**. This feature allows us not only to utilise a **GitOps** approach towards Kubernetes deployments but create a dynamic and scalable configuration for a fleet of clusters. In this section, we will update the Kyverno Sveltos `ClusterProfile` to a template and **set conditions** for the Kyverno deployment based on the managed clusters' **Kubernetes version**.

```yaml
apiVersion: config.projectsveltos.io/v1beta1
kind: ClusterProfile
metadata:
  name: kyverno
spec:
  clusterSelector:
    matchLabels:
      env: staging
  templateResourceRefs:
  - resource:
      apiVersion: lib.projectsveltos.io/v1beta1
      kind: SveltosCluster
      name: "{{ .Cluster.metadata.name }}"
    identifier: Cluster
  helmCharts:
  - repositoryURL:    https://kyverno.github.io/kyverno/
    repositoryName:   kyverno
    chartName:        kyverno/kyverno
    chartVersion: |-
      {{$version := index .Cluster.metadata.labels "projectsveltos.io/k8s-version" }}{{if eq $version "v1.29.8"}}v3.2.8
      {{else}}v3.3.4
      {{end}}
    releaseName:      kyverno-latest
    releaseNamespace: kyverno
    helmChartAction:  Install
```

To be able to extract the managed clusters Kubernetes version, we have to instruct Sveltos to look for that information. The Kubernetes version is stored in the label with the name set to `projectsveltos.io/k8s-version`. By defining the `templateResourceRefs.resource`, we can filter by the `version` and deploy the desired Kyverno version. In this example, Kyverno **v3.2.8** will get deployed to managed clusters with version **v1.29.8** while any other cluster will get the **v3.4.4**.

### sveltoscluster Validation

```bash
$ kubectl get sveltoscluster -A --show-labels
NAMESPACE   NAME        READY   VERSION        LABELS
mgmt        mgmt        true    v1.30.5+k3s1   projectsveltos.io/k8s-version=v1.30.5,sveltos-agent=present
staging     cluster01   true    v1.29.8+k3s1   env=staging,projectsveltos.io/k8s-version=v1.29.8,sveltos-agent=present
staging     cluster02   true    v1.30.5+k3s1   env=staging,projectsveltos.io/k8s-version=v1.30.5,sveltos-agent=present
```

:::note
I have slightly modified the managed cluster versions to demonstrate how the template and the logic applied to the Kyverno `ClusterProfile` work.
:::

### Apply

```bash
$ kubectl apply -f <clusterprofile-name>
```

### Validate

```bash
$ sveltosctl show addons
+-------------------+---------------+-----------+----------------+---------+-------------------------------+------------------------+
|      CLUSTER      | RESOURCE TYPE | NAMESPACE |      NAME      | VERSION |             TIME              |        PROFILES        |
+-------------------+---------------+-----------+----------------+---------+-------------------------------+------------------------+
| staging/cluster01 | helm chart    | kyverno   | kyverno-latest | 3.2.8   | 2024-12-27 14:36:51 +0000 UTC | ClusterProfile/kyverno |
| staging/cluster02 | helm chart    | kyverno   | kyverno-latest | 3.3.4   | 2024-12-27 14:36:41 +0000 UTC | ClusterProfile/kyverno |
+-------------------+---------------+-----------+----------------+---------+-------------------------------+------------------------+
```

As expected, `cluster01` got the Kyverno deployment **v3.2.8** while `cluster02` got the deployment **v3.3.4**. Using a similar approach to the one demonstrated, we can express pretty much any resource defined in a Sveltos `ClusterProfile` as a **template**. For more examples, have a look [here](https://projectsveltos.github.io/sveltos/template/intro_template/).

## Sveltos templateResourceRefs

The `templateResourceRefs` is used by Sveltos within a ClusterProfile/Profiles to retrieve resources in a **Sveltos management cluster**. The **name field** in the `templateResourceRefs` section can be a template. This allows users to dynamically generate names based on information available during deployment plus, making the dynamic automated deployments even easier.

The available cluster information can be found below.

- **cluster namespace**: **.Cluster.metadata.namespace**
- **cluster name**: **.Cluster.metadata.name**
- **cluster type**: **.Cluster.kind**

For the template example above, we used the `templateResourceRefs` and `.Cluster.metadata.name` information to retrieve the **Kubernetes version** of the registered clusters.

More information and examples are located [here](https://projectsveltos.github.io/sveltos/template/intro_template/#templateresourcerefs-namespace-and-name).

## Conclusion

Make your deployments **highly automated** and **dynamic** using the power of Sveltos! If you have any questions or issues, feel free to get in touch with us via Slack or any available social media channels!

## Resources

- **Sveltos Dry-run**: https://projectsveltos.github.io/sveltos/features/dryrun/
- **Sveltos Templating**: https://projectsveltos.github.io/sveltos/template/intro_template/
- **Code Resources**: https://github.com/egrosdou01/blog-post-resources
- **Automate vCluster Management in EKS with Sveltos and Helm (by Colin Lacy)**: https://www.youtube.com/watch?v=GQM7Qn9rWVU


## ✉️ Contact

We are here to help! Whether you have questions, or issues or need assistance, our Slack channel is the perfect place for you. Click here to [join us](https://join.slack.com/t/projectsveltos/shared_invite/zt-1hraownbr-W8NTs6LTimxLPB8Erj8Q6Q) us.

## 👏 Support this project

Every contribution counts! If you enjoyed this article, check out the Projectsveltos [GitHub repo](https://github.com/projectsveltos). You can [star 🌟 the project](https://github.com/projectsveltos) if you find it helpful.

The GitHub repo is a great resource for getting started with the project. It contains the code, documentation, and many more examples.

Thanks for reading!
