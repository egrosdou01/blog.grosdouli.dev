// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Welcome to Eleni's Blog",
  tagline: 'I am passionate about breaking and fixing things! Follow me on this journey of deploying DevOps and GitOps practices on on-prem and Cloud datacenters!',
  favicon: 'https://github.com/egrosdou01.png',

  // Set the production url of your site here
  url: 'https://github.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/blog.grosdouli.dev/',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'egrosdou01', // Usually your GitHub org/user name.
  projectName: 'blog.grosdouli.dev', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: {
          showReadingTime: true,
          blogTitle: 'Eleni Blog',
          blogDescription: 'Eleni Blog',
          postsPerPage: 10,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 6,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'About',
        logo: {
          alt: 'My Site Logo',
          src: 'https://github.com/egrosdou01.png',
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
          {
            href: 'https://github.com/egrosdou01',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'search',
            position: 'right',
          },
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
                to: '/',
              },
            ],
          },
          {
            title: 'Socials',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://linkedin.com/in/eleni-grosdouli-85a1a5116',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/egrosdou01',
              },
              {
                label: 'Medium',
                href: 'https://medium.com/@eleni.grosdouli',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'blog',
              },
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
    plugins: [[ require.resolve('docusaurus-lunr-search'), {
      languages: ['en', 'de'],
    }]],
};

export default config;