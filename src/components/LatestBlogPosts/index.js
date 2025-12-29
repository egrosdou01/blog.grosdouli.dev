import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import blogPostsData from '@generated/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json';
import styles from './styles.module.css';

export default function LatestBlogPosts() {
  const [recentPosts, setRecentPosts] = useState([]);
  const { siteConfig } = useDocusaurusContext();
  const { url } = siteConfig;

  useEffect(() => {
    if (blogPostsData && blogPostsData.items && blogPostsData.items.length > 0) {
      const extractedPosts = blogPostsData.items.slice(0, 3).map(post => ({
        title: post.title,
        link: post.permalink,
        description: `🗓️ Published on ${new Date(post.date).toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      }));
      setRecentPosts(extractedPosts);
    } else {
      setRecentPosts([]);
    }
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "name": "Site Navigation",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": {
          "@type": "WebPage",
          "@id": url,
          "name": "Eleni Grosdouli - DevOps Engineer",
          "url": url
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": {
          "@type": "WebPage",
          "@id": `${url}/about`,
          "name": "About Eleni Grosdouli",
          "url": `${url}/about`
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Blog",
        "item": {
          "@type": "WebPage",
          "@id": `${url}/blog`,
          "name": "DevOps & Cloud Native Blog",
          "url": `${url}/blog`
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Talks",
        "item": {
          "@type": "WebPage",
          "@id": `${url}/talks`,
          "name": "Eleni Grosdouli Cloud Native Talks",
          "url": `${url}/blog`
        }
      }
    ]
  };

  return (
    <div className={clsx('col col--12', styles.latestPostsSectionWrapper)}>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
      
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
            Read More 💡
          </Link>
        </div>
      </div>
    </div>
  );
}