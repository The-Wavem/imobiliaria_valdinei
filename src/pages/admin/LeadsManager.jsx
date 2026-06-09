import { useEffect, useMemo, useState } from "react";
import LeadsStats from "@sections/admin/leads/LeadsStats/LeadsStats.jsx";
import LeadsFilterBar from "@sections/admin/leads/LeadsFilterBar/LeadsFilterBar.jsx";
import LeadsTable from "@sections/admin/leads/LeadsTable/LeadsTable.jsx";
import LeadDetailsModal from "@sections/admin/leads/LeadDetailsModal/LeadDetailsModal.jsx";
import { getAllLeads } from "@services/leadService.js";

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterType, setFilterType] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      try {
        const data = await getAllLeads();
        setLeads(data);
      } catch (error) {
        console.error("Erro ao carregar leads:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeads();
  }, []);

  const totalNovos = useMemo(
    () => leads.filter((lead) => lead.status === "Novo").length,
    [leads],
  );

  const totalAtendimento = useMemo(
    () =>
      leads.filter((lead) =>
        ["Em Atendimento", "Agendado"].includes(lead.status),
      ).length,
    [leads],
  );

  const totalFinalizadas = useMemo(
    () => leads.filter((lead) => lead.status === "Finalizado").length,
    [leads],
  );

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...leads].filter((lead) => {
      const name = lead.name || lead.client?.name || "";
      const property = lead.propertyTitle || lead.client?.property || "";
      const matchesSearch = normalizedSearch
        ? name.toLowerCase().includes(normalizedSearch) || property.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesStatus =
        filterStatus === "Todos" || lead.status === filterStatus;
      
      const type = lead.source || lead.requestType || "";
      const matchesType =
        filterType === "Todos" || type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [filterStatus, filterType, leads, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedLeads = filteredLeads.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const openDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = (requestId, nextStatus) => {
    // Atualiza apenas localmente para ser reativo. No mundo real, aqui chamaria um updateLeadStatus no backend
    setLeads((currentValue) =>
      currentValue.map((lead) =>
        lead.id === requestId ? { ...lead, status: nextStatus } : lead,
      ),
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (nextStatus) => {
    setFilterStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (nextType) => {
    setFilterType(nextType);
    setCurrentPage(1);
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Solicitações de Clientes</h1>

      <LeadsStats
        totalNovos={totalNovos}
        totalAtendimento={totalAtendimento}
        totalFinalizadas={totalFinalizadas}
      />

      <LeadsFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusFilterChange}
        filterType={filterType}
        onTypeChange={handleTypeFilterChange}
      />

      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
          Carregando leads do banco de dados...
        </div>
      ) : (
        <LeadsTable
          leads={paginatedLeads}
          allLeads={leads}
          totalItems={filteredLeads.length}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          onViewDetails={openDetails}
          onStatusChange={handleStatusChange}
        />
      )}

      <LeadDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        lead={selectedRequest}
        allLeads={leads}
      />
    </main>
  );
}
