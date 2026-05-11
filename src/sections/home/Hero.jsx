import Button from "@components/ui/Button/Button.jsx";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.kicker}>Imobiliária Valdinei</span>
          <h1>Encontre o imóvel dos seus sonhos</h1>
          <p>
            Casas, apartamentos e terrenos em Curitiba e região com um
            atendimento próximo e especializado.
          </p>

          <div className={styles.actions}>
            <Button variant="primary">Buscar imóveis</Button>
            <Button variant="outline">Falar com corretor</Button>
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.tabs} aria-label="Filtro de imóveis">
            <span className={`${styles.tab} ${styles.tabActive}`}>Comprar</span>
            <span className={styles.tab}>Alugar</span>
            <span className={styles.tab}>Lançamentos</span>
          </div>

          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Cidade</span>
              <div className={styles.fieldValue}>Curitiba e região</div>
            </label>

            <label className={styles.field}>
              <span>Bairro</span>
              <div className={styles.fieldValue}>Selecione um bairro</div>
            </label>

            <label className={styles.field}>
              <span>Tipo</span>
              <div className={styles.fieldValue}>
                Apartamento, casa ou terreno
              </div>
            </label>

            <label className={styles.field}>
              <span>Faixa de preço</span>
              <div className={styles.fieldValue}>Até R$ 500 mil</div>
            </label>
          </div>

          <div className={styles.searchAction}>
            <Button variant="secondary">Buscar imóveis</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
