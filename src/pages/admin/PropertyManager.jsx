import { useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  Check,
  X,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  Ruler,
  Save,
  SquareCheckBig,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CarFront,
} from "lucide-react";
import AdminSidebar from "@components/layout/AdminSidebar";
import Button from "@components/ui/Button/Button.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./PropertyManager.module.css";

const tabOptions = [
  { id: "basic", label: "Básico" },
  { id: "location", label: "Localização" },
  { id: "features", label: "Características & Mídias" },
];

const initialProperties = [
  {
    id: 1,
    title: "Casa térrea com piscina",
    code: "IV-1024",
    category: "Comprar",
    type: "Casa",
    price: 980000,
    condo: 420,
    iptu: 180,
    address: "Rua das Acácias, 120",
    neighborhood: "Centro",
    area: 168,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    active: true,
    thumbnail:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=320&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Piscina", "Churrasqueira", "Ar-condicionado"],
  },
  {
    id: 2,
    title: "Apartamento mobiliado no centro",
    code: "IV-1041",
    category: "Alugar",
    type: "Apartamento",
    price: 3500,
    condo: 650,
    iptu: 95,
    address: "Av. Presidente Vargas, 900",
    neighborhood: "Jardins",
    area: 84,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    active: true,
    thumbnail:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=320&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Mobiliado", "Elevador", "Portaria 24h"],
  },
  {
    id: 3,
    title: "Sobrado comercial com vitrine",
    code: "IV-1078",
    category: "Comprar",
    type: "Comercial",
    price: 1250000,
    condo: 0,
    iptu: 320,
    address: "Rua Quinze de Novembro, 58",
    neighborhood: "Avenida Central",
    area: 210,
    bedrooms: 0,
    bathrooms: 3,
    parkingSpaces: 4,
    active: false,
    thumbnail:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=320&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Portaria 24h", "Varanda gourmet"],
  },
  {
    id: 4,
    title: "Cobertura com terraço panorâmico",
    code: "IV-1103",
    category: "Alugar",
    type: "Cobertura",
    price: 7800,
    condo: 1180,
    iptu: 240,
    address: "Rua do Lago, 44",
    neighborhood: "Alphaville",
    area: 176,
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    active: true,
    thumbnail:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=320&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Academia", "Piscina", "Elevador", "Pet friendly"],
  },
];

