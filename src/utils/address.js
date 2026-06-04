/**
 * Extrai o nome do bairro a partir de um dado de localização.
 *
 * Suporta dois formatos:
 * 1. Objeto (schema novo): { bairro: "...", neighborhood: "..." }
 * 2. String legado com vírgulas (reverse parsing para suportar Complemento):
 *    Formatos cobertos:
 *    - "Rua, 123 - Bairro, Cidade - UF, CEP"          (sem complemento)
 *    - "Rua, 123 - Comp, Bairro, Cidade - UF, CEP"    (com complemento antes do bairro)
 *    - "Rua, 123, Apto 1 - Bairro, Cidade - UF, CEP"  (complemento como segmento separado)
 *
 * A lógica de leitura de trás para frente torna o parsing imune à quantidade
 * variável de segmentos gerados pelo Complemento do endereço.
 */
export const extractNeighborhood = (locationData) => {
  if (!locationData) return null;

  // 1. Se já for o objeto novo do banco, maravilha!
  if (typeof locationData === "object" && !Array.isArray(locationData)) {
    return locationData.bairro || locationData.neighborhood || null;
  }

  // 2. Se for a string legado (ex: "Rua, 123 - Comp, Bairro, Cidade - UF, CEP")
  if (typeof locationData === "string") {
    const parts = locationData.split(",").map((p) => p.trim());

    // Precisamos de pelo menos 3 segmentos para chegar ao bairro
    if (parts.length < 3) return null;

    // O bairro sempre estará 3 posições antes do final
    // (antes de "Cidade - UF" e do "CEP")
    const bairroPart = parts[parts.length - 3];

    // Se essa parte tiver hífen, significa que não houve complemento com vírgula
    // Ex: "1245 - Porto das Laranjeiras"
    if (bairroPart.includes("-")) {
      const subParts = bairroPart.split("-");
      return subParts[subParts.length - 1].trim() || null;
    }

    // Se não tem hífen, o complemento absorveu o hífen na parte anterior
    // Ex: parts = ["Rua", "123 - Apto 1", "Porto das Laranjeiras", "Cidade - PR", "CEP"]
    return bairroPart || null;
  }

  return null;
};
