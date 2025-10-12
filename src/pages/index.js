import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './index.module.css';

import LatestBlogPosts from '../components/LatestBlogPosts';

const PROFILE_IMAGE = '/elenis_moji.jpg';

const AboutMeList = [
  {
    title: '👋 Hello!',
    description: (
      <>
        I'm a DevOps Consulting Engineer at <a href="https://www.cisco.com/">Cisco Solutions GmbH</a>. I specialise in DevOps, GitOps, datacentres, networking, and security.
        I enjoy solving <strong>complex problems</strong>, <strong>learning</strong> new things, and <strong>speaking</strong> at Cloud Native conferences.
        My home lab is my playground!
      </>
    ),
  },
  {
    title: '🚀 Passionate Explorer',
    description: (
      <>
      I am a <strong>passionate tech explorer</strong>, always eager to discover new things and experiment in my home lab.
      My motto, "Break and fix", is all about hands-on learning and continuous growth in the ever-evolving <strong>cloud-native landscape</strong>.
      </>
    ),
  },
  {
    title: '🤝 Community Contributor',
    description: (
      <>
      I enjoy <strong>creating material</strong> and contributing to the community through <strong>open-source</strong> projects, <strong>blog posts</strong>, and <strong>mentorship</strong>.
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
          <p className="hero__title">Welcome to</p>
          <h1 className="hero__title name reveal-text">Eleni</h1>
          <h2 className="hero__title name reveal-text">Grosdouli's</h2>
          <p className="tagline">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/blog">
              Read More 💡
            </Link>
          </div>
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
      title="Welcome to Eleni Grosdouli's Blog"
      description="Explore DevOps, GitOps, Datacenter, networking, security, and cloud-native insights from Eleni Grosdouli, a DevOps Consulting Engineer at Cisco Solutions GmbH.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className="container">
          <div className="row margin-top--xl">
            <LatestBlogPosts />
          </div>
        </div>
      </main>
    </Layout>
  );
}