import TopNav from '../../components/layout/TopNav/TopNav'
import styles from './PremiumPage.module.css'

export default function PremiumPage() {
  return (
    <div className={styles.page}>
      <TopNav />

      <main className={styles.main}>
        <h1 className={styles.h1}>CofCof Premium</h1>
        <p className={styles.subtitle}>
          Página de premium em progresso. O layout original possui fluxo próprio.
        </p>

        <div className={styles.box}>
          <p className={styles.text}>
            Quando você quiser, podemos portar o conteúdo de `signpremium.html` para aqui
            (incluindo os estilos e os scripts).
          </p>

          <a className={styles.link} href="/read/work-00">
            Ver exemplo de leitura (mock)
          </a>
        </div>
      </main>
    </div>
  )
}

