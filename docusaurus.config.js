// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
// import 'dotenv/config';

const title = 'Grosdouli Blog';
const tagline = "Passionate about breaking and fixing things in the world of tech! Join me on this journey through DevOps and GitOps practices. We'll explore cloud-native solutions and more in both on-prem and cloud data centres!";
const url = 'https://blog.grosdouli.dev';

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${url}`,
      url: url,
      name: "Eleni Grosdouli Blog",
      description: tagline,
      potentialAction: {
        "@type": "SearchAction",
        target: `${url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@id": `${url}/about`
      }
    },
    {
      "@type": "Person",
      "@id": `${url}/about`,
      name: "Eleni Grosdouli",
      alternateName: "Eleni Grosdouli",
      url: url,
      image: {
        "@type": "ImageObject",
        url: `${url}/img/eleni_blog_logo.jpg`,
        width: 512,
        height: 512
      },
      sameAs: [
        "https://linkedin.com/in/eleni-grosdouli-85a1a5116",
        "https://github.com/egrosdou01",
        "https://medium.com/@eleni.grosdouli",
        "https://dev.to/egrosdou"
      ],
      knowsAbout: [
        "Kubernetes", "DevOps", "GitOps", "Cilium",
        "ProjectSveltos", "Cloud Native Technologies",
        "Rancher", "RKE2", "OpenShift", "Talos", "Proxmox",
        "OpenTofu", "Infrastructure as Code", "Docker",
        "Networking", "Data Center"
      ],
      jobTitle: "DevOps Consulting Engineer",
      description: "DevOps and GitOps expert specialising in Kubernetes, cloud-native solutions, and infrastructure automation"
    }
  ]
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title,
  tagline,
  url,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,
  favicon: 'img/elenis_moji_face1.png',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'egrosdou01', // Usually your GitHub org/user name.
  projectName: 'blog.grosdouli.dev', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onDuplicateRoutes: 'warn',
 
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

 headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify(siteStructuredData),
    },
  ],

future: {
  v4: {
    removeLegacyPostBuildHeadAttribute: true,
    useCssCascadeLayers: true,
  },
  faster: true
},

