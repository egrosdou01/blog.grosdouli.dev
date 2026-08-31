---
slug: vcluster-cilium-gateway-api-shared-resources
title: "Cilium Gateway API for vCluster Tenant Clusters on RKE2 | Shared Gateway API Resources per Tenant | vCluster"  
authors: [egrosdou01]
date: 2026-09-01
image: ./vcluster_architecture.png
description: Share Kubernetes resources between the Control plane cluster and the vCluster tenants. In this example, we dive into sharing Gateway API resources between setups.
tags: [kubernetes,vcluster,cilium]
keywords: [Gateway API,CiliumPodIPPool,CiliumLoadBalancerIPPool,L2 announcements,RKE2]
---

**Summary**:
In previous parts of the series, we laid the foundation for creating and using multitenant environments with [vCluster](https://www.vcluster.com/) and [Cilium](https://docs.cilium.io/en/stable/) for networking, observability, and security. In today's post, we introduce a way of sharing Kubernetes resources and custom resource defintions between the Control Plane cluster and the underlying virtual clusters.
<!--truncate-->

## Scenario

As platform engineering teams, we always want control over what we deploy for our consumers such as cluster types, configuration, etc.
In multitenant setups, this means allowing fundamental resources from the Control Plane cluster to be shared across tenant environments. The goal is to give teams the freedom to use their clusters as they see fit, while still be in full control over the deployments.

In today's demonstration, we will allow teams to share Gateway API resources backed by `LoadBalancer` services provided by Cilium. We introduce a straightforward way of sharing Gateway API resources between the Control Plane cluster and the underlying tenant environments. Cilium is configured to integrate with Gateway API, the required CRDs are installed only in the Control Plane cluster, and we keep the same versions and cluster names used in the previous posts.

## Lab Setup

```bash
+-------------------------+--------------+------------------+
|        Resources        |     Type     |     Version      |
+-------------------------+--------------+------------------+
|  Control Plane Cluster  |     RKE2     | v1.35.6+rke2r1   |
|     vcluster-team-d     |     K8s      |     v1.36.0      |
|         Cilium          |     CNI      |     v1.19.4      |
+-------------------------+--------------+------------------+
```

:::note
The Control Plane cluster is the cluster that hosts the virtualised control planes for the tenant clusters.
:::

## Introduction to Gateway API

While the Ingress API supports basic routing based on path and host rules, it lacks support for advanced routing features. This is where Gateway API enters the discussion.

>Gateway API is an official Kubernetes project focused on L4 and L7 routing in Kubernetes. This project represents the next generation of Kubernetes Ingress, Load Balancing, and Service Mesh APIs.

:::note
On the 24th of March 2026, the [ingress-NGINX](https://github.com/kubernetes/ingress-NGINX) project was officially archived. `ingress-nginx` was an Ingress controller for Kubernetes using NGINX as a reverse proxy and load balancer. Of course, other options are available to serve as Ingress controllers, but a large percent of the community out there worked on adopting Gateway API as the next generation of traffic engineering.
:::

### Why Gateway API Matters?

Gateway API does not only overcome the constraints of supporting only `HTTP` and `HTTPS` traffic, it provides a more robust, extensible, and role-oriented approach to traffic engineering. The project represents the next generation of Kubernetes Ingress, Load Balancing, and Service Mesh APIs.

[Source](https://gateway-api.sigs.k8s.io/docs/introduction/)

## Control Plane Cluster - Cilium Configuration

As a starting point, we will expand the Cilium configuration and add the required Helm values to enable the integration of Cilium with the Gateway API. Cilium is the underlying layer for our networking, observability, and security, powered by eBPF, and since version 1.12.x, Cilium integrates nicely with the Gateway API.

### Cilium Helm Chart Upgrade

To enable the integration and going through the [official documentation](https://docs.cilium.io/en/v1.19/network/servicemesh/gateway-api/gateway-api/), a few prerequisites are required. Take a look at the updated Helm chart values file. 

```yaml showLineNumbers
// highlight-start
gatewayAPI:
  enabled: true
// highlight-end
k8sClientRateLimit:
  burst: 40 # Important value when many services run on a Kubernetes cluster. Check out the documentation https://docs.cilium.io/en/v1.18/network/l2-announcements/#sizing-client-rate-limit
  qps: 20 # Important value when many services run on a Kubernetes cluster. Check out the documentation https://docs.cilium.io/en/v1.18/network/l2-announcements/#sizing-client-rate-limit
kubeProxyReplacement: true # Required for the Gateway API integration
l2announcements:
  enabled: true
```

```bash
$ helm upgrade rke2-cilium rke2-charts/rke2-cilium --version 1.19.400 --namespace kube-system -f values_control_plane.yaml
```

Once the `helm upgrade` command is complete, deploy the below Gateway API CRDs to the Control Plane cluster.

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/standard/gateway.networking.k8s.io_gatewayclasses.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/standard/gateway.networking.k8s.io_gateways.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/standard/gateway.networking.k8s.io_httproutes.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/standard/gateway.networking.k8s.io_referencegrants.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/standard/gateway.networking.k8s.io_grpcroutes.yaml
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.4.1/config/crd/experimental/gateway.networking.k8s.io_tlsroutes.yaml(Optional)
```
#### Validation

```bash
$ kubectl get crds | grep gateway.networking.k8s.io

gatewayclasses.gateway.networking.k8s.io                   2026-07-28T06:52:01Z
gateways.gateway.networking.k8s.io                         2026-07-28T06:52:02Z
grpcroutes.gateway.networking.k8s.io                       2026-07-28T06:52:03Z
httproutes.gateway.networking.k8s.io                       2026-07-28T06:52:05Z
referencegrants.gateway.networking.k8s.io                  2026-07-28T06:52:06Z
tlsroutes.gateway.networking.k8s.io                        2026-07-28T06:52:07Z

$ kubectl get gatewayclass
NAME     CONTROLLER                     ACCEPTED   AGE
cilium   io.cilium/gateway-controller   True       47h
```

:::note
Especially in older version of Cilium, there were instances the `GatewayClass` was not available in the cluster or in an Unknown state. Take a look [here](https://github.com/cilium/cilium/issues/42956#issuecomment-3708750583) for more details. Feel free to explore any related GitHub issues to pin point to a specific behaviour observed.
:::

### CiliumLoadBalancerIPPool

We already described in a dedicated [vCluster multi-pool setup](./vcluster-updates-04.md) post how to enable the Cilium `Multi-Pool` mode and `CiliumLoadBalancerIPPool` functionality leveraging L2 Announcements. For more details on the topic, follow the sections [Cilium configuration](./vcluster-updates-04.md#configuration) and [Cilium CRDs](./vcluster-updates-04.md#cilium-crds).

:::note
The `CiliumL2AnnouncementPolicy` resource should be available at the cluster if you followed [part 2](./vcluster-updates-02.md#create-ciliuml2announcementpolicy).
:::

## vCluster Helm Chart Update

### Documentation and Discovery

Once we ensured Cilium is fully functional with Gateway API, it is time to take a look at the vCluster side and check how to share resources between the Control Plane and the multitenant cluster. According to the [official documentation](https://www.vcluster.com/docs/vcluster/configure/vcluster-yaml/sync/)

>syncing is the process by which vCluster replicates resources between the tenant cluster and the Control Plane Cluster. By default, vCluster only syncs low-level resources, such as pods, secrets, configmaps, or services, but a user can enable many other resources for all use cases.

This is promising, but not exactly what we look for. Reading more of the documentation, I found an [example](https://www.vcluster.com/docs/vcluster/configure/vcluster-yaml/sync/to-host/advanced/custom-resources#configure-kubernetes-gateway-api-sync) sharing a `Gateway` resource between the Control Plane cluster and the multitenant setups. This could have been something we could use, however, my main goal is to allow teams to use their own `Gateway` and Gateway related resources.

To conclude the discovery, I did not find a way to use the free version of vCluster to cover my use case. However, as I have a limited availability Enterprise license, I managed to achieve my goal. We will start with the vCluster Helm chart values, outline the additions and why they are required, while we demo a simple NGINX application at the underlying tenant cluster to prove our point.

### vCluster Helm Chart Values

We will update the existing Helm chart values used in parts [1](vcluster-updates-01.md) and [2](vcluster-updates-02.md). The section of interest is under the `sync.toHost.customResources` field. First, we will specify the CRDs we want to sync with the underlying tenant clusters and then add specific [Patches](https://www.vcluster.com/docs/vcluster/configure/vcluster-yaml/sync/to-host/advanced/custom-resources#patches) to make the setup work as expected.

#### Synchronise CRDs

```yaml showLineNumbers
sync:
  toHost:
    customResources: # Outline the CRDs dedicated to Gateway API
      gatewayclasses.gateway.networking.k8s.io:
        enabled: true
      gateways.gateway.networking.k8s.io:
        enabled: true
      httproutes.gateway.networking.k8s.io:
        enabled: true
      grpcroutes.gateway.networking.k8s.io:
        enabled: true
      referencegrants.gateway.networking.k8s.io:
        enabled: true
      tlsroutes.gateway.networking.k8s.io:
        enabled: true
```

When syncing resources from the tenant clusters to the Control Plane cluster, vCluster needs to rewrite references so they point to the correct resources in the Control Plane cluster. This can only happen using the Patches mechanism. Without that, we do see the below information from the Control Plane node when we create `HTTPRoute` resources. Effectively, the mapping between the tenant and the Control Plane node do not match.

```bash
$ kubectl get httproute -n vcluster-team-d -o yaml # Query the output on the Control Plane node
spec:
  parentRefs:
    - name: team-d-gateway        # The name does not exist on the Control plane node
      namespace: default          # The default namespaces does not reflect the namespace on the Control plane node
  rules:
    - backendRefs:
        - name: nginx             # The backendRefs is defined as nginx-x-default-x-vcluster-team-d in the Control plane node
          port: 80
```

To overcome the obstacle mentioned above, a patch needs to be added under `sync.toHost.customResources.httproutes.gateway.networking.k8s.io`.

```yaml showLineNumbers
httproutes.gateway.networking.k8s.io:
  enabled: true
  patches:
    - path: spec.parentRefs[*].name # Automatically rewrite Gateway references to synced names
      reference:
        apiVersion: gateway.networking.k8s.io/v1
        kind: Gateway
    - path: spec.rules[*].backendRefs[*].name # Automatically rewrite backend service references
      reference:
        apiVersion: v1
        kind: Service
```

Without these patches, unfortunately, the `HTTPRoute` resources would reference non-existent resources in the Control Plane cluster and fail to provide a working example.

### Update vCluster Helm Deployment

```bash
$ export KUBECONFIG=control-plane-cluster.yaml

$ helm upgrade --install vcluster-team-d vcluster \
  --repo https://charts.loft.sh \
  --namespace vcluster-team-d \
  --create-namespace \
  -f vcluster_team_d_syncer.yaml
```

Once the pods in the `vcluster-team-d` namespace of the Control Plane cluster are in a **READY** state, proceed with the NGINX application deployment.

:::note
If the pods in the `vcluster-team-d` namespace are in an **Error** state, check the logs of the pod using the command `kubectl logs <pod-name> -n vcluster-team-d`. If there is a line indicating a license issue, ensure the tenant cluster is registered with the vCluster Platform, and an [Enterprise license](https://www.vcluster.com/pricing) is available.
:::

#### Validation

After the successful deployment, the Gateway API CRDs are available in the underlying tenant cluster.

```bash
$ export KUBECONFIG=vcluster-team-d.yaml

$ kubectl get crds | grep gateway.networking.k8s.io
gatewayclasses.gateway.networking.k8s.io    2026-07-28T07:16:49Z
gateways.gateway.networking.k8s.io          2026-07-28T07:16:51Z
grpcroutes.gateway.networking.k8s.io        2026-07-28T07:16:52Z
httproutes.gateway.networking.k8s.io        2026-07-28T07:16:53Z
referencegrants.gateway.networking.k8s.io   2026-07-28T07:16:55Z
tlsroutes.gateway.networking.k8s.io         2026-07-28T07:16:56Z
```
### Deploy an NGINX Application - Multitenant Cluster

#### Gateway Resource

Let's start by creating a `Gateway` resource for an NGINX application deployment.

```yaml showLineNumbers
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: team-d-gateway
spec:
  gatewayClassName: cilium
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: All
```

```bash
$ export KUBECONFIG=vcluster-team-d.yaml

$ kubectl apply -f team-d-gateway.yaml
```

```bash
$ export KUBECONFIG=control-plane-cluster.yaml

$ kubectl get gateway -n vcluster-team-d
NAME             CLASS    ADDRESS       PROGRAMMED   AGE
v48m682h72rpai   cilium   10.10.20.24   True         57s

$ kubectl get svc -n vcluster-team-d | grep -i cilium-gateway
NAME                                       TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                  AGE
cilium-gateway-v48m682h72rpai              LoadBalancer   10.43.111.85    10.10.20.24   80:32583/TCP             67s
```
#### HTTPRoute Resource

```yaml showLineNumbers
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: nginx-route
spec:
  parentRefs:
    - name: team-d-gateway
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: nginx
          port: 80
```

#### NGINX Resource

```yaml showLineNumbers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
  namespace: default
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```
#### Apply Resources

```bash
$ export KUBECONFIG=vcluster-team-d.yaml

$ kubectl apply -f team-d-httproute.yaml,nginx-deployment.yaml
```

```bash
$ kubectl get pods,svc,httproute
NAME                         READY   STATUS    RESTARTS   AGE
pod/nginx-59c4c87bc6-b5c56   1/1     Running   0          20s
NAME                                    TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/cilium-gateway-team-d-gateway   LoadBalancer   10.43.111.85   10.10.20.24   80:32583/TCP   3m11s
service/kubernetes                      ClusterIP      10.43.213.98   <none>        443/TCP        96m
service/nginx                           ClusterIP      10.43.42.143   <none>        80/TCP         20s
NAME                                              HOSTNAMES   AGE
httproute.gateway.networking.k8s.io/nginx-route               20s
```

#### Validation

The application should be accessible from within the **vcluster-team-d** cluster and from any location within the defined subnet/network segment. We can simply perform a cURL test.

```bash
curl http://${GATEWAY_IP}
```

## Common Issues and Troubleshooting Steps

### Cilium Gateway Class

In some Cilium version between **1.17** and **1.18**, when the Gateway API integration is enabled, the `GatewayClass` resource is not automatically created. To force the creation of the resource, update the Cilium Helm chart values and include the highlighted lines below.

```yaml showLineNumbers
gatewayAPI:
  enabled: true
// highlight-start
  gatewayClass:
    create: "true"
// highlight-end
```
### Gateway Stuck in Pending State

If the synchronisation of resources between the tenant and the Control Plane cluster is not done correctly, the `Gateway` resource on the tenant cluster will never get an IP address. Some common issues are around **IP pool exhaustion**, **service selection does not match the tenant namespace**, or some underlying issue with the Cilium Operator. Follow the commands described below to troubleshoot the issue further.

```bash
$ kubectl describe gateway team-d-gateway
$ kubectl get ciliumloadbalancerippool vcluster-team-d-pool -o yaml
```
### HTTPRoute Not Working

The `HTTPRoute` created does not route the traffic correctly. Some common issues relate to the **backend service** not being available or the **port mismatch** between the `HTTPRoute` and the service.

```bash
$ kubectl describe httproute nginx-route
$ kubectl get gateway team-d-gateway -o jsonpath='{.status.listeners}'
$ kubectl get svc nginx
$ kubectl get httproute nginx-route -o yaml
```

## Advantages of Setup

While we could allow teams to deploy their own CRDs on a tenant cluster, we give them the ability to utilise resources available in the Control Plane cluster without going through the process of installing CRDs or other resources required for their work. This matters as developers and teams can have their own `Gateway` and relevant resources without worrying about other tenants or conflicts!

## Resources

- [vCluster Custom Resources Documentation](https://www.vcluster.com/docs/vcluster/configure/vcluster-yaml/sync/to-host/advanced/custom-resources)
- [Cilium Gateway API Documentation](https://docs.cilium.io/en/latest/network/servicemesh/gateway-api/gateway-api/)
- [Cilium IPAM](https://docs.cilium.io/en/stable/network/lb-ipam/)
- [Gateway API Specification](https://gateway-api.sigs.k8s.io/)
- [Kubernetes Gateway API Reference](https://kubernetes.io/docs/concepts/services-networking/gateway/)

## Conclusion

In today's post, we explored how to share Gateway API resources between the Control Plane cluster and underlying tenant clusters using vCluster's
sync mechanism and Cilium. This approach gives platform teams full control over shared infrastructure while allowing tenant teams the flexibility to manage their own Gateway and HTTPRoute resources. In the next post, we will explore how to setup a Cilium multi-tenant pool for the clusters.

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

## Series Navigation

| Part | Title |
| :--- | :---- |
| [Part 1](./vcluster-updates-01.md) | vCluster Recent Updates |
| [Part 2](./vcluster-updates-02.md) | Introduction to Cilium L2 Announcements and vCluster Platform |
| [Part 3](./vcluster-updates-03.md) | vCluster Networking and Cilium Under the Hood |
| [Part 4 ](./vcluster-updates-04.md)| vCluster and Cilium Multi-Pool Mode |
| [Part 5](./vcluster-updates-05.md) | vCluster and Cilium Gateway API Shared Resources |
