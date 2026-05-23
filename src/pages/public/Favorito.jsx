import { useEffect } from "react";
import FavoritoSection from "@sections/Favorito/Favorito";

export default function Favorito() {
	useEffect(() => {
		document.title = "Favoritos | Imobiliária Valdinei";
	}, []);

	return (
		<main>
			<FavoritoSection />
		</main>
	);
}
