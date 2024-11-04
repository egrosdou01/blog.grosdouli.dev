"use strict";(self.webpackChunkpersonal_blog=self.webpackChunkpersonal_blog||[]).push([[1642],{8627:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var o=s(4848),t=s(8453);const i={slug:"k8s-troubleshooting-insights-coredns",title:"K8s Troubleshooting Insights: Looking into CoreDNS Issues",authors:["egrosdou01"],date:new Date("2024-10-27T00:00:00.000Z"),tags:["kubernetes","open-source","troubleshooting-insights","rke2","2024"]},r=void 0,l={permalink:"/blog/k8s-troubleshooting-insights-coredns",source:"@site/blog/2024-10-27-k8s-troubleshooting-insights/k8s-troubleshooting-insights-coredns.md",title:"K8s Troubleshooting Insights: Looking into CoreDNS Issues",description:"Introduction",date:"2024-10-27T00:00:00.000Z",tags:[{inline:!1,label:"Kubernetes",permalink:"/blog/tags/kubernetes",description:"Container orchestration platform for automating application deployment, scaling, and management"},{inline:!1,label:"Open Source",permalink:"/blog/tags/open-source",description:"Open source software"},{inline:!1,label:"Troubleshooting Insights",permalink:"/blog/tags/troubleshooting-insights",description:"Label attached to posts related to K8s insights"},{inline:!1,label:"RKE2",permalink:"/blog/tags/rke2",description:"Rancher Kubernetes Engine 2 (RKE2)"},{inline:!1,label:"2024",permalink:"/blog/tags/2024",description:"The year the post went online"}],readingTime:7.87,hasTruncateMarker:!0,authors:[{name:"Eleni Grosdouli",title:"DevOps Consulting Engineer at Cisco Systems",url:"https://github.com/egrosdou01",imageURL:"https://github.com/egrosdou01.png",key:"egrosdou01"}],frontMatter:{slug:"k8s-troubleshooting-insights-coredns",title:"K8s Troubleshooting Insights: Looking into CoreDNS Issues",authors:["egrosdou01"],date:"2024-10-27T00:00:00.000Z",tags:["kubernetes","open-source","troubleshooting-insights","rke2","2024"]},unlisted:!1,nextItem:{title:"Sveltos: Optimising Day-2 Operations with Cilium and Tetragon",permalink:"/blog/sveltos-cilium-tetragon-day2-operations"}},a={authorsImageUrls:[void 0]},c=[{value:"Introduction",id:"introduction",level:2},{value:"Environment Setup",id:"environment-setup",level:2},{value:"Scenario",id:"scenario",level:2},{value:"Troubleshooting Steps",id:"troubleshooting-steps",level:2},{value:"Step 1: Underlying Infrastructure",id:"step-1-underlying-infrastructure",level:3},{value:"Step 2: Kubernetes Troubleshooting",id:"step-2-kubernetes-troubleshooting",level:3},{value:"Optional: Kubernetes Troubleshoot with Cilium Hubble",id:"optional-kubernetes-troubleshoot-with-cilium-hubble",level:3},{value:"Optional: Kubernetes Troubleshoot with Netshoot Pod and TCPDump",id:"optional-kubernetes-troubleshoot-with-netshoot-pod-and-tcpdump",level:3},{value:"tcpdump Output",id:"tcpdump-output",level:3},{value:"Resources",id:"resources",level:2},{value:"\u2709\ufe0f Contact",id:"\ufe0f-contact",level:2},{value:"Conclusions",id:"conclusions",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.h2,{id:"introduction",children:"Introduction"}),"\n",(0,o.jsxs)(n.p,{children:["Welcome to the the first post of the brand\xa0new\xa0Kubernetes Troubleshooting Insights section! The series of blog posts will share helpful information and troubleshooting tips for issues that might appear in a Kubernetes environment. The posts are focused on real-life scenarios from either ",(0,o.jsx)(n.code,{children:"test"}),", ",(0,o.jsx)(n.code,{children:"staging"})," or ",(0,o.jsx)(n.code,{children:"production"})," environments."]}),"\n",(0,o.jsxs)(n.p,{children:["In today\u2019s blog post, we\u2019ll explore an issue with ",(0,o.jsx)(n.a,{href:"https://kubernetes.io/docs/tasks/administer-cluster/coredns/",children:"CoreDNS"})," setup on ",(0,o.jsx)(n.a,{href:"https://docs.rke2.io/",children:"RKE2"})," clusters. ",(0,o.jsx)(n.a,{href:"https://docs.cilium.io/en/stable/overview/intro/#what-is-cilium",children:"Cilium"})," CNI with ",(0,o.jsx)(n.a,{href:"https://docs.cilium.io/en/stable/overview/intro/#what-is-hubble",children:"Hubble"})," were enabled for this setup. Let\u2019s jump right in!"]}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.img,{alt:"title image reading &quot;It&#39;s not DNS&quot;",src:s(7411).A+"",width:"552",height:"414"})}),"\n",(0,o.jsx)(n.h2,{id:"environment-setup",children:"Environment Setup"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"+-----------------+-------------------+--------------------------+----------------+\n|   Cluster Name  |        Type       |         Version          |       OS       |\n+-----------------+-------------------+--------------------------+----------------+\n|    cluster01    |  Managed Cluster  |      v1.28.14+rke2r1     |   Ubuntu 22.04 |\n+-----------------+-------------------+--------------------------+----------------+\n\n\n+-------------+---------------------+\n|  Deployment  |        Version     |\n+-------------+---------------------+\n|    Cilium    |       v1.16.1      |\n+-------------+---------------------+\n\n"})}),"\n",(0,o.jsx)(n.h2,{id:"scenario",children:"Scenario"}),"\n",(0,o.jsx)(n.p,{children:"DNS issues are wide and can be are caused by many reasons. Unfortunately, there is no one-size-fits-all approach when it comes to troubleshooting. In our scenario, we started with the virtual machines, ensured routing and DNS work and then moved to the Kubernetes layer. The blog post is an attempt to provide readers with troubleshooting ideas about DNS issues."}),"\n",(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.strong,{children:"Background"}),": We performed a major migration to a new instance with ",(0,o.jsx)(n.strong,{children:"new DNS"})," servers and ",(0,o.jsx)(n.strong,{children:"domains"}),". We had to test if everything worked with the new setup. Everything appeared fine apart from synchronising ",(0,o.jsx)(n.strong,{children:"ArgoCD"})," with internal Git repositories. An error from an ",(0,o.jsx)(n.strong,{children:"internal Kubernetes IP address"})," on port ",(0,o.jsx)(n.strong,{children:"53"})," appeared. Weird, right? We were confident the underlying virtual machines were using the correct DNS, and the configuration of the DHCP server was updated."]}),"\n",(0,o.jsx)(n.admonition,{type:"note",children:(0,o.jsx)(n.p,{children:"The troubleshooting session was performed on an Ubuntu 22.04 environment. If another operating system is used, the troubleshooting methodology remains the same. The Linux commands will be different."})}),"\n",(0,o.jsx)(n.h2,{id:"troubleshooting-steps",children:"Troubleshooting Steps"}),"\n",(0,o.jsx)(n.h3,{id:"step-1-underlying-infrastructure",children:"Step 1: Underlying Infrastructure"}),"\n",(0,o.jsx)(n.p,{children:"The below steps were performed to double-check the underlying infrastructure."}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.strong,{children:"DHCP Server (if used)"}),": Ensure the configuration points to the new DNS servers"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ cat /etc/dhcp/dhcpd.conf\n"})}),"\n",(0,o.jsxs)(n.p,{children:["Check the ",(0,o.jsx)(n.code,{children:"domain-name-servers"})," configuration."]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:[(0,o.jsx)(n.strong,{children:"Cluster Node"}),": Perform an SSH connection to one of the cluster nodes"]}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Check the DNS configuration"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ cat /etc/resolv.conf # Check the local DNS configuration\n\n$ sudo resolvectl status # Check the global and per-link DNS settings currently in effect\n"})}),"\n",(0,o.jsxs)(n.p,{children:["From the command above, we would like to see how the Ethernet network interface on the virtual machine resolves domains. The ",(0,o.jsx)(n.code,{children:"resolvectl status"})," command will reveal the use of the new DNS servers."]}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Check routing"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ ping test-site.example-domain.com # Check whether we can reach the custom domain\n\n$ ping 8.8.8.8 # Check whether we can reach the Internet\n"})}),"\n",(0,o.jsx)(n.p,{children:"If one of the commands above fail, this might be an indication that routing is broken, or something else is blocking traffic."}),"\n",(0,o.jsx)(n.p,{children:"If the commands above are successful, we continue with the next step and dive into the Kubernetes world."}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,o.jsx)(n.h3,{id:"step-2-kubernetes-troubleshooting",children:"Step 2: Kubernetes Troubleshooting"}),"\n",(0,o.jsxs)(n.p,{children:["Depending on the Kubernetes environment in place, identify how DNS queries are resolved from a Kubernetes cluster point of view. In our case, the RKE2 clusters use ",(0,o.jsx)(n.code,{children:"CoreDNS"}),"."]}),"\n",(0,o.jsxs)(n.p,{children:["Even from a Kubernetes point of view, we will perform the well used ",(0,o.jsx)(n.code,{children:"ping"})," and ",(0,o.jsx)(n.code,{children:"curl"})," commands to see what is going on. For that reason, we will deploy the ",(0,o.jsx)(n.code,{children:"dns-utils"})," pod to perform network calls."]}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Deploy the ",(0,o.jsx)(n.code,{children:"dns-utils"})," ",(0,o.jsx)(n.a,{href:"https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",children:"pod"})," to check DNS queries"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"  $ kubectl apply -f - <<EOF\n    apiVersion: v1\n    kind: Pod\n    metadata:\n      name: dnsutils\n      namespace: default\n    spec:\n      containers:\n      - name: dnsutils\n        image: registry.k8s.io/e2e-test-images/agnhost:2.39\n        imagePullPolicy: IfNotPresent\n      restartPolicy: Always\n  EOF\n"})}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Exec into the ",(0,o.jsx)(n.code,{children:"dnsutils"})," pod - Perform ",(0,o.jsx)(n.code,{children:"ping"})," and ",(0,o.jsx)(n.code,{children:"dig"})," to well known website"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"  $ kubectl exec -it dnsutils -- /bin/sh\n\n  / # ping 8.8.8.8\n  PING 8.8.8.8 (8.8.8.8): 56 data bytes\n  64 bytes from 8.8.8.8: icmp_seq=0 ttl=119 time=41.526 ms\n\n  / # dig SOA www.google.com\n  ;; AUTHORITY SECTION:\n  google.com.\t\t30\tIN\tSOA\t<YOUR DNS Server>.google.com. dns-admin.google.com. 689372973 900 900 1800 60\n"})}),"\n",(0,o.jsx)(n.p,{children:"If the above commands are successful, we know that routing and resolution works for well known websites."}),"\n",(0,o.jsx)(n.admonition,{type:"tip",children:(0,o.jsxs)(n.p,{children:["Learn more about ",(0,o.jsx)(n.a,{href:"https://www.cloudflare.com/en-gb/learning/dns/dns-records/dns-soa-record/",children:"SOA"}),"."]})}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Exec into the ",(0,o.jsx)(n.code,{children:"dnsutils"})," pod - Perform ",(0,o.jsx)(n.code,{children:"curl"})," and ",(0,o.jsx)(n.code,{children:"dig"})," to the custom domain"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"  $ kubectl exec -it dnsutils -- /bin/sh\n  / # curl -vvv example-domain.com\n    * Could not resolve host: example-domain.com\n    * Closing connection 0\n    curl: (6) Could not resolve host: example-domain.com\n  \n  / # dig SOA example-domain.com\n  ...\n    ;; AUTHORITY SECTION:\n    example-domain.com.\t20\tIN\tSOA\tns.dns.example-domain.com. hostmaster.example-domain.com. 1729344685 7200 1800 86400 30\n\n  / # dig @YOUR DNS Server SOA example-domain.com\n  ...\n  ;; AUTHORITY SECTION:\n  example-domain.com. 3600\tIN\tSOA\t<YOUR DNS SERVER NAME>.example-domain.com. mail.example-domain.com. 1729687405 604800 86400 2419200 604800\n"})}),"\n",(0,o.jsxs)(n.p,{children:["From the above, we can see that we can resolve the custom domain by defining our DNS server. But, when we do not define it the responsible entity to answer the DNS queries of the custom zone is set to the name\xa0",(0,o.jsx)(n.code,{children:"ns.dns."}),". What is going on here? We would expect the DNS quetries to be resolved by the DNS serve defined in the virtual machines."]}),"\n",(0,o.jsx)(n.admonition,{type:"note",children:(0,o.jsxs)(n.p,{children:["It is important to check the ",(0,o.jsx)(n.code,{children:"AUTHORITY SECTION"})," of the ",(0,o.jsx)(n.code,{children:"dig"})," command output.\n",(0,o.jsx)(n.code,{children:"SOA ns.dns.example-domain.com."})," signifies this is an SOA record, which provides essential information about a DNS zone. The ",(0,o.jsx)(n.code,{children:"ns.dns.example-domain.com."})," defines the primary DNS for that domain. But why? We would expect to see one of the new DNS servers instead."]})}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Identify the CoreDNS deployment"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl get deploy -n kube-system\nrke2-coredns-rke2-coredns              2/2     2            2           23h\nrke2-coredns-rke2-coredns-autoscaler   1/1     1            1           23h\n"})}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Check the ",(0,o.jsx)(n.code,{children:"CoreDNS ConfigMap"})]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl get cm -n kube-system\nchart-content-rke2-coredns                             1      23h\nrke2-coredns-rke2-coredns                              1      23h\nrke2-coredns-rke2-coredns-autoscaler                   1      23h\n\n$ kubectl get cm rke2-coredns-rke2-coredns -n kube-system -o jsonpath='{.data.Corefile}'\n  .:53 {\n  errors \n  health  {\n      lameduck 5s\n  }\n  ready \n  kubernetes example-domain.com   cluster.local  cluster.local in-addr.arpa ip6.arpa {\n      pods insecure\n      fallthrough in-addr.arpa ip6.arpa\n      ttl 30\n  }\n  prometheus   0.0.0.0:9153\n  forward   . /etc/resolv.conf\n  cache   30\n  loop \n  reload \n  loadbalance \n  }\n"})}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsxs)(n.p,{children:["Exec to the CoreDNS deployment and ",(0,o.jsx)(n.code,{children:"cat"})," the ",(0,o.jsx)(n.code,{children:"/etc/resolv.conf"})]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl exec -it deploy/rke2-coredns-rke2-coredns -n kube-system -- cat /etc/resolv.conf\n  nameserver <DNS01 IP>\n  nameserver <DNS02 IP>\n"})}),"\n",(0,o.jsx)(n.p,{children:"If the above output returns the expected nameservers, continue with the next step."}),"\n"]}),"\n",(0,o.jsxs)(n.li,{children:["\n",(0,o.jsx)(n.p,{children:"Analyse the CoreDNS config"}),"\n",(0,o.jsxs)(n.p,{children:["The output ",(0,o.jsx)(n.code,{children:"kubernetes example-domain.com   cluster.local  cluster.local in-addr.arpa ip6.arpa"})," indicates that ",(0,o.jsx)(n.code,{children:"CoreDNS"})," is responsible for responsing to DNS queries of the specified zones including ",(0,o.jsx)(n.code,{children:"example-domain.com"}),". Should ",(0,o.jsx)(n.code,{children:"CoreDNS"})," be responsible, or this is just a misconfiguration?"]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(n.p,{children:["In our case, the custom domain was included to the ",(0,o.jsx)(n.code,{children:"CoreDNS"})," configuration by mistake. Responses to DNS queries related to the custom domain should be forwarded to the defined DNS server instead."]}),"\n",(0,o.jsxs)(n.p,{children:["If this is the case for your environment, edit the ",(0,o.jsx)(n.code,{children:"ConfigMap"})," and remove the custom domain from the configuration. Use the commands below."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:'$ kubectl patch cm rke2-coredns-rke2-coredns -n kube-system --type=\'json\' -p=\'[{"op": "replace", "path": "/data/Corefile", "value": ".:53 {\\n    errors \\n    health  {\\n        lameduck 5s\\n    }\\n    ready \\n    kubernetes cluster.local cluster.local in-addr.arpa ip6.arpa {\\n        pods insecure\\n        fallthrough in-addr.arpa ip6.arpa\\n        ttl 30\\n    }\\n    prometheus 0.0.0.0:9153\\n    forward . /etc/resolv.conf\\n    cache 30\\n    loop \\n    reload \\n    loadbalance \\n}"}]\'\n\nconfigmap/rke2-coredns-rke2-coredns patched\n\n$ kubectl get cm rke2-coredns-rke2-coredns -n kube-system -o jsonpath=\'{.data.Corefile}\' # Ensure the custom domain is removed\n\n$ kubectl exec -it dnsutils -- /bin/sh\n/ # curl <domain>:<port> # You should be able to resolved the domain now\n'})}),"\n",(0,o.jsx)(n.h3,{id:"optional-kubernetes-troubleshoot-with-cilium-hubble",children:"Optional: Kubernetes Troubleshoot with Cilium Hubble"}),"\n",(0,o.jsxs)(n.p,{children:["Another option to troubleshoot network issues is with Hubble. If it is available as part of your installation, you can exec into the Cilium ",(0,o.jsx)(n.code,{children:"daemonset"})," and start using the Hubble CLI to observe traffic. For example, you can use something like the below."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl exec -it ds/cilium -n kube-system -- /bin/sh\n# hubble observe --pod rke2-coredns-rke2-coredns-84b9cb946c-b7l9k --namespace kube-system --protocol UDP -f\n"})}),"\n",(0,o.jsxs)(n.p,{children:["The command above will display UDP packages between the ",(0,o.jsx)(n.code,{children:"dnsutils"})," pod and ",(0,o.jsx)(n.code,{children:"CoreDNS"}),". The Hubble cheat sheet can be found ",(0,o.jsx)(n.a,{href:"https://cilium.isovalent.com/hubfs/marketing%20briefs/Isovalent%20-%20Cilium%20Hubble%20Cheat%20Sheet.pdf",children:"here"}),"."]}),"\n",(0,o.jsx)(n.h3,{id:"optional-kubernetes-troubleshoot-with-netshoot-pod-and-tcpdump",children:"Optional: Kubernetes Troubleshoot with Netshoot Pod and TCPDump"}),"\n",(0,o.jsxs)(n.p,{children:["If we want to see what happens with the UDP packages when we perform a ",(0,o.jsx)(n.code,{children:"CURL"})," request on a custom domain, it might be easier to instantiate a ",(0,o.jsx)(n.code,{children:"tcpdump"})," using the ",(0,o.jsx)(n.a,{href:"https://hub.docker.com/r/nicolaka/netshoot/tags",children:"netshoot pod"}),". Follow the commands below."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl run -it --rm debug --image=nicolaka/netshoot -- /bin/bash\ndebug:~# tcpdump -i eth0 -n udp port 53\n"})}),"\n",(0,o.jsxs)(n.p,{children:["Once tcpdump is enabled, exec into the same pod and perform ",(0,o.jsx)(n.code,{children:"CURL"})," requests."]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"$ kubectl exec -it dnsutils -n kube-system -- /bin/sh\n/ # curl example-domain.com\n"})}),"\n",(0,o.jsx)(n.h3,{id:"tcpdump-output",children:"tcpdump Output"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-bash",children:"tcpdump: verbose output suppressed, use -v[v]... for full protocol decode\nlistening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes\n16:31:52.197604 IP 10.42.2.184.49109 > 10.43.0.10.53: 59274+ [1au] A? example-domain.com.default.svc.cluster.local. (86)\n16:31:52.197677 IP 10.42.2.184.49109 > 10.43.0.10.53: 134+ [1au] AAAA? example-domain.com.default.svc.cluster.local. (86)\n16:31:52.198333 IP 10.43.0.10.53 > 10.42.2.184.49109: 59274 NXDomain*- 0/1/1 (179)\n16:31:52.198553 IP 10.43.0.10.53 > 10.42.2.184.49109: 134 NXDomain*- 0/1/1 (179)\n"})}),"\n",(0,o.jsxs)(n.p,{children:["The output above indicates that a client queries a DNS server, and the server responds that the domain ",(0,o.jsx)(n.strong,{children:"does not exist"}),". This would be a hint to check the ",(0,o.jsx)(n.code,{children:"CoreDNS"})," configuration! :)"]}),"\n",(0,o.jsx)(n.h2,{id:"resources",children:"Resources"}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.strong,{children:"Debugging DNS"}),": ",(0,o.jsx)(n.a,{href:"https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",children:"https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/"})]}),"\n"]}),"\n",(0,o.jsx)(n.h2,{id:"\ufe0f-contact",children:"\u2709\ufe0f Contact"}),"\n",(0,o.jsxs)(n.p,{children:["If you have any questions, feel free to get in touch! You can use the ",(0,o.jsx)(n.code,{children:"Discussions"})," option found ",(0,o.jsx)(n.a,{href:"https://github.com/egrosdou01/personal-blog/discussions",children:"here"})," or reach out to me on any of the social media platforms provided. \ud83d\ude0a"]}),"\n",(0,o.jsx)(n.p,{children:"We look forward to hearing from you!"}),"\n",(0,o.jsx)(n.h2,{id:"conclusions",children:"Conclusions"}),"\n",(0,o.jsx)(n.p,{children:"Is it DNS at the end? This is something you will have to find out! Hopefully, the post gave you some ideas to troubleshoot with confidence DNS issues in a Kubernetes environment."}),"\n",(0,o.jsx)(n.p,{children:"It's a wrap for this post! \ud83c\udf89 Thanks for reading! Stay tuned for more exciting updates!"})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},7411:(e,n,s)=>{s.d(n,{A:()=>o});const o=s.p+"assets/images/its_not_dns-7c9e0117b51945b16881a20c7d6a2878.jpeg"},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>l});var o=s(6540);const t={},i=o.createContext(t);function r(e){const n=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),o.createElement(i.Provider,{value:n},e.children)}}}]);