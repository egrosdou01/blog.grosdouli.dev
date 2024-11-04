---
slug: cilium-cluster-mesh-rke2
title: Cilium Cluster Mesh on RKE2
authors: [egrosdou01]
date: 2024-07-18
tags: [cilium,rke2,open-source,kubernetes,gitops,devops,"2024"]
---

## Introduction

After spending some time working with the on-prem [RKE2](https://docs.rke2.io/) lab setup, I came to notice a couple of issues while forming in an automated fashion the [Cilium cluster mesh](https://docs.cilium.io/en/stable/network/clustermesh/clustermesh/) between on-prem clusters.

In today's post, we will go through the step-by-step process of forming a **Cilium Cluster Mesh** and explain any issues that might have arisen by following the **GitOps** approach. The cilium CLI will not be required. The deployment will be performed primarily via `Helm` and `kubectl`.
<!--truncate-->

Additionally, we will use the [shared CA](https://docs.cilium.io/en/v1.15/network/clustermesh/clustermesh/#shared-certificate-authority) (Certificate Authority) approach as this is a convenient way to form a cluster mesh in an automated fashion and also the best practise for the Hubble Relay setup. The approach will enable **mTLS** across clusters.

## Lab Setup

```bash
+-----------------+----------------------+----------------------+
|   Cluster Name  |        Type          |       Version        |
+-----------------+----------------------+----------------------+
|   mesh01        | RKE2 managed cluster | RKE2 v1.27.14+rke2r1 |
|   mesh02        | RKE2 managed cluster | RKE2 v1.27.14+rke2r1 |
+-----------------+----------------------+----------------------+

+-------------------+----------+
|    Deployment     | Version  |
+-------------------+----------+
| Rancher2 Provider |  4.2.0   |
|     Cilium        | 1.15.500 |
+-------------------+----------+
```

## Prerequisites

### Infrastructure

For this demonstration, we assume readers have at least two RKE2 clusters up and running. In our case, to create an RKE2 cluster on-prem we used the [Rancher2](https://registry.terraform.io/providers/rancher/rancher2/latest/docs) Terraform provider. The provider allows users to create different resources across different platforms alongside defining information for the RKE2 deployment like IP Address handling, and CNI (Container Network Interface) custom configuration.

### Cilium Cluster Mesh

- The **Cluster Name** and the **Cluster ID** must be unique.
- The **Pods** and the **Services CIDR** ranges must be unique across all the Kubernetes Clusters. The pods need to communicate over a unique IP address. See the IP address schema table above.
- Node CIDRs must be unique. The Nodes to have IP connectivity.
- The Cilium pods must connect to the `ClusterMesh API Server` service exposed on every Kubernetes cluster.

### Resources

Ensure the below are satisfied.

1. Helm CLI installed
1. kubectl installed

## Step 0: RKE2 Terraform Provider

The below snippet is an example configuration on how to deploy an RKE2 cluster via the **Rancher2** Provider.

```terraform
  # RKE2 configuration
  resource "rancher2_cluster_v2" "rke2" {
    # Define basic cluster details like labels and annotations
    annotations           = var.rancher_env.cluster_annotations
    kubernetes_version    = var.rancher_env.rke2_version
    labels                = var.rancher_env.cluster_labels
    enable_network_policy = var.rancher_env.network_policy # Option to enable or disable Project Network Isolation.
    name                  = var.rancher_env.cluster_id
      
      # Define the Cilium Configuration for the cluster
      chart_values = <<-EOF
        rke2-cilium:
          k8sServiceHost: 127.0.0.1
          k8sServicePort: 6443
          kubeProxyReplacement: true # Prepare the deployment for kube-proxy replacement
          operator:
            replicas: 1
          hubble: # Enable Hubble for observability 
            enabled: true
            peerService:
              clusterDomain: cluster.local
            relay:
              enabled: true
            tls:
              auto:
                certValidityDuration: 1095
                enabled: true
                method: helm
            ui:
              enabled: true
        EOF
      
      # Apply machine global settings for the clusters
      machine_global_config = <<EOF
        cni: "cilium" # Enable Cilium CNI for every cluster
        cluster-cidr: ${var.rke_cluster_cidr}
        service-cidr: ${var.rke_service_cidr}
        disable-kube-proxy: true # Disable kube-proxy
        etcd-expose-metrics: false # Do not expose the etcd metrics
        EOF
      
      # Start building the controller and workder nodes dynamically
      dynamic "machine_pools" {
        for_each = var.node
        content {
          cloud_credential_secret_name = data.rancher2_cloud_credential.auth.id
          control_plane_role           = machine_pools.key == "ctl_plane" ? true : false
          etcd_role                    = machine_pools.key == "ctl_plane" ? true : false
          name                         = machine_pools.value.name
          quantity                     = machine_pools.value.quantity
          worker_role                  = machine_pools.key != "ctl_plane" ? true : false

          machine_config {
            kind = rancher2_machine_config_v2.nodes[machine_pools.key].kind
            name = replace(rancher2_machine_config_v2.nodes[machine_pools.key].name, "_", "-")
          }
        }
      }
      machine_selector_config {
        config = null
      }
    }
  }

```
As the focus here is more on the **Cilium Cluster Mesh** setup, we will not go into much detail about the Terraform RKE2 deployment. If there is demand for an in-depth blog post about Terraform RKE2 deployments, feel free to get in touch.

## Step 1: Export kubeconfig
Either from the Terraform execution plan or via the Rancher UI, collect the kubeconfig of the RKE2 clusters. Alternatively, we can `SSH` into one of the RKE2 master nodes and collect the `kubeconfig` found in the directory `/etc/rancher/rke2/rke2.yaml`.

```bash
$ export KUBECONFIG=<directory of kubeconfig>
$ kubectl nodes
```

## Step 2: Helm list and values export
RKE2 comes with its own Cilium CNI Helm chart. That means RKE2 clusters will have an RKE2 Cilium Helm chart deployment in the `kube-system` namespace.

### Validate

```bash
$ export KUBECONFIG=<directory of kubeconfig>
$ helm list -n kube-system

NAME                            	NAMESPACE  	REVISION	UPDATED                                	STATUS  	CHART                                       	APP VERSION
rke2-cilium                     	kube-system	1       	2024-07-13 09:32:09.981662 +0200 CEST  	deployed	rke2-cilium-1.15.500                        	1.15.5     
rke2-coredns                    	kube-system	1       	2024-07-13 07:05:49.846980773 +0000 UTC	deployed	rke2-coredns-1.29.002                       	1.11.1     
rke2-ingress-nginx              	kube-system	1       	2024-07-13 07:06:24.63272854 +0000 UTC 	deployed	rke2-ingress-nginx-4.8.200                  	1.9.3      
rke2-metrics-server             	kube-system	1       	2024-07-13 07:06:24.86243331 +0000 UTC 	deployed	rke2-metrics-server-2.11.100-build2023051513	0.6.3      
rke2-snapshot-controller        	kube-system	1       	2024-07-13 07:06:26.764326178 +0000 UTC	deployed	rke2-snapshot-controller-1.7.202            	v6.2.1     
rke2-snapshot-controller-crd    	kube-system	1       	2024-07-13 07:06:24.217899546 +0000 UTC	deployed	rke2-snapshot-controller-crd-1.7.202        	v6.2.1     
rke2-snapshot-validation-webhook	kube-system	1       	2024-07-13 07:06:24.544748567 +0000 UTC	deployed	rke2-snapshot-validation-webhook-1.7.302    	v6.2.2 
```

### Collect rke2-cilium Helm Values

**mesh01**
```bash
$ helm get values rke2-cilium -n kube-system -o yaml > values_mesh01.yaml
```

**mesh02**
```bash
$ helm get values rke2-cilium -n kube-system -o yaml > values_mesh02.yaml
```

**Example values_mesh01.yaml**

```yaml
global:
  cattle:
    clusterId: c-m-8ffz659l
  clusterCIDR: 10.244.0.0/16
  clusterCIDRv4: 10.244.0.0/16
  clusterDNS: 10.96.0.10
  clusterDomain: cluster.local
  rke2DataDir: /var/lib/rancher/rke2
  serviceCIDR: 10.96.0.0/18
hubble:
  enabled: true
  peerService:
    clusterDomain: cluster.local
  relay:
    enabled: true
  tls:
    auto:
      certValidityDuration: 1095
      enabled: true
      method: helm
  ui:
    enabled: true
k8sServiceHost: 127.0.0.1
k8sServicePort: 6443
kubeProxyReplacement: true
operator:
  replicas: 1
```

:::note
The configuration comes from the `machine_global_config` and `chart_values` sections defined in the Terraform code found in [Step 0](#step-0-rke2-terraform-provider).
:::

## Step 3: Cilium Cluster Mesh Helm Values

To set up the Cilium cluster mesh, we need to include the `rke2-charts` repo and later on, update the Helm values with the required cluster mesh settings. For this demonstration, we will use the `NodePort` deployment. For production environments, a `LoadBalancer` deployment is recommended as we do not have to rely on Node availability.

### Add rke2-charts Repo

The action should be performed in both clusters.

```bash
$ helm repo add rke2-charts https://rke2-charts.rancher.io/
$ helm repo update
```

### Update mesh01 Helm Values

On the same level as global, add the below configuration.

```yaml
tls:
  ca:
    cert: "" # Base64 encoded shared CA crt
    key: "" # Base64 encoded shared CA key
cluster:
  name: mesh01 # The unique name of the cluster
  id: 1 # The unique ID of the cluster used for the cluster mesh formation
clustermesh:
  apiserver:
    replicas: 2
    service:
      type: NodePort # Set the Clustermesh API service to be of type NodePort. Not recommended for Production environments
      nodePort: 32379 # Define the listening port for the Clustermesh API service
    tls:
      authMode: cluster
      server:
        extraDnsNames:
          - "mesh01.mesh.cilium.io" # Define the extra DNS
  config:
    clusters:
    - address: ""
      ips:
      - <Node IP> # The Node IP of the mesh02 cluster
      name: mesh02
      port: 32380 # The NodePort defined on mesh02 for the Clustermesh API service
    enabled: true
    domain: "mesh.cilium.io" # Define the default domain for the mesh
  useAPIServer: true # Enable the Clustermesh API deployment
```

### Update mesh02 Helm Values

On the same level as global, add the below configuration.

```yaml
tls:
  ca:
    cert: "" # Base64 encoded shared CA crt
    key: "" # Base64 encoded shared CA key
cluster:
  name: mesh02 # The unique name of the cluster
  id: 2 # The unique ID of the cluster used for the cluster mesh formation
clustermesh:
  apiserver:
    replicas: 2
    service:
      type: NodePort # Set the Clustermesh API service to be of type NodePort. Not recommended for production environments
      nodePort: 32380 # Define the listening port for the Clustermesh API service
    tls:
      authMode: cluster
      server:
        extraDnsNames:
          - "mesh02.mesh.cilium.io" # Define the extra DNS
  config:
    clusters:
    - address: ""
      ips:
      - <Node IP> # The Node IP of the mesg01 cluster
      name: mesh01 # Define the name of the cluster
      port: 32379 # The NodePort defined on mesh02 for the Clustermesh API service
    enabled: true
    domain: "mesh.cilium.io" # Define the default domain for the mesh
  useAPIServer: true # Enable the Clustermesh API deployment
```

### Update mesh01/mesh02 Helm deployment

To ensure the updated Helm values are applied, we will use the HELM CLI to update the `rke2-cilium` deployment.

```bash
$ helm upgrade rke2-cilium rke2-charts/rke2-cilium --version 1.15.500 --namespace kube-system -f values_mesh01.yaml

$ helm list -n kube-system
```

Perform the commands for the `mesh02` cluster.

:::tip
The `helm upgrade` command will create a new revision of the `rke2-cilium` application and show if the update was successful or not. Additionally, the cilium daemonset will get restarted and the Clustermesh API deployment will get created. Execute the commands below to double-check the update action.

```bash
$ kubectl rollout status daemonset cilium -n kube-system

$ kubectl get pods,svc -n kube-system | grep -i clustermesh
```
:::


## Step 4: Validate Cilium Cluster Mesh

As we do not use the Cilium CLI, to ensure the Cilium cluster mesh works as expected, we will exec into the cilium daemonset and check the required details.

```bash
$ kubectl get ds -n kube-system | grep -i cilium
cilium                          4         4         4       4            4           kubernetes.io/os=linux   7d6h
```

### On mesh01 and mesh02

```bash
$ kubectl exec -it ds/cilium -n kube-system -- cilium status | grep -i clustermesh

Defaulted container "cilium-agent" out of: cilium-agent, install-portmap-cni-plugin (init), config (init), mount-cgroup (init), apply-sysctl-overwrites (init), mount-bpf-fs (init), clean-cilium-state (init), install-cni-binaries (init)
ClusterMesh:             1/1 clusters ready, 11 global-services
```

On both sides, the `ClusterMesh` should point to `1/1 clusters ready`.

```bash
$ kubectl exec -it ds/cilium -n kube-system -- cilium-health status               
Defaulted container "cilium-agent" out of: cilium-agent, install-portmap-cni-plugin (init), config (init), mount-cgroup (init), apply-sysctl-overwrites (init), mount-bpf-fs (init), clean-cilium-state (init), install-cni-binaries (init)
Probe time:   2024-07-20T13:58:47Z
Nodes:
  mesh01/mesh01-controller-3d16581b-7q5bj (localhost):
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=693.829µs
      HTTP to agent:   OK, RTT=118.583µs
    Endpoint connectivity to 10.244.1.71:
      ICMP to stack:   OK, RTT=688.411µs
      HTTP to agent:   OK, RTT=251.927µs
  mesh01/mesh01-controller-3d16581b-v58rq:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=671.007µs
      HTTP to agent:   OK, RTT=237.395µs
    Endpoint connectivity to 10.244.0.75:
      ICMP to stack:   OK, RTT=702.976µs
      HTTP to agent:   OK, RTT=342.115µs
  mesh01/mesh01-worker-7ced0c6c-lz9sp:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=819.21µs
      HTTP to agent:   OK, RTT=397.398µs
    Endpoint connectivity to 10.244.3.215:
      ICMP to stack:   OK, RTT=821.223µs
      HTTP to agent:   OK, RTT=465.965µs
  mesh01/mesh01-worker-7ced0c6c-w294x:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=738.787µs
      HTTP to agent:   OK, RTT=335.803µs
    Endpoint connectivity to 10.244.2.36:
      ICMP to stack:   OK, RTT=693.326µs
      HTTP to agent:   OK, RTT=426.571µs
  mesh02/mesh02-controller-52d8e160-b27rn:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=683.278µs
      HTTP to agent:   OK, RTT=335.076µs
    Endpoint connectivity to 10.245.0.106:
      ICMP to stack:   OK, RTT=818.386µs
      HTTP to agent:   OK, RTT=387.314µs
  mesh02/mesh02-controller-52d8e160-q4rvf:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=683.097µs
      HTTP to agent:   OK, RTT=301.448µs
    Endpoint connectivity to 10.245.1.75:
      ICMP to stack:   OK, RTT=748.101µs
      HTTP to agent:   OK, RTT=510.124µs
  mesh02/mesh02-worker-a1c14ae0-5l759:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=631.954µs
      HTTP to agent:   OK, RTT=266.391µs
    Endpoint connectivity to 10.245.3.232:
      ICMP to stack:   OK, RTT=751.853µs
      HTTP to agent:   OK, RTT=433.049µs
  mesh02/mesh02-worker-a1c14ae0-c7tcb:
    Host connectivity to x.x.x.x:
      ICMP to stack:   OK, RTT=671.823µs
      HTTP to agent:   OK, RTT=365.949µs
    Endpoint connectivity to 10.245.2.69:
      ICMP to stack:   OK, RTT=690.894µs
      HTTP to agent:   OK, RTT=466.73µs
```

:::note
With the cilium-health status command, you should be able to see all the nodes from both clusters. Check the ICMP and HTTP status. Should be "OK".

Also, it might take a couple of minutes till the cilium-health status is available.

If the time-out persists, have a look at the firewall rules and whether traffic between the clusters is allowed.
:::

:::warning
The NodePort IP addresses set for the cluster mesh need to be the IP addresses of the worker node instead of the master node. If they are the master node, the Cilium Cluster Mesh will not get deployed and we will get the below error.
```
remote-etcd-cluster01                                                             4m25s ago      4s ago       22      failed to detect whether the cluster configuration is required: etcdserver: permission denied 
```
:::

## Step 5: Hubble UI

To work with the Hubble UI we can use the `kubectl port-forward` of the Hubble UI service or update the existing `rke2-cilium` deployment on one of the nodes and expose the Hubble UI as a `NodePort` service. Just include the below in the `values_mesh01.yaml` or the `values_mesh02.yaml` file.

```yaml
  ui:
    enabled: true
    service:
      type: NodePort
```

For more information about the RKE2 Cilium Helm Chart values, have a look [here](https://artifacthub.io/packages/helm/rke2-charts/rke2-cilium/1.15.500).

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/personal-blog/discussions) or reach out to me on any of the social media platforms provided. 😊

We look forward to hearing from you!

## Conclusions

This is it! We performed a Cilium cluster mesh between two on-prem RKE2 clusters in just a few steps! 🎉

It's a wrap for this post! 🎉 Thanks for reading! Stay tuned for more exciting updates!