export const calculateBaseScore = (property) => {
  let score = Number(property.views) || 0;

  if (property.featured) {
    score += 10000;
  }

  return score;
};

export const calculateTotalScore = (property) => {
  // Pega o score fixado do banco ou calcula o base na hora
  let score = property.score !== undefined ? Number(property.score) : calculateBaseScore(property);

  // Fator Novidade (Temporário, não vai pro banco, apenas exibe no frontend)
  const createdAtStr = property.createdAt || (property.audit && property.audit.createdAt);
  if (createdAtStr) {
    const createdAtTime = new Date(createdAtStr).getTime();
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    if (!isNaN(createdAtTime) && (now - createdAtTime) <= threeDaysInMs) {
      score += 5000;
    }
  }

  return score;
};

export const sortPropertiesByRelevance = (properties) => {
  return [...properties].sort((a, b) => {
    const scoreA = calculateTotalScore(a);
    const scoreB = calculateTotalScore(b);
    return scoreB - scoreA; // Decrescente
  });
};
