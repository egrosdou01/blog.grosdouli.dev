import React from 'react'
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import LatestBlogPosts from '../components/LatestBlogPosts';

const PROFILE_IMAGE = '/img/elenis_moji.jpg';

function IntroSection() {
  return (
    <div className={clsx('col col--12', styles.introSection)}>
      <div className="text--center margin-bottom--lg">
        <img
          className={clsx(styles.profilePicture, 'margin-bottom--md')}
          src={PROFILE_IMAGE}
          alt="Eleni Grosdouli, DevOps Consulting Engineer at Cisco specialising in Kubernetes and cloud-native technologies."
          width="250"
          height="250"
        />
        <Heading as="h1">About Eleni Grosdouli - DevOps Consulting Engineer</Heading>
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
    title: 'Technical Expertise 💻',
    description: (
      <>
        I often share content and guides on <a href="https://github.com/cilium/cilium">Cilium</a>, <a href="https://github.com/projectsveltos">ProjectSveltos</a>, <a href="https://github.com/gianlucam76/k8s-cleaner">K8S Cleaner</a>, <a href="https://github.com/rancher/rancher">Rancher</a>, <a href="https://docs.rke2.io/">RKE2</a>, and <a href="https://www.redhat.com/en/technologies/cloud-computing/openshift">OpenShift deployments</a>. These focus on strong solutions for both on-prem and cloud setups.
        My contributions are also featured on official platforms like the <a href="https://cilium.io/blog/categories/how-to/">Cilium Blog</a> and the <a href="https://projectsveltos.github.io/sveltos/main/blogs/">ProjectSveltos Blog</a>.
      </>
    ),
    columnClass: 'col--6'
  },
  {
    title: 'Beyond the Keyboard 🏃‍♀️',
    description: (
      <>
       When I am not diving deep into tech, my time is often spent enjoying the great outdoors or competing in team sports.
       Boxing and kickboxing remain my preferred ways to stay active!
      </>
    ),
    columnClass: 'col--6'
  },
];

const BlogTopics = [
  {
    title: 'GitOps & Multi-Cluster Management',
    description: (
      <>
        Hands-on tutorials on <strong>Flux CD</strong>, <strong>ArgoCD</strong>, and <strong>Sveltos</strong> for managing Kubernetes clusters at scale.
        Topics include HelmRelease automation, progressive rollouts, Pull Mode deployments, and multi-cluster orchestration patterns.
      </>
    ),
  },
  {
    title: 'Kubernetes Networking & Security',
    description: (
      <>
        Deep dives into <strong>Cilium</strong> networking. Topics like Cilium Cluster Mesh, Gateway API integration, L2 announcements, dual-stack configurations, and network isolation with Hubble observability.
      </>
    ),
  },
  {
    title: 'Platform Engineering & Infrastructure',
    description: (
      <>
        Building Platforms with <strong>Sveltos</strong>, <strong>Cluster API</strong> (CAPZ, CAPMOX), <strong>OpenTofu</strong>, <strong>Talos Linux</strong>, and <strong>Proxmox</strong>.
        End-to-end guides covering automated Kubernetes environments, vCluster multi-tenancy, and self-managed Kubernetes on Proxmox.
      </>
    ),
  },
  {
    title: 'Rancher & RKE2 Ecosystem',
    description: (
      <>
        Deployment guides for <strong>Rancher</strong> and <strong>RKE2</strong> clusters on Azure and on-prem, including Cilium CNI integration, Let's Encrypt TLS, and day-2 operational patterns.
      </>
    ),
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
      title="About Eleni Grosdouli - DevOps & Kubernetes Engineer"
      description="Eleni Grosdouli is a DevOps Consulting Engineer at Cisco specialising in Kubernetes, GitOps, Cilium, Sveltos, and cloud-native infrastructure for on-prem and cloud data centres.">
      <Head>
        <link rel="canonical" href={`${siteConfig.url}/about`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${siteConfig.url}/about`} />
        <meta property="profile:first_name" content="Eleni" />
        <meta property="profile:last_name" content="Grosdouli" />
        <meta name="twitter:title" content="About Eleni Grosdouli - DevOps & Kubernetes Engineer" />
        <meta name="twitter:description" content="Eleni Grosdouli is a DevOps Consulting Engineer at Cisco specialising in Kubernetes, GitOps, Cilium, Sveltos, and cloud-native infrastructure for on-prem and cloud data centres." />
      </Head>
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

            <div className="row margin-top--xl">
              <div className="col col--12">
                <Heading as="h2" className="text--center margin-bottom--lg">What You'll Find on This Blog 📝</Heading>
                <div className="row">
                  {BlogTopics.map((topic, idx) => (
                    <div key={idx} className="col col--6 margin-bottom--lg">
                      <div className="text--center padding-horiz--md">
                        <Heading as="h3">{topic.title}</Heading>
                        <p>{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row margin-top--xl">
              <LatestBlogPosts />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}