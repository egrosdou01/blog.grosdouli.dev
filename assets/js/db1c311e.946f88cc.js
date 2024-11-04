"use strict";(self.webpackChunkpersonal_blog=self.webpackChunkpersonal_blog||[]).push([[2615],{3495:(e,t,o)=>{o.r(t),o.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>r,metadata:()=>a,toc:()=>u});var n=o(4848),i=o(8453);const r={slug:"opentofu-rke2-cilium-azure",title:"OpenTofu: RKE2 Cluster with Cilium on Azure",authors:["egrosdou01"],date:new Date("2024-08-21T00:00:00.000Z"),tags:["opentofu","cilium","rke2","azure","open-source","kubernetes","gitops","devops","2024"]},s=void 0,a={permalink:"/blog/opentofu-rke2-cilium-azure",source:"@site/blog/2024-08-21-opentofu-rke2-cilium-azure/opentofu-rke2-cilium-azure.md",title:"OpenTofu: RKE2 Cluster with Cilium on Azure",description:"Introduction",date:"2024-08-21T00:00:00.000Z",tags:[{inline:!1,label:"OpenTofu",permalink:"/blog/tags/opentofu",description:"OpenTofu is a fork of Terraform"},{inline:!1,label:"Cilium",permalink:"/blog/tags/cilium",description:"eBPF-based Networking, Security, and Observability for Kubernetes"},{inline:!1,label:"RKE2",permalink:"/blog/tags/rke2",description:"Rancher Kubernetes Engine 2 (RKE2)"},{inline:!1,label:"Azure",permalink:"/blog/tags/azure",description:"Azure Cloud"},{inline:!1,label:"Open Source",permalink:"/blog/tags/open-source",description:"Open source software"},{inline:!1,label:"Kubernetes",permalink:"/blog/tags/kubernetes",description:"Container orchestration platform for automating application deployment, scaling, and management"},{inline:!1,label:"GitOps",permalink:"/blog/tags/gitops",description:"Operational framework that uses Git as a single source of truth for declarative infrastructure and applications"},{inline:!1,label:"DevOps",permalink:"/blog/tags/devops",description:"Set of practices that combines software development and IT operations"},{inline:!1,label:"2024",permalink:"/blog/tags/2024",description:"The year the post went online"}],readingTime:10.665,hasTruncateMarker:!0,authors:[{name:"Eleni Grosdouli",title:"DevOps Consulting Engineer at Cisco Systems",url:"https://github.com/egrosdou01",imageURL:"https://github.com/egrosdou01.png",key:"egrosdou01"}],frontMatter:{slug:"opentofu-rke2-cilium-azure",title:"OpenTofu: RKE2 Cluster with Cilium on Azure",authors:["egrosdou01"],date:"2024-08-21T00:00:00.000Z",tags:["opentofu","cilium","rke2","azure","open-source","kubernetes","gitops","devops","2024"]},unlisted:!1,prevItem:{title:"Civo Navigate Berlin 2024",permalink:"/blog/civo-navigate-berlin-2024"},nextItem:{title:"Sveltos Templating: Cilium Cluster Mesh in One Run",permalink:"/blog/sveltos-templating-cilium-cluster-mesh"}},l={authorsImageUrls:[void 0]},u=[{value:"Introduction",id:"introduction",level:2}];function c(e){const t={a:"a",code:"code",h2:"h2",img:"img",p:"p",strong:"strong",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:"introduction",children:"Introduction"}),"\n",(0,n.jsxs)(t.p,{children:["In a ",(0,n.jsx)(t.a,{href:"/blog/rancher-rke2-cilium-azure",children:"previous post"}),", we covered how to create an ",(0,n.jsx)(t.a,{href:"https://docs.rke2.io/",children:"RKE2"})," cluster on ",(0,n.jsx)(t.a,{href:"https://azure.microsoft.com/en-us/get-started",children:"Azure Cloud"})," using the ",(0,n.jsx)(t.a,{href:"https://azure.microsoft.com/en-us/free#all-free-services",children:"cloud-free credits"})," from the ",(0,n.jsx)(t.strong,{children:"Rancher UI"}),". As this is a convenient approach to get started with Rancher, in today's post, we will demonstrate how to use ",(0,n.jsx)(t.a,{href:"https://opentofu.org/",children:"OpenTofu"})," to automate the deployment."]}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:"OpenTofu"})," is a fork of ",(0,n.jsx)(t.a,{href:"https://www.terraform.io/",children:"Terraform"}),". It is an open-source project, community-driven, and managed by the Linux Foundation. If you want to get familiar with what ",(0,n.jsx)(t.code,{children:"OpenTofu"})," is and how to get started, check out the link ",(0,n.jsx)(t.a,{href:"https://opentofu.org/docs/intro/core-workflow/",children:"here"}),"."]}),"\n",(0,n.jsxs)(t.p,{children:["Additionally, we will demonstrate how easy it is to customise the ",(0,n.jsx)(t.a,{href:"https://docs.cilium.io/en/stable/",children:"Cilium"})," configuration and enable ",(0,n.jsx)(t.a,{href:"https://kube-vip.io/",children:"kube-vip"})," for LoadBalancer services from the HCL (HashiCorp Configuration Language) definition."]}),"\n",(0,n.jsx)(t.p,{children:(0,n.jsx)(t.img,{alt:"title image reading &quot;OpenTofu Rancher RKE2 Cluster on Azure&quot;",src:o(6586).A+"",width:"6907",height:"2316"})})]})}function p(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(c,{...e})}):c(e)}},6586:(e,t,o)=>{o.d(t,{A:()=>n});const n=o.p+"assets/images/openTofu_rancher_intro_image-d89b7d976207b64e2eaa5b79d0cbf34e.jpg"},8453:(e,t,o)=>{o.d(t,{R:()=>s,x:()=>a});var n=o(6540);const i={},r=n.createContext(i);function s(e){const t=n.useContext(r);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),n.createElement(r.Provider,{value:t},e.children)}}}]);