---
slug: capmox-troubleshooting-insights
title: "CAPMOX Troubleshooting Insights"
authors: [egrosdou01]
date: 2026-01-22
image: ./focus.png
description: This is the continuation of the previous post and walks users through common deployment issues during CAPMOX deployments.
tags: [kubernetes,tshoot-insights,proxmox,clusterapi,cilium]
---

**Summary**:

We continue where we left off with the [CAPMOX deployment](./k8s-managed-clusters-capmox.md). In this post, we will go through common issues during deployment and the tools used to troubleshoot and resolve them.

<!--truncate-->
![title image reading "Troubleshooting Focus"](focus.png)

## Scenario

The post is an attempt to help users troubleshoot common CAPMOX issues in their environment. Every environment is unique, and different issues could arise. Follow along, and let’s fix them!

## Prerequisites

The post is based on the [previous one](./k8s-managed-clusters-capmox.md). Ensure any prerequisites are met.

## Common Issues

### Image Builder - Broken Pipe Error

The first step working with CAPMOX is to ensure a valid base image is generated. That means we use the `image-builder` with the required tooling and dependencies to do so. However, to push the created template to our Proxmox server and, in general, interact with the Proxmox server, we need to authenticate. For that reason, the documentation advises creating a PVE Admin role or a restricted user. In any case, if incorrect permissions are set to the `PROXMOX_USERNAME` variable, broken pipe errors will be visible.

#### Error

```bash
proxmox-iso.ubuntu-2404: Post "https://PROXMOX IP:PORT/api2/json/nodes/pve/storage/local/upload": write tcp EXECUTION MACHINE:56542->PROXMOX IP:PORT: write: broken pipe
```

#### Solution

