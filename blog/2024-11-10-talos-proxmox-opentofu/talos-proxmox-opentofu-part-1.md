---
slug: talos-on-proxmox-opentofu-part-1
title: "Talos, Proxmox and OpenTofu: Beginner's Guide – Part 1"
authors: [egrosdou01]
date: 2024-11-10
tags: [talos,opentofu,proxmox,open-source,beginner-guide,"2024"]
---
## Introduction
It's been a while now since I bootstrapping [RKE2](https://docs.rke2.io/) and [K3s](https://docs.k3s.io/) clusters on different platforms, on-prem and in the cloud, including VMware, Proxmox, Nutanix and pretty much every well-known cloud provider. This week, I have decided to take a different approach and discover something new! Bootstrap a Talos Kubernetes cluster on [Proxmox](https://www.proxmox.com/en/proxmox-virtual-environment/overview) using [OpenTofu](https://opentofu.org/docs/) as the Infrastructure as Code (IaC) solution. My first interaction with [Talos Linux](https://www.talos.dev/) was a couple of months back when Justin Garrison posted something about the ease of Kubernetes cluster deployment. I did not have much time to play around with it, but now the time has come!
The blog post will be split into two parts. **Part 1** will include a basic deployment of a Talos cluster using the out-of-box configuration, while **Part 2** will contain the required configuration changes to use [Cilium](https://docs.cilium.io/en/stable/) as our CNI.
Get ready to roll up your sleeves and dive into the essentials of Talos Linux with OpenTofu on Proxmox.
<!-- 
![title image reading "It's not DNS"](its_not_dns.jpeg) -->
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
The showcase repository is available here.
## Prerequisites
### Talos Linux - Quick Guide
If you are new to bootstrapping Kubernetes clusters or Kubernetes in general, I would recommned you start with the `Quick Start` guide found [here](https://www.talos.dev/v1.8/introduction/quickstart/), and use the `talosctl` utility and create a simple Docker deployment. It is a non-production deployment used for testing, but it will give you a nice overview of how the bootstrap process works.
### Proxmox API Token
To authenticate with Proxmox while executing the `tofu plan`, we need an API token with the right permissions. This is how to create one.
For more information about API tokens and Access Control Lists (ACLs), check out the [link](https://pve.proxmox.com/pve-docs/chapter-pveum.html#pveum_tokens).
## Scenario Overview
As this is a beginner guide, we will keep the code as simple as possible including comments about the `resources` and `data` used. The demonstration starts by downloading the custom `.iso` with the **QEMU agent** included, we continue with the creation of the virtual machines in Proxmox in a dedicated VLAN with dynamic IP allocation and last but not least, use the Talos provider to bootstrap a cluster.
## Talos Linux - Why bother?
Going through the official documentation [here](https://www.talos.dev/), I stumbled upon the fact that Talos Linux is an immutable Operating System (OS) designed only for Kubernetes purposes and it is a production-ready solution. That means, an end-user cannot perform changes on the image directly, and interaction with the cluster is done only via API. How cool is that?
Below are some of the benefits outlined in the documentation.
> "Talos Linux is Linux designed for Kubernetes – secure, immutable, and minimal."
> 
> - Supports cloud platforms, bare metal, and virtualization platforms
> - All system management is done via an API. No SSH, shell, or console
> - Production ready: supports some of the largest Kubernetes clusters in the world
> - Open source project from the team at Sidero Labs
## File structure
- `providers.tf`: Contains the required providers used in the resource blocks
- `virtual_machines.tf`: Contains the resources to spin up the virtual machines
- `main.tf`: Contains the resource blocks for the Talos Linux bootstrap
- `data.tf`: Contains several data required for the Talos cluster bootstrap proccess
- `variables.tf`: Contains the variable declaration used in the resource blocks
- `output.tf`: Contains the output upon successful completion of the OpenTofu plan/apply
- `*.tfvars`: Contains the default values of the defined variables
## Custom ISO
### Retrieve Custom ISO
As the Talos Linux image is immutable, we will download a `factory` image from the [link](https://factory.talos.dev/) and include the `QEMU Guest Agent` to allow reporting of the virtual machine status to Proxmox.
### Upload Custom ISO
You can either copy the URL pointing to the ISO found at the last page of the interaction guide and use the `Download from the Internet` option in Proxmox or download the ISO locally and upload it to the Proxmox server.
Once the image is there, remember the name provided as it will be used in a later step.
## OpenTofu Provides
As with any Terraform/OpenTofu setup, we have to define the providers and versions we would like to use. If you are not aware of the term `Provider`, have a look [here](https://opentofu.org/docs/language/providers/).
- The `telmate/proxmox` provider details and the how to use guide, are located [here](https://search.opentofu.org/provider/telmate/proxmox/latest)
- The `siderolabs/talos` provider details are located [here](https://github.com/opentofu/registry/tree/main/providers/s/siderolabs)
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
:::tip
It is a good practice to avoid specifying sensitive data in the `variables.tf` file. Following the best practices, we can have a `.env` file that exports the required variables and it is excluded with the `.gitignore`. If you use a secret management solution, this is the point to use it.
:::
## Virtual Machines Setup
As we have two types of machines, `controller` and `worker` node, I have decided to keep the configuration as simple as possible and avoid using one node for both types of virtual machines. That means, we will have two resources to create the `controller` and the `worker` nodes.
```hcl
# Create the controller and worker Nodes 
resource "proxmox_vm_qemu" "talos_vm_controller" {
  for_each = var.controller
  name        = "${each.value.name}-${random_id.cluster_random_name.hex}"
  target_node = var.vm_details.target_node
  vmid        = each.value.vmid
  clone       = var.vm_details.talos_template_name
  full_clone  = true
  # basic VM settings here. agent refers to guest agent
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
From the above, it is important to set the `agent` to `1` to enable the `QEMU quest agent`.
:::

## Bootstrap Talos Kubernetes Cluster
As the `resource` and `data` for the Siderolabs provider are not available in the OpenTofu provider UI, we will use their own [example](https://github.com/siderolabs/terraform-provider-talos/blob/main/docs/resources/machine_bootstrap.md) and create a plan.
### data.tf
```hcl
# Generate the client configuration for a Talos cluster
# The cluster_name is required and should be unique
data "talos_client_configuration" "talosconfig" {
  cluster_name         = var.talos_cluster_name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [for i, v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address]
  nodes                = [for i, v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address]
}
# Generate a machine configuration for the controllers
# The cluster_name is required
data "talos_machine_configuration" "machineconfig_controller" {
  cluster_name     = var.talos_cluster_name
  cluster_endpoint = "https://${tolist([for i, v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]}:6443"
  machine_type     = "controlplane"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
}
# Generate a machine configuration for the workers
# The cluster_name is required
data "talos_machine_configuration" "machineconfig_worker" {
  cluster_name     = var.talos_cluster_name
  cluster_endpoint = "https://${tolist([for i, v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]}:6443"
  machine_type     = "worker"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
}
```
### main.tf
```hcl
# Generate machine secrets for Talos cluster
resource "talos_machine_secrets" "this" {}
# Apply the machine configuration greated in the data section for the controller node
resource "talos_machine_configuration_apply" "controller_config_apply" {
  for_each                    = { for i, v in proxmox_vm_qemu.talos_vm_controller : i => v }
  depends_on                  = [proxmox_vm_qemu.talos_vm_controller]
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.machineconfig_controller.machine_configuration
  node                        = each.value.default_ipv4_address
}
# Apply the machine configuration greated in the data section for the worker node
resource "talos_machine_configuration_apply" "worker_config_apply" {
  for_each                    = { for i, v in proxmox_vm_qemu.talos_vm_worker : i => v }
  depends_on                  = [proxmox_vm_qemu.talos_vm_worker]
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.machineconfig_worker.machine_configuration
  node                        = each.value.default_ipv4_address
}
# Start the bootstraping of the cluster
resource "talos_machine_bootstrap" "bootstrap" {
  depends_on           = [talos_machine_configuration_apply.controller_config_apply]
  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = tolist([for i, v in proxmox_vm_qemu.talos_vm_controller : v.default_ipv4_address])[0]
}
```
## Plan Output
After 10 min or so, we have a fully functional Kubernetes cluster (assuming the cluster is in healthy state). To interact with it, we need the `kubeconfig`. This is retrieved from the `talos_cluster_kubeconfig` data source defined in the `data.tf` file. The complete `data.tf` file is located here.
```hcl
output "kubeconfig" {
  value     = data.talos_cluster_kubeconfig.kubeconfig
  sensitive = true
}
```
### Retrieve kubeconfig
```bash
$ tofu output kubeconfig
$ export KUBECONFIG=<Directory of the kubeconfig>
$ kubectl get nodes
```
## Resources
- [Talos Linux Guides](https://www.talos.dev/v1.8/talos-guides/)
- [Advanced Talos Cluster Setup](https://blog.stonegarden.dev/articles/2024/08/talos-proxmox-tofu/)
## Part-2 Outline
In **Part 2**, we will cover how to update the default CNI with [Cilium](https://docs.cilium.io/en/stable/index.html). Stay Tuned!
## ✉️ Contact
If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊
We look forward to hearing from you!
## Conclusions
Hope the post gave you an overview on how to bootstrap a basic Talos Linux cluster with OpenTofu! The Siderolab folks prepared a material for beginners and experts on how to deploy Talos Linux clusters! Enjoy :)
It's a wrap for this post! 🎉 Thanks for reading! Stay tuned for more exciting updates!
