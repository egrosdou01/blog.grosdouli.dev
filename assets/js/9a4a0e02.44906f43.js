"use strict";(self.webpackChunkpersonal_blog=self.webpackChunkpersonal_blog||[]).push([[5911],{661:(e,t,o)=>{o.r(t),o.d(t,{assets:()=>a,contentTitle:()=>l,default:()=>p,frontMatter:()=>n,metadata:()=>r,toc:()=>c});var s=o(4848),i=o(8453);const n={slug:"cilium-eks-sveltos",title:"Cilium on EKS with Sveltos",authors:["egrosdou01"],date:new Date("2024-07-15T00:00:00.000Z"),image:"./cilium_sveltos_eks.jpg",tags:["sveltos","cilium","open-source","kubernetes","gitops","devops","2024"]},l=void 0,r={permalink:"/blog/cilium-eks-sveltos",source:"@site/blog/2024-07-15-welcome/cilium-eks-sveltos.md",title:"Cilium on EKS with Sveltos",description:"Introduction",date:"2024-07-15T00:00:00.000Z",tags:[{inline:!1,label:"Sveltos",permalink:"/blog/tags/sveltos",description:"Open source project Sveltos"},{inline:!1,label:"Cilium",permalink:"/blog/tags/cilium",description:"eBPF-based Networking, Security, and Observability for Kubernetes"},{inline:!1,label:"Open Source",permalink:"/blog/tags/open-source",description:"Open source software"},{inline:!1,label:"Kubernetes",permalink:"/blog/tags/kubernetes",description:"Container orchestration platform for automating application deployment, scaling, and management"},{inline:!1,label:"GitOps",permalink:"/blog/tags/gitops",description:"Operational framework that uses Git as a single source of truth for declarative infrastructure and applications"},{inline:!1,label:"DevOps",permalink:"/blog/tags/devops",description:"Set of practices that combines software development and IT operations"},{inline:!1,label:"2024",permalink:"/blog/tags/2024",description:"The year the post went online"}],readingTime:8.29,hasTruncateMarker:!0,authors:[{name:"Eleni Grosdouli",title:"DevOps Consulting Engineer at Cisco Systems",url:"https://github.com/egrosdou01",imageURL:"https://github.com/egrosdou01.png",key:"egrosdou01"}],frontMatter:{slug:"cilium-eks-sveltos",title:"Cilium on EKS with Sveltos",authors:["egrosdou01"],date:"2024-07-15T00:00:00.000Z",image:"./cilium_sveltos_eks.jpg",tags:["sveltos","cilium","open-source","kubernetes","gitops","devops","2024"]},unlisted:!1,prevItem:{title:"Cilium Cluster Mesh on RKE2",permalink:"/blog/cilium-cluster-mesh-rke2"},nextItem:{title:"Welcome",permalink:"/blog/welcome"}},a={image:o(1177).A,authorsImageUrls:[void 0]},c=[{value:"Introduction",id:"introduction",level:2}];function u(e){const t={a:"a",h2:"h2",img:"img",p:"p",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h2,{id:"introduction",children:"Introduction"}),"\n",(0,s.jsxs)(t.p,{children:["In today's blog post, we will demonstrate an easy way of deploying and controlling ",(0,s.jsx)(t.a,{href:"https://docs.cilium.io/en/v1.14/",children:"Cilium"})," on an ",(0,s.jsx)(t.a,{href:"https://aws.amazon.com/eks/",children:"EKS"})," cluster with ",(0,s.jsx)(t.a,{href:"https://github.com/projectsveltos",children:"Sveltos"}),"."]}),"\n",(0,s.jsxs)(t.p,{children:["As the majority of the documentation out there provides a step-by-step installation directly with the Helm chart commands, we decided to demonstrate a different approach, the GitOps approach, with the use of ",(0,s.jsx)(t.a,{href:"https://projectsveltos.github.io/sveltos/addons/addons/",children:"Sveltos ClusterProfile"})," CRD (Custom Resource Definition)."]}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"title image reading &quot;Cilium on EKS with Sveltos Diagram&quot;",src:o(3922).A+"",width:"1600",height:"870"})})]})}function p(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}},1177:(e,t,o)=>{o.d(t,{A:()=>s});const s=o.p+"assets/images/cilium_sveltos_eks-96202e60f24f3661fb326790c8b28ead.jpg"},3922:(e,t,o)=>{o.d(t,{A:()=>s});const s=o.p+"assets/images/cilium_sveltos_eks-96202e60f24f3661fb326790c8b28ead.jpg"},8453:(e,t,o)=>{o.d(t,{R:()=>l,x:()=>r});var s=o(6540);const i={},n=s.createContext(i);function l(e){const t=s.useContext(n);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),s.createElement(n.Provider,{value:t},e.children)}}}]);