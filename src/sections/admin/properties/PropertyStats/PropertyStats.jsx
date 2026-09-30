import { BadgeCheck, Ban, Building2, Key, Handshake, CalendarClock, Trash2 } from "lucide-react";
import styles from "./PropertyStats.module.css";

const stats = [
  {
    key: "total",
    statusValue: "Todos",
    label: "Total",
    hint: "Imóveis no catálogo",
    icon: Building2,
  },
  {
    key: "disponiveis",
    statusValue: "Disponível",
    label: "Disponíveis",
    hint: "Prontos para negócio",
    icon: BadgeCheck,
  },
  {
    key: "reservados",
    statusValue: "Reservado",
    label: "Reservados",
    hint: "Aguardando fechamento",
    icon: CalendarClock,
  },
  {
    key: "vendidos",
    statusValue: "Vendido",
    label: "Vendidos",
    hint: "Negócio concluído",
    icon: Handshake,
  },
  {
    key: "alugados",
    statusValue: "Alugado",
    label: "Alugados",
    hint: "Com contrato ativo",
    icon: Key,
  },
  {
    key: "inativos",
    statusValue: "Inativo",
    label: "Inativos",
    hint: "Desativados do site",
    icon: Ban,
  },
  {
    key: "lixeira",
    statusValue: "Lixeira",
    label: "Lixeira",
    hint: "Retenção por 7 dias",
    icon: Trash2,
  },
];

export default function PropertyStats({ 
  total = 0, 
  disponiveis = 0, 
  reservados = 0, 
  vendidos = 0, 
  alugados = 0, 
  inativos = 0, 
  lixeira = 0,
  activeFilter = "Todos",
  onStatClick
}) {
  const values = { total, disponiveis, reservados, vendidos, alugados, inativos, lixeira };

  return (
    <section className={styles.section} aria-label="Resumo dos imóveis">
      <div className={styles.grid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.statusValue;
          const isLixeira = stat.key === "lixeira";

          let cardClass = styles.card;
          if (isLixeira) {
            cardClass += ` ${isActive ? styles.cardLixeiraActive : styles.cardLixeira}`;
          } else if (isActive) {
            cardClass += ` ${styles.cardActive}`;
          }

          return (
            <article 
              key={stat.key} 
              className={cardClass}
              onClick={() => onStatClick && onStatClick(stat.statusValue)}
              title={`Filtrar por ${stat.label}`}
            >
              <div className={styles.topRow}>
                <div 
                  className={styles.iconWrap} 
                  aria-hidden="true"
                  style={isLixeira ? { background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" } : {}}
                >
                  <Icon size={20} />
                </div>
                <span className={styles.kicker}>{stat.label}</span>
              </div>

              <p className={styles.value} style={isLixeira ? { color: "#dc2626" } : {}}>{values[stat.key]}</p>
              <p className={styles.hint}>{stat.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}