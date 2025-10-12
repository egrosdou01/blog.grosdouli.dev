import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import blogPostsData from '@generated/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json';
import styles from './styles.module.css';

export default function LatestBlogPosts() {
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
    <div className={clsx('col col--12', styles.latestPostsSectionWrapper)}>
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