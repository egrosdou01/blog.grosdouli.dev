// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import 'dotenv/config';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Grosdouli Blog",
  tagline: 'Passionate about breaking and fixing things in the world of tech! Join me on this journey through DevOps and GitOps practices. We\'ll explore cloud-native solutions and more in both on-prem and cloud data centres!',

  // Set the production url of your site here
  url: 'https://blog.grosdouli.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,

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

future: {
  v4: {
    removeLegacyPostBuildHeadAttribute: true,
    useCssCascadeLayers: true,
  },
  experimental_faster: true
},

scripts: [
  {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    defer: true,
    'data-cf-beacon': `{"token": "${process.env.CLOUDFLARE_TOKEN}"}`,
  },
],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: {
          showReadingTime: true,
          blogTitle: 'Welcome to my blog!',
          blogDescription: 'Welcome to Eleni Grosdouli\'s official blog. Explore articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift. Discover insights into Cisco networking, security, and cloud-native solutions for both on-prem and cloud datacenters.',
          postsPerPage: 20,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 6,
          feedOptions: {
            type: 'all',
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
          changefreq: 'weekly',
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
        { property: 'og:title', content: "Eleni Grosdouli's Blog: DevOps, GitOps, Kubernetes & Cisco Insights" },
        { property: 'og:description', content: "Welcome to Eleni Grosdouli's official blog. Explore expert articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift." },
        { name: 'description', content: "Welcome to Eleni Grosdouli's official blog. Explore expert articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift." },
        { name: 'robots', content: 'max-image-preview:large' },
        { name: 'twitter:title', content: "Eleni Grosdouli's Blog: DevOps, GitOps, Kubernetes & Cisco Insights" },
        { name: 'twitter:description', content: "Welcome to Eleni Grosdouli's official blog. Explore expert articles on DevOps, GitOps, Kubernetes, Cilium, Rancher, RKE2, and OpenShift." },
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
          src: '/eleni_blog_logo.jpg',
          width: 32,
          height: 32,
        },
        items: [
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'tutorialSidebar',
          //   position: 'left',
          //   label: 'Tutorial',
          // },
          {to: 'blog', label: 'Blog', position: 'left'},
          {to: '/blog/tags', label: 'Tags', position: 'left'},
          {to: 'talks', label: 'Talks', position: 'left'},
          {to: 'favourites', label: 'Favourites', position: 'left'},
          {to: 'about', label: 'About', position: 'right'},
          {label: 'GitHub', href: 'https://github.com/egrosdou01', position: 'right'},
          {type: 'search', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'About',
            items: [
              {
                label: 'About me',
                to: '/about',
              },
            ],
          },
          {
            title: 'Socials',
            items: [
              {label: 'LinkedIn', href: 'https://linkedin.com/in/eleni-grosdouli-85a1a5116'},
              {label: 'GitHub', href: 'https://github.com/egrosdou01'},
              {label: 'Medium', href: 'https://medium.com/@eleni.grosdouli'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'RSS', href: 'https://blog.grosdouli.dev/blog/rss.xml'},
              {label: 'All posts', href: '/blog/archive'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Eleni Grosdouli Blog`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      colorMode: {
        defaultMode: 'light',
      },
    }),
    plugins: [
      [ require.resolve('docusaurus-lunr-search'), {
        languages: ['en', 'de'],
      }],
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