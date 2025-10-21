import React, { lazy, Suspense } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const LatestBlogPosts = lazy(() => import('../components/LatestBlogPosts'));
const PROFILE_IMAGE = '/img/elenis_moji.jpg';

const AboutMeList = [
  {
    title: '👋 Hello!',
    description: (
      <>
        I'm Eleni Grosdouli, a DevOps Consulting Engineer at <a href="https://www.cisco.com/">Cisco Solutions GmbH</a>.
        My professional journey is based in the exciting areas of DevOps, GitOps, modern data centres, networking, and security practices.
        I enjoy solving <strong>complex</strong> problems, <strong>learning</strong> new things, and <strong>speaking</strong> at Cloud Native conferences, where I often share cloud-native insights.
        My home lab is my playground!
      </>
    ),
  },
  {
    title: '🚀 Passionate Explorer',
    description: (
      <>
      As a <strong>passionate</strong> tech explorer, I'm always eager to discover new technologies and experiment in my home lab environment.
      My motto, "Break and fix," focuses on hands-on learning and constant growth in the changing <strong>cloud-native</strong> world.
      This approach helps me better understand how complex systems work and create solutions that are both reliable and scalable. For me, hands-on experience is the most effective way to learn and grow as an engineer in a fast-paced environment!
      </>
    ),
  },
  {
    title: '🤝 Community Contributor',
    description: (
      <>
      Outside my job, I focus on making resources and helping the community. I do this through <strong>open-source</strong> projects, <strong>blog posts</strong>, and <strong>mentorship</strong>.
      I believe in the power of shared knowledge and enjoy helping others grow in their technical journeys by offering insights into cloud-native technologies. All it takes is a collaborative and encouraging environment to make a real difference and inspire others to achieve their full potential.
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
        <Heading as="h2" className="text--center margin-bottom--lg"> A little bit about myself </Heading>
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
          {/* <p className="hero__title">Welcome to</p> */}
          <h1 className="hero__title name reveal-text">Eleni</h1>
          <h2 className="hero__title name reveal-text">Grosdouli's</h2>
          <p className="hero__title">Blog</p>
          <p className="tagline">{siteConfig.tagline}</p>
        </div>
      </div>
      <div className="main-image-container">
          <img
            src={PROFILE_IMAGE}
            alt="Eleni Grosdouli Profile. Credits to Vaso Michailidou."
            className={styles.profilePicture}
          />
        </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="DevOps, GitOps, Cloud-Native Insights"
      description="Explore DevOps, GitOps, data center, networking, security, and cloud-native insights from Eleni Grosdouli.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className="container">
          <div className="row margin-top--xl">
            <Suspense fallback={<div>Loading...</div>}>
              <LatestBlogPosts />
            </Suspense>
          </div>
        </div>
      </main>
    </Layout>
  );
}