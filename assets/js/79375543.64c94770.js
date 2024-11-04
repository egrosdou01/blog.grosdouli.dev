"use strict";(self.webpackChunkpersonal_blog=self.webpackChunkpersonal_blog||[]).push([[1620],{891:(e,t,o)=>{o.r(t),o.d(t,{assets:()=>a,contentTitle:()=>r,default:()=>d,frontMatter:()=>s,metadata:()=>l,toc:()=>u});var i=o(4848),n=o(8453);const s={slug:"cilium-cluster-mesh-rke2",title:"Cilium Cluster Mesh on RKE2",authors:["egrosdou01"],date:new Date("2024-07-18T00:00:00.000Z"),tags:["cilium","rke2","open-source","kubernetes","gitops","devops","2024"]},r=void 0,l={permalink:"/blog.grosdouli.dev/blog/cilium-cluster-mesh-rke2",source:"@site/blog/2024-07-18-rke2-cilium/cilium-cluster-mesh-rke2.md",title:"Cilium Cluster Mesh on RKE2",description:"Introduction",date:"2024-07-18T00:00:00.000Z",tags:[{inline:!1,label:"Cilium",permalink:"/blog.grosdouli.dev/blog/tags/cilium",description:"eBPF-based Networking, Security, and Observability for Kubernetes"},{inline:!1,label:"RKE2",permalink:"/blog.grosdouli.dev/blog/tags/rke2",description:"Rancher Kubernetes Engine 2 (RKE2)"},{inline:!1,label:"Open Source",permalink:"/blog.grosdouli.dev/blog/tags/open-source",description:"Open source software"},{inline:!1,label:"Kubernetes",permalink:"/blog.grosdouli.dev/blog/tags/kubernetes",description:"Container orchestration platform for automating application deployment, scaling, and management"},{inline:!1,label:"GitOps",permalink:"/blog.grosdouli.dev/blog/tags/gitops",description:"Operational framework that uses Git as a single source of truth for declarative infrastructure and applications"},{inline:!1,label:"DevOps",permalink:"/blog.grosdouli.dev/blog/tags/devops",description:"Set of practices that combines software development and IT operations"},{inline:!1,label:"2024",permalink:"/blog.grosdouli.dev/blog/tags/2024",description:"The year the post went online"}],readingTime:10.415,hasTruncateMarker:!0,authors:[{name:"Eleni Grosdouli",title:"DevOps Consulting Engineer at Cisco Systems",url:"https://github.com/egrosdou01",imageURL:"https://github.com/egrosdou01.png",key:"egrosdou01"}],frontMatter:{slug:"cilium-cluster-mesh-rke2",title:"Cilium Cluster Mesh on RKE2",authors:["egrosdou01"],date:"2024-07-18T00:00:00.000Z",tags:["cilium","rke2","open-source","kubernetes","gitops","devops","2024"]},unlisted:!1,prevItem:{title:"Rancher RKE2 Cluster on Azure",permalink:"/blog.grosdouli.dev/blog/rancher-rke2-cilium-azure"},nextItem:{title:"Cilium on EKS with Sveltos",permalink:"/blog.grosdouli.dev/blog/cilium-eks-sveltos"}},a={authorsImageUrls:[void 0]},u=[{value:"Introduction",id:"introduction",level:2}];function c(e){const t={a:"a",code:"code",h2:"h2",p:"p",strong:"strong",...(0,n.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.h2,{id:"introduction",children:"Introduction"}),"\n",(0,i.jsxs)(t.p,{children:["After spending some time working with the on-prem ",(0,i.jsx)(t.a,{href:"https://docs.rke2.io/",children:"RKE2"})," lab setup, I came to notice a couple of issues while forming in an automated fashion the ",(0,i.jsx)(t.a,{href:"https://docs.cilium.io/en/stable/network/clustermesh/clustermesh/",children:"Cilium cluster mesh"})," between on-prem clusters."]}),"\n",(0,i.jsxs)(t.p,{children:["In today's post, we will go through the step-by-step process of forming a ",(0,i.jsx)(t.strong,{children:"Cilium Cluster Mesh"})," and explain any issues that might have arisen by following the ",(0,i.jsx)(t.strong,{children:"GitOps"})," approach. The cilium CLI will not be required. The deployment will be performed primarily via ",(0,i.jsx)(t.code,{children:"Helm"})," and ",(0,i.jsx)(t.code,{children:"kubectl"}),"."]})]})}function d(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}},8453:(e,t,o)=>{o.d(t,{R:()=>r,x:()=>l});var i=o(6540);const n={},s=i.createContext(n);function r(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:r(e.components),i.createElement(s.Provider,{value:t},e.children)}}}]);