---
slug: sveltos-dashboard-oidc-keycloak-cilium-gateway-api
title: "Enable Sveltos Dashboard OIDC Authentication with Keycloak Using Cilium and Gateway API Capabilities"
authors: [egrosdou01]
date: 2026-09-20
description: Explore how the vCluster setup can be extended to share Gateway and HTTRoute resources alongside secrets in a dedicate namespace in a tenant environment with the Control Plane cluster. We demonstrate how to setup Keycloak oAuth2 Authentication for Grafana.
tags: [kubernetes,sveltos,cilium,gateway-api]
keywords: [Sveltos,Gateway API,Keycloak,CiliumLoadBalancerIPPool,L2 announcements,RKE2]
---

**Summary**:

Let's explore how to enable the Sveltos dashboard with [OIDC Authentication](https://openid.net/developers/how-connect-works/) using [Keycloak](https://www.keycloak.org/). We use an RKE2 cluster powered by **Cilium** and **Gateway API**, while **L2Announcement** are used to advertise the LoadBalancer IP address.

<!--truncate-->

## Introduction

Since the Sveltos release v1.10.0, the Sveltos Dashboard supports OIDC authentication using the Authorization Code Flow with PKCE (public client). To enable OIDC we need to configure the Sveltos dashboard Helm chart values, configure the Kubernetes API server, and set up RBAC for the dashboard users. The Keycloak dashboard and the Sveltos dashboard are exposed via `HTTPRoute` resources using the Cilium and Gateway API integration, with the only difference being that the Keycloak deployment is on a Services cluster in a different network segment.

:::note
In this post, we do not cover how to configure the Keycloak deployment. If this is something you would like to see, contact me and I will create a blog post around it.
:::

## Lab Setup

```bash
+-------------------------+--------------+------------------+
|        Resources        |     Type     |     Version      |
+-------------------------+--------------+------------------+
|  Management Cluster     |     RKE2     | v1.35.6+rke2r1   |
|        Sveltos          |  Helm Chart  |     v1.15.0      |
|    Sveltos Dashboard    |  Helm Chart  |     v1.15.0      |
|         Cilium          |     CNI      |     v1.19.4      |
+-------------------------+--------------+------------------+
```

## Prerequisites