const emptyForm = {
  title: "",
  code: "",
  category: "",
  type: "",
  price: "",
  condo: "",
  iptu: "",
  address: "",
  neighborhood: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  imageUrl: "",
  amenities: [],
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function createPropertyCode(nextId) {
  return `IV-${String(nextId).padStart(4, "0")}`;
}

function normalizeForm(property = emptyForm) {
  return {
    ...emptyForm,
    ...property,
    price: property.price !== undefined && property.price !== null ? String(property.price) : "",
    condo: property.condo !== undefined && property.condo !== null ? String(property.condo) : "",
    iptu: property.iptu !== undefined && property.iptu !== null ? String(property.iptu) : "",
    area: property.area !== undefined && property.area !== null ? String(property.area) : "",
    bedrooms: property.bedrooms !== undefined && property.bedrooms !== null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms !== undefined && property.bathrooms !== null ? String(property.bathrooms) : "",
    parkingSpaces:
      property.parkingSpaces !== undefined && property.parkingSpaces !== null
        ? String(property.parkingSpaces)
        : "",
    amenities: property.amenities || [],
  };
}

export default function PropertyManager() {
  const [properties, setProperties] = useState(initialProperties);
  const [categories, setCategories] = useState(["Alugar", "Comprar"]);
  const [types, setTypes] = useState(["Casa", "Apartamento", "Comercial", "Cobertura"]);
  const [features, setFeatures] = useState([
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
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeTab, setActiveTab] = useState("basic");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const categoryOptions = useMemo(
    () => [{ label: "Selecione", value: "" }, ...categories.map((item) => ({ label: item, value: item }))],
    [categories],
  );

  const typeOptions = useMemo(
    () => [{ label: "Selecione", value: "" }, ...types.map((item) => ({ label: item, value: item }))],
    [types],
  );

  const metrics = useMemo(() => {
    const activeCount = properties.filter((property) => property.active).length;
    const rentCount = properties.filter((property) => property.category === "Alugar").length;
    const buyCount = properties.filter((property) => property.category === "Comprar").length;

    return [
      { label: "Imóveis ativos", value: activeCount, hint: "Publicados na vitrine" },
      { label: "Para alugar", value: rentCount, hint: "Carteira de locação" },
      { label: "Para vender", value: buyCount, hint: "Carteira de venda" },
    ];
  }, [properties]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData(normalizeForm(emptyForm));
    setActiveTab("basic");
    setIsAddingCategory(false);
    setIsAddingType(false);
    setNewCategory("");
    setNewType("");
    setNewFeature("");
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    setModalMode("edit");
    setEditingId(property.id);
    setFormData(
      normalizeForm({
        ...property,
        category: property.category,
      }),
    );
    setActiveTab("basic");
    setIsAddingCategory(false);
    setIsAddingType(false);
    setNewCategory("");
    setNewType("");
    setNewFeature("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const startAddingCategory = () => {
    setIsAddingType(false);
    setNewType("");
    setIsAddingCategory(true);
    setNewCategory("");
  };

  const startAddingType = () => {
    setIsAddingCategory(false);
    setNewCategory("");
    setIsAddingType(true);
    setNewType("");
  };

  const cancelAddingCategory = () => {
    setIsAddingCategory(false);
    setNewCategory("");
  };

  const cancelAddingType = () => {
    setIsAddingType(false);
    setNewType("");
  };

  const confirmNewCategory = () => {
    const value = newCategory.trim();

    if (!value) {
      return;
    }

    setCategories((currentValue) =>
      currentValue.includes(value) ? currentValue : [...currentValue, value],
    );
    setFormData((currentValue) => ({
      ...currentValue,
      category: value,
    }));
    setIsAddingCategory(false);
    setNewCategory("");
  };

  const confirmNewType = () => {
    const value = newType.trim();

    if (!value) {
      return;
    }

    setTypes((currentValue) => (currentValue.includes(value) ? currentValue : [...currentValue, value]));
    setFormData((currentValue) => ({
      ...currentValue,
      type: value,
    }));
    setIsAddingType(false);
    setNewType("");
  };

  const toggleAmenity = (amenity) => {
    setFormData((currentValue) => {
      const selected = currentValue.amenities.includes(amenity)
        ? currentValue.amenities.filter((item) => item !== amenity)
        : [...currentValue.amenities, amenity];

      return {
        ...currentValue,
        amenities: selected,
      };
    });
  };

  const handleStatusToggle = (propertyId) => {
    setProperties((currentValue) =>
      currentValue.map((property) =>
        property.id === propertyId ? { ...property, active: !property.active } : property,
      ),
    );
  };

  const handleDelete = (propertyId) => {
    const propertyToDelete = properties.find((property) => property.id === propertyId);
    const confirmed = window.confirm(
      propertyToDelete
        ? `Excluir o imóvel ${propertyToDelete.code} - ${propertyToDelete.title}?`
        : "Excluir este imóvel?",
    );

    if (!confirmed) {
      return;
    }

    setProperties((currentValue) => currentValue.filter((property) => property.id !== propertyId));
  };

  const handleSubmit = () => {
    const nextId = properties.reduce((highestId, property) => Math.max(highestId, property.id), 0) + 1;
    const payload = {
      id: modalMode === "edit" && editingId ? editingId : nextId,
      title: formData.title.trim(),
      code: formData.code.trim() || createPropertyCode(modalMode === "edit" && editingId ? editingId : nextId),
      category: formData.category,
      type: formData.type.trim() || "Imóvel",
      price: Number(formData.price || 0),
      condo: Number(formData.condo || 0),
      iptu: Number(formData.iptu || 0),
      address: formData.address.trim(),
      neighborhood: formData.neighborhood.trim(),
      area: Number(formData.area || 0),
      bedrooms: Number(formData.bedrooms || 0),
      bathrooms: Number(formData.bathrooms || 0),
      parkingSpaces: Number(formData.parkingSpaces || 0),
      imageUrl: formData.imageUrl.trim(),
      thumbnail: formData.imageUrl.trim() || "",
      amenities: formData.amenities,
      active: true,
    };

    setProperties((currentValue) => {
      if (modalMode === "edit") {
        return currentValue.map((property) =>
          property.id === editingId ? { ...property, ...payload, active: property.active } : property,
        );
      }

      return [{ ...payload }, ...currentValue];
    });

    setIsModalOpen(false);
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Gerenciamento de imóveis</p>
              <h1 className={styles.title}>Lista premium e cadastro rápido</h1>
              <p className={styles.subtitle}>
                Gerencie o estoque com uma visão clara de publicação, tipo, preço e status de vitrine.
              </p>
            </div>

            <Button variant="primary" className={styles.addButton} onClick={openCreateModal}>
              <Plus size={18} />
              <span>Adicionar Novo Imóvel</span>
            </Button>
          </header>

          <section className={styles.metricsBar} aria-label="Micro-métricas do estoque">
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <span className={styles.metricValue}>{metric.value}</span>
                <div>
                  <h2 className={styles.metricLabel}>{metric.label}</h2>
                  <p className={styles.metricHint}>{metric.hint}</p>
                </div>
              </article>
            ))}
          </section>

          <section className={styles.tableCard} aria-label="Tabela de imóveis cadastrados">
            <div className={styles.tableHeadBar}>
              <div>
                <p className={styles.tableKicker}>Cadastro e controle</p>
                <h2 className={styles.tableTitle}>Imóveis cadastrados</h2>
              </div>
              <p className={styles.tableMeta}>{properties.length} itens na lista</p>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Título / Código</th>
                    <th>Tipo / Categoria</th>
                    <th>Preço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <div className={styles.thumbnail}>
                          <img src={property.thumbnail} alt={property.title} />
                        </div>
                      </td>
                      <td>
                        <div className={styles.propertyIdentity}>
                          <strong>{property.title}</strong>
                          <span>{property.code}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.propertyMeta}>
                          <span>{property.type}</span>
                          <small>{property.category}</small>
                        </div>
                      </td>
                      <td>
                        <div className={styles.priceCell}>{formatCurrency(property.price)}</div>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Button
                            variant="outline"
                            className={styles.iconActionButton}
                            onClick={() => openEditModal(property)}
                            aria-label={`Editar ${property.title}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </Button>

                          <Button
                            variant="secondary"
                            className={styles.iconActionButton}
                            onClick={() => handleDelete(property.id)}
                            aria-label={`Excluir ${property.title}`}
                          >
                            <Trash2 size={16} />
                            <span>Excluir</span>
                          </Button>

                          <Button
                            variant={property.active ? "primary" : "secondary"}
                            className={`${styles.iconActionButton} ${property.active ? styles.statusActive : styles.statusInactive}`.trim()}
                            onClick={() => handleStatusToggle(property.id)}
                            aria-label={`${property.active ? "Desativar" : "Ativar"} ${property.title}`}
                          >
                            {property.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            <span>{property.active ? "Ativo" : "Inativo"}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Adicionar imóvel" : "Editar imóvel"}
      >
        <div className={styles.modalContent}>
          <nav className={styles.tabs} aria-label="Navegação das abas do formulário">
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
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                />

                <Input
                  label="Código"
                  placeholder="Ex: IV-1204"
                  value={formData.code}
                  onChange={(event) => handleFieldChange("code", event.target.value)}
                />

                <Input
                  label="Preço"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(event) => handleFieldChange("price", event.target.value)}
                />

                <Input
                  label="Condomínio"
                  type="number"
                  placeholder="0"
                  value={formData.condo}
                  onChange={(event) => handleFieldChange("condo", event.target.value)}
                />

                <Input
                  label="IPTU"
                  type="number"
                  placeholder="0"
                  value={formData.iptu}
                  onChange={(event) => handleFieldChange("iptu", event.target.value)}
                />

                <div className={styles.dynamicSelectRow}>
                  <div className={styles.dynamicSelectGroup}>
                    {isAddingType ? (
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
                            onClick={cancelAddingType}
                            aria-label="Cancelar novo tipo"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.selectRow}>
                        <Select
                          label="Tipo"
                          options={typeOptions}
                          value={formData.type}
                          onChange={(value) => handleFieldChange("type", value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className={styles.inlineAddButton}
                          onClick={startAddingType}
                          aria-label="Adicionar novo tipo"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className={styles.dynamicSelectGroup}>
                    {isAddingCategory ? (
                      <div className={styles.inlineEditRow}>
                        <Input
                          label="Nova categoria"
                          placeholder="Ex: Lançamento"
                          value={newCategory}
                          onChange={(event) => setNewCategory(event.target.value)}
                          className={styles.inlineInput}
                        />
                        <div className={styles.inlineActionGroup}>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={confirmNewCategory}
                            aria-label="Confirmar nova categoria"
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.inlineIconButton}
                            onClick={cancelAddingCategory}
                            aria-label="Cancelar nova categoria"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.selectRow}>
                        <Select
                          label="Categoria"
                          options={categoryOptions}
                          value={formData.category}
                          onChange={(value) => handleFieldChange("category", value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className={styles.inlineAddButton}
                          onClick={startAddingCategory}
                          aria-label="Adicionar nova categoria"
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
                  onChange={(event) => handleFieldChange("address", event.target.value)}
                />

                <Input
                  label="Bairro"
                  placeholder="Nome do bairro"
                  value={formData.neighborhood}
                  onChange={(event) => handleFieldChange("neighborhood", event.target.value)}
                />

                <Input
                  label="Área (m²)"
                  icon={Ruler}
                  type="number"
                  placeholder="0"
                  value={formData.area}
                  onChange={(event) => handleFieldChange("area", event.target.value)}
                />

                <Input
                  label="Quartos"
                  icon={BedDouble}
                  type="number"
                  placeholder="0"
                  value={formData.bedrooms}
                  onChange={(event) => handleFieldChange("bedrooms", event.target.value)}
                />

                <Input
                  label="Banheiros"
                  icon={Bath}
                  type="number"
                  placeholder="0"
                  value={formData.bathrooms}
                  onChange={(event) => handleFieldChange("bathrooms", event.target.value)}
                />

                <Input
                  label="Vagas"
                  icon={CarFront}
                  type="number"
                  placeholder="0"
                  value={formData.parkingSpaces}
                  onChange={(event) => handleFieldChange("parkingSpaces", event.target.value)}
                />
              </div>
            </section>
          ) : null}

          {activeTab === "features" ? (
            <section className={styles.tabPanel}>
              <div className={styles.featureIntro}>
                <div>
                  <p className={styles.featureKicker}>Comodidades</p>
                  <h3 className={styles.featureTitle}>Selecione as características do imóvel</h3>
                </div>
                <p className={styles.featureDescription}>
                  Organize os diferenciais e adicione a mídia principal para a vitrine pública.
                </p>
              </div>

              <div className={styles.featureToolbar}>
                <Input
                  label="Nova característica"
                  placeholder="Ex: Piso Aquecido"
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

                    setFeatures((currentValue) =>
                      currentValue.includes(value) ? currentValue : [...currentValue, value],
                    );

                    setFormData((currentValue) => ({
                      ...currentValue,
                      amenities: currentValue.amenities.includes(value)
                        ? currentValue.amenities
                        : [...currentValue.amenities, value],
                    }));

                    setNewFeature("");
                  }}
                >
                  Adicionar
                </Button>
              </div>

              <div className={styles.checkboxGrid}>
                {features.map((amenity) => (
                  <label key={amenity} className={styles.checkboxCard}>
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>

              <div className={styles.mediaField}>
                <Input
                  label="URL da imagem principal"
                  icon={ImagePlus}
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
                />
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <SquareCheckBig size={18} />
                  <span>Resumo do cadastro</span>
                </div>
                <div className={styles.previewGrid}>
                  <div>
                    <strong>{formData.title || "Título do imóvel"}</strong>
                    <span>{formData.code || "Código automático"}</span>
                  </div>
                  <div>
                    <strong>{formData.category === "rent" ? "Alugar" : formData.category === "buy" ? "Comprar" : "Categoria"}</strong>
                    <span>{formData.type || "Tipo do imóvel"}</span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <footer className={styles.modalFooter}>
            <Button variant="outline" className={styles.modalButton} onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" className={styles.modalButton} onClick={handleSubmit}>
              <Save size={16} />
              <span>Salvar Imóvel</span>
            </Button>
          </footer>
        </div>
      </Modal>
    </div>
  );
}