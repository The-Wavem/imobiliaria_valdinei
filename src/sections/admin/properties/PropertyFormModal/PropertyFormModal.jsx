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
  Trash2,
  X,
  CarFront,
} from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import styles from "./PropertyFormModal.module.css";

const tabOptions = [
  { id: "basic", label: "Básico" },
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

export default function PropertyFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  mode = "create",
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [availableTypes, setAvailableTypes] = useState(baseTypes);
  const [availableFeatures, setAvailableFeatures] = useState(baseFeatures);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
    setIsSaving(false);

    if (formData?.type) {
      setAvailableTypes((currentValue) =>
        currentValue.includes(formData.type)
          ? currentValue
          : [...currentValue, formData.type],
      );
    }

    if (Array.isArray(formData?.features)) {
      setAvailableFeatures((currentValue) => {
        const nextValues = [...currentValue];

        formData.features.forEach((feature) => {
          if (!nextValues.includes(feature)) {
            nextValues.push(feature);
          }
        });

        return nextValues;
      });
    }
  }, [formData?.features, formData?.type, isOpen]);

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
      formData.address.trim() !== "" ||
      formData.photos.length > 0 ||
      formData.features.length > 0
    );
  }, [formData]);

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
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Editar imóvel" : "Adicionar imóvel"}
      variant="admin"
    >
      <div className={styles.modalContent}>
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

        {activeTab === "basic" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="Título"
                placeholder="Ex: Casa térrea com piscina"
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
              <Input
                label="Código"
                placeholder="Ex: IV-1204"
                value={formData.code}
                onChange={(event) => updateField("code", event.target.value)}
              />
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

              <div className={styles.dynamicSelectRow}>
                <div className={styles.dynamicSelectGroup}>
                  <Select
                    label="Categoria"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => updateField("category", value)}
                  />
                </div>

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

        {activeTab === "location" ? (
          <section className={styles.tabPanel}>
            <div className={styles.formGrid}>
              <Input
                label="Endereço"
                icon={MapPin}
                placeholder="Rua, avenida, número"
                value={formData.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={formData.neighborhood}
                onChange={(event) =>
                  updateField("neighborhood", event.target.value)
                }
              />
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
                className={styles.featureToolbarInput}
              />
              <Button
                type="button"
                variant="primary"
                className={styles.featureToolbarButton}
                onClick={() => {
                  const value = newFeature.trim();

                  if (!value) {
                    return;
                  }

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
                }}
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
                {formData.photos.filter(Boolean).map((photoUrl, index) => (
                  <div
                    key={`${photoUrl}-${index}`}
                    className={styles.thumbnailCard}
                  >
                    <img
                      src={photoUrl || undefined}
                      alt={`Mídia ${index + 1} do imóvel`}
                    />

                    {index === 0 ? (
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
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "description" ? (
          <section className={styles.tabPanel}>
            <div className={styles.descriptionGroup}>
              <Input
                label="Resumo Rápido"
                placeholder="Ex: Lindo sobrado triplex com sol da manhã"
                value={formData.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />

              <label className={styles.textareaField}>
                <span className={styles.textareaLabel}>Descrição Completa</span>
                <textarea
                  className={styles.textareaControl}
                  placeholder="Descreva o imóvel com detalhes, diferenciais, posicionamento solar, acabamentos e contexto de uso."
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        ) : null}

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
                variant="outline"
                className={styles.modalButton}
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className={styles.modalButton}
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? <Loader size={20} /> : <Save size={16} />}
                <span>{isSaving ? "Salvando..." : "Salvar Imóvel"}</span>
              </Button>
            </>
          )}
        </footer>
      </div>
    </Modal>
  );
}