1. A Kubernetes cluster with Keycloak already in place
1. A recent Helm version isntalled
1. **kubectl** installed/available. Find the guide [here](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

## Keycloak Deployment

The Keycloak instance is exposed via and Gateway API `HTTPRoute` since we have already Cilium installed on our cluster and enabled the Gateway API integration. To allow Keycloak to authenticate Sveltos dashboard users, we performed the below.

1. Create a Realm called `test-realm`
1. Create a Client named `sveltos-dashboard`
1. Populate the `Valid redirect URIs`, `Web origins`, and `Admin URL` values like below.
    - https://Sveltos Dashboard FQDN/oidc-callback
    - https://Sveltos Dashboard FQDN
    - https://Sveltos Dashboard FQDN
1. Disable `Client authentication`
1. Enable `Standard flow` and `Direct access grants` under Authentication flow

For more information on how to setup Keycloak, take a look at the [official documentation](https://www.keycloak.org/documentation) and [Sveltos documentation](https://projectsveltos.io/main/getting_started/optional/dashboard/#oidc-authentication).

## Update RKE2 Kube API Server Values

Because we want the Kubernetes API server to accept and validate OIDC tokens, we will update the controller configuration to include the below arguments. On an RKE2 installation, the server configuration is stored under `/etc/rancher/rke2/config.yaml`. We will update the existing configuration to add the OIDC configuration. Then, we will restart the `rke2-server` service using `systemctl`.

```yaml showLineNumbers
kube-apiserver-arg:
  - "oidc-issuer-url=https://<your Keycloak domain>/realms/test-realm"
  - "oidc-client-id=sveltos-dashboard"
  - "oidc-username-claim=preferred_username"
  - "oidc-username-prefix=oidc:"
  - "oidc-ca-file=/var/lib/rancher/rke2/server/tls/keycloak-ca.crt"
```

:::note
The trusted CA used for Keycloak needs to be copied under `/var/lib/rancher/rke2/server/tls/`. If case not, we will get issues while contacting the Keycloak instance. Ensure the values provided under the `kube-apiserver-arg` section reflect your Keycloak setup for the Sveltos Dashboard.
:::

After the configuration has been updated based on our needs, we can go ahead the restart the rke2-server service.

```bash
$ systemctl restart rke2-server
$ systemctl status rke2-server
```

## Sveltos Dashboard

The Sveltos dashboard is installed as a Helm chart and following the official documentation, we will provide the required Helm values to enable OIDC authentication.

```bash
$ helm repo add projectsveltos https://projectsveltos.github.io/helm-charts
$ helm repo update
```

```bash
$ helm install sveltos-dashboard projectsveltos/sveltos-dashboard -n projectsveltos \
  --set auth.oidc.issuer=https://<Your FQDN>/realms/test-realm \
  --set auth.oidc.clientId=sveltos-dashboard \
  --set auth.oidc.redirectUri=https://<Your FQDN>/oidc-callback
```

Once the Sveltos dashboard is installed, ensure the deployment is successfully deployed.

```bash
$ kubectl get pods -n projectsveltos -l app.kubernetes.io/instance=sveltos-dashboard,app.kubernetes.io/name=sveltos-dashboard
NAME                                 READY   STATUS    RESTARTS   AGE
dashboard-6f7b5df444-flwgl           1/1     Running   0          1h
ui-backend-manager-c7649c7bd-65xjd   1/1     Running   0          1h
```

### Create a ClusterRoleBinding

To access everything on the Sveltos Dashboard, we will create a `ClusterRoleBinding` resource which will map the `ClusterAdmin` role. Once the resources is applied to the `projectsveltos` namespace, the defined user will have full access to the dashboard.

```yaml showLineNumbers
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: sveltos-dashboard-admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: "oidc:test"
```


```bash
$ kubectl apply -f sveltos-clusterrolebind-admin.yaml
```

:::note
The name defined under `subjects.name` should match a user created in the Keycloak realm `test-realm`. If not, the authentication will not work.
:::

## Cilium Configuration

Since **Cilium v1.19.4** is already installed in the RKE2 cluster and the Gateway API integration is in place, we can continue with deployment of the `Gateway` and `HTTPRoute` resources.

```bash showLineNumbers
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: sveltos-gw
  namespace: projectsveltos
spec:
  gatewayClassName: cilium
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "your.domain"
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: test-lab-tls # The secret is already created and contains the TLS details for the Sveltos dashboard 
      allowedRoutes:
        namespaces:
          from: Same
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: sveltos-dashboard
  namespace: projectsveltos
spec:
  parentRefs:
    - name: sveltos-gw
      sectionName: https
  hostnames:
    - "your.domain"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: dashboard
          port: 80
```

If the Cilium and Gateway API deployment is working as expected, the `Gateway` resources should get a valid routable IP address and consecuently, we will be able to access the Sveltos dashboard from a browser uing the FQDN defined. If this is not the case, I would recommend taking at a previous post [containing a troubleshooting section for Gateway API](../2024-12-29-experimenting-with-vCluster-and-multitenancy/vcluster-updates-05.md#common-issues-and-troubleshooting-steps).

### Validation

Just issue the below `kubectl` command and ensure the `Gateway` and `HTTPRoute` resources are in a Successful state.

```bash
$ kubectl get gateway,httproute -n projectsveltos
NAME                                           CLASS    ADDRESS       PROGRAMMED   AGE
gateway.gateway.networking.k8s.io/sveltos-gw   cilium    x.x.x.x   True         1h

NAME                                                    HOSTNAMES                AGE
httproute.gateway.networking.k8s.io/sveltos-dashboard   ["your.domain"]   1h
```

## Test Sveltos Dashboard UI

Just open a browser window and type the FQDN you defined for the Sveltos dashboard. If the DNS in you infrastructure works as expected, we will be able to resolved the hostname into the defined IP address which is the IP address of the `Gateway` resource. Expected behaviour: the Sveltos dashboard is accessible, the OIDC option is enabled, and authentication is done through Keycloak.

![title image reading "Sveltos Dashboard OIDC Option"](sveltos_dashboard_01.png)

![title image reading "Keycloak Redirect"](keycloak_sveltos_dashboard.png)

![title image reading "Sveltos Authenticated User Dashboard"](sveltos_dashboard_02.png)


## Common Issues

### Incorrect RKE2 Kube API Server Details

This is a critical part of the process. Go through the Sveltos official documentation and ensure the values defined for the Kube API server configuration reflect the reality of our setup. Also, ensure there are not typos and the configuration is clean from errors.

A good approach is to check the `rke2-server` service logs for any OIDC output.

```bash
$ journalctl -u rke2-server -f | grep -i oidc
```

We can also check the logs of the `kube-apiserver` on the Kubernetes level.

```bash
$ kubectl logs kube-apiserver-name-of-controller -n kube-system | grep -i oidc
```

### Incorrect Keycloak root CA RKE2

A lot of issues and confussion can come from untrusted CAs defined under the OIDC configuration section of the Kube API server. For example, x509 certificate signed by unknown authority (wrong/missing root CA), no such file or directory (incorrect mount point), c509 malformed certificate, generic 401 HTTP error for unothaurized OIDC requests. For that reason, ensure the provided CA for the `oidc-ca-file` flag maps the correct CA used for the Keycloak deployment.

We can use `openssl` to validate the issuer of the CA using the command `openssl x509 -in /var/lib/rancher/rke2/server/tls/keycloak-ca.crt -noout -subject -issuer`.

### Misconfigurations

A lot of 401 HTTP errors can pop-up due to typos and misconfigurations on Keycloak side. Ensure the provide Client details for your Realm do not contain typos or incorrect information. It's a good approach to Inspect (via your favourite browser) the HTTPS sessions and capture any errors visible under the Network tab. Try to understand what is failing.

Also, check the Sveltos backend deployment details for more logs.

```bash
$ kubectl logs ui-backend-manager-c7649c7bd-65xjd -n projectsveltos 
```

## Conclusion

You made it to the end of this blog post! You can now use the Sveltos dashoard and authenticate users with your prefered OIDC client! The setup gives us a unified way of authenticating users while provide flexibility to teams who want to have access to the Sveltos dashboard.

## Resources

- [Cilium Up & Running](https://isovalent.com/books/cilium-up-and-running/)
- [Keycloak OAuth2 Authentication for Grafana](https://grafana.com/docs/grafana/latest/setup-grafana/configure-access/configure-authentication/keycloak/)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

## Series Navigation

| Part | Title |
| :--- | :---- |
| Part 1 | vCluster Recent Updates |
