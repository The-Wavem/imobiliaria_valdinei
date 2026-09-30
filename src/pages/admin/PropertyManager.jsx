import { useEffect, useMemo, useState } from "react";
import PropertyStats from "@sections/admin/properties/PropertyStats/PropertyStats.jsx";
import PropertyFilterBar from "@sections/admin/properties/PropertyFilterBar/PropertyFilterBar.jsx";
import PropertyTable from "@sections/admin/properties/PropertyTable/PropertyTable.jsx";
import PropertyFormModal from "@sections/admin/properties/PropertyFormModal/PropertyFormModal.jsx";
import ConfirmDialog from "@components/ui/ConfirmDialog/ConfirmDialog.jsx";
import { 
  addProperty, 
  updateProperty, 
  getAllProperties, 
  moveToTrash, 
  restoreFromTrash, 
  deletePropertyPermanently, 
  emptyTrash, 
  togglePropertyStatus, 
  togglePropertyFeatured 
} from "@services/propertyService.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export default function PropertyManager() {
  useDocumentTitle('Gerenciar Imóveis');
  const [properties, setProperties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [editingProperty, setEditingProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Modais de Confirmação
  const [confirmTrash, setConfirmTrash] = useState({ isOpen: false, propertyId: null, status: null });
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState({ isOpen: false, propertyId: null, title: "" });
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  const statsCounts = useMemo(() => {
    const counts = { total: 0, disponiveis: 0, reservados: 0, vendidos: 0, alugados: 0, inativos: 0, lixeira: 0 };
    properties.forEach((p) => {
      const st = p.status;
      if (st === 'Lixeira') {
        counts.lixeira++;
      } else {
        counts.total++;
        if (st === 'Disponível' || !st) counts.disponiveis++;
        else if (st === 'Reservado') counts.reservados++;
        else if (st === 'Vendido') counts.vendidos++;
        else if (st === 'Alugado') counts.alugados++;
        else if (st === 'Inativo') counts.inativos++;
        else counts.inativos++;
      }
    });
    return counts;
  }, [properties]);

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
    loadProperties();
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

      // Se o filtro selecionado for Lixeira, mostra APENAS os itens da Lixeira
      if (filterStatus === "Lixeira") {
        return matchesSearch && property.status === "Lixeira";
      }

      // Para as demais abas ("Todos", "Disponível", etc.), OCULTA os itens da Lixeira
      if (property.status === "Lixeira") {
        return false;
      }

      const matchesStatus =
        filterStatus === "Todos"
          ? true
          : property.status === filterStatus;

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

  const handleToggleStatus = async (id, newStatus) => {
    await togglePropertyStatus(id, newStatus);
    loadProperties();
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    await togglePropertyFeatured(id, !currentFeatured);
    loadProperties();
  };

  // 1. Mover para a Lixeira
  const handleMoveToTrashRequest = (id, currentStatus) => {
    setConfirmTrash({ isOpen: true, propertyId: id, status: currentStatus });
  };

  const confirmMoveToTrashAction = async () => {
    if (confirmTrash.propertyId) {
      try {
        await moveToTrash(confirmTrash.propertyId, confirmTrash.status);
        setConfirmTrash({ isOpen: false, propertyId: null, status: null });
        loadProperties();
      } catch (error) {
        console.error("Erro ao mover para a lixeira:", error);
        alert("Falha ao mover imóvel para a lixeira.");
      }
    }
  };

  // 2. Restaurar da Lixeira
  const handleRestoreProperty = async (property) => {
    try {
      await restoreFromTrash(property.firestoreId || property.id, property.previousStatus);
      loadProperties();
    } catch (error) {
      console.error("Erro ao restaurar imóvel:", error);
      alert("Falha ao restaurar imóvel.");
    }
  };

  // 3. Exclusão Permanente
  const handlePermanentDeleteRequest = (property) => {
    setConfirmPermanentDelete({
      isOpen: true,
      propertyId: property.firestoreId || property.id,
      title: property.title || "este imóvel"
    });
  };

  const confirmPermanentDeleteAction = async () => {
    if (confirmPermanentDelete.propertyId) {
      try {
        await deletePropertyPermanently(confirmPermanentDelete.propertyId);
        setConfirmPermanentDelete({ isOpen: false, propertyId: null, title: "" });
        loadProperties();
      } catch (error) {
        console.error("Erro ao excluir permanentemente:", error);
        alert("Falha ao excluir o imóvel definitivamente.");
      }
    }
  };

  // 4. Esvaziar Lixeira
  const handleEmptyTrashRequest = () => {
    setConfirmEmptyTrash(true);
  };

  const confirmEmptyTrashAction = async () => {
    try {
      await emptyTrash(properties);
      setConfirmEmptyTrash(false);
      loadProperties();
    } catch (error) {
      console.error("Erro ao esvaziar a lixeira:", error);
      alert("Falha ao esvaziar a lixeira.");
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

  const isTrashView = filterStatus === "Lixeira";

  return (
    <main className="admin-container">
      <h1 className="admin-title">Imóveis</h1>

      <PropertyStats 
        {...statsCounts} 
        activeFilter={filterStatus}
        onStatClick={handleStatusFilterChange}
      />

      <PropertyFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusFilterChange}
        onAddClick={openCreateModal}
      />

      <PropertyTable
        properties={visibleProperties}
        isLoading={isLoading}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleOpenModal}
        onDelete={handleMoveToTrashRequest}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
        isTrashView={isTrashView}
        onRestore={handleRestoreProperty}
        onPermanentDelete={handlePermanentDeleteRequest}
        onEmptyTrash={handleEmptyTrashRequest}
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

      {/* Modal 1: Mover para Lixeira */}
      <ConfirmDialog
        isOpen={confirmTrash.isOpen}
        onClose={() => setConfirmTrash({ isOpen: false, propertyId: null, status: null })}
        onConfirm={confirmMoveToTrashAction}
        title="Mover para a Lixeira"
        message="O imóvel será movido para a Lixeira e ficará oculto do site público. Ele será mantido por 7 dias, podendo ser restaurado a qualquer momento antes da exclusão automática."
        confirmText="Sim, mover para lixeira"
        cancelText="Cancelar"
      />

      {/* Modal 2: Exclusão Permanente */}
      <ConfirmDialog
        isOpen={confirmPermanentDelete.isOpen}
        onClose={() => setConfirmPermanentDelete({ isOpen: false, propertyId: null, title: "" })}
        onConfirm={confirmPermanentDeleteAction}
        title="Excluir Definitivamente"
        message={`Tem certeza que deseja apagar "${confirmPermanentDelete.title}" do banco de dados? Esta ação é irreversível e o imóvel não poderá ser recuperado.`}
        confirmText="Sim, apagar de vez"
        cancelText="Cancelar"
      />

      {/* Modal 3: Esvaziar Lixeira */}
      <ConfirmDialog
        isOpen={confirmEmptyTrash}
        onClose={() => setConfirmEmptyTrash(false)}
        onConfirm={confirmEmptyTrashAction}
        title="Esvaziar Lixeira"
        message="Tem certeza que deseja apagar PERMANENTEMENTE todos os imóveis que estão na lixeira? Todos os dados serão excluídos definitivamente."
        confirmText="Sim, esvaziar lixeira"
        cancelText="Cancelar"
      />
    </main>
  );
}
