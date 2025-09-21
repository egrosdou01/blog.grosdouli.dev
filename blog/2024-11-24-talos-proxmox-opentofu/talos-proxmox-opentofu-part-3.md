---
slug: talos-on-proxmox-opentofu-part-3
title: "Talos, Proxmox, OpenTofu: Beginner's Guide Pt.3"
authors: [egrosdou01]
date: 2025-02-06
image: ./Proxmox_OpenTofu_Talos_Cilium.jpg
description: A step-by-step guide installing a Talos Cluster on Proxmox with OpenTofu - Part 3.
tags: [talos,cilium,opentofu,proxmox,open-source,beginner-guide,"2025"]
---

## Introduction

Welcome to **part 3** of the **Talos Linux Kubernetes cluster** bootstrap of the **Proxmox** series. In today's post, we will perform changes to make the code **reusable** and **extensible**. Users can follow a GitOps approach towards Talos deployments.

We assume you already have the basic [project structure](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-proxmox). To follow along, check out the [part 1](talos-proxmox-opentofu-part-1.md) and [part 2](talos-proxmox-opentofu-part-2.md) posts.

![title image reading "Talos Cluster on Proxmox with OpenTofu and Cilium"](Proxmox_OpenTofu_Talos_Cilium.jpg)

<!--truncate-->

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
+------------------------+-------------------------+
|        Binaries        |         Version         |
+------------------------+-------------------------+
|         tofu           | OpenTofu v1.8.1/v1.9.0  |
|        kubectl         |         v1.30.2         |
+------------------------+-------------------------+
```

## Module Tests

The module was primarily tested from a local MacBook however, it was also tested from an `Ubuntu 22.04` virtual machine within the Proxmox environment.

## GitHub Resources

The showcase repository is available [here](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-cilium-proxmox-module).

## Prerequisites

As this is **part 3** of the blog post series, we assume the prerequisites are already satisfied. If not, go through the previous posts and check out the prerequisites.

## Code Updates

- Allow users to create `controplane` and `worker` instances using **one** variable
- Convert the `tofu plan` into a module
- Store the `tofu state` in a `backend`
- Use an external `secret management` solution

### Talos Nodes Definition

As we already know we need two different node types to form a Talos cluster, instead of using two separate variables, we can optimise the code and use one variable definition instead. The variable is a `map object` sharing the same information for both types.

```hcl
variable "node" {
  description = "Configuration for the Talos cluster nodes"
  type = map(object({
    vmodel       = string
    hdd_capacity = string
    vmid         = number
    vnetwork     = string
    vcores       = number
    vram         = number
  }))
}
```

#### Example Definition

```hcl
node = {
  controller01 = {
    vmodel       = "virtio"
    hdd_capacity = "10G"
    vmid         = 505
    vnetwork     = "vmbr3"
    vcores       = 2
    vram         = 2048
  }
  controller02 = {
    vmodel       = "virtio"
    hdd_capacity = "10G"
    vmid         = 506
    vnetwork     = "vmbr3"
    vcores       = 2
    vram         = 2048
  }
  worker01 = {
    vmodel       = "virtio"
    hdd_capacity = "10G"
    vmid         = 507
    vnetwork     = "vmbr3"
    vcores       = 2
    vram         = 2048
  }
  worker02 = {
    vmodel       = "virtio"
    hdd_capacity = "10G"
    vmid         = 508
    vnetwork     = "vmbr3"
    vcores       = 2
    vram         = 2048
  }
}
```

This approach allows us to create two types of virtual machines using one `resource` and looping over the defined nodes. The advantage is that we can reusable the code not only during the virtual machine creation but also in the `data.tf` and `main.tf` definitions of the Talos Kubernetes cluster. Additionally, we can utilise conditional checks to perform the right deployment configurations for the different nodes.

:::note
The node names should follow the name convention `controller` and `worker`. The names are used as `keys` in different parts of the module.
:::

### Talos Plan into Module

To allow users to reuse the `tofu plan`, it might be a good idea to convert the `plan` into a **module**.

> "A module is a container for multiple resources that are used together. You can use modules to create lightweight abstractions, so that you can describe your infrastructure in terms of its architecture, rather than directly in terms of physical objects."
>
> [Source](https://opentofu.org/docs/language/modules/develop/)

Following the instructions and recommendations, we converted the code into a **module**. The `examples/complete` directory showcase how users can utilise the module. The information is useful when the module is called from a pipeline (GitHub actions, GitLab pipelines etc.).

:::note
For the module to work in your environment, ensure the information provided in the `main.tf` file reflects the data found within your Proxmox installation. If example values do not fit your setup, please update them accordingly.

Notable variables:
- `vm_details.iso_name`: Ensure the correct `iso` name is defined based on your deployment
- `vm_details.target_node`: Ensure the correct Proxmox `node name` is defined
- `vm_details.ipconfig`: The code works with `DHCP`
- `talos_cluster_details.schematic_id`: The `schematic ID` extracted from the `Talos Factory Image` website
:::

:::tip
If the installation takes longer than `10 min` (default health_check timeout condition), you can update the `data.talos_cluster_health.cluster_health` to a greater value. The configuration can be found within the **module** and file `data.tf`.
:::

### Tofu State to Backend

The `tofu state` is a critical component of the infrastructure deployment. Thus, it might be a good idea to store it in a backend. Backends are primarily used as a means of managing the information contained within a `tofu state` file. OpenTofu recommends storing the `tofu state` file in a [TACOS (TF Automation and Collaboration Software)](https://opentofu.org/docs/language/state/remote/) system. In my case, I tend to store the `state` file within a GitLab project while executing pipelines. For better scalability and if you want to be independent from a GitLab server, it is very simple to store the `state` files in an [S3 bucket](https://aws.amazon.com/s3/). More information can be found [here](https://spacelift.io/blog/terraform-s3-backend).

### Work with Sensitive Information

As I am working in my home-lab setup, I am more than happy with storing sensitive information in a `.env` file and excluding it from the Git repository with an entry in the `.gitignore` file. However, when more than one person work on the same code, it is a good idea to store secrets in a central location with encryption in transit and at rest. Below are some of the tools I have worked with. Due to the nature of `secret management` in general, this topic will not be covered in this particular guide. I recommend looking at the provided links and choosing the tool that fits your needs and use cases.

- [Hashicorp Vault](https://www.vaultproject.io/)
- [AWS Secret Manager](https://aws.amazon.com/secrets-manager/)

## Conclusion

🚀 In Part 3, we explored potential improvements to the current setup. If you have any ideas or suggestions for enhancing the module further, feel free to get in touch. Thanks for reading, and stay tuned for the next post!

## Resources

- [OpenTofu Module](https://opentofu.org/docs/language/modules/)
- [OpenTofu State](https://opentofu.org/docs/language/state/remote/)
- [GitLab Terraform/OpenTofu State](https://docs.gitlab.com/ee/user/infrastructure/iac/terraform_state.html)
- [OpenTofu - Backend Type](https://opentofu.org/docs/language/settings/backends/http/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!
