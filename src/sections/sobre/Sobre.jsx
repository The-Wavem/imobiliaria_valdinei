import styles from "./sobre.module.css";

export default function Sobre() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1>Seu parceiro em <span>Negócios Imobiliários</span></h1>
        <p>
          Com anos de experiência no mercado de Curitiba, Valdinei Souza
          consolidou sua marca através de um atendimento próximo, transparente e
          focado em resultados para todos os perfis.
        </p>
      </div>
      <div className={styles.cardsDiv}>
        <div className={styles.card}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" id="shield" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
          </div>
          <h1>Segurança Jurídica</h1>
        </div>
        <div className={styles.card}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" id="target" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <h1>Seleção para todos</h1>
        </div>
        <div className={styles.card}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" id="human" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <h1>Atendimento Humano</h1>
        </div>
      </div>
      <div className={styles.historyDiv}>
        <div>
          <h2>Nossa História</h2>
        </div>
        <div>
          <img src="" alt="imagem ilustrativa valdinei souza" />
          <h1>Compromisso com o seu <span>novo começo</span></h1>
          <p>
            Fundada por Valdinei Souza, nossa imobiliária nasceu com o propósito
            de democratizar o acesso a imóveis de qualidade em Curitiba e
            região. Com o CRECI 9720-J, operamos com total seriedade e
            profissionalismo. Atuamos em diversos bairros, do Centro ao Batel,
            entendendo que não estamos apenas vendendo metros quadrados, mas sim
            realizando sonhos e facilitando novos começos para todas as
            famílias. Nossa missão é ser a ponte entre você e o seu novo lar,
            proporcionando uma experiência de compra ou aluguel sem
            complicações, pautada na confiança e na acessibilidade.
          </p>
          <button>Ver Imóveis Disponiveis →</button>
        </div>
      </div>
    </main>
  );
}
