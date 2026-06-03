import { useEffect, useMemo, useState } from "react";
import PropertyStats from "@sections/admin/properties/PropertyStats/PropertyStats.jsx";
import PropertyFilterBar from "@sections/admin/properties/PropertyFilterBar/PropertyFilterBar.jsx";
import PropertyTable from "@sections/admin/properties/PropertyTable/PropertyTable.jsx";
import PropertyFormModal from "@sections/admin/properties/PropertyFormModal/PropertyFormModal.jsx";
import { addProperty, updateProperty, getAllProperties, deleteProperty, togglePropertyStatus } from "@services/propertyService.js";

export default function PropertyManager() {
  const [properties, setProperties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [editingProperty, setEditingProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalProperties = properties.length;
  const ativos = useMemo(
    () => properties.filter((property) => property.active).length,
    [properties],
  );
  const inativos = totalProperties - ativos;

  const loadProperties = async () => {
    setIsLoading(true);
    const data = await getAllProperties();
    setProperties(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleOpenModal = (property = null) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProperty(null);
    setIsModalOpen(false);
    loadProperties(); // Recarrega a tabela após fechar/salvar o modal
  };

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
            .some((field) =>
              String(field).toLowerCase().includes(normalizedSearch),
            )
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const visibleProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const openCreateModal = () => {
    handleOpenModal(null);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Ativo" ? "Inativo" : "Ativo";
    
    // Agora usamos a função cirúrgica em vez da atualização completa!
    await togglePropertyStatus(id, newStatus);
    
    loadProperties();
  };

  const handleDeleteProperty = async (propertyId) => {
    const propertyToDelete = properties.find(
      (property) => property.id === propertyId || property.firestoreId === propertyId,
    );
    
    const titleOrCode = propertyToDelete ? `${propertyToDelete.code} - ${propertyToDelete.title}` : "este imóvel";
    const confirmed = window.confirm(`Tem certeza que deseja excluir o imóvel ${titleOrCode}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      loadProperties();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Falha ao excluir o imóvel. Tente novamente.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleSaveProperty = async (formData) => {
    if (editingProperty) {
      await updateProperty(editingProperty.firestoreId || editingProperty.id, formData);
    } else {
      await addProperty(formData);
    }
    handleCloseModal();
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Imóveis</h1>

      <PropertyStats
        total={totalProperties}
        ativos={ativos}
        inativos={inativos}
      />

      <PropertyFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusFilterChange}
        onAddClick={openCreateModal}
      />

      <PropertyTable
        properties={properties}
        isLoading={isLoading}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleOpenModal}
        onDelete={handleDeleteProperty}
        onToggleStatus={handleToggleStatus}
        onRefresh={loadProperties}
      />

      {isModalOpen && (
        <PropertyFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          property={editingProperty}
          onSave={handleSaveProperty}
        />
      )}
    </main>
  );
}
