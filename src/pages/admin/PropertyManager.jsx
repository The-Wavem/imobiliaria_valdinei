import { useEffect, useMemo, useState } from "react";
import PropertyStats from "@sections/admin/properties/PropertyStats/PropertyStats.jsx";
import PropertyFilterBar from "@sections/admin/properties/PropertyFilterBar/PropertyFilterBar.jsx";
import PropertyTable from "@sections/admin/properties/PropertyTable/PropertyTable.jsx";
import PropertyFormModal from "@sections/admin/properties/PropertyFormModal/PropertyFormModal.jsx";
import { buildPropertyDocument, savePropertyDocument } from "@services/AdminCadastro";
import { initialProperties } from "../../data/admin/propertiesSeed.js";

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
  photos: [],
  features: [],
  summary: "",
  description: "",
};

const PROPERTIES_STORAGE_KEY = "@valdinei:properties";

function readStoredProperties() {
  if (typeof window === "undefined") {
    return initialProperties;
  }

  try {
    const rawValue = window.localStorage.getItem(PROPERTIES_STORAGE_KEY);

    if (!rawValue) {
      return initialProperties;
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : initialProperties;
  } catch {
    return initialProperties;
  }
}

function createPropertyCode(nextId) {
  return `IV-${String(nextId).padStart(4, "0")}`;
}

function normalizeForm(property = emptyForm) {
  return {
    ...emptyForm,
    ...property,
    price:
      property.price !== undefined && property.price !== null
        ? String(property.price)
        : "",
    condo:
      property.condo !== undefined && property.condo !== null
        ? String(property.condo)
        : "",
    iptu:
      property.iptu !== undefined && property.iptu !== null
        ? String(property.iptu)
        : "",
    area:
      property.area !== undefined && property.area !== null
        ? String(property.area)
        : "",
    bedrooms:
      property.bedrooms !== undefined && property.bedrooms !== null
        ? String(property.bedrooms)
        : "",
    bathrooms:
      property.bathrooms !== undefined && property.bathrooms !== null
        ? String(property.bathrooms)
        : "",
    parkingSpaces:
      property.parkingSpaces !== undefined && property.parkingSpaces !== null
        ? String(property.parkingSpaces)
        : "",
    photos: property.photos || (property.imageUrl ? [property.imageUrl] : []),
    features: property.features || [],
    summary: property.summary || "",
    description: property.description || "",
  };
}

export default function PropertyManager() {
  const [properties, setProperties] = useState(() => readStoredProperties());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    window.dispatchEvent(new CustomEvent("valdinei:analytics-update", { detail: { type: "properties" } }));
  }, [properties]);

  const totalProperties = properties.length;
  const ativos = useMemo(() => properties.filter((property) => property.active).length, [properties]);
  const inativos = totalProperties - ativos;

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch = normalizedSearch
        ? [
            property.title,
            property.code,
            property.type,
            property.category,
            property.address,
            property.neighborhood,
          ]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(normalizedSearch))
        : true;

      const matchesStatus =
        filterStatus === "Todos"
          ? true
          : filterStatus === "Ativos"
            ? property.active
            : !property.active;

      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, properties, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const visibleProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData(normalizeForm(emptyForm));
    setCurrentPage(1);
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    setModalMode("edit");
    setEditingId(property.id);
    setFormData(normalizeForm(property));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode("create");
    setEditingId(null);
    setFormData(normalizeForm(emptyForm));
  };

  const handleStatusToggle = (propertyId) => {
    setProperties((currentValue) =>
      currentValue.map((property) =>
        property.id === propertyId
          ? { ...property, active: !property.active }
          : property,
      ),
    );
  };

  const handleDelete = (propertyId) => {
    const propertyToDelete = properties.find(
      (property) => property.id === propertyId,
    );
    const confirmed = window.confirm(
      propertyToDelete
        ? `Excluir o imóvel ${propertyToDelete.code} - ${propertyToDelete.title}?`
        : "Excluir este imóvel?",
    );

    if (!confirmed) {
      return;
    }

    setProperties((currentValue) =>
      currentValue.filter((property) => property.id !== propertyId),
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    const nextId =
      properties.reduce(
        (highestId, property) => Math.max(highestId, property.id),
        0,
      ) + 1;
    const propertyId =
      modalMode === "edit" && editingId ? editingId : nextId;
    const payload = {
      id: propertyId,
      title: formData.title.trim(),
      code: formData.code.trim() || createPropertyCode(propertyId),
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
      thumbnail: formData.photos[0] || formData.imageUrl.trim() || "",
      photos: formData.photos,
      features: formData.features,
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      active:
        modalMode === "edit"
          ? properties.find((property) => property.id === editingId)?.active ?? true
          : true,
    };

    const existingProperty =
      modalMode === "edit"
        ? properties.find((property) => property.id === editingId)
        : null;

    try {
      const documentPayload = buildPropertyDocument(payload, {
        propertyId,
        active: existingProperty?.active ?? true,
        existingProperty,
      });

      if (modalMode === "create" || existingProperty?.firestoreId) {
        const savedDocument = await savePropertyDocument(payload, {
          propertyId,
          active: existingProperty?.active ?? true,
          firestoreId: existingProperty?.firestoreId,
        });

        payload.firestoreId = savedDocument.id;
      }

      setProperties((currentValue) => {
        if (modalMode === "edit") {
          return currentValue.map((property) =>
            property.id === editingId
              ? {
                  ...property,
                  ...payload,
                  structuredDocument: documentPayload,
                  firestoreId: property.firestoreId || payload.firestoreId,
                  active: property.active,
                }
              : property,
          );
        }

        return [
          {
            ...payload,
            structuredDocument: documentPayload,
          },
          ...currentValue,
        ];
      });

        setIsModalOpen(false);
        setModalMode("create");
        setEditingId(null);
        setFormData(normalizeForm(emptyForm));

        if (modalMode === "create") {
          setCurrentPage(1);
        }
    } catch (error) {
      console.error("Falha ao salvar o imóvel no banco:", error);

      setProperties((currentValue) => {
        if (modalMode === "edit") {
          return currentValue.map((property) =>
            property.id === editingId
              ? { ...property, ...payload, active: property.active }
              : property,
          );
        }

        return [{ ...payload }, ...currentValue];
      });

      setIsModalOpen(false);
      setModalMode("create");
      setEditingId(null);
      setFormData(normalizeForm(emptyForm));
    }
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Imóveis</h1>

      <PropertyStats total={totalProperties} ativos={ativos} inativos={inativos} />

      <PropertyFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusFilterChange}
        onAddClick={openCreateModal}
      />

      <PropertyTable
        properties={visibleProperties}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleStatus={handleStatusToggle}
      />

      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSubmit}
        mode={modalMode}
      />
    </main>
  );
}
