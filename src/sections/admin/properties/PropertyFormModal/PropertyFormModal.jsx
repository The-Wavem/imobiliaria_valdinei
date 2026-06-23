import { useEffect, useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  Camera,
  Check,
  ImagePlus,
  MapPin,
  Plus,
  Ruler,
  Save,
  Star,
  Trash2,
  X,
  CarFront,
  PlaySquare,
} from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Loader from "@components/ui/Loader/Loader.jsx";
import styles from "./PropertyFormModal.module.css";
import { checkCodeExists } from "../../../../services/propertyService.js";

const tabOptions = [
  { id: "basic", label: "Básico" },
  { id: "structure", label: "Estrutura" },
  { id: "description", label: "Descrição" },
  { id: "location", label: "Localização" },
  { id: "features", label: "Características" },
  { id: "media", label: "Mídias" },
];

const categoryOptions = [
  { label: "Selecione", value: "" },
  { label: "Alugar", value: "Alugar" },
  { label: "Comprar", value: "Comprar" },
];

const baseTypes = ["Casa", "Apartamento", "Comercial", "Cobertura"];

const baseFeatures = [
  "Piscina",
  "Churrasqueira",
  "Academia",
  "Varanda gourmet",
  "Portaria 24h",
  "Playground",
  "Elevador",
  "Ar-condicionado",
  "Mobiliado",
  "Pet friendly",
];

const defaultForm = {
  title: "", code: "", price: "", condo: "", iptu: "",
  category: "", type: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  area: "", bedrooms: "", bathrooms: "", parkingSpaces: "",
  features: [], photos: [], videos: [], description: "",
  status: "Disponível"
};

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

