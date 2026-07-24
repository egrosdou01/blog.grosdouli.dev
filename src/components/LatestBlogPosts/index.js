import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import blogPostsData from '@generated/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json';
import styles from './styles.module.css';

export default function LatestBlogPosts() {
  const { siteConfig } = useDocusaurusContext();
  const { url } = siteConfig;

  const recentPosts = (blogPostsData?.blogPosts || blogPostsData?.items || []).slice(0, 8).map(post => ({
    title: post.title,
    link: post.permalink,
    date: post.date,
    description: `🗓️ Published on ${new Date(post.date).toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' })}`,
  }));

  const breadcrumbData = {
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
          "url": `${url}/talks`
        }
      }
    ]
  };

  const postsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest Blog Posts",
    "itemListElement": recentPosts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${url}${post.link}`,
    })),
  };

  return (
    <div className={clsx('col col--12', styles.latestPostsSectionWrapper)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {recentPosts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(postsStructuredData) }}
        />
      )}

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
