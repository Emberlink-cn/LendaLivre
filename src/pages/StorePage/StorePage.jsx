import { useMemo, useState } from 'react'
import TopNav from '../../components/layout/TopNav/TopNav'
import styles from './StorePage.module.css'

const STORE_SECTIONS = [
  {
    id: 'vestuario',
    label: 'Vestuário',
    iframeUrl: 'https://montink.com/',
    description: 'Camisetas, moletons e itens de vestuario com identidade visual do projeto.',
  },
  {
    id: 'acessorios',
    label: 'Acessórios',
    iframeUrl: 'https://www.nuvemshop.com.br/',
    description: 'Canecas, posters e colecionaveis para apoiar o universo CofCof.',
  },
  {
    id: 'premium',
    label: 'Premium',
    iframeUrl: null,
    description: 'Conteudos exclusivos, acesso antecipado e beneficios para apoiadores.',
  },
  {
    id: 'apoiar',
    label: 'Apoiar',
    iframeUrl: null,
    description: 'Ajude o projeto a crescer e acelerar novas historias, capitulos e midias.',
  },
]

export default function StorePage() {
  const [activeSection, setActiveSection] = useState('vestuario')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentSection = useMemo(
    () => STORE_SECTIONS.find((s) => s.id === activeSection) ?? STORE_SECTIONS[0],
    [activeSection],
  )

  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.h1}>Loja CofCof</h1>
            <p className={styles.subtitle}>
              Navegue pelas secoes e acompanhe os modulos que serao conectados ao backend da loja.
            </p>
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          </button>
        </header>

        <section className={styles.layout}>
          <aside className={styles.menu}>
            <h2 className={styles.menuTitle}>Categorias</h2>
            <ul className={styles.menuList}>
              {STORE_SECTIONS.map((section) => {
                const isActive = section.id === activeSection
                return (
                  <li key={section.id}>
                    <button
                      className={isActive ? styles.menuItemActive : styles.menuItem}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {mobileMenuOpen ? (
            <nav className={styles.mobileMenu}>
              {STORE_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className={section.id === activeSection ? styles.menuItemActive : styles.menuItem}
                  onClick={() => {
                    setActiveSection(section.id)
                    setMobileMenuOpen(false)
                  }}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          ) : null}

          <div className={styles.content}>
            <div className={styles.sectionCard}>
              <h2 className={styles.iframeTitle}>{currentSection.label}</h2>
              <p className={styles.sectionDescription}>{currentSection.description}</p>
            </div>

            {currentSection.iframeUrl ? (
              <div className={styles.iframeBox}>
                <iframe
                  title={currentSection.label}
                  src={currentSection.iframeUrl}
                  className={styles.iframe}
                  loading="lazy"
                />
              </div>
            ) : currentSection.id === 'premium' ? (
              <div className={styles.placeholderCard}>
                <h3>Premium em construcao</h3>
                <p>
                  Em breve esta secao tera planos e beneficios integrados com autenticacao e assinatura.
                </p>
              </div>
            ) : (
              <div className={styles.placeholderCard}>
                <h3>Como apoiar a CofCof</h3>
                <p>Pix: b512370d-71b9-4de8-987f-0eac41f99d93</p>
                <p>Email: cofcof.prod@gmail.com</p>
                <p>Instagram: @cofcof.prod</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

