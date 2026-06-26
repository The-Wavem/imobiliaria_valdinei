import FavoritoSection from "@sections/Favorito/Favorito";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export default function Favorito() {
	useDocumentTitle('Meus Favoritos');

	return (
		<main>
			<FavoritoSection />
		</main>
	);
}
