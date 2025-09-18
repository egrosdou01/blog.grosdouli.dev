import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const AboutMeList = [
  {
    title: '👋 Hello!',
    description: (
      <>
        I am a DevOps Consulting Engineer at Cisco Solutions GmbH, specialising in DevOps and GitOps, networking, security, and endpoint management.
        I love solving real-world problems, am a lifelong learner, and enjoy public speaking.
        I constantly explore new tech in my home lab and share insights on my blog.
      </>
    ),
  },
  {
    title: '🚀 Passionate Explorer',
    description: (
      <>
      I am excited about discovering discovering new things and experimenting in my home lab.
      My motto, "Break and fix", is all about hands-on learning and embracing every opportunity to grow.
      </>
    ),
  },
  {
    title: '💻 Expertise',
    description: (
      <>
      My expertise lies in DevOps and GitOps practices.
      I create content about <a href="https://github.com/cilium/cilium">Cilium</a>, <a href="https://github.com/projectsveltos">ProjectSveltos</a>, <a href="https://github.com/gianlucam76/k8s-cleaner">K8s Cleaner</a>, <a href="https://github.com/rancher/rancher">Rancher</a>, <a href="https://docs.rke2.io/">RKE2</a>, and <a href="https://www.redhat.com/en/technologies/cloud-computing/openshift">OpenShift</a> deployments in on-prem and cloud environments.
      </>
    ),
  },
  {
    title: '✍️ Where I Publish',
    description: (
      <>
        You can find my articles and insights here on <a href="/blog">my blog</a>, as well as on <a href="https://medium.com/@eleni.grosdouli">Medium</a>. Part of my work has been published in the <a href="hhttps://cilium.io/blog/categories/how-to/">Cilium Posts</a> area and at <a href="https://projectsveltos.github.io/sveltos/main/blogs/">ProjectSveltos</a>.
      </>
    ),
  },
  {
    title: '🤝 Community Contributor',
    description: (
      <>
      I enjoy creating material and contributing to the community through open-source projects, blog posts, and mentorship.
      </>
    ),
  },
  {
    title: '🏃‍♀️ Sports Enthusiast',
    description: (
      <>
      You will often find me enjoying nature or on the field, playing team sports. Boxing and kickboxing are my go-to activities, and
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
        <Heading as="h1" className="text--center margin-bottom--lg"> A little bit about myself </Heading>
        <div className="row">
          {AboutMeList.map((props, idx) => (
            <AboutMe key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}