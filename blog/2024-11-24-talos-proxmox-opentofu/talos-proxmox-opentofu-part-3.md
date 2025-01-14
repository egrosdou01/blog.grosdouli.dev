---
slug: talos-on-proxmox-opentofu-part-3
title: "Talos, Proxmox and OpenTofu: Beginner's Guide – Part 3"
authors: [egrosdou01]
date: 2025-02-04
tags: [talos,cilium,opentofu,proxmox,open-source,beginner-guide,"2025"]
---

## Introduction

Welcome to part 3 of the Talos Linux Kubernetes cluster bootstrap of the Proxmox series. In today's post, we will perform changes to make the code reusable and extensible. Users can reuse the code and follow a GitOps approach towards Talos deployments.

We assume you already have the basic [project structure](https://github.com/egrosdou01/blog-post-resources/tree/main/opentofu-talos-proxmox). To follow along, check out the [part 1](../2024-11-24-talos-proxmox-opentofu/talos-proxmox-opentofu-part-1.md) and [part 2](../2024-11-24-talos-proxmox-opentofu/talos-proxmox-opentofu-part-2.md) posts.

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

As this is **part 3** of the blog post series, we assume the prerequisites are already satisfied. If not, go to the previous posts and check out the prerequisites.

## Code Updates

- Allow users to create `controplane` and `worker` instances using one variable
- Convert the `tofu plan` into a module
- Store the `tofu state` in a `backend`
- Use an external `secret management` solution

### Talos Nodes Definition

As we already know we need two different node types to form a Talos cluster, instead of using two variables to create them, we can optimise the code and use variable definition instead. The variable is nothing more than a `map object` sharing the same information for both types.

```hcl
variable "node" {
  description = "Condifuration for the Talos cluster nodes"
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

This approach allows us to create different types of virtual machines using one `resource` and looping over the defined nodes. The advantage is that we can reusable the code not only during the virtual machine creation but also in the `data.tf` and `main.tf` definitions of the Talos Kubernetes clusters. Additionally, we can utilise conditional checks to perform the right deployment configurations for the different nodes.

:::note
The node names should follow the name convention `controller` and `worker`. The `keys` of the specified nodes are used in different parts of the module.
:::

### Talos Plan into Module

To allow different users to reuse the `tofu plan`, it might be a good idea to convert the `plan` into a module.

> "A module is a container for multiple resources that are used together. You can use modules to create lightweight abstractions, so that you can describe your infrastructure in terms of its architecture, rather than directly in terms of physical objects."
>
> [Source](https://opentofu.org/docs/language/modules/develop/)

Following the instructions and recommendations from the mentioned link, we managed to convert the code into a module. Also, the `examples/complete` directory was created to help users use the module. The information is useful when the module is called from a pipeline (GitHub actions, GitLab pipelines etc.).

### Tofu State to Backend

The `tofu state` is a critical component of the infrastructure deployment. Thus, it might be a good idea to store it in a backend. Backends are primarily used as a means of managing the information contained within a `tofu state` file. OpenTofu recommends storing the `tofu state` file in a [TACOS (TF Automation and Collaboration Software)](https://opentofu.org/docs/language/state/remote/) system. In my case, I tend to store the `state` file on a GitLab project while executing pipelines. For better scalability and if you want to be independent of a GitLab server, it is very simple to store the `state` files in an S3 bucket. More information can be found [here](https://spacelift.io/blog/terraform-s3-backend).


### Work with Sensitive Information

As I am working in my home-lab setup, I am more than happy with storing sensitive information in a `.env` file and excluding it from the Git repository with an entry in the `.gitignore` file. However, when more than one person is working on developing code, it is a good idea to store secrets in a central location with encryption in transit and at rest. Below are some of the tools I have worked with. Due to the nature of `secret management` in general, this topic will not be covered in this beginner guide. I would recommend looking at the provided links and choosing the tool that fits your needs and use cases.

## Resources

- [OpenTofu Module](https://opentofu.org/docs/language/modules/)
- [OpenTofu State](https://opentofu.org/docs/language/state/remote/)
- [GitLab Terraform/OpenTofu State](https://docs.gitlab.com/ee/user/infrastructure/iac/terraform_state.html)
- [OpenTofu - Backend Type](https://opentofu.org/docs/language/settings/backends/http/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

## Conclusions
🚀 In part 3, we outlines potential improvements on the existing setup. Thanks for reading, and stay tuned for the next post!