import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import logoUrl from "../../../assets/images/logo.png";

const FADE_DURATION = 500;
const SHOW_DELAY = 120;

function buildMarkup() {
  return `
    <div class="vs-preloader__scene">
      <div class="vs-preloader__shine" aria-hidden="true"></div>

      <div class="vs-preloader__logo-wrap">
        <div class="vs-preloader__orbit" aria-hidden="true">
        <svg viewBox="0 0 200 200" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id="vs-preloader-gold-gradient" x1="18%" y1="18%" x2="82%" y2="82%">
              <stop offset="0%" stop-color="#F6E08A" />
              <stop offset="42%" stop-color="#D4AF37" />
              <stop offset="100%" stop-color="#9C7720" />
            </linearGradient>
          </defs>

          <circle class="vs-preloader__guide" cx="100" cy="100" r="72"></circle>
          <circle class="vs-preloader__arc" cx="100" cy="100" r="72"></circle>
        </svg>
        </div>

        <img
          class="vs-preloader__logo"
          src="${logoUrl}"
          alt="Valdinei S. de Souza"
          onerror="this.classList.add('is-hidden');this.nextElementSibling.classList.add('is-visible');"
        />
        <div class="vs-preloader__logo-fallback" aria-hidden="true">VS</div>
      </div>
    </div>
  `;
}

export default function RoutePreloader() {
  const location = useLocation();
  const firstRender = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }

    const existingLoader = document.getElementById("vs-preloader");
    if (existingLoader) {
      return undefined;
    }

    const loader = document.createElement("div");
    loader.id = "vs-preloader";
    loader.setAttribute("aria-label", "Carregando o site");
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.innerHTML = buildMarkup();

    document.body.classList.add("is-preloading");
    document.body.appendChild(loader);

    timeoutRef.current = window.setTimeout(() => {
      loader.classList.add("is-fading");

      window.setTimeout(() => {
        loader.remove();
        document.body.classList.remove("is-preloading");
      }, FADE_DURATION);
    }, SHOW_DELAY);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const activeLoader = document.getElementById("vs-preloader");
      if (activeLoader && activeLoader !== existingLoader && activeLoader.isConnected) {
        activeLoader.remove();
      }

      document.body.classList.remove("is-preloading");
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}