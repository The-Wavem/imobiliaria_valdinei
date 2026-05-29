import { useEffect, useMemo, useState } from "react";
import LeadsStats from "@sections/admin/leads/LeadsStats/LeadsStats.jsx";
import LeadsFilterBar from "@sections/admin/leads/LeadsFilterBar/LeadsFilterBar.jsx";
import LeadsTable from "@sections/admin/leads/LeadsTable/LeadsTable.jsx";
import LeadDetailsModal from "@sections/admin/leads/LeadDetailsModal/LeadDetailsModal.jsx";
import { initialRequests } from "../../data/admin/leadsSeed.js";

function parseBrazilianDateTime(dateValue) {
  const [datePart = "", timePart = "00:00"] = String(dateValue || "")
    .trim()
    .split(" ");
  const [day = "0", month = "0", year = "0"] = datePart.split("/");
  const [hours = "0", minutes = "0"] = timePart.split(":");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  ).getTime();
}

const LEADS_STORAGE_KEY = "@valdinei:leads";

function readStoredRequests() {
  if (typeof window === "undefined") {
    return initialRequests;
  }

  try {
    const rawValue = window.localStorage.getItem(LEADS_STORAGE_KEY);

    if (!rawValue) {
      return initialRequests;
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : initialRequests;
  } catch {
    return initialRequests;
  }
}

export default function LeadsManager() {
  const [requests, setRequests] = useState(() => readStoredRequests());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterType, setFilterType] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(
      new CustomEvent("valdinei:analytics-update", {
        detail: { type: "leads" },
      }),
    );
  }, [requests]);

  const totalNovos = useMemo(
    () => requests.filter((request) => request.status === "Novo").length,
    [requests],
  );

  const totalAtendimento = useMemo(
    () =>
      requests.filter((request) =>
        ["Em Atendimento", "Agendado"].includes(request.status),
      ).length,
    [requests],
  );

  const totalFinalizadas = useMemo(
    () => requests.filter((request) => request.status === "Finalizado").length,
    [requests],
  );

  const processedLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...requests]
      .filter((request) => {
        const matchesSearch = normalizedSearch
          ? request.client.name.toLowerCase().includes(normalizedSearch)
          : true;

        const matchesStatus =
          filterStatus === "Todos" || request.status === filterStatus;
        const matchesType =
          filterType === "Todos" || request.requestType === filterType;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort(
        (leftRequest, rightRequest) =>
          parseBrazilianDateTime(rightRequest.date) -
          parseBrazilianDateTime(leftRequest.date),
      );
  }, [filterStatus, filterType, requests, searchTerm]);

  const totalRequests = processedLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalRequests / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem =
    totalRequests === 0 ? 0 : indexOfLastItem - itemsPerPage;
  const visibleRequests = processedLeads.slice(
    indexOfFirstItem,
    indexOfLastItem,
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
    setRequests((currentValue) =>
      currentValue.map((request) =>
        request.id === requestId ? { ...request, status: nextStatus } : request,
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

      <LeadsTable
        leads={visibleRequests}
        totalItems={totalRequests}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onViewDetails={openDetails}
        onStatusChange={handleStatusChange}
      />

      <LeadDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        lead={selectedRequest}
      />
    </main>
  );
}