scripts: [
  {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    defer: true,
    'data-cf-beacon': '{"token": "dde5cdd42345413a961a805d108934fb"}',
  },
],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          showReadingTime: true,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          blogTitle: 'Welcome to Eleni Grosdouli\'s official blog!',
          blogDescription: 'Welcome to Eleni Grosdouli\'s official blog. Explore articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift. Discover insights into networking, security, and cloud-native solutions for both on-prem and cloud datacenters.',
          postsPerPage: 20,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 8,
          tags: 'tags.yml',
          onInlineAuthors: 'ignore',
          onInlineTags: 'throw',
          onUntruncatedBlogPosts: 'throw',
          feedOptions: {
            type: 'all',
            title: 'Welcome to Eleni Grosdouli\'s official blog!',
            description: 'Welcome to Eleni Grosdouli\'s official blog. Explore articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift. Discover insights into networking, security, and cloud-native solutions for both on-prem and cloud datacenters.',
            language: 'en',
            copyright: `Copyright © ${new Date().getFullYear()} Eleni Grosdouli Blog`,
            createFeedItems: async (params) => {
              const {blogPosts, defaultCreateFeedItems, ...rest} = params;
              return defaultCreateFeedItems({
                blogPosts: blogPosts.filter((item, index) => index < 5),
                ...rest,
              });
            },
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: null,
          priority: 0.5,
          ignorePatterns: [
            '/blog/page/**',
            '/blog/tags/**',
            '/docs/**',
          ],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      metadata: [
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
      ],
      
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      
      navbar: {
        title: 'Eleni Grosdouli',
        logo: {
          alt: 'Eleni Grosdouli Blog Logo',
          src: '/img/eleni_blog_logo.jpg',
          width: 32,
          height: 32,
        },
        items: [
          {to: 'blog', label: 'Blog', position: 'left'},
          {to: '/blog/tags', label: 'Tags', position: 'left'},
          {to: 'talks', label: 'Talks', position: 'left'},
          // {to: 'favourites', label: 'Favourites', position: 'left'},
          {to: 'about', label: 'About', position: 'right'},
          {label: 'GitHub', href: 'https://github.com/egrosdou01', rel: 'me', position: 'right'},
          {type: 'search', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Kubernetes & Platform Engineering',
            items: [
              {label: 'CAPMOX: Kubernetes Clusters on Proxmox with Cluster API', to: '/blog/capmox-k8s-managed-clusters'},
              {label: 'CAPZ and Sveltos: Managed Kubernetes on Azure', to: '/blog/capi-sveltos-azure-managed-k8s-cilium'},
              {label: 'Automate Flux HelmReleases at Scale with Sveltos', to: '/blog/flux-helmrelease-automation-sveltos-demo'},
              {label: 'Sveltos Progressive Rollouts', to: '/blog/sveltos-progressive-rollouts-pt1'},
            ],
          },
          {
            title: 'Cilium & Networking',
            items: [
              {label: 'Talos Linux on Proxmox with OpenTofu', to: '/blog/talos-on-proxmox-opentofu-part-1'},
              {label: 'Cilium Gateway API with Cert-Manager and Let\'s Encrypt', to: '/blog/cilium-gateway-api-cert-manager-lets-encrypt'},
              {label: 'Cilium Cluster Mesh: Multi-Cluster on RKE2', to: '/blog/cilium-cluster-mesh-rke2'},
              {label: 'RKE2: Migrate ArgoCD to Cilium Ingress', to: '/blog/rke2-argocd-cilium-ingress'},
              {label: 'RKE2 Dual-Stack with Cilium on Proxmox', to: '/blog/rke2-dual-stack-cilium-proxmox'},
            ],
          },
          {
            title: 'Resources',
            items: [
              {label: 'About Eleni Grosdouli', to: '/about'},
              {label: 'Conference Talks', to: '/talks'},
              {label: 'All Blog Posts', to: '/blog/archive'},
              {label: 'Blog Tags', to: '/blog/tags'},
              {label: 'RSS Feed', href: 'https://blog.grosdouli.dev/blog/rss.xml'},
            ],
          },
          {
            title: 'Connect',
            items: [
              {label: 'LinkedIn', rel: 'me', href: 'https://linkedin.com/in/eleni-grosdouli-85a1a5116'},
              {label: 'GitHub', rel: 'me', href: 'https://github.com/egrosdou01'},
              {label: 'Medium', rel: 'me', href: 'https://medium.com/@eleni.grosdouli'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Eleni Grosdouli Blog. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
    plugins: [
      [
        require.resolve('@easyops-cn/docusaurus-search-local'),
        {
          hashed: true,
          blogRouteBasePath: '/blog',
          indexDocs: false,
          language: ["en", "de"],
        },
      ],
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects: [
            {
              to: '/blog/cilium-gateway-api-cert-manager-lets-encrypt',
              from: '/blog/cilium-gateway-api-cert-manager-let\'s-encrypt',
            },
            {
              to: '/blog/cilium-gateway-api-cert-manager-lets-encrypt',
              from: '/blog/cilium-gateway-api-cert-manager-let%27s-encrypt',
            },
            {
              to: '/blog/sveltos-whats-new-part-1',
              from: '/blog/sveltos-what\'s-new-part-1',
            },
            {
              to: '/blog/sveltos-whats-new-part-1',
              from: '/blog/sveltos-what%27s-new-part-1',
            },
            {
              to: '/blog/sveltos-whats-new-part-2',
              from: '/blog/sveltos-what\'s-new-part-2',
            },
            {
              to: '/blog/sveltos-whats-new-part-2',
              from: '/blog/sveltos-what%27s-new-part-2',
            },
          ],
        },
      ],
    ],
  };
export default config;