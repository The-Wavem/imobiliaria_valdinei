import { useMemo, useState } from "react";
import { Eye, MessageCircle, Search } from "lucide-react";
import AdminSidebar from "@components/layout/AdminSidebar";
import Input from "@components/ui/Input/Input.jsx";
import Button from "@components/ui/Button/Button.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import Select from "@components/ui/Select/Select.jsx";
import paginationStyles from "./Pagination.module.css";
import styles from "./LeadsManager.module.css";

const statusOptions = [
  { label: "Todos", value: "Todos" },
  { label: "Novo", value: "Novo" },
  { label: "Em Atendimento", value: "Em Atendimento" },
  { label: "Agendado", value: "Agendado" },
  { label: "Finalizado", value: "Finalizado" },
];

const typeOptions = [
  { label: "Todos", value: "Todos" },
  { label: "Visita", value: "Visita" },
  { label: "Contato", value: "Contato" },
];

const requestTypeStyles = {
  Visita: styles.requestBadgeVisit,
  Contato: styles.requestBadgeContact,
};

const initialRequests = [
  {
    id: 1,
    date: "21/05/2026 09:14",
    requestType: "Visita",
    status: "Novo",
    client: {
      name: "Marcos Vinícius",
      phone: "11987654321",
      email: "marcos@email.com",
      property: "Casa térrea com piscina",
    },
    desiredDate: "24/05/2026",
    period: "Manhã",
    message: "Gostaria de agendar uma visita no sábado se ainda estiver disponível.",
  },
  {
    id: 2,
    date: "21/05/2026 10:02",
    requestType: "Contato",
    status: "Em Atendimento",
    client: {
      name: "Juliana Melo",
      phone: "11966554411",
      email: "juliana@email.com",
      property: "Apartamento mobiliado no centro",
    },
    desiredDate: "",
    period: "",
    message: "Quero entender melhor as condições de aluguel, valor do condomínio e documentação.",
  },
  {
    id: 3,
    date: "20/05/2026 17:45",
    requestType: "Visita",
    status: "Agendado",
    client: {
      name: "Ricardo Azevedo",
      phone: "11933332222",
      email: "ricardo@email.com",
      property: "Cobertura com terraço panorâmico",
    },
    desiredDate: "25/05/2026",
    period: "Tarde",
    message: "Posso comparecer com minha esposa. Preciso confirmar o horário exato.",
  },
  {
    id: 4,
    date: "19/05/2026 13:28",
    requestType: "Contato",
    status: "Finalizado",
    client: {
      name: "Patrícia Lima",
      phone: "11922223333",
      email: "patricia@email.com",
      property: "Sobrado comercial com vitrine",
    },
    desiredDate: "",
    period: "",
    message: "Obrigado pelo atendimento. Consegui fechar com outro imóvel, mas volto a falar depois.",
  },
];

const statusMetricDefinitions = [
  { label: "Novas Solicitações", statuses: ["Novo"] },
  { label: "Em Atendimento", statuses: ["Em Atendimento", "Agendado"] },
  { label: "Finalizadas", statuses: ["Finalizado"] },
];

function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function buildWhatsAppUrl(client) {
  const message = `Olá ${client.name}, vi que você solicitou informações sobre o imóvel ${client.property}. Como posso ajudar?`;
  return `https://wa.me/55${sanitizePhone(client.phone)}?text=${encodeURIComponent(message)}`;
}

function getRequestTypeClass(requestType) {
  return requestTypeStyles[requestType] || styles.requestBadgeContact;
}

