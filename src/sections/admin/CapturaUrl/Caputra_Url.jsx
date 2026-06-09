import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Link2, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import {
  CAMPAIGN_PRESETS,
  buildCampaignUrl,
  createPresetState,
  getInitialCampaignForm,
  normalizeCampaignSlug,
  DEFAULT_CAMPAIGN_DOMAIN,
} from "@hooks/capturaUrl.js";
import { addCampaignLink, deleteCampaignLink, getCampaignLinks } from "@services/campaignLinkService.js";
import "./Captura_Url.css";

// Emoji/icon for each platform
const PLATFORM_META = {
  Instagram: { emoji: "", color: "#E1306C" },
  Facebook:  { emoji: "", color: "#1877F2" },
  WhatsApp:  { emoji: "", color: "#25D366" },
  LinkedIn:  { emoji: "", color: "#0A66C2" },
  YouTube:   { emoji: "▶",  color: "#FF0000" },
};

const PAGE_OPTIONS = [
  { label: "Contato", value: "/contato" },
  { label: "Imóveis", value: "/imoveis" },
  { label: "Início", value: "/" },
  { label: "Sobre nós", value: "/sobre" },
  { label: "Serviços", value: "/servicos" },
];

const toSafeText = (value) => String(value || "").trim();

export default function CapturaUrlSection() {
  const [form, setForm] = useState(getInitialCampaignForm());
  const [selectedPreset, setSelectedPreset] = useState("Instagram");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [campaignLinks, setCampaignLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedbackId, setCopyFeedbackId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const effectiveCampaign = useMemo(() => {
    return (
      normalizeCampaignSlug(form.campaign) ||
      normalizeCampaignSlug(form.title) ||
      normalizeCampaignSlug(`${form.source}-${form.medium}`) ||
      "campanha"
    );
  }, [form.campaign, form.medium, form.source, form.title]);

  const previewUrl = useMemo(
    () =>
      buildCampaignUrl({
        destinationPath: form.destinationPath,
        source: form.source,
        medium: form.medium,
        campaign: effectiveCampaign,
        content: form.content,
        term: form.term,
      }),
    [effectiveCampaign, form.content, form.destinationPath, form.medium, form.source, form.term],
  );

  const sourceBreakdown = useMemo(() => {
    return campaignLinks.reduce(
      (accumulator, link) => {
        const source = String(link.source || "outro").toLowerCase();
        accumulator[source] = (accumulator[source] || 0) + 1;
        return accumulator;
      },
      { instagram: 0, facebook: 0, whatsapp: 0, linkedin: 0, youtube: 0, outro: 0 },
    );
  }, [campaignLinks]);

  const loadCampaignLinks = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const links = await getCampaignLinks();
      setCampaignLinks(links);
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível carregar os links de campanha agora.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignLinks();
  }, []);

  const applyPreset = (preset) => {
    setSelectedPreset(preset.label);
    setForm((currentForm) => ({
      ...currentForm,
      ...createPresetState(preset),
    }));
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCopyUrl = async (url, linkId) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedbackId(linkId || "preview");
      window.setTimeout(() => setCopyFeedbackId(""), 1800);
    } catch (error) {
      console.error("Falha ao copiar URL:", error);
      setErrorMessage("Não foi possível copiar o link. Verifique as permissões do navegador.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const title = toSafeText(form.title) || effectiveCampaign.replace(/-/g, " ");
    const destinationPath = toSafeText(form.destinationPath) || "/";
    const source = toSafeText(form.source) || "instagram";
    const medium = toSafeText(form.medium) || "social";
    const campaign = effectiveCampaign;
    const content = toSafeText(form.content);
    const term = toSafeText(form.term);
    const url = buildCampaignUrl({ destinationPath, source, medium, campaign, content, term });

    setIsSaving(true);

    try {
      await addCampaignLink({
        title,
        destinationPath,
        source,
        medium,
        campaign,
        content,
        term,
        url,
      });

      setForm(getInitialCampaignForm());
      setSelectedPreset("Instagram");
      setShowAdvanced(false);
      await loadCampaignLinks();
      await handleCopyUrl(url, "preview");
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível salvar o link. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (linkId) => {
    const shouldDelete = window.confirm("Excluir este link de campanha?");

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteCampaignLink(linkId);
      await loadCampaignLinks();
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível excluir o link. Tente novamente.");
    }
  };

  const handleReset = () => {
    setForm(getInitialCampaignForm());
    setSelectedPreset("Instagram");
    setShowAdvanced(false);
  };

  return (
    <main className="admin-container">
      <section className="pageHeader">
        <div>
          <p className="kicker">Captura de URL</p>
          <h1 className="admin-title">Criar Links de Campanha</h1>
          <p className="description">
            Gere links rastreáveis para suas campanhas em poucos cliques, usando o domínio <strong>{DEFAULT_CAMPAIGN_DOMAIN}</strong>.
          </p>
        </div>

        <div className="headerActions">
          <Button variant="outline" className="copyPreviewButton" type="button" onClick={() => handleCopyUrl(previewUrl, "preview")}>
            <Copy size={18} />
            {copyFeedbackId === "preview" ? "Copiado!" : "Copiar link"}
          </Button>
          <Button variant="primary" className="primaryAction" type="button" onClick={handleReset}>
            <RotateCcw size={18} />
            Limpar
          </Button>
        </div>
      </section>

      <section className="statsGrid" aria-label="Resumo rápido dos links">
        <article className="statCard">
          <span>Total</span>
          <strong>{campaignLinks.length}</strong>
        </article>
        <article className="statCard">
          <span>Instagram</span>
          <strong>{sourceBreakdown.instagram}</strong>
        </article>
        <article className="statCard">
          <span>Facebook</span>
          <strong>{sourceBreakdown.facebook}</strong>
        </article>
        <article className="statCard">
          <span>WhatsApp</span>
          <strong>{sourceBreakdown.whatsapp}</strong>
        </article>
      </section>

      <section className="workspace">
        <form className="formCard" onSubmit={handleSubmit}>

          {/* ── PASSO 1: plataforma ── */}
          <div className="formStep">
            <p className="stepLabel"><span className="stepNum">1</span> De onde vem o visitante?</p>
            <div className="platformGrid">
              {CAMPAIGN_PRESETS.map((preset) => {
                const meta = PLATFORM_META[preset.label] || { emoji: "🔗", color: "#888" };
                const isActive = selectedPreset === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={`platformButton${isActive ? " platformButton--active" : ""}`}
                    style={{ "--platform-color": meta.color }}
                    onClick={() => applyPreset(preset)}
                    aria-pressed={isActive}
                  >
                    <span className="platformEmoji">{meta.emoji}</span>
                    <span className="platformName">{preset.label}</span>
                    {isActive && <span className="platformCheck">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PASSO 2: nome da campanha ── */}
          <div className="formStep">
            <p className="stepLabel"><span className="stepNum">2</span> Nome da campanha</p>
            <Input
              placeholder="Ex.: Lançamento de julho, Stories de verão..."
              value={form.title}
              onChange={handleFormChange("title")}
            />
            <p className="fieldHint">Só para você se lembrar depois — não aparece no link.</p>
          </div>

          {/* ── PASSO 3: página de destino ── */}
          <div className="formStep">
            <p className="stepLabel"><span className="stepNum">3</span> Para qual página o link leva?</p>
            <div className="pageButtonRow">
              {PAGE_OPTIONS.map((page) => (
                <button
                  key={page.value}
                  type="button"
                  className={`pageButton${form.destinationPath === page.value ? " pageButton--active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, destinationPath: page.value }))}
                >
                  {page.label}
                </button>
              ))}
            </div>
            <Input
              placeholder="Ou cole o link direto: /imoveis ou https://..."
              value={form.destinationPath}
              onChange={handleFormChange("destinationPath")}
            />
          </div>

          {/* ── Avançado ── */}
          <button
            type="button"
            className="advancedToggle"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showAdvanced ? "Ocultar opções avançadas" : "Opções avançadas (opcional)"}
          </button>

          {showAdvanced && (
            <div className="advancedFields">
              <Input
                label="Identificador do anúncio"
                placeholder="Ex.: botao-story, banner-topo"
                value={form.content}
                onChange={handleFormChange("content")}
              />
              <Input
                label="Palavra-chave"
                placeholder="Ex.: imoveis-curitiba"
                value={form.term}
                onChange={handleFormChange("term")}
              />
            </div>
          )}

          {/* ── Preview ── */}
          <div className="previewBox">
            <div className="previewHeader">
              <span>Link gerado</span>
              <span className="previewDomain">{DEFAULT_CAMPAIGN_DOMAIN}</span>
            </div>
            <div className="previewUrlRow">
              <Link2 size={18} className="previewIcon" />
              <input readOnly value={previewUrl} aria-label="URL gerada" />
              <button type="button" className="inlineCopyButton" onClick={() => handleCopyUrl(previewUrl, "preview")}>
                {copyFeedbackId === "preview" ? "✓" : <Copy size={16} />}
              </button>
            </div>
          </div>

          {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}

          <div className="formActions">
            <Button variant="primary" className="saveButton" type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 size={18} className="spinningIcon" /> : <Plus size={18} />}
              {isSaving ? "Salvando..." : "Gerar e salvar link"}
            </Button>
          </div>
        </form>

        <section className="listCard">
          <div className="cardHeading">
            <div>
              <p className="cardLabel">Links salvos</p>
              <h2>Histórico para copiar ou excluir</h2>
            </div>
            <Link2 size={20} />
          </div>

          {isLoading ? (
            <div className="emptyState">Carregando links de campanha...</div>
          ) : campaignLinks.length === 0 ? (
            <div className="emptyState">
              Nenhum link salvo ainda. Crie o primeiro usando o formulário ao lado.
            </div>
          ) : (
            <div className="linkList">
              {campaignLinks.map((link) => (
                <article key={link.id} className="linkCard">
                  <div className="linkMeta">
                    <strong>{link.title || link.campaign}</strong>
                    <div className="linkTags">
                      <span>{link.source}</span>
                      <span>{link.medium}</span>
                      <span>{link.destinationPath}</span>
                    </div>
                  </div>

                  <div className="linkUrlRow">
                    <input readOnly value={link.url} />
                  </div>

                  <div className="linkActions">
                    <button type="button" className="linkActionButton" onClick={() => handleCopyUrl(link.url, link.id)}>
                      <Copy size={16} />
                      {copyFeedbackId === link.id ? "Copiado!" : "Copiar"}
                    </button>

                    <button type="button" className="linkActionButton dangerAction" onClick={() => handleDelete(link.id)}>
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
