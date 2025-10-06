import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const AboutMeList = [
  {
    title: '👋 Hello!',
    description: (
      <>
        As a <strong>DevOps Consulting Engineer at Cisco Solutions GmbH</strong>, I specialise in cutting-edge <strong>DevOps and GitOps methodologies</strong>, alongside <strong>networking, security, and endpoint management</strong>.
        I thrive on solving complex real-world problems, constantly learning, and sharing my expertise through public speaking and detailed blog posts.
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
    title: '💻 Expertise',
    description: (
      <>
      My core expertise spans <strong>DevOps and GitOps</strong> practices.
      I regularly publish content and guides on <a href="https://github.com/cilium/cilium">Cilium</a>, <a href="https://github.com/projectsveltos">ProjectSveltos</a>, <a href="https://github.com/gianlucam76/k8s-cleaner">K8S Cleaner</a>, <a href="https://github.com/rancher/rancher">Rancher</a>, <a href="https://docs.rke2.io/">RKE2</a>, and <a href="https://www.redhat.com/en/technologies/cloud-computing/openshift">OpenShift deployments</a>, covering robust solutions for <strong>on-prem and cloud environments</strong>.
      </>
    ),
  },
  {
    title: '✍️ Where I Publish',
    description: (
      <>
        Discover my <strong>latest articles and technical insights</strong> right here on <a href="/blog">my blog</a> and on <a href="https://medium.com/@eleni.grosdouli">Medium</a>. My contributions are also featured in official platforms like the <a href="https://cilium.io/blog/categories/how-to/">Cilium Blog</a> and the <a href="https://projectsveltos.github.io/sveltos/main/blogs/">ProjectSveltos Blog</a>.
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
  {
    title: '🏃‍♀️ Sports Enthusiast',
    description: (
      <>
      You will often find me enjoying nature or on the field, playing team sports. <strong>Boxing</strong> and <strong>kickboxing</strong> are my go-to activities, and
      recently, I joined a local women’s rugby team, where I am embracing the creativity of the sport itself. 🥊🏉
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

export default function HomepageFeatures() {
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