import styles from './Services.module.css';

export default function Services() {
    return ( 
      <main>
        <div className={styles.hero}>
          <h1>Nossos <span>Serviços</span></h1>
          <p>Soluções completas para quem quer comprar, vender ou alugar com segurança e agilidade em Curitiba.</p>
        </div>
        <div className={styles.services}>
          <section>
            <div className={styles.servicesCard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
              <h1>Consultoria Imobiliária</h1>
              <p>Atendimento próximo e personalizado para encontrar o imóvel que melhor se adapta ao seu momento de vida.</p>
              <button>Agendar Visita</button>
              <div className={styles.invisibleDiv}>
                <h2>Atendimento Personalizado</h2>
                <h2>Segurança Garantida</h2>
              </div>
            </div>
            <div className={styles.servicesCard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up" aria-hidden="true"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
              <h1>Gestão de Patrimônio</h1>
              <p>Cuidamos do seu imóvel como se fosse nosso, garantindo rentabilidade e tranquilidade para proprietários.</p>
              <div className={styles.invisibleDiv}>
                <h2>Atendimento Personalizado</h2>
                <h2>Segurança Garantida</h2>
              </div>
            </div>
          </section>
          <section>
            <div className={styles.servicesCard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale" aria-hidden="true"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>
              <h1>Avaliação de Mercado</h1>
              <p>Análise técnica e mercadológica precisa para determinar o valor justo de imóveis em Curitiba e região.</p>
              <button>Solicitar Avaliação</button>
              <div className={styles.invisibleDiv}>
                <h2>Atendimento Personalizado</h2>
                <h2>Segurança Garantida</h2>
              </div>
            </div>
            <div className={styles.servicesCard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key" aria-hidden="true"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path><path d="m21 2-9.6 9.6"></path><circle cx="7.5" cy="15.5" r="5.5"></circle></svg>
              <h1>Assessoria Completa</h1>
              <p>Suporte em todas as etapas burocráticas, garantindo que você compre ou alugue com total segurança.</p>
              <div className={styles.invisibleDiv}>
                <h2>Atendimento Personalizado</h2>
                <h2>Segurança Garantida</h2>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
}