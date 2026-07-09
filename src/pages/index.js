import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import LatestBlogPosts from '../components/LatestBlogPosts';

const PROFILE_IMAGE = '/img/elenis_moji.jpg';

const AboutMeList = [
  {
    title: 'Hello! 👋',
    description: (
      <>
        I'm Eleni Grosdouli, a DevOps Consulting Engineer at <a href="https://www.cisco.com/">Cisco Solutions GmbH</a>.
        I specialise in DevOps, GitOps, Platform engineering, modern data centres, networking, and security practices.
        I enjoy solving <strong>complex</strong> problems, <strong>learning</strong> new things, and <strong>public speaking</strong>.
        My home lab is my playground!
      </>
    ),
  },
  {
    title: 'Passionate Explorer 🚀',
    description: (
      <>
      As a <strong>passionate</strong> tech explorer, I'm always eager to discover new technologies and experiment in my home lab.
      My motto, "Break and fix," emphasises hands-on learning and continuous growth in the evolving <strong>cloud-native</strong> world.
      For me, hands-on experience is the most effective way to learn and grow as an engineer in a fast-paced environment.
      </>
    ),
  },
  {
    title: 'Community Contributor 🤝',
    description: (
      <>
      Outside my job, I focus on making resources and helping the community. I do this through <strong>open-source</strong> projects, <strong>blog posts</strong>, and <strong>mentorship</strong>.
      I believe in sharing knowledge. I enjoy helping others grow in their tech journeys by offering insights into cloud-native technologies.
      </>
    ),
  },
];

function AboutMe({ title, description }) {
  return (
    <div className={clsx('col col--4 margin-bottom--lg', styles.feature)}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">About Eleni Grosdouli</Heading>
        <div className="row">
          {AboutMeList.map((props, idx) => (
            <AboutMe key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className='header'>
      <div className="mixmax">
        <div className="main-text-container">
          <h1 className="hero__title">
            <span className="name reveal-text">Eleni</span>
            <span className="name reveal-text">Grosdouli's</span>
            <span>DevOps Blog</span>
          </h1>
          <p className="tagline">{siteConfig.tagline}</p>
        </div>
      </div>
      <div className="main-image-container">
          <img
            src={PROFILE_IMAGE}
            alt="Eleni Grosdouli, DevOps Consulting Engineer specialising in Kubernetes, GitOps, and cloud-native technologies."
            className={styles.profilePicture}
            width="250"
            height="250"
          />
        </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Eleni Grosdouli - DevOps, GitOps & Kubernetes Blog"
      description="Eleni Grosdouli's blog on DevOps, GitOps, Kubernetes, Cilium, Sveltos, and cloud-native engineering. Tutorials, insights, and hands-on guides for Platform engineers.">
      <Head>
        <link rel="canonical" href={siteConfig.url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteConfig.url} />
        <meta name="twitter:title" content="Eleni Grosdouli - DevOps, GitOps & Kubernetes Blog" />
        <meta name="twitter:description" content="Eleni Grosdouli's blog on DevOps, GitOps, Kubernetes, Cilium, Sveltos, and cloud-native engineering. Tutorials, insights, and hands-on guides for Platform engineers." />
      </Head>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className="container margin-top--xl">
          <div className="row">
            <LatestBlogPosts />
          </div>
        </section>
      </main>
    </Layout>
  );
}