function parseBrazilianDateTime(dateValue) {
  const [datePart = "", timePart = "00:00"] = String(dateValue || "").trim().split(" ");
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

export default function LeadsManager() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterType, setFilterType] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const metrics = useMemo(
    () =>
      statusMetricDefinitions.map((definition) => ({
        label: definition.label,
        value: requests.filter((request) => definition.statuses.includes(request.status)).length,
      })),
    [requests],
  );

  const processedLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...requests]
      .filter((request) => {
        const matchesSearch = normalizedSearch
          ? request.client.name.toLowerCase().includes(normalizedSearch)
          : true;

        const matchesStatus = filterStatus === "Todos" || request.status === filterStatus;
        const matchesType = filterType === "Todos" || request.requestType === filterType;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((leftRequest, rightRequest) => parseBrazilianDateTime(rightRequest.date) - parseBrazilianDateTime(leftRequest.date));
  }, [filterStatus, filterType, requests, searchTerm]);

  const totalRequests = processedLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalRequests / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = totalRequests === 0 ? 0 : indexOfLastItem - itemsPerPage;
  const visibleRequests = processedLeads.slice(indexOfFirstItem, indexOfLastItem);
  const showStart = totalRequests === 0 ? 0 : indexOfFirstItem + 1;
  const showEnd = totalRequests === 0 ? 0 : Math.min(indexOfLastItem, totalRequests);

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

  const handleWhatsApp = (request) => {
    window.open(buildWhatsAppUrl(request.client), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Painel de triagem</p>
              <h1 className={styles.title}>Solicitações de Clientes</h1>
              <p className={styles.subtitle}>
                Centralize os contatos vindos dos formulários públicos e acompanhe a evolução de cada
                solicitação.
              </p>
            </div>

            <div className={styles.headerSearch}>
              <Search size={18} />
              <span>Leitura rápida e triagem operacional</span>
            </div>
          </header>

          <section className={styles.metricsBar} aria-label="Métricas rápidas de solicitações">
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <span className={styles.metricValue}>{metric.value}</span>
                <div>
                  <h2 className={styles.metricLabel}>{metric.label}</h2>
                  <p className={styles.metricHint}>Atualizado em tempo real</p>
                </div>
              </article>
            ))}
          </section>

          <div className={styles.filterBar} aria-label="Filtros de solicitações">
            <div className={styles.filterFieldSearch}>
              <Input
                icon={Search}
                label="Buscar cliente"
                placeholder="Digite o nome do cliente"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className={styles.filterFieldSelect}>
              <Select
                compact
                label="Status"
                options={statusOptions}
                value={filterStatus}
                onChange={handleStatusFilterChange}
              />
            </div>

            <div className={styles.filterFieldSelect}>
              <Select
                compact
                label="Tipo"
                options={typeOptions}
                value={filterType}
                onChange={handleTypeFilterChange}
              />
            </div>
          </div>

          <section className={styles.tableCard} aria-label="Tabela de solicitações">
            <div className={styles.tableHeadBar}>
              <div>
                <p className={styles.tableKicker}>Leitura e triagem</p>
                <h2 className={styles.tableTitle}>Solicitações recentes</h2>
              </div>
              <p className={styles.tableMeta}>{totalRequests} itens filtrados</p>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Imóvel</th>
                    <th>Tipo de Solicitação</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className={styles.dateCell}>{request.date}</div>
                      </td>
                      <td>
                        <div className={styles.clientCell}>
                          <strong>{request.client.name}</strong>
                          <span>{request.client.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.propertyCell}>
                          <strong>{request.client.property}</strong>
                          <span>{request.client.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.requestBadge} ${getRequestTypeClass(request.requestType)}`}>
                          {request.requestType}
                        </span>
                      </td>
                      <td>
                        <Select
                          compact
                          label="Status"
                          options={statusOptions}
                          value={request.status}
                          onChange={(nextStatus) => handleStatusChange(request.id, nextStatus)}
                          className={styles.statusSelect}
                        />
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Button
                            type="button"
                            variant="outline"
                            className={`${styles.actionButton} ${styles.whatsappButton}`}
                            onClick={() => handleWhatsApp(request)}
                            aria-label={`Abrir WhatsApp para ${request.client.name}`}
                          >
                            <MessageCircle size={16} />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            className={styles.actionButton}
                            onClick={() => openDetails(request)}
                          >
                            <Eye size={16} />
                            <span>Ver Detalhes</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className={paginationStyles.paginationFooter}>
              <p className={paginationStyles.paginationSummary}>
                Mostrando {showStart} a {showEnd} de {totalRequests} solicitações
              </p>

              <div className={paginationStyles.paginationControls}>
                <Button
                  type="button"
                  variant="outline"
                  className={paginationStyles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Anterior
                </Button>

                <span className={paginationStyles.paginationPageIndicator}>
                  Página {safeCurrentPage} de {totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  className={paginationStyles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </footer>
          </section>
        </div>
      </main>

      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        title="Detalhes da Solicitação"
      >
        {selectedRequest ? (
          <div className={styles.detailsModal}>
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Nome</span>
                <strong>{selectedRequest.client.name}</strong>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Telefone</span>
                <strong>{selectedRequest.client.phone}</strong>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>E-mail</span>
                <strong>{selectedRequest.client.email}</strong>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Imóvel de Interesse</span>
                <strong>{selectedRequest.client.property}</strong>
              </div>
            </div>

            {selectedRequest.requestType === "Visita" ? (
              <div className={styles.detailGridTwo}>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Data Desejada</span>
                  <strong>{selectedRequest.desiredDate}</strong>
                </div>

                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Período</span>
                  <strong>{selectedRequest.period}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.messageBlock}>
                <span className={styles.detailLabel}>Mensagem</span>
                <div className={styles.messageArea}>{selectedRequest.message}</div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}