import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

import LatestBlogPosts from '../components/LatestBlogPosts';

const PROFILE_IMAGE = '/elenis_moji.jpg';

function HomepageHeader() {
  return null;
}


function IntroSection() {
  return (
    <div className={clsx('col col--12', styles.introSection)}>
      <div className="text--center margin-bottom--lg">
        <img
          className={clsx(styles.profilePicture, 'margin-bottom--md')}
          src={PROFILE_IMAGE}
          alt="Eleni Grosdouli Profile. Credits to Vaso Michailidou."
        />
        <Heading as="h1">👋 Hello! I'm Eleni Grosdouli</Heading>
        <p className="hero__subtitle">
          As a DevOps Consulting Engineer at <a href="https://www.cisco.com/">Cisco Solutions GmbH</a>, I'm deeply involved in the cloud-native ecosystem.
          My main technical skills are Kubernetes, Docker, containers, Infrastructure as Code tools, and networking in data centres. I'm driven by solving complex challenges across different environments.
          <br /><br />
          Feel free to reach out to any available platform!
        </p>
      </div>
    </div>
  );
}

const AboutMeSections = [
  {
    title: '💻 My Expertise',
    description: (
      <>
        I often share content and guides on <a href="https://github.com/cilium/cilium">Cilium</a>, <a href="https://github.com/projectsveltos">ProjectSveltos</a>, <a href="https://github.com/gianlucam76/k8s-cleaner">K8S Cleaner</a>, <a href="https://github.com/rancher/rancher">Rancher</a>, <a href="https://docs.rke2.io/">RKE2</a>, and <a href="https://www.redhat.com/en/technologies/cloud-computing/openshift">OpenShift deployments</a>. These focus on strong solutions for both on-prem and cloud setups.
        My contributions are also featured in official platforms like the <a href="https://cilium.io/blog/categories/how-to/">Cilium Blog</a> and the <a href="https://projectsveltos.github.io/sveltos/main/blogs/">ProjectSveltos Blog</a>.
      </>
    ),
    columnClass: 'col--6'
  },
  {
    title: '🏃‍♀️ Beyond the Keyboard',
    description: (
      <>
       When I am not diving deep into tech, my time is often spent enjoying the great outdoors or competing in team sports.
       Boxing and kickboxing remain my preferred ways to stay active! 🥊🏉
      </>
    ),
    columnClass: 'col--6'
  },
];

function AboutMe({ title, description, columnClass = 'col--4' }) {
  return (
    <div className={clsx('col margin-bottom--lg', columnClass, styles.feature)}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="This is the About me section"
      description="Learn more about Eleni Grosdouli, her expertise, passions, and contributions.">
      <main>
        <section className={styles.aboutPageContent}>
          <div className="container">
            <div className="row">
              <IntroSection />
            </div>

            <div className="row margin-top--xl">
              <div className={clsx('col col--12', styles.aboutMeSection)}>
                <div className="row">
                  {AboutMeSections.map((props, idx) => (
                    <AboutMe key={idx} {...props} />
                  ))}
                </div>
              </div>
            </div>
            {/* Use the new LatestBlogPosts component here */}
            <div className="row margin-top--xl">
              <LatestBlogPosts />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}