export default function PropertyFormModal({ isOpen, onClose, property, onSave }) {
  const mode = property ? "edit" : "create";
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(defaultForm);
  const [availableTypes, setAvailableTypes] = useState(baseTypes);
  const [availableFeatures, setAvailableFeatures] = useState(baseFeatures);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepSuccess, setCepSuccess] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setShowCancelConfirm(false);
    setActiveTab("basic");
    setIsAddingType(false);
    setNewType("");
    setNewFeature("");
    setNewPhotoUrl("");
    setNewVideoUrl("");
    setCoverPhotoIndex(0);
    setIsSaving(false);
    setCepError("");
    setCepSuccess(false);
    setCodeError("");
    setIsGeneratingCode(false);

    if (property) {
      setFormData({
        title: property.title || property.content?.summary || "",
        code: property.code || "",
        price: property.pricing?.price || property.price || "",
        condo: property.pricing?.condo || property.condo || "",
        iptu: property.pricing?.iptu || property.iptu || "",
        category: property.category || "",
        type: property.type || "",
        cep: property.location?.cep || property.cep || "",
        logradouro: property.location?.logradouro || property.location?.street || property.street || property.location?.address || property.address || "",
        numero: property.location?.numero || property.location?.number || property.number || "",
        complemento: property.location?.complemento || property.location?.complement || property.complement || "",
        bairro: property.location?.bairro || property.location?.neighborhood || property.neighborhood || "",
        cidade: property.location?.cidade || property.location?.city || property.city || "",
        estado: property.location?.estado || property.location?.state || property.state || "",
        area: property.area || property.location?.area || "",
        bedrooms: property.bedrooms || property.location?.bedrooms || "",
        bathrooms: property.bathrooms || property.location?.bathrooms || "",
        parkingSpaces: property.parkingSpaces || property.location?.parkingSpaces || "",
        features: property.features || [],
        photos: property.photos || [],
        videos: property.videos || [],
        description: property.content?.description || property.description || "",
        status: property.status || "Disponível"
      });

      if (property.type) {
        setAvailableTypes((currentValue) =>
          currentValue.includes(property.type)
            ? currentValue
            : [...currentValue, property.type],
        );
      }

      if (Array.isArray(property.features)) {
        setAvailableFeatures((currentValue) => {
          const nextValues = [...currentValue];
          property.features.forEach((feature) => {
            if (!nextValues.includes(feature)) {
              nextValues.push(feature);
            }
          });
          return nextValues;
        });
      }
    } else {
      setFormData(defaultForm);
    }
  }, [isOpen, property]);

  const typeOptions = useMemo(
    () => [
      { label: "Selecione", value: "" },
      ...availableTypes.map((item) => ({ label: item, value: item })),
    ],
    [availableTypes],
  );

  const updateField = (field, value) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    setCodeError('');
    let isUnique = false;
    let newCode = '';
    
    try {
      while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        newCode = `VLD-${randomNum}`;
        const exists = await checkCodeExists(newCode, property?.firestoreId || property?.id);
        if (!exists) {
          isUnique = true;
        }
      }
      updateField('code', newCode);
    } catch (error) {
      console.error("Erro ao gerar código único:", error);
      setCodeError("Erro ao gerar código. Tente novamente.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCodeBlur = async (event) => {
    const code = event.target.value.trim();
    if (!code) {
      setCodeError('');
      return;
    }
    
    try {
      const exists = await checkCodeExists(code, property?.firestoreId || property?.id);
      if (exists) {
        setCodeError('Este código já está em uso ou já existiu e não pode ser repetido.');
      } else {
        setCodeError('');
      }
    } catch (error) {
      console.error("Erro ao validar código:", error);
    }
  };

  const handleCepChange = async (event) => {
    let value = event.target.value.replace(/\D/g, "");
    updateField("cep", value);
    setCepError("");
    setCepSuccess(false);

    if (value.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setCepError("CEP não encontrado. Por favor, verifique.");
        } else {
          setCepSuccess(true);
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepError("Erro ao buscar CEP. Tente novamente.");
      }
    }
  };

  const handleAddFeature = () => {
    const value = newFeature.trim();
    if (!value) return;

    setAvailableFeatures((currentValue) =>
      currentValue.includes(value)
        ? currentValue
        : [...currentValue, value],
    );

    setFormData((currentValue) => ({
      ...currentValue,
      features: currentValue.features.includes(value)
        ? currentValue.features
        : [...currentValue.features, value],
    }));

    setNewFeature("");
  };

  const addPhoto = (urlValue) => {
    const value = urlValue.trim();

    if (!value) {
      return;
    }

    setFormData((currentValue) => ({
      ...currentValue,
      photos: [...currentValue.photos, value],
      imageUrl:
        currentValue.photos.length === 0 ? value : currentValue.imageUrl,
    }));
  };

  const removePhoto = (photoIndex) => {
    setFormData((currentValue) => {
      const nextPhotos = currentValue.photos.filter(
        (_, index) => index !== photoIndex,
      );

      return {
        ...currentValue,
        photos: nextPhotos,
        imageUrl: nextPhotos[0] || "",
      };
    });

    if (coverPhotoIndex === photoIndex) {
      setCoverPhotoIndex(0);
    } else if (coverPhotoIndex > photoIndex) {
      setCoverPhotoIndex((prev) => prev - 1);
    }
  };

  const addVideo = (urlValue) => {
    const value = urlValue.trim();
    if (!value) return;

    setFormData((currentValue) => ({
      ...currentValue,
      videos: [...currentValue.videos, value],
    }));
  };

  const removeVideo = (videoIndex) => {
    setFormData((currentValue) => ({
      ...currentValue,
      videos: currentValue.videos.filter((_, index) => index !== videoIndex),
    }));
  };

  const toggleFeature = (feature) => {
    setFormData((currentValue) => {
      const selectedFeatures = currentValue.features.includes(feature)
        ? currentValue.features.filter((item) => item !== feature)
        : [...currentValue.features, feature];

      return {
        ...currentValue,
        features: selectedFeatures,
      };
    });
  };

  const confirmNewType = () => {
    const value = newType.trim();

    if (!value) {
      return;
    }

    setAvailableTypes((currentValue) =>
      currentValue.includes(value) ? currentValue : [...currentValue, value],
    );

    updateField("type", value);
    setIsAddingType(false);
    setNewType("");
  };

  const deleteType = (typeToRemove) => {
    setAvailableTypes((currentValue) =>
      currentValue.filter((item) => item !== typeToRemove),
    );
    updateField("type", formData.type === typeToRemove ? "" : formData.type);
  };

  const deleteFeature = (featureToRemove) => {
    setAvailableFeatures((currentValue) =>
      currentValue.filter((item) => item !== featureToRemove),
    );
    setFormData((currentValue) => ({
      ...currentValue,
      features: currentValue.features.filter(
        (item) => item !== featureToRemove,
      ),
    }));
  };

  const isFormDirty = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      formData.price !== "" ||
      formData.logradouro.trim() !== "" ||
      formData.photos.length > 0 ||
      formData.videos.length > 0 ||
      formData.features.length > 0
    );
  }, [formData]);

  const fullAddressString = useMemo(() => {
    const parts = [];
    if (formData.logradouro) parts.push(formData.logradouro);
    if (formData.numero) parts.push(formData.numero);
    let str = parts.join(", ");
    
    const comp = [];
    if (formData.bairro) comp.push(formData.bairro);
    if (formData.cidade) comp.push(formData.cidade);
    if (formData.estado) comp.push(formData.estado);
    
    if (comp.length > 0) {
      str += (str ? " - " : "") + comp.join(", ");
    }
    
    return str;
  }, [formData.logradouro, formData.numero, formData.bairro, formData.cidade, formData.estado]);

  const handleCancelClick = () => {
    if (isFormDirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (formData.code) {
        const codeExists = await checkCodeExists(formData.code, property?.firestoreId || property?.id);
        if (codeExists) {
          setCodeError('Este código já está em uso ou já existiu e não pode ser repetido.');
          setActiveTab("basic");
          setIsSaving(false);
          return;
        }
      }

      const payload = { ...formData };
      
      // Reordenar fotos para garantir que a capa (coverPhotoIndex) seja a primeira
      if (payload.photos.length > 1 && coverPhotoIndex > 0 && coverPhotoIndex < payload.photos.length) {
        const photosCopy = [...payload.photos];
        const [coverPhoto] = photosCopy.splice(coverPhotoIndex, 1);
        photosCopy.unshift(coverPhoto);
        payload.photos = photosCopy;
      }
      
      const parts = [];
      if (payload.logradouro) parts.push(payload.logradouro);
      if (payload.numero) parts.push(payload.numero);
      
      let addressStr = parts.join(", ");
      
      const compBairro = [];
      if (payload.complemento) compBairro.push(payload.complemento);
      if (payload.bairro) compBairro.push(payload.bairro);
      
      if (compBairro.length > 0) {
        addressStr += ` - ${compBairro.join(", ")}`;
      }
      
      const cityState = [];
      if (payload.cidade) cityState.push(payload.cidade);
      if (payload.estado) cityState.push(payload.estado);
      
      if (cityState.length > 0) {
        addressStr += `, ${cityState.join(" - ")}`;
      }
      
      if (payload.cep) {
        addressStr += `, ${payload.cep}`;
      }

      payload.location = {
        cep: payload.cep,
        logradouro: payload.logradouro,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
        address: addressStr
      };

      // Limpar campos de localização temporários da raiz
      delete payload.cep;
      delete payload.logradouro;
      delete payload.numero;
      delete payload.complemento;
      delete payload.bairro;
      delete payload.cidade;
      delete payload.estado;

      await onSave(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modalContent}
      contentClassName={styles.modalInnerContent}
      variant="admin"
    >
      <form className={styles.formContainer} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <header className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <h2>{mode === "edit" ? "Editar imóvel" : "Adicionar imóvel"}</h2>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
              <X size={20} />
            </button>
          </div>
          <nav
            className={styles.tabs}
            aria-label="Navegação das abas do formulário"
          >
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`.trim()}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <div className={styles.modalBody}>
          {activeTab === "basic" ? (
            <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="Título"
                placeholder="Ex: Casa térrea com piscina"
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
              <div className={styles.codeGroupContainer}>
                <Input
                  label="Código"
                  placeholder="Ex: VLD-1204"
                  value={formData.code}
                  onChange={(event) => updateField("code", event.target.value)}
                  onBlur={handleCodeBlur}
                  error={codeError}
                  className={styles.codeInput}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className={styles.generateCodeBtn}
                >
                  {isGeneratingCode ? "Gerando..." : "Gerar Código"}
                </Button>
              </div>
              <Input
                label="Preço"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(event) => updateField("price", event.target.value)}
              />
              <Input
                label="Condomínio"
                type="number"
                placeholder="0"
                value={formData.condo}
                onChange={(event) => updateField("condo", event.target.value)}
              />
              <Input
                label="IPTU"
                type="number"
                placeholder="0"
                value={formData.iptu}
                onChange={(event) => updateField("iptu", event.target.value)}
              />

              <div className={styles.selectRow}>
                <Select
                  label="Categoria"
                  value={formData.category}
                  onChange={(value) => updateField("category", value)}
                  options={categoryOptions}
                />
              </div>

              <div className={styles.dynamicSelectRow}>
                <div className={styles.dynamicSelectGroup}>
                  {isAddingType ? (
                    <div className={styles.typeEditorBox}>
                      <div className={styles.typeBadgeList}>
                        {availableTypes.map((typeItem) => (
                          <span key={typeItem} className={styles.typeBadge}>
                            <span>{typeItem}</span>
                            <button
                              type="button"
                              className={styles.typeBadgeRemoveButton}
                              onClick={() => deleteType(typeItem)}
                              aria-label={`Remover tipo ${typeItem}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className={styles.inlineEditRow}>
                        <Input
                          label="Novo tipo"
                          placeholder="Ex: Cobertura duplex"
                          value={newType}
                          onChange={(event) => setNewType(event.target.value)}
                          className={styles.inlineInput}
                        />
                        <div className={styles.inlineActionGroup}>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={confirmNewType}
                            aria-label="Confirmar novo tipo"
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={() => {
                              setIsAddingType(false);
                              setNewType("");
                            }}
                            aria-label="Cancelar novo tipo"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.selectRow}>
                      <Select
                        label="Tipo"
                        options={typeOptions}
                        value={formData.type}
                        onChange={(value) => updateField("type", value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.inlineAddButton}
                        onClick={() => setIsAddingType(true)}
                        aria-label="Adicionar novo tipo"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "structure" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="Área (m²)"
                icon={Ruler}
                type="number"
                placeholder="0"
                value={formData.area}
                onChange={(event) => updateField("area", event.target.value)}
              />
              <Input
                label="Quartos"
                icon={BedDouble}
                type="number"
                placeholder="0"
                value={formData.bedrooms}
                onChange={(event) =>
                  updateField("bedrooms", event.target.value)
                }
              />
              <Input
                label="Banheiros"
                icon={Bath}
                type="number"
                placeholder="0"
                value={formData.bathrooms}
                onChange={(event) =>
                  updateField("bathrooms", event.target.value)
                }
              />
              <Input
                label="Vagas"
                icon={CarFront}
                type="number"
                placeholder="0"
                value={formData.parkingSpaces}
                onChange={(event) =>
                  updateField("parkingSpaces", event.target.value)
                }
              />
            </div>
          </section>
        ) : null}

        {activeTab === "location" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="CEP"
                placeholder="Apenas números"
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={8}
                error={cepError}
                success={cepSuccess}
              />
              <Input
                label="Logradouro"
                icon={MapPin}
                placeholder="Rua, avenida..."
                value={formData.logradouro}
                onChange={(event) => updateField("logradouro", event.target.value)}
              />
              <Input
                label="Número"
                placeholder="Ex: 123"
                value={formData.numero}
                onChange={(event) => updateField("numero", event.target.value)}
              />
              <Input
                label="Complemento"
                placeholder="Ex: Apto 42"
                value={formData.complemento}
                onChange={(event) => updateField("complemento", event.target.value)}
              />
              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={formData.bairro}
                onChange={(event) =>
                  updateField("bairro", event.target.value)
                }
              />
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                value={formData.cidade}
                onChange={(event) => updateField("cidade", event.target.value)}
              />
              <Input
                label="Estado (UF)"
                placeholder="Ex: SP"
                value={formData.estado}
                onChange={(event) => updateField("estado", event.target.value)}
                maxLength={2}
              />
            </div>

            {fullAddressString && (
              <div className={styles.mapContainer}>
                <h4 className={styles.mapTitle}>Confirme a Localização no Mapa</h4>
                <iframe
                  title="Mapa da Propriedade"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddressString)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className={styles.mapIframe}
                ></iframe>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "features" ? (
          <section className={styles.tabPanel}>
            <div className={styles.featureIntro}>
              <div>
                <p className={styles.featureKicker}>Comodidades</p>
                <h3 className={styles.featureTitle}>
                  Selecione as características do imóvel
                </h3>
              </div>
              <p className={styles.featureDescription}>
                Organize os diferenciais do anúncio e deixe a vitrine mais
                clara.
              </p>
            </div>

            <div className={styles.featureToolbar}>
              <Input
                label="Nova característica"
                placeholder="Ex: Piso aquecido"
                value={newFeature}
                onChange={(event) => setNewFeature(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddFeature();
                  }
                }}
                className={styles.featureToolbarInput}
              />
              <Button
                type="button"
                variant="primary"
                className={styles.featureToolbarButton}
                onClick={handleAddFeature}
              >
                Adicionar
              </Button>
            </div>

            <div className={styles.featureGrid}>
              {availableFeatures.map((featureItem) => (
                <div key={featureItem} className={styles.featureCard}>
                  <label className={styles.featureCheckLabel}>
                    <input
                      type="checkbox"
                      checked={formData.features.includes(featureItem)}
                      onChange={() => toggleFeature(featureItem)}
                    />
                    <span>{featureItem}</span>
                  </label>

                  <button
                    type="button"
                    className={styles.featureDeleteButton}
                    onClick={() => deleteFeature(featureItem)}
                    aria-label={`Remover característica ${featureItem}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "media" ? (
          <section className={styles.tabPanel}>
            <div className={styles.mediaDropzone}>
              <div className={styles.mediaDropzoneIcon} aria-hidden="true">
                <Camera size={34} />
              </div>
              <div className={styles.mediaDropzoneText}>
                <strong>Adicione fotos ou vídeos do imóvel</strong>
                <span>
                  Você pode inserir URLs ou simular a seleção de arquivos com o
                  botão abaixo.
                </span>
              </div>

              <div className={styles.mediaDropzoneActions}>
                <Input
                  label="URL da mídia"
                  icon={ImagePlus}
                  placeholder="Cole a URL da foto"
                  value={newPhotoUrl}
                  onChange={(event) => setNewPhotoUrl(event.target.value)}
                  className={styles.mediaDropzoneInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  className={styles.mediaDropzoneButton}
                  onClick={() => {
                    const value = newPhotoUrl.trim();

                    if (!value) {
                      return;
                    }

                    addPhoto(value);
                    setNewPhotoUrl("");
                  }}
                >
                  Procurar arquivos
                </Button>
              </div>
            </div>

            <div className={styles.galleryShell}>
              <div className={styles.galleryGrid}>
                {formData.photos.filter(Boolean).map((photoUrl, index) => {
                  const isCover = index === coverPhotoIndex;
                  return (
                    <div
                      key={`${photoUrl}-${index}`}
                      className={`${styles.thumbnailCard} ${isCover ? styles.thumbnailCardCover : ""}`}
                    >
                      <img
                        src={photoUrl || undefined}
                        alt={`Mídia ${index + 1} do imóvel`}
                      />

                      <button
                        type="button"
                        className={`${styles.coverStarButton} ${isCover ? styles.coverStarButtonActive : styles.coverStarButtonInactive}`}
                        onClick={() => setCoverPhotoIndex(index)}
                        aria-label={isCover ? "Capa atual" : "Definir como capa"}
                        title="Definir como capa"
                      >
                        <Star size={14} fill={isCover ? "currentColor" : "none"} />
                      </button>

                      {isCover ? (
                        <span className={styles.coverBadge}>Capa</span>
                      ) : null}

                      <button
                        type="button"
                        className={styles.removePhotoButton}
                        onClick={() => removePhoto(index)}
                        aria-label={`Remover mídia ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.videoSection} style={{ marginTop: '2rem' }}>
              <div className={styles.mediaDropzoneText} style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <strong>Adicione Vídeos do YouTube</strong>
                <span style={{ display: 'block', fontSize: '0.85rem' }}>Cole os links do YouTube (ex: youtube.com/watch?v=...) para exibir no carrossel de mídia.</span>
              </div>
              
              <div className={styles.mediaDropzoneActions}>
                <Input
                  label="URL do YouTube"
                  icon={PlaySquare}
                  placeholder="Cole a URL do vídeo"
                  value={newVideoUrl}
                  onChange={(event) => setNewVideoUrl(event.target.value)}
                  className={styles.mediaDropzoneInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  className={styles.mediaDropzoneButton}
                  onClick={() => {
                    addVideo(newVideoUrl);
                    setNewVideoUrl("");
                  }}
                >
                  Adicionar Vídeo
                </Button>
              </div>

              {formData.videos.length > 0 && (
                <div className={styles.galleryShell} style={{ marginTop: '1.5rem', background: 'rgba(20, 20, 60, 0.03)', padding: '1rem', borderRadius: '1rem' }}>
                  <div className={styles.galleryGrid}>
                    {formData.videos.filter(Boolean).map((videoUrl, index) => (
                      <div key={`video-${index}`} className={styles.thumbnailCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#fff', border: '1px solid rgba(20,20,60,0.1)' }}>
                        <span style={{ fontSize: '0.8rem', wordBreak: 'break-all', textAlign: 'center' }}>{videoUrl}</span>
                        <button
                          type="button"
                          className={styles.removePhotoButton}
                          onClick={() => removeVideo(index)}
                          aria-label={`Remover vídeo ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "description" ? (
          <section className={styles.tabPanel}>
            <div className={styles.descriptionGroup} style={{ paddingBottom: '2rem' }}>
              <div className={styles.textareaField}>
                <span className={styles.textareaLabel}>Descrição Completa</span>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                  modules={quillModules}
                  placeholder="Descreva o imóvel com detalhes, diferenciais, posicionamento solar, acabamentos e contexto de uso."
                />
              </div>
            </div>
          </section>
        ) : null}
        </div>

        <footer className={styles.modalFooter}>
          {showCancelConfirm ? (
            <div className={styles.cancelConfirm}>
              <p className={styles.cancelConfirmText}>
                Descartar as alterações feitas?
              </p>
              <div className={styles.cancelConfirmActions}>
                <Button
                  variant="outline"
                  className={styles.modalButton}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Continuar editando
                </Button>
                <Button
                  variant="secondary"
                  className={styles.modalButton}
                  onClick={handleConfirmCancel}
                >
                  Sim, descartar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className={styles.modalButton}
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={styles.modalButton}
                disabled={isSaving || !!codeError}
              >
                {isSaving ? <Loader size={20} /> : <Save size={16} />}
                <span>{isSaving ? "Salvando..." : "Salvar Imóvel"}</span>
              </Button>
            </>
          )}
        </footer>
      </form>
    </Modal>
  );
}
