import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const PROFILE_IMAGE = '/elenis_moji.jpg';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className='header'>
      <div className="mixmax">
        <div className="main-text-container">
          <p className="hero__title">Welcome to</p>
          <h1 className="hero__title name reveal-text">Eleni</h1>
          <h2 className="hero__title name reveal-text">Grosdouli's</h2>
          <p className="hero__title">Blog</p>
          <p className="tagline">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/blog">
              Show More 🖋️💡
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
      title={siteConfig.title}
      description={siteConfig.description}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
