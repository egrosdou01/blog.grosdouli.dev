import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function Favourites() {
  const getBaseUrl = useBaseUrl;

  const favourites = [
    {
      permalink: 'https://learning.oreilly.com/course/getting-started-with/9780137649648/',
      title: "Getting Started with Containers - O'Reilly - Sander van Vugt",
      imageUrl: useBaseUrl('/img/containers.png'),
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: favourites.map((favourites, index) => ({
      '@type': 'CreativeWork',
      position: index + 1,
      name: favourites.title,
      url: favourites.permalink,
      description: favourites.title,
      contentUrl: favourites.permalink,
      imageUrl: favourites.imageUrl,
    })),
  };

  return (
    <Layout title="Favourites">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">Favourites</h1>
          <p className="hero__subtitle">
            A space for sharing helpful learning materials about GitOps and DevOps approaches!✨ Stay tuned—coming soon! 🚀
          </p>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {favourites.map((favourites, index) => (
                <div className="card-demo margin--md" key={index}>
                  <div className="card shadow--tl">
                    <div className="card__header">
                      <h3 style={{ maxWidth: '560px' }}>
                        <Link to={favourites.permalink}>{favourites.title}</Link>
                      </h3>
                    </div>
                    <div className={styles.card__image}>
                      <img 
                        src={favourites.imageUrl}
                        alt={favourites.title}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Favourites;