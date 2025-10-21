---
slug: talos-on-proxmox-opentofu-part-1
title: "Talos, Proxmox, OpenTofu: Beginner's Guide Pt.1"
authors: [egrosdou01]
date: 2024-11-24
image: ./Proxmox_OpenTofu_Talos.jpg
description: A step-by-step guide installing a Talos Cluster on Proxmox with OpenTofu - Part 1.
tags: [talos,opentofu,proxmox]
---

## Introduction

I have been bootstrapping [RKE2](https://docs.rke2.io/) and [K3s](https://docs.k3s.io/) clusters for a while now. I work on different platforms, both on-prem and in the cloud. This includes VMware, Proxmox, Nutanix, and almost every major cloud provider. This week, I have decided to take a different approach and discover something new! Bootstrap a Talos Kubernetes cluster on [Proxmox](https://www.proxmox.com/en/proxmox-virtual-environment/overview) using [OpenTofu](https://opentofu.org/docs/) as the Infrastructure as Code (IaC) solution. My first interaction with [Talos Linux](https://www.talos.dev/) was a couple of months back when Justin Garrison posted something about the ease of Kubernetes cluster deployment. I did not have much time back then, but here we come!

The blog post will be split into two parts. **Part 1** will include a basic deployment of a Talos cluster using the out-of-the-box configuration, while **Part 2** will contain the required configuration changes to use [Cilium](https://docs.cilium.io/en/stable/) as our CNI.
Get ready to roll up your sleeves and dive into the essentials of Talos Linux with OpenTofu on Proxmox.


![title image reading "Talos Cluster on Proxmox with OpenTofu"](Proxmox_OpenTofu_Talos.jpg)

<!--truncate-->

## Lab Setup

```bash
+------------------------------+-----------+
|         Deployment           |  Version  |
+------------------------------+-----------+
|        Proxmox VE            |    8.2.4  |
|   Talos Kubernetes Cluster   |    1.8.1  |
+------------------------------+-----------+
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
The showcase repository is available [here](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-proxmox).

## Prerequisites

### Manual Bootstrap (Optional)

If you are new to the concept of bootstrapping Kubernetes clusters, it might be worth familiarising yourself with Talos and trying to bootstrap a cluster using `talosctl` and `Docker`. Check out the link [here](https://www.talos.dev/v1.8/introduction/quickstart/).

### Proxmox API Token

To authenticate with Proxmox while executing the `tofu plan`, we need an API token with the right permissions.

1. From the Proxmox UI, navigate to **Datacenter > Permissions**
1. Click on `Roles` and create a **role** with the appropriate permissions to allow the creation of VMs alongside other activities. More information can be found [here](https://pve.proxmox.com/wiki/User_Management).
1. Click on `Users` and create a **user** that will be used for the execution of the `tofu plan`
1. Click on `Permissions` and associate the `user` with the `role`
1. Click on `API Tokens` and create a new **API Token**. Specify the authentication method, the user, the token ID alongside unselecting the `Privilege Separation` button

For more about API tokens and Access Control Lists (ACLs), check out the [link](https://pve.proxmox.com/pve-docs/chapter-pveum.html#pveum_tokens).

### Retrieve and Upload Custom ISO

As the Talos Linux image is immutable, we will download a `factory` image from the [link](https://factory.talos.dev/) and include the `QEMU Guest Agent` to allow reporting of the virtual machine status to Proxmox.

#### Steps taken

1. Access the [URL](https://factory.talos.dev/)
1. Set **Hardware Type**: Bare-metal Machine
1. Set **Talos Linux Version**: 1.8.1
1. Set **Machine Architecture**: amd64 (for my environment)
1. Set **System Extensions**: siderolabs/qemu-guest-agent (9.1.0)
1. Set **Customization**: Nothing to choose there
1. **Last Overview Page**: Copy the **First Boot** `.iso` link and the **Initial Installation** link

Upload the `.iso` to the Proxmox server. Make a copy of the `Initial Installation` link.

## Scenario Overview

In today's post, we will perform the below using the IaC approach. As this is a beginner's guide, we will keep the code as simple as possible, including relevant comments and notes. For the setup, we will use DHCP to hand over IPs to the endpoints.

The deployment in a nutshell 👇

- Create virtual machines using the Talos Linux image
- Specify the endpoint for the Kubernetes API
- Generate the machine configurations (part 1 uses the default ones)
- Apply the machine configurations to the virtual machines
- Bootstrap a Kubernetes cluster

## Talos Linux - Why bother?

I came across in the [official documentation](https://www.talos.dev/) that Talos Linux is a secure, immutable, and minimal OS. It is built for Kubernetes and managed via an API. Plus, it supports cloud, bare metal, and virtualisation platforms in a production-ready way. Cool, right?

## File structure

- `creds/`: This is a **hidden directory** that holds the `api_token_id.txt`, `api_token_secret.txt` and `api_url.txt`
- `files/`: Contains files and templates for the initial image configuration of the Talos cluster
- `providers.tf`: Contains the required providers used in the resource blocks
- `virtual_machines.tf`: Contains the resources to spin up the virtual machines
- `main.tf`: Contains the resource blocks for the Talos Linux bootstrap
- `data.tf`: Contains several pieces of data required for the Talos cluster bootstrap process
- `variables.tf`: Contains the variable declarations used in the resource blocks
- `output.tf`: Contains the output upon successful completion of the OpenTofu plan/apply
- `*.tfvars`: Contains the default values of the defined variables

## OpenTofu Provides

As with any Terraform/OpenTofu setup, we have to define the providers and versions we would like to use. If you are not aware of the term `Provider`, have a look [here](https://opentofu.org/docs/language/providers/).

- The `telmate/proxmox` provider details and the how-to guide, are located [here](https://search.opentofu.org/provider/telmate/proxmox/latest)
- The `siderolabs/talos` provider details and the how-to guide, are located [here](https://search.opentofu.org/provider/siderolabs/talos/v0.6.1)

```hcl
terraform {
  required_version = "~> 1.8.1"
  required_providers {
    random = {
      source  = "opentofu/random"
      version = "3.6.2"
    }
    proxmox = {
      source  = "registry.opentofu.org/telmate/proxmox"
      version = "3.0.1-rc4"
    }
    talos = {
      source  = "registry.opentofu.org/siderolabs/talos"
      version = "0.6.1"
    }
  }
}
provider "proxmox" {
  pm_api_url          = file(var.api_url)
  pm_api_token_id     = file(var.api_token_id)
  pm_api_token_secret = file(var.api_token_secret)
  pm_tls_insecure     = true
}
```

At this point, we defined the preferred provider versions and the way to authenticate with the Proxmox server. For this demonstration, I am using `.txt` files in a directory to store sensitive data and exclude them with the `.gitignore`.

## Virtual Machines Setup

As we have two types of machines, `controller` and `worker` node, I have decided to keep the configuration as simple as possible and avoid using one node for both types. That means we will have two resources to create the `controller` and the `worker` nodes.

```hcl
# Create the controller and worker Nodes 
resource "proxmox_vm_qemu" "talos_vm_controller" {
  for_each = var.controller
  name        = "${each.value.name}-${random_id.cluster_random_name.hex}"
  target_node = var.vm_details.target_node
  vmid        = each.value.vmid

  # Basic VM settings here. agent refers to guest agent
  agent   = var.vm_details.agent_number
  cores   = each.value.vcores
  sockets = var.vm_details.socket_number
  cpu     = var.vm_details.cpu_type
  memory  = each.value.vram
  scsihw  = var.vm_details.scsihw
  qemu_os = var.vm_details.qemu_os
  onboot  = var.vm_details.onboot
  disks {
    ide {
      ide0 {
        cdrom {
          iso = var.vm_details.iso_name
        }
      }
    }
    scsi {
      scsi0 {
        disk {
          size    = each.value.hdd_capacity
          storage = var.vm_details.storage
        }
      }
    }
  }
  network {
    model  = each.value.vmodel
    bridge = each.value.vnetwork
  }
  lifecycle {
    ignore_changes = [
      network, disk, target_node
    ]
  }
  ipconfig0  = var.vm_details.ipconfig
  nameserver = var.vm_details.nameserver
}
```
:::note
From the above, it is important to set the `agent` to `1` to enable the `QEMU quest agent`. We populate the first part of the disk config with the `.iso` name uploaded to Proxmox in an earlier state.
:::

## Bootstrap Talos Kubernetes Cluster

Following the example located [here](https://github.com/siderolabs/terraform-provider-talos/tree/v0.6.1/examples), the `data` and `resources` are defined. The first step is to boot a virtual machine using the `factory image` and then use the `initial image` after the first reboot. The `initial image` details are provided during the `talos_machine_configuration` for the `controller` and the `worker` node.

### data.tf

```hcl
# Define the Initial Image link copied from the Talos Factory guide from an earlier stage
locals {
  initial_image = "factory.talos.dev/installer/${var.talos_cluster_details.schematic_id}:${var.talos_cluster_details.version}"
}
# Generate the Talos client configuration
data "talos_client_configuration" "talosconfig" {
  cluster_name         = var.talos_cluster_details.name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address]
  nodes                = [for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address]
}
# Generate the controller configuration and instantiate the Initial Image for the Talos configuration
data "talos_machine_configuration" "machineconfig_controller" {
  cluster_name     = var.talos_cluster_details.name
  talos_version    = var.talos_cluster_details.version
  cluster_endpoint = "https://${tolist([for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]}:6443" # Use the first controller node IP address from the list as the cluster_endpoint
  machine_type     = "controlplane"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
  config_patches = [
    templatefile("${path.module}/files/init_install.tfmpl", {
      initial_image = local.initial_image
  })]
}
# Generate the worker configuration and instantiate the Initial Image for the Talos configuration
data "talos_machine_configuration" "machineconfig_worker" {
  cluster_name     = var.talos_cluster_details.name
  talos_version    = var.talos_cluster_details.version
  cluster_endpoint = "https://${tolist([for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]}:6443" # Use the first controller node IP address from the list as the cluster_endpoint
  machine_type     = "worker"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
  config_patches = [
    templatefile("${path.module}/files/init_install.tfmpl", {
      initial_image = local.initial_image
  })]
}
```

### main.tf

```hcl
# Generate machine secrets for Talos cluster
resource "talos_machine_secrets" "this" {
  talos_version    = var.talos_cluster_details.version
}
# Apply the machine configuration created in the data section for the controller node
resource "talos_machine_configuration_apply" "controller_config_apply" {
  for_each                    = { for i, v in proxmox_vm_qemu.talos_vm_controller : i => v }
  depends_on                  = [proxmox_vm_qemu.talos_vm_controller]
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.machineconfig_controller.machine_configuration
  node                        = each.value.default_ipv4_address
}
# Apply the machine configuration created in the data section for the worker node
resource "talos_machine_configuration_apply" "worker_config_apply" {
  for_each                    = { for i, v in proxmox_vm_qemu.talos_vm_worker : i => v }
  depends_on                  = [proxmox_vm_qemu.talos_vm_worker]
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.machineconfig_worker.machine_configuration
  node                        = each.value.default_ipv4_address
}
# Start the bootstrap of the cluster
resource "talos_machine_bootstrap" "bootstrap" {
  depends_on           = [talos_machine_configuration_apply.controller_config_apply]
  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = tolist([for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]
}
# Collect the kubeconfig of the Talos cluster created
resource "talos_cluster_kubeconfig" "kubeconfig" {
  depends_on           = [talos_machine_bootstrap.bootstrap, data.talos_cluster_health.cluster_health]
  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = tolist([for v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]
}
...
```

## Tofu Execution Plan

```bash
$ tofu init
$ tofu plan
$ tofu apply
```

## Plan Output

Within less than 5 minutes, we have a fully functional Kubernetes cluster (assuming the cluster is in a healthy state). To interact with it, we need the `kubeconfig`. This is retrieved from the `talos_cluster_kubeconfig` data source defined in the `data.tf` file. The complete `data.tf` file is located here.

```hcl
output "kubeconfig" {
  value     = resource.talos_cluster_kubeconfig.kubeconfig.kubeconfig_raw
  sensitive = true
}
```

:::note
I had to set a sleep condition between the bootstrap and the health check condition. The `health state` was always failing for my setup even if a timeout was defined within the data definition.
:::

:::tip
If you want to use the `talosctl` to check the status of the cluster, the service running etc., feel free to collect the `talos_config` from the client configuration.

```hcl
output "talos_configuration" {
  value     = data.talos_client_configuration.talosconfig.talos_config
  sensitive = true
}
```
:::

### Retrieve kubeconfig

```bash
$ tofu output kubeconfig
$ export KUBECONFIG=<Directory of the kubeconfig>
$ kubectl get nodes -o wide
NAME            STATUS   ROLES           AGE     VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE         KERNEL-VERSION   CONTAINER-RUNTIME
talos-04v-eny   Ready    control-plane   3m45s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-af3-vad   Ready    control-plane   3m45s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-hi4-p4z   Ready    <none>          3m52s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
talos-yvq-7ic   Ready    <none>          3m39s   v1.31.1   x.x.x.x        <none>        Talos (v1.8.1)   6.6.54-talos     containerd://2.0.0-rc.5
```

## Conclusion

Hope the post gave you an overview on how to bootstrap a basic Talos Linux cluster with OpenTofu! The Siderolab folks prepared material for beginners and experts on how to deploy Talos Linux clusters!

## Part-2 Outline

In [Part 2](talos-proxmox-opentofu-part-2.md), we will cover how to update the default CNI with [Cilium](https://docs.cilium.io/en/stable/index.html). Stay tuned!

## Resources

- [Talos - Quick Guide](https://www.talos.dev/v1.8/introduction/quickstart/)
- [Talos Linux Guides](https://www.talos.dev/v1.8/talos-guides/)
- [Advanced Talos Cluster Setup](https://blog.stonegarden.dev/articles/2024/08/talos-proxmox-tofu/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
