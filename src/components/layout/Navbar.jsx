import { Heart, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const navigationItems = [
	{ label: "Início", to: "/" },
	{ label: "Alugar", to: "/#alugar" },
	{ label: "Comprar", to: "/#comprar" },
	{ label: "Sobre Nós", to: "/#sobre-nos" },
	{ label: "Serviços", to: "/#servicos" },
	{ label: "Contato", to: "/contato" },
];

export default function Navbar() {
	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<NavLink to="/" className={styles.brand} aria-label="Ir para a página inicial">
					<span className={styles.brandMark}>VS</span>
					<span className={styles.brandText}>
						<strong>Valdinei Souza</strong>
						<small>Imóveis com confiança</small>
					</span>
				</NavLink>

				<nav className={styles.nav} aria-label="Navegação principal">
					{navigationItems.map((item) => (
						<NavLink
							key={item.label}
							to={item.to}
							className={({ isActive }) =>
								`${styles.link} ${isActive ? styles.linkActive : ""}`.trim()
							}
						>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className={styles.actions}>
					<NavLink to="/favorito" className={styles.iconButton} aria-label="Ver favoritos">
						<Heart size={18} />
					</NavLink>
					<button type="button" className={styles.menuButton} aria-label="Abrir menu">
						<Menu size={20} />
					</button>
				</div>
			</div>
		</header>
	);
}
