import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bath, Bed, Heart, MapPin, Maximize2, Trash2 } from "lucide-react";
import styles from "./Favorito.module.css";

const STORAGE_KEY = "imobiliaria-valdinei:favorites";

const DEFAULT_FAVORITES = [
	{
		id: "fav-1",
		type: "Apartamento",
		category: "Comprar",
		location: "Portão, Curitiba",
		title: "Apartamento Aconchegante no Portão",
		price: 320000,
		beds: 2,
		baths: 1,
		area: 58,
		image:
			"https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200",
	},
	{
		id: "fav-2",
		type: "Casa",
		category: "Comprar",
		location: "Boqueirão, Curitiba",
		title: "Casa Charmosa no Boqueirão",
		price: 450000,
		beds: 3,
		baths: 2,
		area: 95,
		image:
			"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
	},
];

function formatCurrency(value) {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export default function FavoritoSection() {
	const [favorites, setFavorites] = useState([]);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		try {
			const storedFavorites = localStorage.getItem(STORAGE_KEY);

			if (storedFavorites) {
				const parsedFavorites = JSON.parse(storedFavorites);
				setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
			} else {
				setFavorites(DEFAULT_FAVORITES);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITES));
			}
		} catch {
			setFavorites(DEFAULT_FAVORITES);
		} finally {
			setIsReady(true);
		}
	}, []);

	useEffect(() => {
		if (!isReady) {
			return;
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
	}, [favorites, isReady]);

	function handleRemoveFavorite(id) {
		setFavorites((currentFavorites) => currentFavorites.filter((favorite) => favorite.id !== id));
	}

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<header className={styles.header}>
					<div className={styles.titleWrap}>
						<span className={styles.titleIcon} aria-hidden="true">
							<Heart size={28} fill="currentColor" />
						</span>

						<div>
							<h1 className={styles.title}>Meus Imóveis Favoritos</h1>
							<p className={styles.subtitle}>
								Os imóveis que você mais gostou salvos em um só lugar.
							</p>
						</div>
					</div>
				</header>

				{favorites.length > 0 ? (
					<div className={styles.grid}>
						{favorites.map((favorite) => (
							<article key={favorite.id} className={styles.card}>
								<div className={styles.imageWrap}>
									<img
										src={favorite.image}
										alt={favorite.title}
										className={styles.image}
										referrerPolicy="no-referrer"
									/>

									<div className={styles.badges}>
										<span className={styles.badge}>{favorite.type}</span>
										<span className={`${styles.badge} ${styles.categoryBadge}`}>
											{favorite.category}
										</span>
									</div>

									<button
										type="button"
										className={styles.removeButton}
										aria-label={`Remover ${favorite.title} dos favoritos`}
										onClick={() => handleRemoveFavorite(favorite.id)}
									>
										<Trash2 size={18} />
									</button>
								</div>

								<div className={styles.content}>
									<div className={styles.location}>
										<MapPin size={14} />
										<span>{favorite.location}</span>
									</div>

									<h2 className={styles.propertyTitle}>{favorite.title}</h2>

									<p className={styles.price}>{formatCurrency(favorite.price)}</p>

									<div className={styles.stats}>
										<div className={styles.statItem}>
											<Bed size={16} />
											<span>{favorite.beds}</span>
										</div>

										<div className={styles.statItem}>
											<Bath size={16} />
											<span>{favorite.baths}</span>
										</div>

										<div className={styles.statItem}>
											<Maximize2 size={16} />
											<span>{favorite.area}m²</span>
										</div>
									</div>

									<div className={styles.actions}>
										<Link to="/" className={styles.detailsButton}>
											Detalhes
											<ArrowRight size={18} />
										</Link>

										<button type="button" className={styles.visitButton}>
											<span className={styles.visitIcon} aria-hidden="true">
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
													<line x1="16" y1="2" x2="16" y2="6" />
													<line x1="8" y1="2" x2="8" y2="6" />
													<line x1="3" y1="10" x2="21" y2="10" />
												</svg>
											</span>
											Visitar
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
				) : (
					<div className={styles.emptyState}>
						<div className={styles.emptyIcon} aria-hidden="true">
							<Heart size={52} />
						</div>

						<h2 className={styles.emptyTitle}>Nenhum favorito ainda</h2>
						<p className={styles.emptyText}>
							Navegue pelos imóveis e clique no coração para salvá-los aqui.
						</p>

						<Link to="/" className={styles.exploreButton}>
							Explorar Imóveis
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}