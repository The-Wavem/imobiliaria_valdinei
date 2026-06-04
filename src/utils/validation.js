// ─── Limites de campo ──────────────────────────────────────────────────────────
export const FIELD_LIMITS = {
  name:    { min: 3,  max: 80  },
  email:   { min: 6,  max: 150 },
  phone:   { min: 0,  max: 20  }, // opcional
  subject: { min: 0,  max: 120 }, // opcional
  message: { min: 10, max: 1200 },
};

// ─── Sanitização ──────────────────────────────────────────────────────────────

/**
 * Remove tags HTML e caracteres de controle para evitar XSS e injeções.
 * Preserva letras, números, pontuação normal e acentos do PT-BR.
 */
export function sanitizeString(raw) {
  if (typeof raw !== "string") return "";

  return raw
    // Remove qualquer tag HTML
    .replace(/<[^>]*>/g, "")
    // Remove caracteres de controle (exceto \n e \r que podem ser necessários em textarea)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Colapsa múltiplos espaços/tabs em um só (mas preserva quebras de linha)
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

/** Sanitiza todos os campos de um objeto de formulário de uma vez. */
export function sanitizeFormData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, sanitizeString(String(value ?? ""))])
  );
}

// ─── Validadores individuais ───────────────────────────────────────────────────

/** Valida o nome: somente letras, acentos, espaços e apóstrofos. */
export function validateName(value) {
  const v = sanitizeString(value);
  if (!v) return "Nome é obrigatório.";
  if (v.length < FIELD_LIMITS.name.min) return `Nome deve ter pelo menos ${FIELD_LIMITS.name.min} caracteres.`;
  if (v.length > FIELD_LIMITS.name.max) return `Nome deve ter no máximo ${FIELD_LIMITS.name.max} caracteres.`;
  if (!/^[\p{L}\s'.,-]+$/u.test(v)) return "Nome deve conter apenas letras e espaços.";
  return null;
}

/** Valida o e-mail com regex padrão de mercado + limites de tamanho. */
export function validateEmail(value) {
  const v = sanitizeString(value);
  if (!v) return "E-mail é obrigatório.";
  if (v.length > FIELD_LIMITS.email.max) return `E-mail muito longo (máx. ${FIELD_LIMITS.email.max} caracteres).`;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(v)) return "Insira um e-mail válido (ex: nome@dominio.com).";
  return null;
}

/**
 * Valida o telefone (opcional, mas quando preenchido deve ser válido).
 * Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
 */
export function validatePhone(value) {
  const v = sanitizeString(value);
  if (!v) return null; // campo opcional
  if (v.length > FIELD_LIMITS.phone.max) return `Telefone muito longo (máx. ${FIELD_LIMITS.phone.max} caracteres).`;

  // Remove tudo que não é dígito ou o + inicial para checar quantidade de dígitos
  const digitsOnly = v.replace(/\D/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 13) {
    return "Telefone inválido. Use o formato (00) 00000-0000.";
  }
  return null;
}

/** Valida o assunto (opcional). */
export function validateSubject(value) {
  const v = sanitizeString(value);
  if (!v) return null; // campo opcional
  if (v.length > FIELD_LIMITS.subject.max) return `Assunto muito longo (máx. ${FIELD_LIMITS.subject.max} caracteres).`;
  return null;
}

/** Valida a mensagem: campo obrigatório com min e max caracteres. */
export function validateMessage(value) {
  const v = sanitizeString(value);
  if (!v) return "Mensagem é obrigatória.";
  if (v.length < FIELD_LIMITS.message.min) return `Mensagem muito curta (mín. ${FIELD_LIMITS.message.min} caracteres).`;
  if (v.length > FIELD_LIMITS.message.max) return `Mensagem muito longa (máx. ${FIELD_LIMITS.message.max} caracteres).`;
  return null;
}

// ─── Validação completa do formulário ─────────────────────────────────────────

/**
 * Valida todos os campos de uma vez e retorna um mapa de erros.
 * Retorna {} se tudo estiver válido.
 */
export function validateContactForm(data) {
  const errors = {};

  const nameError    = validateName(data.name);
  const emailError   = validateEmail(data.email);
  const phoneError   = validatePhone(data.phone);
  const subjectError = validateSubject(data.subject);
  const messageError = validateMessage(data.message);

  if (nameError)    errors.name    = nameError;
  if (emailError)   errors.email   = emailError;
  if (phoneError)   errors.phone   = phoneError;
  if (subjectError) errors.subject = subjectError;
  if (messageError) errors.message = messageError;

  return errors;
}
