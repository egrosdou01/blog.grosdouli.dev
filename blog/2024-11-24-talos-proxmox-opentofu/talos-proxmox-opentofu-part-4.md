---
slug: talos-on-proxmox-opentofu-part-4
title: "Talos, Proxmox, OpenTofu: Beginner's Guide Pt.4"
authors: [egrosdou01]
date: 2025-11-27
image: ./Proxmox_OpenTofu_Talos_Cilium.jpg
description: The blog post is a continuation of part 3 and the goal is to perform the required updates of the Talos module. Additionally, we update the code to allow users to create more than one cluster at a run.
tags: [talos,cilium,opentofu,proxmox]
---

**Summary**:

Talos Linux Kubernetes module updates for ongoing operations.

<!--truncate-->

## Introduction

Welcome to **part 4** of the **Talos Linux Kubernetes cluster** bootstrap of the **Proxmox** series. 

Since [Talos Linux officially recognised as CNCF AI conformant](https://www.siderolabs.com/blog/talos-linux-officially-cncf-ai-conformant/), I decided to revisit the topic. I will update the module shown in [part 3](talos-proxmox-opentofu-part-3.md) and make some code changes. This will allow me to create multiple clusters in one run. In **part 5**, we will integrate [Longhorn](https://longhorn.io/) for persistent block storage capabilities. Stay tuned!

We assume familiarity with the [project's structure](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-proxmox).

![title image reading "Talos Cluster on Proxmox with OpenTofu and Cilium"](Proxmox_OpenTofu_Talos_Cilium.jpg)

## Lab Setup

```bash
+------------------------------+------------+
|         Deployment            |  Version  |
+------------------------------+------------+
|        Proxmox VE            |   8.2.4    |
|   Talos Kubernetes Cluster   |   1.11.3   |
|         Cilium               |   1.18.0   |
+------------------------------+------------+
+-----------------------------+-----------+
|       OpenTofu Providers    |  Version  |
+-----------------------------+-----------+
|      opentofu/random        |    3.6.2  |
|      telmate/proxmox        | 3.0.2-rc4 |
|      siderolabs/talos       |    0.8.1  |
+-----------------------------+-----------+
+------------------------+-------------------------+
|        Binaries        |         Version         |
+------------------------+-------------------------+
|         tofu           | OpenTofu v1.9.0         |
|        kubectl         |         v1.34.1         |
+------------------------+-------------------------+
```

## Module Tests

The module underwent testing mainly on a local MacBook; it also underwent testing on an `Ubuntu 24.04` virtual machine within the Proxmox environment.

## GitHub Resources

Check out the [GitHub repository](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-cilium-proxmox-module) for the full code.

## Main Code Changes

In a nutshell, below are some of the code updates for the module. Have a look further below for an example outline of these changes.

- **OpenTofu provider updates**
  - **hashicorp/random 3.7.2**
  - **telmate/proxmox 3.0.2-rc04**
  - **siderolabs/talos 0.8.1**
- **Virtual machine variable updates**
  - The `skip_ipv6` variable was included. If not set, the virtual machines were waiting for an IPv6 address and an IPv4 address, which caused issues during the setup creation
  - Rename `cpu_type` to `type`
  - The variables `vcores`, `vm_details.socket_number`, and `vm_details.type` were moved under the `proxmox_vm_qemu.talos_nodes.cpu` section. Before, they were defined at a global level of the `proxmox_vm_qemu` resource
- **Talos cluster details**
  - The `talos_cluster_details.name` was removed, and the name of the cluster(s) is created dynamically
- **Cluster definition**
  - Initially, the `node` variable was defined to set the number of nodes, including the hardware requirements. With the code changes, the variable was renamed to `clusters` and includes `nodes`, which is a map of objects. Effectively, we can now define the number of clusters we want to create once the _tofu plan|apply_ command is executed.

### OpenTofu Provider Updates

```hcl showlines
terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "3.7.2"
    }
    proxmox = {
      source  = "telmate/proxmox"
      version = "3.0.2-rc04"
    }
    talos = {
      source  = "siderolabs/talos"
      version = "0.8.1"
    }
  }
}
```

### Talos Clusters Definition

To create more than one cluster at once, the initial **node** variable was updated to achieve the goal.

```hcl showlines
variable "clusters" {
  description = "Specification of the different Talos clusters and nodes"
  type = map(object({
    nodes = map(object({
      id           = number
      vmodel       = string
      hdd_capacity = string
      vmid         = number
      vnetwork     = string
      vcores       = number
      vram         = number
    }))
  }))
}
```

#### Example Definition

```hcl showlines
clusters = {
  "cluster1" = {
    nodes = {
      "controller01" = {
        id           = 0
        vmodel       = "virtio"
        hdd_capacity = "10G"
        vmid         = 505
        vnetwork     = "vmbr3"
        vcores       = 2
        vram         = 2048
      },
      "worker01" = {
        id           = 0
        vmodel       = "virtio"
        hdd_capacity = "10G"
        vmid         = 506
        vnetwork     = "vmbr3"
        vcores       = 2
        vram         = 2048
      }
    }
  },
  "cluster2" = {
    nodes = {
      "controller01" = {
        id           = 0
        vmodel       = "virtio"
        hdd_capacity = "10G"
        vmid         = 507
        vnetwork     = "vmbr3"
        vcores       = 2
        vram         = 2048
      },
      "worker01" = {
        id           = 0
        vmodel       = "virtio"
        hdd_capacity = "10G"
        vmid         = 508
        vnetwork     = "vmbr3"
        vcores       = 2
        vram         = 2048
      }
    }
  }
}
```

:::tip
As before, we rely heavily on the naming convention of the nodes to distinguish which nodes are controllers and which nodes are workers. If something different is defined, the module will not work. Or additional changes will be required.
:::

An issue with the above definition is that we need to flatten the input using merge so we can easily work with one map containing the user input. In this case, the clusters that need to be created. A local variable was included in the `virtual_machine.tf` file.

```hcl
locals {
  all_clusters = merge([
    for cluster_name, cluster_config in var.clusters : {
      for node_name, node_details in cluster_config.nodes :
      "${cluster_name}-${node_name}" => merge(node_details, {
        cluster_name = cluster_name
        node_name    = node_name
        full_name    = "${cluster_name}-${node_name}"
      })
    }
  ]...)
}
```

This creates a single map named `all_clusters` from the nested variable `clusters`. It iterates through each cluster and node(s), generating a unique key for each node. At the end of the merge, the `all_clusters` map shows the original user details. It also includes `cluster_name`, `node_name`, and `full_name` details.

Check out the different [OpenTofu Types and Values](https://opentofu.org/docs/language/expressions/types/) and how [Opentofu merges](https://opentofu.org/docs/language/functions/merge/) work.

I was uncertain whether to use the Flatten or the Merge built-in functions. I learned that merge takes several maps as objects and returns a single map or object, while flatten works with lists.

Nice examples provided by [Spacelift](https://spacelift.io/) about [flatten](https://spacelift.io/blog/terraform-flatten) and [merge](https://spacelift.io/blog/terraform-merge-function).

### main.tf

The idea of how we generate Talos secrets, the configuration and the bootstrap process remain the same. The difference with the updated code is that we have to iterate through the `var.clusters` to collect the required information, especially for the controller. Also, depending on the number of clusters defined, a unique Talos secret per cluster is generated.

```hcl
# Generate machine secrets for different Talos clusters
resource "talos_machine_secrets" "this" {
  for_each      = var.clusters
  talos_version = var.talos_cluster_details.version
}
...

# Start the bootstrapping of the cluster
resource "talos_machine_bootstrap" "bootstrap" {
  for_each             = var.clusters
  depends_on           = [talos_machine_configuration_apply.node_config_apply]
  client_configuration = talos_machine_secrets.this[each.key].client_configuration
  node = tolist([
    for n_key, n_value in local.all_clusters :
    proxmox_vm_qemu.talos_nodes[n_key].default_ipv4_address
    if n_value.cluster_name == each.key && can(regex("controller", lower(n_value.node_name)))
  ])[0]
}
...
}
```

The full code example is located [**here**](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-cilium-proxmox-module/v0.1.1).

### data.tf

The same iteration for the `data.tf` file happens. We have to iterate through the `var.clusters` and collect the required information for the controller and worker nodes. Additionally, during the `talos_cluster_health` checks, the validation was taking slightly longer than expected. Thus, the `timeouts.reads` were increased to 20 minutes instead.

### output.tf

To gather the necessary output for each cluster, we need to use a _for_ loop to process the information. This is how I have done it.

```hcl
# Collect each kubeconfig per Talos cluster definition
output "kubeconfig" {
  description = "Kubeconfig for each Talos cluster"
  value = {
    for cluster, cfg in talos_cluster_kubeconfig.kubeconfig :
    cluster => cfg.kubeconfig_raw
  }
}
```

## Troubleshoot

If there is a problem with the module deployment, or if _tofu apply_ takes longer than expected (2 clusters x 2 workers usually take 7-15 minutes, based on the hardware), then turn on debug mode.

- `TF_LOG=DEBUG`

During the module execution, I did not notice any weird behaviour or issues. It took me more time to update the virtual machine creation instead of the Talos part.

## Cluster Upgrades

Till this time, we cannot use Terraform or OpenTofu to gracefully upgrade the Talos cluster from one version to another. Many recommend using the `talosctl` to update a cluster; however, I think this approach is overwhelming. With the code in place, I can `create` and `delete` clusters on demand; however, by changing the Talos image to a different one, nothing happens after a _tofu apply_. This is something I need to investigate further, but my use case is more to create clusters on demand for testing and then delete them.

## Conclusion

🚀 With a few tweaks, we updated the Talos Linux module and provided readers with the ability to create more than one cluster at once. Continue with **part 5** and enable Longhorn for storage capabilities.

## Resources

- [Talos Linux Official Documentation](https://docs.siderolabs.com/talos/v1.11/overview/what-is-talos)
- [OpenTofu Flatten Function](https://opentofu.org/docs/language/functions/flatten/)
- [OpenTofu Merge Function](https://opentofu.org/docs/language/functions/merge/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
