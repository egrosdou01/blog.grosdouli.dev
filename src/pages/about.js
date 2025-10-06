import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import blogPostsData from '@generated/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json';
import styles from './styles.module.css';

const PROFILE_IMAGE_URL = 'https://avatars.githubusercontent.com/u/147995681?v=4';

function HomepageHeader() {
  return null;
}


function IntroSection() {
  return (
    <div className={clsx('col col--12', styles.introSection)}>
      <div className="text--center margin-bottom--lg">
        <img
          className={clsx(styles.profilePicture, 'margin-bottom--md')}
          src={PROFILE_IMAGE_URL}
          alt="Profile Picture"
        />
        <Heading as="h1">👋 Hello! I'm Eleni Grosdouli</Heading>
        <p className="hero__subtitle">
          As a DevOps Consulting Engineer at <a href="https://www.cisco.com/">Cisco Solutions GmbH</a>, I specialise in cutting-edge <strong>DevOps and GitOps</strong> methodologies, alongside networking, security, and endpoint management.
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
        I regularly publish content and guides on <a href="https://github.com/cilium/cilium">Cilium</a>, <a href="https://github.com/projectsveltos">ProjectSveltos</a>, <a href="https://github.com/gianlucam76/k8s-cleaner">K8S Cleaner</a>, <a href="https://github.com/rancher/rancher">Rancher</a>, <a href="https://docs.rke2.io/">RKE2</a>, and <a href="https://www.redhat.com/en/technologies/cloud-computing/openshift">OpenShift deployments</a>, covering robust solutions for <strong>on-prem and cloud environments</strong>. My contributions are also featured in official platforms like the <a href="https://cilium.io/blog/categories/how-to/">Cilium Blog</a> and the <a href="https://projectsveltos.github.io/sveltos/main/blogs/">ProjectSveltos Blog</a>.
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
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    if (blogPostsData && blogPostsData.items && blogPostsData.items.length > 0) {
      const sortedPosts = [...blogPostsData.items].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      const extractedPosts = sortedPosts.slice(0, 3).map(post => ({
        title: post.title,
        link: post.permalink,
        description: `Published on ${new Date(post.date).toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      }));
      setRecentPosts(extractedPosts);
    } else {
      setRecentPosts([]);
    }
  }, []);

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
            <div className="row margin-top--xl">
              <div className="col col--12">
                <div className={styles.latestPostsSection}>
                  <Heading as="h2" style={{ textAlign: 'center', marginBottom: '30px' }}>Latest Blog Posts</Heading>
                  {recentPosts.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>No recent posts found.</p>
                  ) : (
                    <div className={styles.postsGrid}>
                      {recentPosts.map((post, index) => (
                        <article key={index} className={styles.blogPostCard}>
                          <Link to={post.link} className={styles.postLink}>
                            <h3 className={styles.postTitle}>{post.title}</h3>
                          </Link>
                          <p className={styles.postDescription}>{post.description}</p>
                        </article>
                      ))}
                    </div>
                  )}
                  <div className={styles.buttons} style={{ marginTop: '50px', textAlign: 'center' }}>
                    <Link className="button button--secondary button--lg" to="/blog">
                      Show More 🖋️💡
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}