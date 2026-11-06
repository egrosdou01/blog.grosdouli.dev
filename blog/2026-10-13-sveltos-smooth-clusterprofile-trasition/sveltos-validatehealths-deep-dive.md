---
slug: sveltos-day-2-operations-validatehealths-deep-dive
title: "Sveltos for Day-2 Operations: A Deep Dive into validateHealths"
authors: [egrosdou01]
date: 2026-11-13
description: Enhance the smooth transition from one ClusterProfile to another using the transitionFrom combined with the validateHealths fields.
tags: [kubernetes,sveltos,cilium,day2operations,rke2]
keywords: [Sveltos,Cilium,Day2Operations,RKE2]
---

**Summary**:

In the previous post, we discovered the power of the [`transitionFrom`](https://projectsveltos.io/main/deployment_order/transition_from/#the-solution-transitionfrom) field defined in the Sveltos `ClusterProfile`/`Profile` resources when we want a smooth transition of an application from one version to another, minimizing downtime. In this post, we provide the full picture and conclude the series with the `validateHealths` field definition. We will learn how to use different health checks to ensure the applications are healthy based on conditions defined by us, the DevOps and Platform Engineering team.

<!--truncate-->

![title image reading "Me at a Gotcha Moment"](https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1596476959064-URX58JWLKGKWVDKMLOME/michael+scott+surprised.jpg?format=2500w)

## Introduction

Guess what, I had my first Sveltos gotcha after a long time! :') It happened while I was working on a new setup, and even though I am a confident Sveltos user, I still had a gotcha moment. It happened during an update of an application from one version to another. I assumed that everything was working as expected at the targeted Sveltos managed clusters since the `ClusterSummary` status reported that everything was "Provisioned". This was true! Sveltos did the job and deployed the defined application to the targeted clusters, but because I did not have any checks defined in the `ClusterProfile`/`Profile` resources to ensure the application was indeed healthy, I was caught by surprise when the pipelines started failing.

Sveltos does not check whether the application, from a functionality point of view, is healthy. Sveltos ensures the application has been deployed to the targeted clusters as instructed. The checks are more around the resources deployed down those clusters, the Helm chart deployed successfully, the YAML manifest deployed successfully, etc. Having said that, Sveltos gives us the ability to take our deployments to the next level and complete the picture using the [`validateHealths` field](https://projectsveltos.io/main/addons/clusterprofile/#specvalidatehealths). We define a set of checks that Sveltos executes against the managed cluster to assess the health of add-ons and applications in the defined resource. Sveltos holds the `ClusterProfile`/`Profile` in a **non-provisioned** state until all checks pass.

If you already went through the [smooth transition post](./sveltos-smooth-clusterprofile-transition-cilium-cni.md), you know the power of the configuration since we avoid downtime and complete undeployment-redeployment of our applications using Sveltos. In this post, we complete the previously used scenario and include different `validateHealths` conditions to ensure the deployments are healthy after a version update. First, we will work with the standard `validateHealths` specification using a script, and later on we will finalise the post with the job-based checks.

### How does validateHealths work?

Sveltos will utilise the specification defined under the `validateHealths` field and access the health of the application. Different ways of setting the health checks are available.

- **Inspect Kubernetes resources**: Fetch objects by Group/Version/Kind and evaluate them with a [Lua](https://www.lua.org/) script or [CEL](https://cel.dev/) rules
- **Query a Prometheus-compatible metrics endpoint**: Run PromQL instant queries and evaluate the results with a Lua script
- **Combine both**: Inspect a resource and metric values under the script section

:::note
You might wonder what the difference is between the use of Lua and CEL for the validation part. Lua is a programming language and thus richer. It allows us to evaluate more than one resource at once and return messages if a condition is met or not. This will be clear when we go over the following section.
:::

## Lab Setup

```bash
+-------------------------+--------------+------------------+
|        Resources        |     Type     |     Version      |
+-------------------------+--------------+------------------+
|   Management Cluster    |     RKE2     |  v1.36.5+rke2r1  |
|         Cilium          |  Helm Chart  | v1.19.7, v1.19.8 |
|        Sveltos          |  Helm Chart  |     v1.16.0      |
+-------------------------+--------------+------------------+
```

## GitHub Resources

The YAML outputs are not complete. Have a look at the [GitHub repository](https://github.com/egrosdou01/blog-post-resources/tree/main/sveltos-transitionfrom/pt2).

## Prerequisites

We assume a Kubernetes cluster is available with Sveltos installed. We also assume a managed cluster is already registered with Sveltos, and we are ready to work with the `ClusterProfile` resources to deploy add-ons and applications to the targeted clusters. If this is not the case, do not worry. Take a look at the [previous post](./sveltos-smooth-clusterprofile-transition-cilium-cni.md) and complete the first two sections: [Sveltos Installation](./sveltos-smooth-clusterprofile-transition-cilium-cni.md#sveltos-installation) and [Sveltos Resources](./sveltos-smooth-clusterprofile-transition-cilium-cni.md#sveltos-resources).

## Update Sveltos Resources

We will update the `ClusterProfile` resources used in the previous post and include the `spec.validateHealths` field to check if the deployment is **Healthy** on the managed clusters. Sveltos allows us to set and use our own conditions and definitions using Lua and CEL, and define what healthy means for every application deployed. In this example, we will use the Lua programming language since we want to check the status of more than one resource on the targeted managed clusters. If you want to explore more examples, take a look at the [Sveltos official documentation](https://projectsveltos.io/main/addons/clusterprofile/#specvalidatehealths).

### ClusterProfile - Cilium v1.19.7|Cilium v1.19.8

```yaml showLineNumbers
apiVersion: config.projectsveltos.io/v1beta1
kind: ClusterProfile
metadata:
  name: cilium-cni-1197-staging
spec:
  clusterSelector:
    matchLabels:
      env: staging
      cni: cilium1197
  helmCharts:
  - chartName: cilium/cilium
    chartVersion: 1.19.7
    helmChartAction: Install
    releaseName: cilium
    releaseNamespace: kube-system
    repositoryName: cilium
    repositoryURL: https://helm.cilium.io/
    values: |
      k8sServiceHost: "Your API Server IP Address"
      k8sServicePort: 6443
      kubeProxyReplacement: true
  // highlight-start
  validateHealths:
  - name: cilium
    featureID: Helm
    group: "apps"
    version: "v1"
    kind: "DaemonSet"
    namespace: kube-system
    labelFilters:
    - key: app.kubernetes.io/name
      operation: Equal
      value: cilium-agent
    script: |
      function evaluate(obj)
        if obj.status ~= nil and obj.status.numberAvailable ~= nil
            and obj.status.desiredNumberScheduled ~= nil
            and obj.status.numberAvailable == obj.status.desiredNumberScheduled then
          return {healthy=true, message=""}
        end
        return {healthy=false, message="Available replicas not matching desired scheduled replicas for ds/cilium"}
      end
  - name: cilium-operator
    featureID: Helm
    group: "apps"
    version: "v1"
    kind: "Deployment"
    namespace: kube-system
    labelFilters:
    - key: app.kubernetes.io/name
      operation: Equal
      value: cilium-operator
    script: |
      function evaluate(obj)
        if obj.status ~= nil and obj.status.availableReplicas ~= nil
            and obj.status.availableReplicas >= 1 then
          return {healthy=true, message=""}
        end
        return {healthy=false, message="cilium-operator does not have ready replicas"}
      end
  // highlight-end
```

Using the Lua language and the `labelFilters`, we can narrow down the scope of the checks. We validate whether all the Cilium agents are Running. For the Cilium Operator, we ensure we have at least one `availableReplicas` in a Running state.

Let's apply the updated `ClusterProfile` to the **management** cluster and ensure our deployment is healthy end-to-end.

:::tip
The managed clusters already have the right set of labels. Follow [part 1](./sveltos-smooth-clusterprofile-transition-cilium-cni.md) to understand how that works, or take a look at the [official Sveltos documentation for registering clusters](https://projectsveltos.io/main/register/register-cluster/).
:::

```bash
$ export KUBECONFIG=/path/to/management/cluster/kubeconfig

$ kubectl apply -f sveltos_day2_resources/
```

### Validation

**Management Cluster**

```bash

$ kubectl get clusterprofile,clustersummary -A

NAMESPACE   NAME                                                              AGE
            clusterprofile.config.projectsveltos.io/cilium-cni-1197-staging   7m34s
            clusterprofile.config.projectsveltos.io/cilium-cni-1198-staging   2m13s

NAMESPACE   NAME                                                                                  AGE
staging     clustersummary.config.projectsveltos.io/cilium-cni-1197-staging-sveltos-edge-zone01   7m34s
```

```bash
$ kubectl get clustersummary cilium-cni-1197-staging-sveltos-edge-zone01 -n staging -o yaml
status:
  dependencies: no dependencies
  featureSummaries:
  - featureID: Helm
    hash: hd/Pe4IWmVEFZIdmszqDSL6j1AOxu9BgUzUeQsH3ATA=
    status: Provisioning
  helmReleaseSummaries:
  - chartName: cilium/cilium
    chartVersion: 1.19.7
    releaseName: cilium
    releaseNamespace: kube-system
    repoURL: https://helm.cilium.io/
    repositoryName: cilium
    status: Managing
    valuesHash: wRgxTZp4IJS12t2h9AH9ODSw7XEsS9Dqyq0T/XmW1a4=
  nextReconcileTime: "2026-10-25T08:52:41Z"
```

:::note
It might take a few seconds for Sveltos to execute the tests and ensure the `cilium-operator` Deployment and the `cilium` DaemonSet pass the `validateHealths` conditions. While checking the `ClusterSummary`, the error below might appear. Keep in mind that if the Lua script and the targeted objects are correct, the failures should be cleared out within a few seconds.

```yaml
status:
  dependencies: no dependencies
  featureSummaries:
  - consecutiveFailures: 1
    failureMessage: 'health check ''cilium'' for feature Helm failed: resource DaemonSet
      kube-system/cilium is not healthy "resource kube-system/cilium is not healthy:
      Available replicas not matching desired scheduled replicas for ds/cilium"'
    featureID: Helm
    hash: /MscB4+HnKIBy7RfynrpKI3BZXidPWoy7Pd9iBrWBh4=
    lastAppliedTime: "2026-10-25T09:15:03Z"
    resourceSummaryDeployed: false
    status: Failed
```
:::

```bash
status:
  dependencies: no dependencies
  featureSummaries:
  - featureID: Helm
    hash: 2Cq2S054v7lVUeemcZXjt6BOXVPeHMCjyC5C4iX5R1Y=
    lastAppliedTime: "2026-10-25T09:16:27Z"
    resourceSummaryDeployed: false
    status: Provisioned
  helmReleaseSummaries:
  - chartName: cilium/cilium
    chartVersion: 1.19.7
    releaseName: cilium
    releaseNamespace: kube-system
    repoURL: https://helm.cilium.io/
    repositoryName: cilium
    status: Managing
    valuesHash: wRgxTZp4IJS12t2h9AH9ODSw7XEsS9Dqyq0T/XmW1a4=
```

**Managed Cluster**

```bash
$ kubectl get pods -n kube-system -l app.kubernetes.io/part-of=cilium -w
NAME                               READY   STATUS    RESTARTS   AGE
cilium-d7cp9                                           1/1     Running     0             32s
cilium-envoy-pnf2b                                     1/1     Running     0             32s
cilium-envoy-qxzt4                                     1/1     Running     0             32s
cilium-gqzsc                                           1/1     Running     0             32s
cilium-operator-7bbf976ddf-72kb6                       1/1     Running     0             32s
cilium-operator-7bbf976ddf-gdhpc                       1/1     Running     0             32s
```

:::tip
Sveltos allows us to define health checks using different Prometheus metrics. We can set the `metricSource` and the `metricQueries` values to run PromQL queries and reference the results in the script section via the metric _name_. For more details, take a look at the [metrics-based checks](https://projectsveltos.io/main/addons/clusterprofile/#metric-based-checks).
:::

## Job-based Checks

While setting Lua or CEL conditions under the `spec.validateHealths` field is suitable for some cases, sometimes there is a need to perform more concrete tests instead of validating a condition. That is the reason why the **job-based checks** were added to the Sveltos stack. Sveltos deploys a Kubernetes Job in the **managed** cluster and uses the Job's **Complete/Failed** outcome as the check result.

:::note
The `jobCheck` field is mutually exclusive with the `script` and `evaluateCEL` on the same check. A single `validateHealths` entry cannot combine an active Job probe with a Lua/CEL evaluation.
:::

For our example, we want to ensure the CNI is deployed successfully and pods can be created without issues. We will create a `ConfigMap` and define a `Job` that checks the state of the Cilium deployment (Cilium Operator, Cilium agent). Then we will update the existing `ClusterProfile` resource to include the job-based check instead of the script under `validateHealths`.

```yaml showLineNumbers
apiVersion: v1
kind: ConfigMap
metadata:
  name: cni-smoke-test
  namespace: default
data:
  job.yaml: |
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: cni-smoke-test
    spec:
      backoffLimit: 0 # It runs once and returns a fail/pass signal
      activeDeadlineSeconds: 60
      template:
        spec:
          restartPolicy: Never
          containers:
          - name: test
            image: busybox:1.38
            command:
            - /bin/sh
            - -c
            - |
              IP=$(hostname -i)
              mkdir -p /tmp/www
              echo "CNI OK" > /tmp/www/index.html
              httpd -f -p 8080 -h /tmp/www &
              sleep 2
              wget -qO- "http://${IP}:8080" | grep -q "CNI OK"
```

```yaml showLineNumbers
apiVersion: config.projectsveltos.io/v1beta1
kind: ClusterProfile
metadata:
  name: cilium-cni-1197-staging
spec:
  clusterSelector:
    matchLabels:
      env: staging
      cni: cilium1197
  helmCharts:
  - chartName: cilium/cilium
    chartVersion: 1.19.7
    helmChartAction: Install
    releaseName: cilium
    releaseNamespace: kube-system
    repositoryName: cilium
    repositoryURL: https://helm.cilium.io/
    values: |
      k8sServiceHost: "Your API Server IP Address"
      k8sServicePort: 6443
      kubeProxyReplacement: true
  // highlight-start
  validateHealths:
  - name: cni-smoke-test
    featureID: Helm 
    jobCheck:
      jobRef:
        kind: ConfigMap
        namespace: default
        name: cni-smoke-test
      timeout: 1m
  // highlight-end
```

Once the resources are deployed to the management cluster, the `ClusterSummary` will be either in Provisioned or Failed state. The failed condition could be due to a failed Job execution. The details of the failure will be visible under the `status` of the `ClusterSummary`. The Job described above will only check if a pod is created, has received an IP address, and then perform a CURL on a defined port. To validate the state of your CNI, follow the instructions provided in the [Cilium official documentation](https://docs.cilium.io/en/stable/contributing/testing/e2e/).

:::note
The Job-based checks feature is available with Enterprise or Enterprise Plus license. Contact the Sveltos team at support@projectsveltos.io to explore license options.
:::

## Conclusion

Day 2 operations decide whether a system survives, and getting them wrong is what keeps us up at night. The gotcha in this post is proof of that. "Provisioned" does not mean "healthy", and Sveltos gives us the tools to close that gap. We started the series with `transitionFrom`, moving from one `ClusterProfile`/`Profile` to another without downtime, and we finished with `validateHealths` to confirm that what we deployed actually works. We went from simple Lua checks against Kubernetes resources all the way to job-based checks for when basic checks are not enough. If there is one thing to take away from this post, it's this: never assume, always validate.

## Resources

- [Sveltos Quick Start](https://projectsveltos.io/main/getting_started/install/quick_start/)
- [Sveltos Smooth Transition](https://projectsveltos.io/main/deployment_order/transition_from/)
- [Sveltos validateHealths](https://projectsveltos.io/main/addons/clusterprofile/#specvalidatehealths)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

## Series Navigation

| Part | Title |
| :--- | :---- |
| [Part 1](./sveltos-smooth-clusterprofile-transition-cilium-cni.md) | Introduction to Sveltos ClusterProfile and transitionFrom |
| [Part 2](./sveltos-validateHealths-deep-dive.md) | Sveltos Validate Health and Job-based checks Deep Dive |
