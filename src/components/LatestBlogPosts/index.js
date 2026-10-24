import React from 'react';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import blogPostsData from '@generated/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json';
import styles from './styles.module.css';

export default function LatestBlogPosts({ breadcrumbs = [] }) {
  const { siteConfig } = useDocusaurusContext();
  const { url } = siteConfig;

  const recentPosts = (blogPostsData?.blogPosts || blogPostsData?.items || []).slice(0, 8).map(post => ({
    title: post.title,
    link: post.permalink,
    date: post.date,
    description: `🗓️ Published on ${new Date(post.date).toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' })}`,
  }));

  const defaultBreadcrumbs = [{ name: 'Home', url }];
  const breadcrumbItems = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url,
    })),
  };

  const postsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest Blog Posts",
    "itemListElement": recentPosts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": post.title,
      "url": `${url}${post.link}`,
    })),
  };

  return (
    <div className={clsx('col col--12', styles.latestPostsSectionWrapper)}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Head>
      {recentPosts.length > 0 && (
        <Head>
          <script type="application/ld+json">{JSON.stringify(postsStructuredData)}</script>
        </Head>
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
