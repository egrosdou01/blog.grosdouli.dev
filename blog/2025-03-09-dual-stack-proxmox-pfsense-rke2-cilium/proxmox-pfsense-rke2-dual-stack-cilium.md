---
slug: rke2-dual-stack-cilium-proxmox
title: "Dual-Stack: Rancher RKE2 With Cilium on Proxmox"
authors: [egrosdou01]
date: 2025-03-24
description: A step-by-step guide to dual-stack deployment on a Rancher RKE2 cluster with Cilium.
tags: [proxmox,open-source,kubernetes,rke2,cilium,ipv6,"2025"]
---

## Introduction

Welcome to **part 2** of the `dual-stack` series! In [part 1](./proxmox-pfsense-fritzbox-ipv6-prefix-allocation-setup.md), we covered how to enable `IPv6 Prefix` allocation using `pfsense` on `Proxmox` with `Fritz!Box` as a home router. The setup allows virtual machines in a dedicated interface to receive an `IPv4` and an `IPv6` address. If you have completed **part 1**, you can continue with the `dual-stack` [RKE2](https://docs.rke2.io/) setup powered by [Cilium](https://cilium.io/).

![title image reading "What gives people joy?"](what_gives_people_joy.jpg)
<!--truncate-->
[Source](https://imgflip.com)

In later sections, we go through configuring the **RKE2** clusters and performing different tests to ensure the `dual-stack` setup is functional. Ready to get started? Let’s dive in!

## Lab Setup

```bash
+----------------------------+-------------------------+
|        Deployment           |         Version         |
+----------------------------+-------------------------+
|        Proxmox VE           |          8.2.4          |
|        RKE2                 |      v1.29.12+rke2r1    |
|        Cilium               |          1.16.4         |
+----------------------------+-------------------------+
```

## Prerequisites

- Virtual Machine with a `dual-stack` setup

## Virtual Machines

Before we begin with the cluster setup, ensure the base image used for the virtual machines fits the **RKE2 support matrix** found [here](https://www.suse.com/suse-rke2/support-matrix/all-supported-versions/rke2-v1-29/).

For today's demonstration, an `SLES 15 SP5` image is used. The same setup should work for an `Ubuntu 22.04` and an `Ubuntu 24.04` image. This needs to be evaluated though! Let me know in the discussion section.

### RKE2 Server Setup

For the `server` and the `agent` configuration, we follow the [official documentation](https://docs.rke2.io/networking/basic_network_options). However, it will be adjusted to support a `dual-stack` deployment. Now, it is the right moment to decide what the IPv6 Prefix for the `cluster-cidr` and the `service-cidr` are. 😊

#### Check IP Address Allocation

The network interface used by the virtual machine should already have an `IPv4` and `IPv6` address assigned via `DHCP` and `DHCPv6` respectively. The virtual machine interface should look similar to the one below.

```bash
$ $ ip address
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether bc:24:11:47:47:e1 brd ff:ff:ff:ff:ff:ff
    altname enp0s18
    altname ens18
    inet 10.10.20.126/24 brd 10.10.20.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 2001:xxx:xxxx:xxxx::111f/128 scope global dynamic 
       valid_lft 5045sec preferred_lft 2345sec
    inet6 fe80::be24:11ff:fe47:47e1/64 scope link 
       valid_lft forever preferred_lft forever
```

#### RKE2 Server Configuration

```bash
$ mkdir -p /etc/rancher/rke2/
```

```yaml showLineNumbers
echo "
write-kubeconfig-mode: 0644
tls-san:
  - <YOUR NODE NAME>
token: <YOUR TOKEN>
cni: cilium
// highlight-start
cluster-cidr: "10.42.0.0/16,2001:face:42::/56"
service-cidr: "10.43.0.0/16,2001:face:43::/112"
node-ip: "10.10.20.126,2001:xxxx:xxxx:xxxx::111f"
// highlight-end
disable-kube-proxy: true
etcd-expose-metrics: false
" > /etc/rancher/rke2/config.yaml
```

The most important aspects of the configuration are the `cluster-cidr` and `service-cidr`. For the `node-ip`, we define the IPv4 and IPv6 addresses of the network interface seen previously. Apart from that, we disable the `kube-proxy` as it will be replaced by `Cilium`.

:::tip
For the second RKE2 cluster, ensure the `cluster-cidr` and `service-cidr` definitions are not overlapping as in **part 3** we will introduce a `Service Mesh` between the two clusters.
:::

#### Cilium Configuration

Going through the Cilium [official documentation](https://docs.cilium.io/en/v1.16/operations/performance/tuning/#id2) for **IPv6** we need to enable the `ipv6.enabled=true` option during the Helm chart installation. If `IPv6 BIG TCP` is required, include the option `enableIPv6BIGTCP=true`.

```bash
$ mkdir -p  /var/lib/rancher/rke2/server/manifests
```

```yaml showLineNumbers
echo "
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: rke2-cilium
  namespace: kube-system
spec:
  valuesContent: |-
    image:
      tag: v1.16.4
    kubeProxyReplacement: true
    k8sServiceHost: <Sever FQDN or IP Address>
    k8sServicePort: 6443
    operator:
      replicas: 1
// highlight-start
    ipv6:
      enabled: true
// highlight-end
    hubble:
      enabled: true
      relay:
        enabled: true
      ui:
        enabled: true
" > /var/lib/rancher/rke2/server/manifests/rke2-cilium-config.yaml
```

:::note
By default, VXLAN tunnelling for routing is enabled. For more information about the available routing options, have a look [here](https://docs.cilium.io/en/v1.16/network/concepts/routing/#routing).
:::

#### Install RKE2 Server

If a later version of RKE2 is available or required, check out the [release page](https://github.com/rancher/rke2/releases).

```bash
$ curl -sfL https://get.rke2.io |INSTALL_RKE2_VERSION=v1.29.12+rke2r1 INSTALL_RKE2_TYPE=server sh -

$ systemctl enable --now rke2-server.service # This might take a few seconds to ensure the service is in a healthy state
$ systemctl start rke2-server # Ensure the rke2-serer service is running
$ systemctl status rke2-server # Ensure the rke2-serer service is healthy
```

#### Kubeconfig

The `kubeconfig` is located under `/etc/rancher/rke2/rke2.yaml`. To interact with the cluster, use ```export KUBECONFIG=/etc/rancher/rke2/rke2.yaml``` and ```kubectl get nodes``` for validation.

### RKE2 Agent Setup

To connect an `RKE2 agent` to the cluster, we need to ensure the virtual machines **can talk** to each other from a network point of view and then define the RKE2 configuration which includes the `RKE2 Server URL` and the `token` generated in a previous step. Then, we can continue with the installation of the RKE2 `agent`.

#### RKE2 Agent Configuration

```bash
$ mkdir -p /etc/rancher/rke2/
```

```yaml showLineNumbers
$ echo "
server: https://<Sever FQDN or IP Address>:9345
token: <YOUR TOKEN>
" > /etc/rancher/rke2/config.yaml
```

#### Install RKE2 Agent

```bash
$ curl -sfL https://get.rke2.io |INSTALL_RKE2_VERSION=v1.29.12+rke2r1 INSTALL_RKE2_TYPE=agent sh -

$ systemctl enable --now rke2-agent.service # This might take a few seconds to ensure the service is in a healthy state
$ systemctl start rke2-agent # Ensure the rke2-serer service is running
$ systemctl status rke2-agent # Ensure the rke2-serer service is healthy
```

### Cluster Validation

Either from a jump host or the server (master) node, perform the validation and ensure the cluster is in a `Ready` state, contains **two** nodes in total and `dual-stack` networking is available.

```bash
$ kubectl get nodes
NAME       STATUS   ROLES                       AGE     VERSION
master03   Ready    control-plane,etcd,master   9m30s   v1.29.12+rke2r1
worker03   Ready    <none>                      112s    v1.29.12+rke2r1
```

```bash
$ kubectl describe nodes | grep -i 'Internal'
  InternalIP:  10.10.20.132
  InternalIP:  2001:xxx:xxxx:xxxx::1539
  InternalIP:  10.10.20.141
  InternalIP:  2001:xxx:xxxx:xxxx::1fb3
```

```bash
$ kubectl describe nodes | grep -i 'PodCIDRs'
PodCIDRs:                     10.42.0.0/24,2001:face:42::/64
PodCIDRs:                     10.42.1.0/24,2001:face:42:1::/64
```

The cluster nodes have an IPv4 and an IPv6 address assigned while the Pod CIDR matches the configuration details mentioned above.

### Pod to Pod Communication IPv6

Let's create two pods, `test01` and `test02`. The well-known network image `netshoot` is used and we will assign the pods to two different nodes. Use the [nodeName](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename) specification.

- For more information about the `netshoot` image, have a look [here](https://hub.docker.com/r/nicolaka/netshoot).

```bash
$ kubectl get pod test01 -o jsonpath='{.status.podIPs[1].ip}'
2001:face:42::c36e

$ kubectl get pod test02 -o jsonpath='{.status.podIPs[1].ip}'
2001:face:42:1::41d5
```

#### Connectivity Test

```bash
$ kubectl exec -it test02 -- ping 2001:face:42::c36e
PING 2001:face:42::c36e (2001:face:42::c36e) 56 data bytes
64 bytes from 2001:face:42::c36e: icmp_seq=1 ttl=63 time=0.270 ms
64 bytes from 2001:face:42::c36e: icmp_seq=2 ttl=63 time=0.210 ms
64 bytes from 2001:face:42::c36e: icmp_seq=3 ttl=63 time=0.238 ms

$ kubectl exec -it test01 -- ping 2001:face:42:1::41d5
PING 2001:face:42:1::41d5 (2001:face:42:1::41d5) 56 data bytes
64 bytes from 2001:face:42:1::41d5: icmp_seq=1 ttl=63 time=0.371 ms
64 bytes from 2001:face:42:1::41d5: icmp_seq=2 ttl=63 time=0.233 ms
64 bytes from 2001:face:42:1::41d5: icmp_seq=3 ttl=63 time=0.228 ms
```

That looks good! Let's continue.

### Pod to Service Communication Dual-stack

For the pod-to-service connectivity test, we will create a new `Deployment` using the `inanimate/echo-server` image. We will then expose the `Deployment` to a `ClusterIP` service on port `8080` and define the `ipFamilyPolicy` and `ipFamilies` service specifications based on the `dual-stack` example.

- The example can be found [here](https://kubernetes.io/docs/concepts/services-networking/dual-stack/).

```bash
$ kubectl create deploy echo-server --image=inanimate/echo-server

$ kubectl expose deploy echo-server --port=8080

$ kubectl get pods,svc
NAME                               READY   STATUS    RESTARTS   AGE
pod/echo-server-55c585ccd7-dd65x   1/1     Running   0          20s
pod/test01                         1/1     Running   0          8m2s
pod/test02                         1/1     Running   0          8m2s

NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/echo-server   ClusterIP   10.43.108.176   <none>        8080/TCP   5s
service/kubernetes    ClusterIP   10.43.0.1       <none>        443/TCP    21m
```

Let's edit the service `echo-server` define the `ipFamilyPolicy` as `PreferDualStack`, include `IPv6` to the `ipFamilies` and continue with the remaining tests.

```yaml showLineNumbers
$ kubectl edit svc echo-server
apiVersion: v1
kind: Service
metadata:
  labels:
    app: echo-server
  name: echo-server
  namespace: default
spec:
  clusterIP: 10.43.108.176
  clusterIPs:
  - 10.43.108.176
  internalTrafficPolicy: Cluster
// highlight-start
  ipFamilies:
  - IPv4
  - IPv6
  ipFamilyPolicy: PreferDualStack
// highlight-end
  ports:
  - port: 8080
    protocol: TCP
    targetPort: 8080
  selector:
    app: echo-server
  sessionAffinity: None
  type: ClusterIP
```

```bash
$ kubectl describe svc echo-server
Name:              echo-server
Namespace:         default
Labels:            app=echo-server
Annotations:       <none>
Selector:          app=echo-server
Type:              ClusterIP
IP Family Policy:  PreferDualStack
IP Families:       IPv4,IPv6
IP:                10.43.108.176
IPs:               10.43.108.176,2001:face:43::9f4c
Port:              <unset>  8080/TCP
TargetPort:        8080/TCP
Endpoints:         10.42.1.107:8080
Session Affinity:  None
Events:            <none>
```

#### Connectivity Tests

```bash
$ kubectl exec -it test01 -- curl http://echo-server.default:8080
Welcome to echo-server!  Here's what I know.
  > Head to /ws for interactive websocket echo!

-> My hostname is: echo-server-55c585ccd7-dd65x

-> Requesting IP: [2001:face:42::c36e]:39452

-> Request Headers | 

  HTTP/1.1 GET /

  Host: echo-server.default:8080
  Accept: */*
  User-Agent: curl/8.7.1
```

```bash
$ kubectl exec -it test01 -- curl http://10.43.108.176:8080
Welcome to echo-server!  Here's what I know.
  > Head to /ws for interactive websocket echo!

-> My hostname is: echo-server-55c585ccd7-dd65x

-> Requesting IP: 10.42.0.94:39162

-> Request Headers | 

  HTTP/1.1 GET /

  Host: 10.43.108.176:8080
  Accept: */*
  User-Agent: curl/8.7.1
```

```bash
$ kubectl exec -it test01 -- curl http://[2001:face:43::9f4c]:8080
Welcome to echo-server!  Here's what I know.
  > Head to /ws for interactive websocket echo!

-> My hostname is: echo-server-55c585ccd7-dd65x

-> Requesting IP: [2001:face:42::c36e]:47332

-> Request Headers | 

  HTTP/1.1 GET /

  Host: [2001:face:43::9f4c]:8080
  Accept: */*
  User-Agent: curl/8.7.1
```

From the outputs it is visible the `echo-server` service can talk IPv4 and IPv6.

## Second RKE2 Cluster

Repeat the steps above for the second cluster. Ensure the `cluster-cidr` and the `service-cidr` are not overlapping. You can use the below as an example.

```bash
cluster-cidr: "10.44.0.0/16,2001:cafe:42::/56"
service-cidr: "10.45.0.0/16,2001:cafe:43::/112"
```

## Conclusion

`Dual-stack` deployment on an RKE2 cluster, check! ✅ Thanks for reading, and stay tuned for the upcoming posts!

## Resources

- [Dual Stack on AKS by Amit Gupta](https://isovalent.com/blog/post/cilium-dual-stack-aks/)
- [eCHO Episode 59: Dual Stack with Cilium](https://www.youtube.com/watch?v=SwXvGeMy3Wg)

## Next Steps

In the [upcoming post](./proxmox-pfsense-rke2-dual-stack-cluster-mesh-cilium.md), we will set up a `Cilium Service Mesh` and share `IPv4` and `IPv6` `Global Services`.

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
