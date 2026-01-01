---
slug: talos-on-proxmox-opentofu-part-2
title: "Talos, Proxmox, OpenTofu: Beginner's Guide Pt.2"
authors: [egrosdou01]
date: 2024-12-14
image: ./Proxmox_OpenTofu_Talos_Cilium.jpg
description: A step-by-step guide installing a Talos Cluster on Proxmox with OpenTofu - Part 2.
tags: [talos,cilium,opentofu,proxmox]
---

## Introduction

Welcome to **part 2** of the Talos Linux Kubernetes cluster bootstrap on the Proxmox series.

We will enable [Cilium](https://docs.cilium.io/en/stable/) as our CNI (Container Network Interface), use `KubeProxy` replacement, and set up `Cilium Hubble` for network observability. We will outline basic `kubectl` commands to evaluate the Cilium setup alongside network tests.

We assume you already have the basic [project structure](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-proxmox)from part 1, as we will extend the configuration for Cilium. To follow along, check out the [part 1 post](../2024-11-24-talos-proxmox-opentofu/talos-proxmox-opentofu-part-1.md).

![title image reading "Talos Cluster on Proxmox with OpenTofu and Cilium"](Proxmox_OpenTofu_Talos_Cilium.jpg)

<!--truncate-->

:::note
Check out the [updated code](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-cilium-proxmox-module/v0.1.1).
:::

## Lab Setup

```bash
+------------------------------+------------+
|         Deployment            |  Version  |
+------------------------------+------------+
|        Proxmox VE            |   8.2.4    |
|   Talos Kubernetes Cluster   |   1.8.1    |
|         Cilium               |   1.16.4   |
+------------------------------+------------+
+-----------------------------+-----------+
|       OpenTofu Providers    |  Version  |
+-----------------------------+-----------+
|      opentofu/random        |    3.6.2  |
|      telmate/proxmox        | 3.0.1-rc4 |
|      siderolabs/talos       |    0.6.1  |
+-----------------------------+-----------+
+------------------------+---------------------+
|        Binaries        |        Version      |
+------------------------+---------------------+
|         tofu           |    OpenTofu v1.8.1  |
|        kubectl         |        v1.30.2      |
+------------------------+---------------------+
```

## GitHub Resources

The showcase repository is available [here](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-cilium-proxmox).

## Prerequisites

As this is part 2 of the blog post series, we assume the prerequisites are already satisfied. If not, go to the previous [post](talos-proxmox-opentofu-part-1.md) and check the prerequisites.

## Pre-work

In the previous post, we bootstrapped a Talos Kubernetes cluster with the default configuration, which worked like a charm. But now, we want to deploy Cilium. To do that, first, we need to identify what is required from a configuration point of view. The official Talos documentation for Cilium is located [here](https://www.talos.dev/v1.8/kubernetes-guides/network/deploying-cilium/). The Talos guide is written for Cilium `v1.14.x`, however, we can use the information provided to perform our deployment.

Going through the documentation, the easiest approach is to use `Method 5: Using a job`. The method allows us to utilise a job pattern that runs during the bootstrap time. That means, we can dynamically define the `controller` and `worker` `talos_machine_configuration` and then for the `talos_machine_configuration_apply` resource for the `controller`, define the Cilium configuration by utilising the `config_patches` available for that resource.

The above approach utilises the [cilium-cli](https://github.com/cilium/cilium-cli) container for installing Cilium to the cluster. Unfortunately, the configuration provided in the Talos documentation does no longer work. That means the cilium containers end up in an `Error` state because the commands, for example `- --set ipam.mode=kubernetes`, are not recognised in the latest version. To overcome the difficulties, I already had the `cilium-cli` locally, and performed the below.

```bash
$ cilium install --help

Examples:
# Install Cilium in current Kubernetes context with default parameters
cilium install

# Install Cilium into Kubernetes context "kind-cluster1" and also set cluster
# name and ID to prepare for multi-cluster capabilities.
cilium install --context kind-cluster1 --set cluster.id=1 --set cluster.name=cluster1

Usage:
  cilium install [flags]

Flags:
      --chart-directory string   Helm chart directory
      --datapath-mode string     Datapath mode to use { tunnel | native | aws-eni | gke | azure | aks-byocni } (default: autodetected).
      --disable-check strings    Disable a particular validation check
      --dry-run                  Write resources to be installed to stdout without actually installing them
      --dry-run-helm-values      Write non-default Helm values to stdout without performing the actual installation
  -h, --help                     help for install
      --list-versions            List all the available versions without actually installing
      --nodes-without-cilium     Configure the affinities to avoid scheduling Cilium components on nodes labeled with cilium.io/no-schedule. It is assumed that the infrastructure has set up routing on these nodes to provide connectivity within the Cilium cluster.
      --repository string        Helm chart repository to download Cilium charts from (default "https://helm.cilium.io")
      --set stringArray          Set helm values on the command line (can specify multiple or separate values with commas: key1=val1,key2=val2)
      --set-file stringArray     Set helm values from respective files specified via the command line (can specify multiple or separate values with commas: key1=path1,key2=path2)
      --set-string stringArray   Set helm STRING values on the command line (can specify multiple or separate values with commas: key1=val1,key2=val2)
  -f, --values strings           Specify helm values in a YAML file or a URL (can specify multiple)
      --version string           Cilium version to install (default "v1.15.6")
      --wait                     Wait for helm install to finish
      --wait-duration duration   Maximum time to wait for status (default 5m0s)

Global Flags:
      --context string             Kubernetes configuration context
      --helm-release-name string   Helm release name (default "cilium")
  -n, --namespace string           Namespace Cilium is running in (default "kube-system")
```

From the output above, the flags `--version` and `--values` are of interest to us. The `--version` flag can be used to specify the Cilium version to be installed while the `--values` flag can be used to pass a `.yaml` definition that contains the Cilium configuration. If you have performed a Cilium Helm installation before, this should be the straightforward approach.

### Cilium Configuration

For the Cilium setup, I used the example from the Talos documentation and made the necessary changes in the `command` section of the container definition. The `yaml` definition was converted into a template to dynamically pass the `cilium-cli` version alongside the `Cilium` version.

**cilium_config.tfmpl**

```yaml
cluster:
  inlineManifests:
    - name: cilium-install
      contents: |
         ---
         apiVersion: rbac.authorization.k8s.io/v1
         kind: ClusterRoleBinding
         metadata:
           name: cilium-install
         roleRef:
           apiGroup: rbac.authorization.k8s.io
           kind: ClusterRole
           name: cluster-admin
         subjects:
         - kind: ServiceAccount
           name: cilium-install
           namespace: kube-system
         ---
         apiVersion: v1
         kind: ServiceAccount
         metadata:
           name: cilium-install
           namespace: kube-system
         ---
         apiVersion: batch/v1
         kind: Job
         metadata:
           name: cilium-install
           namespace: kube-system
         spec:
           backoffLimit: 10
           template:
             metadata:
               labels:
                 app: cilium-install
             spec:
               restartPolicy: OnFailure
               tolerations:
                 - operator: Exists
                 - effect: NoSchedule
                   operator: Exists
                 - effect: NoExecute
                   operator: Exists
                 - effect: PreferNoSchedule
                   operator: Exists
                 - key: node-role.kubernetes.io/control-plane
                   operator: Exists
                   effect: NoSchedule
                 - key: node-role.kubernetes.io/control-plane
                   operator: Exists
                   effect: NoExecute
                 - key: node-role.kubernetes.io/control-plane
                   operator: Exists
                   effect: PreferNoSchedule
               affinity:
                 nodeAffinity:
                   requiredDuringSchedulingIgnoredDuringExecution:
                     nodeSelectorTerms:
                       - matchExpressions:
                           - key: node-role.kubernetes.io/control-plane
                             operator: Exists
               serviceAccount: cilium-install
               serviceAccountName: cilium-install
               hostNetwork: true
               containers:
               - name: cilium-install
                 image: quay.io/cilium/cilium-cli-ci:${cilium_cli_version}
                 env:
                 - name: KUBERNETES_SERVICE_HOST
                   valueFrom:
                     fieldRef:
                       apiVersion: v1
                       fieldPath: status.podIP
                 - name: KUBERNETES_SERVICE_PORT
                   value: "6443"
                 volumeMounts:
                   - name: values
                     mountPath: /tmp/cilium_helm_values.yaml
                     subPath: cilium_helm_values.yaml
                 command:
                  - cilium
                  - install
                  - --version=${cilium_version}
                  - --values
                  - /tmp/cilium_helm_values.yaml
               volumes:
               - name: values
                 configMap:
                   name: cilium-install-values
```

### Bootstrap and Cilium Values

**init_install_controller.tfmpl**

```yaml
machine:
  install:
    image: ${initial_image}
cluster:
  network:
    cni:
      name: none
  proxy:
    disabled: true
  inlineManifests:
  - name: cilium-install-config
    contents: |
      ---
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: cilium-install-values
        namespace: kube-system
      data:
        cilium_helm_values.yaml: |-
          kubeProxyReplacement: true
          k8sServiceHost: localhost
          k8sServicePort: 7445
          securityContext:
            capabilities:
              ciliumAgent: [ CHOWN, KILL, NET_ADMIN, NET_RAW, IPC_LOCK, SYS_ADMIN, SYS_RESOURCE, DAC_OVERRIDE, FOWNER, SETGID, SETUID ]
              cleanCiliumState: [ NET_ADMIN, SYS_ADMIN, SYS_RESOURCE ]
          ipam:
            mode: kubernetes
          cgroup:
            autoMount:
              enabled: false
            hostRoot: /sys/fs/cgroup
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
```

:::note
In the `ConfigMap` with the name `cilium-install-values` we define the Helm chart values required for the Cilium installation and configuration. A full list of the available Cilium Helm values is located [here](https://github.com/cilium/cilium/blob/main/install/kubernetes/cilium/values.yaml).
:::

## Bootstrap Talos Kubernetes Cluster

The difference with the previous configuration is that will split the `init_install.tfmpl` file in two instead. One for the `controller` and one for the `worker` nodes. The `worker` nodes include only the initial image setup while the `controller` nodes include the **CNI** and **proxy** configuration.

### data.tf

```hcl
# Generate the controller configuration and instantiate the Initial Image for the Talos configuration
data "talos_machine_configuration" "machineconfig_controller" {
  cluster_name     = var.talos_cluster_details.name
  talos_version    = var.talos_cluster_details.version
  cluster_endpoint = "https://${tolist([for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]}:6443"
  machine_type     = "controlplane"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
  config_patches = [
    templatefile("${path.module}/files/init_install_controller.tfmpl", {
      initial_image = local.initial_image
    }),
    templatefile("${path.module}/files/cilium_config.tfmpl", {
      cilium_cli_version = var.talos_cluster_details.cilium_cli_version
      cilium_version     = var.talos_cluster_details.cilium_version
    })
  ]
}
...
```

:::tip
The worker node data resource looks like the controller configuration without the `cilium_config.tfmpl` definition. Check out the repository for more details.
:::

### main.tf

The `main.tf` file remains the same.

## Tofu Execution Plan

```bash
$ tofu init
$ tofu plan
$ tofu apply
```

### Retrieve kubeconfig

```bash
$ tofu output kubeconfig
$ export KUBECONFIG=<Directory of the kubeconfig>
$ kubectl get nodes -o wide
NAME            STATUS   ROLES           AGE     VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE         KERNEL-VERSION   CONTAINER-RUNTIME
talos-6u7-96l   Ready    control-plane   4m27s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-c5b-96x   Ready    <none>          4m27s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-sq5-08p   Ready    control-plane   4m31s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-xw3-5lp   Ready    <none>          4m25s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
```

### Cilium, Hubble Pods Status

```bash
$ kubectl get pods -n kube-system | grep -E 'cilium|hubble'
cilium-42z5m                            1/1     Running     0               4m55s
cilium-dsxwh                            1/1     Running     0               4m55s
cilium-dxw8w                            1/1     Running     0               4m55s
cilium-envoy-45kbx                      1/1     Running     0               4m55s
cilium-envoy-7cs7v                      1/1     Running     0               4m55s
cilium-envoy-h7fs5                      1/1     Running     0               4m55s
cilium-envoy-zjmlt                      1/1     Running     0               4m55s
cilium-install-hzcrf                    0/1     Completed   0               6m58s
cilium-kz4nt                            1/1     Running     0               4m55s
cilium-operator-675f856f99-hscgc        1/1     Running     0               4m55s
hubble-relay-6bf99866c-fhw79            1/1     Running     0               4m55s
hubble-ui-77555d5dcf-m7xl9              2/2     Running     0               4m55s
```

## Cilium Validation

To validate Cilium, we will first `exec` into the Cilium `daemonset`. Then, we will run several network tests to check if the CNI setup works as expected.

```bash
$ kubectl exec -it ds/cilium -n kube-system -- cilium status
Defaulted container "cilium-agent" out of: cilium-agent, config (init), apply-sysctl-overwrites (init), mount-bpf-fs (init), clean-cilium-state (init), install-cni-binaries (init)
KVStore:                 Ok   Disabled
Kubernetes:              Ok   1.31 (v1.31.1) [linux/amd64]
Kubernetes APIs:         ["EndpointSliceOrEndpoint", "cilium/v2::CiliumClusterwideNetworkPolicy", "cilium/v2::CiliumEndpoint", "cilium/v2::CiliumNetworkPolicy", "cilium/v2::CiliumNode", "cilium/v2alpha1::CiliumCIDRGroup", "core/v1::Namespace", "core/v1::Pods", "core/v1::Service", "networking.k8s.io/v1::NetworkPolicy"]
KubeProxyReplacement:    True   [enx22989c9b16a0   x.x.x.x fe80::2098:9cff:fe9b:16a0 (Direct Routing)]
Host firewall:           Disabled
SRv6:                    Disabled
CNI Chaining:            none
CNI Config file:         successfully wrote CNI configuration file to /host/etc/cni/net.d/05-cilium.conflist
Cilium:                  Ok   1.16.4 (v1.16.4-03807242)
NodeMonitor:             Listening for events on 4 CPUs with 64x4096 of shared memory
Cilium health daemon:    Ok   
IPAM:                    IPv4: 8/254 allocated from 10.244.1.0/24, 
IPv4 BIG TCP:            Disabled
IPv6 BIG TCP:            Disabled
BandwidthManager:        Disabled
Routing:                 Network: Tunnel [vxlan]   Host: Legacy
Attach Mode:             TCX
Device Mode:             veth
Masquerading:            IPTables [IPv4: Enabled, IPv6: Disabled]
Controller Status:       51/51 healthy
Proxy Status:            OK, ip 10.244.1.153, 0 redirects active on ports 10000-20000, Envoy: external
Global Identity Range:   min 256, max 65535
Hubble:                  Ok              Current/Max Flows: 4095/4095 (100.00%), Flows/s: 22.48   Metrics: Disabled
Encryption:              Disabled        
Cluster health:          4/4 reachable   (2024-11-30T17:08:00Z)
Modules Health:          Stopped(0) Degraded(0) OK(58)
```

You can apply similar network tests like the following example located at the official [Cilium documentation](https://raw.githubusercontent.com/cilium/cilium/1.16.4/examples/kubernetes/connectivity-check/connectivity-check.yaml).

:::note
When the Cilium tests are deployed on the cluster, you might get warnings due to the Talos Linux minimalistic setup. Feel free to use your tests for further validation.
:::

## Conclusion

In today's post, we showed how to quickly set up a Talos Kubernetes cluster with Cilium as the CNI in just a few simple steps. 🚀 In [Part 3](talos-proxmox-opentofu-part-3.md), we will outline potential improvements to make the setup even better. Thanks for reading, and stay tuned for the next post!

## Resources

- [Cilium - Getting Started](https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/)
- [Talos - Quick Guide](https://www.talos.dev/v1.8/introduction/quickstart/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