Go through the [image builder documentation](https://image-builder.sigs.k8s.io/capi/providers/proxmox#building-images-for-proxmox-ve) and ensure the right permissions are assigned to the used token.

### capmox-controller-manager Pod Error

The issue is visible while performing the initialisation of the CAPI Proxmox provider to the management cluster.

```bash
clusterctl init --infrastructure proxmox --ipam in-cluster
```

#### Error

```bash
$ kubectl logs capmox-controller-manager-7898557fd8-rnpt6 -n capmox-system
I0117 15:59:44.625459       1 main.go:95] "starting capmox" logger="setup"
I0117 15:59:44.627001       1 main.go:138] "feature gates: ClusterTopology=false\n" logger="setup"
E0117 15:59:44.631453       1 main.go:145] "unable to setup proxmox API client" err="unable to initialize proxmox api client: 501 Method 'GET /api2/json/version' not implemented" logger="setup"
```

#### Solution

This issue most commonly occurs due to the incorrect definition of the `PROXMOX_URL`, `PROXMOX_TOKEN`, and `PROXMOX_SECRET` environmental variables. Ensure the following variables are exported and defined correctly.

```bash
$ export PROXMOX_URL="https://<PROXMOX_IP/HOSTNAME>:<LISTENING PORT>"
$ export PROXMOX_TOKEN='image-builder@pve!image-builder'
$ export PROXMOX_SECRET="5d44bf10-1234-5678-9101-ff7bdd8963fa"
```

### Incorrect CONTROL_PLANE_ENDPOINT_IP Definition

The `CONTROL_PLANE_ENDPOINT_IP` variable definition is required during the `clusterctl generate cluster` action and had to be unique. Outside the DHCP range (if used), and in the same subnet/network as the `NODE_IP_RANGES` definition.

If the `CONTROL_PLANE_ENDPOINT_IP` is used by another machine within the network or defined in the `NODE_IP_RANGES` variable, the deployment will fail. The `CONTROL_PLANE_ENDPOINT_IP` is important because it is used as a stable, single access point for all interactions within a Kubernetes cluster. The `kube-apiserver` will be listening on this IP address.

If you try to get the kubeconfig of the controlplane node to authenticate with the cluster, you will not be able to reach the cluster, as the IP address defined is used in the range group.

#### Solution

Update the variable to something that does not conflict with or is not used by another device in the same subnet/network.

### Missing `schedulerHints.memoryAdjustment` CAPI Configuration

As mentioned by Kyriakos in his [post](https://www.linkedin.com/posts/akyriako_build-your-own-managed-kubernetes-service-activity-7385295814992224256-xx-i/), we need to enable memory overcommit to allow Proxmox to create the virtual machines while allowing memory overcommit. If not defined, the virtual machines will simply hang.

#### Error

```yaml
Message:               * Machine proxmox05-control-plane-4948h:
* InfrastructureReady: cannot reserve 4294967296B of memory on node pve: 0B available memory left
```

#### Solution

```yaml showLineNumbers
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha1
kind: ProxmoxCluster
metadata:
  name: proxmox01
  namespace: default
spec:
  ...
// highlight-start
  schedulerHints:
    memoryAdjustment: 0
// highlight-end
```

### Cloud Init Errors

There are instances when the virtual machines are created in Proxmox; however, the configuration is not getting applied. One possibility is that cloud-init is incomplete or exited with errors. There might be different issues that could stop the deployment, but we will focus on cloud-init issues.

An SSH key is already defined during the cluster creation. We can SSH to the virtual machines and investigate further.

#### cloud-init Checks

```bash
$ cloud-init status # Get the status of the cloud-init configuration

$ sudo cloud-init collect-logs # The command will generate the `cloud-init.tar.gz` file

$ tar -xvf cloud-init.tar.gz # To untar the file
```

Once the cloud-init logs are available, take a looks at directories that might indicate errors and/or failures. Once a potential error is identified, continue with the basic networking checks.

#### Network Checks

Ensure basic networking configuration is applied to the machine. IP address, Gateway, default route, and DNS.

```bash
$ ip link # Layer 2 MAC address validation

$ ip add # Layer 3 IP address validation

$ ip route # Check the routing table on the virtual machine and validate that a default route exists

$ cat /etc/resolv.conf # Ensure the correct DNS server for the subnet/network is defined
```

Once the above commands have been validated, continue with some basic `ping` commands.

```bash
$ ping <another machine in the same subnet>

$ ping <gateway IP address>

$ ping www.google.com
```

If any of the above fail and the network configuration is correct, check the firewall on the machine. Is there anything that might be dropping traffic? If the firewall on the machine seems to be correctly configured, check the home router firewall.

In my case, in the defined VLAN, there was a firewall rule blocking all traffic from that VLAN to the outside (forgotten from a previous deployment). As a result, cloud-init was not able to reach the Internet to finish the initial configuration.

### NTP Drift

Once basic network issues are resolved, the controlplane and worker machines were created. Cloud-init was successful; however, the worker machines were not able to join the cluster.

#### Error

```yaml
...
x509: certificate has expired or is not yet valid
```

#### Check ControlPlane

Ensure the controlplane node/s are in a "Ready" state. If no CNI (Container Network Interface) is deployed, go ahead and do so. On the controlplane node, we can check the `kubeadm` status and whether the required resources (manifests and files) are created under the `/etc/kubernetes/manifests/` directory. If the controlplane node looks okay, go back to the management cluster and check the status of the CAPI cluster.

#### Cluster Check Management Cluster

```bash
$ export KUBECONFIG=/path/to/management/kubeconfig

$ kubectl describe cluster <name>

$ kubectl describe kubeadmcontrolplane <name>
```

Check for errors. They will give some hints on what went wrong.

In my case, the certificates created for the worker nodes to join or maintain communication with the controlplane were no longer valid. At first, I thought, "Okay, this is weird, why?"

#### Controlplane Checks

```bash
$ kubeadm certs check-expiration # Check the certificate status and expiration dates
```

#### Solution

1. Check the NTP server and date/time on Proxmox
1. Check the NTP server and date/time on the Kubernetes management cluster
1. Check the NTP server and date/time on the machines created

Indeed, there was a time drift between the created nodes and the underlying Kubernetes management cluster.

1. Correct the date/time on the Kubernetes management cluster
1. Delete the existing cluster creation
1. Re-apply the cluster configuration.

### Sufficient Resources Management Cluster

There are instances when the underlying management cluster lacks sufficient resources to create additional nodes or handle the additional load of creating CAPI resources. No errors will be visible in the created resources; however, the cluster creation will stop in the control plane. This situation could be confusing, but ensure the underlying cluster has sufficient memory.

## Conclusion

CAPI to the moon! 🚀 I hope the guide gave you some ideas and hints on what might be wrong with your own deployments!

## Resources

- [Cluster API Troubleshooting Guide](https://cluster-api.sigs.k8s.io/user/troubleshooting)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

## Series Narigation

| Part | Title |
| :--- | :---- |
| [Part 1](./k8s-managed-clusters-capmox.md) | Introduction to CAPMOX |
| [Part 2](./k8s-managed-clusters-capmox-tshoot-insights.md) | Troubleshooting CAPMOX deployments |
| Part 3 | CAPMOX with Sveltos |