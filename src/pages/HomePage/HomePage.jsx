import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/common/Modal/Modal'
import TopNav from '../../components/layout/TopNav/TopNav'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <div className={styles.page}>
      <TopNav homeAnchors />

      <main className={styles.main}>
        <section id="home" className={styles.hero}>
          <div className={styles.heroLogoBlock}>
            <img
              src="/midias/home-page/logo/art_logo.png"
              alt="Logo da empresa"
              className={styles.heroLogo}
            />
            <img
              src="/midias/home-page/logo/LOGO-HOME-01.png"
              alt="Nome da empresa"
              className={styles.heroWordmark}
            />
          </div>
        </section>

        <section id="about" className={styles.aboutSection}>
          <div className={styles.sectionTitleRow}>
            <h1 className={styles.h1}>Sobre Nos</h1>
            <button className={styles.aboutBtn} onClick={() => setAboutOpen(true)}>
              Ler manifesto
            </button>
          </div>
          <p className={styles.subtitle}>
            Projeto autoral de leitura digital, construido de forma independente.
          </p>
          <div className={styles.aboutGrid}>
            <img
              src="/midias/home-page/sobre/imagem-lateral-esquerda-01.png"
              alt="Ilustracao lateral esquerda"
              className={styles.sideArt}
            />

            <button className={styles.aboutImageButton} onClick={() => setAboutOpen(true)}>
              <img
                src="/midias/home-page/sobre/imagem-sobre-nos.png"
                alt="Ilustracao sobre nos"
                className={styles.aboutImage}
              />
            </button>

            <img
              src="/midias/home-page/sobre/imagem-lateral-direita-01.png"
              alt="Ilustracao lateral direita"
              className={styles.sideArt}
            />
          </div>
        </section>

        <section id="contacts" className={styles.contactSection}>
          <h1 className={styles.h1}>Contatos</h1>
          <div className={styles.contactsGrid}>
            <img
              src="/midias/home-page/contatos/imagem-lateral-esquerda-04.png"
              alt="Ilustracao contatos esquerda"
              className={styles.contactArt}
            />

            <div className={styles.contactCard}>
              <p className={styles.contentBody}>Instagram: @cofcof.prod</p>
              <p className={styles.contentBody}>LinkedIn: Cof Cof Producoes</p>
              <p className={styles.contentBody}>Email: cofcof.prod@gmail.com</p>
              <p className={styles.contentBody}>Whatsapp: +55 16 99152-3778</p>
              <Link to="/login" className={styles.primaryAction}>
                Login
              </Link>
            </div>

            <img
              src="/midias/home-page/contatos/imagem-lateral-direita-04.jpg"
              alt="Ilustracao contatos direita"
              className={styles.contactArt}
            />
          </div>
        </section>
      </main>

      <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="Sobre">
        <h2 className={styles.modalTitle}>Sobre</h2>
        <p className={styles.modalBody}>
          Somos dois amigos contadores de historias e decidimos transformar nosso sonho em algo concreto.
          Assim nasceu a Cof Cof Producoes.
        </p>
        <p className={styles.modalBody}>
          O portal atual esta em evolucao continua e em breve sera conectado ao backend para renderizar
          catalogo, obras e capitulos dinamicamente.
        </p>
      </Modal>
    </div>
  )
}

