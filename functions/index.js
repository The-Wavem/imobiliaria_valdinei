const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const escapeXml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
};

const mapPropertyType = (rawType) => {
  if (!rawType) return null;
  const typeStr = String(rawType).toLowerCase().trim();
  
  if (typeStr.includes('apartamento') || typeStr.includes('flat') || typeStr.includes('studio') || typeStr.includes('loft') || typeStr.includes('cobertura') || typeStr.includes('apto') || typeStr.includes('duplex')) {
      return 'Apartamento';
  }
  if (typeStr.includes('casa') || typeStr.includes('sobrado') || typeStr.includes('chácara') || typeStr.includes('chacara') || typeStr.includes('sítio') || typeStr.includes('sitio') || typeStr.includes('fazenda') || typeStr.includes('villa')) {
      return 'Casa';
  }
  if (typeStr.includes('terreno') || typeStr.includes('lote') || typeStr.includes('área') || typeStr.includes('area')) {
      return 'Terreno';
  }
  if (typeStr.includes('comercial') || typeStr.includes('loja') || typeStr.includes('galpão') || typeStr.includes('galpao') || typeStr.includes('barracão') || typeStr.includes('barracao') || typeStr.includes('sala') || typeStr.includes('prédio') || typeStr.includes('predio') || typeStr.includes('ponto')) {
      return 'Comercial';
  }
  
  return null;
};

exports.apiCanalPro = onRequest(async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("properties")
      .where("status", "==", "Disponível")
      .get();

    let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlString += `<Carga xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    xmlString += `  <Imoveis>\n`;

    snapshot.forEach((doc) => {
      const property = doc.data();

      // Validação Rígida: Requisitos Mínimos para Integração
      const rawTipo = property.type || property.tipoImovel || property.tipo || "";
      const mappedTipo = mapPropertyType(rawTipo);

      const cidade = property.location?.cidade || property.cidade || "";
      const bairro = property.location?.bairro || property.bairro || "";
      const area = Number(property.area || property.areaUtil || 0);

      const rawPrice = property.pricing?.price || property.price || 0;
      const rawRentPrice = property.pricing?.rentPrice || property.rentPrice || 0;
      const hasValidPrice = Number(rawPrice) > 0 || Number(rawRentPrice) > 0;

      const hasPhotos = property.photos && Array.isArray(property.photos) && property.photos.length > 0;

      if (!mappedTipo || !cidade || !bairro || area <= 0 || !hasValidPrice || !hasPhotos) {
        return; // Pula este imóvel pois está incompleto ou o tipo não é suportado pelo portal
      }

      xmlString += `    <Imovel>\n`;

      // <CodigoImovel>
      const code = property.code || doc.id;
      xmlString += `      <CodigoImovel>${escapeXml(code)}</CodigoImovel>\n`;

      // <TipoImovel>
      xmlString += `      <TipoImovel>${mappedTipo}</TipoImovel>\n`;

      // <PrecoVenda> e <PrecoLocacao>
      const category = property.category
        ? String(property.category).toLowerCase()
        : "";
      const price = property.pricing?.price || property.price || "";
      const rentPrice = property.pricing?.rentPrice || property.rentPrice || "";

      if (category.includes("venda") || category.includes("ambos")) {
        if (price)
          xmlString += `      <PrecoVenda>${escapeXml(price)}</PrecoVenda>\n`;
      }
      if (
        category.includes("loca") ||
        category.includes("alug") ||
        category.includes("ambos")
      ) {
        if (rentPrice)
          xmlString += `      <PrecoLocacao>${escapeXml(rentPrice)}</PrecoLocacao>\n`;
        else if (
          price &&
          !category.includes("ambos") &&
          !category.includes("venda")
        ) {
          xmlString += `      <PrecoLocacao>${escapeXml(price)}</PrecoLocacao>\n`;
        }
      }

      // Bairro e Cidade
      const bairroXml = property.location?.bairro || property.bairro || "";
      if (bairroXml) xmlString += `      <Bairro>${escapeXml(bairroXml)}</Bairro>\n`;

      const cidadeXml = property.location?.cidade || property.cidade || "";
      if (cidadeXml) xmlString += `      <Cidade>${escapeXml(cidadeXml)}</Cidade>\n`;

      // Quartos, Banheiros, Vagas, Suítes, Área Útil
      const quartos = property.bedrooms || property.quartos || "";
      if (quartos !== "")
        xmlString += `      <QtdDormitorios>${escapeXml(quartos)}</QtdDormitorios>\n`;

      const banheiros = property.bathrooms || property.banheiros || "";
      if (banheiros !== "")
        xmlString += `      <QtdBanheiros>${escapeXml(banheiros)}</QtdBanheiros>\n`;

      const vagas = property.parkingSpaces || property.vagas || "";
      if (vagas !== "")
        xmlString += `      <QtdVagas>${escapeXml(vagas)}</QtdVagas>\n`;

      const suites = property.suites || "";
      if (suites !== "")
        xmlString += `      <QtdSuites>${escapeXml(suites)}</QtdSuites>\n`;

      const areaXml = property.area || property.areaUtil || "";
      if (areaXml !== "") {
        xmlString += `      <AreaUtil>${escapeXml(areaXml)}</AreaUtil>\n`;
      }

      // Observacao
      const obs = property.content?.description || property.description || property.observacoes || "";
      if (obs) {
        xmlString += `      <Observacao><![CDATA[${obs}]]></Observacao>\n`;
      }

      // Caracteristicas
      const caracteristicas = property.features || property.comodidades || property.caracteristicas || [];
      if (Array.isArray(caracteristicas) && caracteristicas.length > 0) {
        xmlString += `      <Caracteristicas>\n`;
        caracteristicas.forEach(feat => {
           if (feat) {
               xmlString += `        <Caracteristica>${escapeXml(feat)}</Caracteristica>\n`;
           }
        });
        xmlString += `      </Caracteristicas>\n`;
      }

      // Fotos
      if (
        property.photos &&
        Array.isArray(property.photos) &&
        property.photos.length > 0
      ) {
        xmlString += `      <Fotos>\n`;
        property.photos.forEach((photoUrl, index) => {
          const url =
            typeof photoUrl === "string"
              ? photoUrl
              : photoUrl.url || photoUrl.src || "";
          if (url) {
            const isPrincipal = index === 0 ? "1" : "0";
            xmlString += `        <Foto>\n`;
            xmlString += `          <Principal>${isPrincipal}</Principal>\n`;
            xmlString += `          <URLArquivo>${escapeXml(url)}</URLArquivo>\n`;
            xmlString += `        </Foto>\n`;
          }
        });
        xmlString += `      </Fotos>\n`;
      }

      xmlString += `    </Imovel>\n`;
    });

    xmlString += `  </Imoveis>\n`;
    xmlString += `</Carga>\n`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xmlString);
  } catch (error) {
    console.error("Erro ao gerar XML Canal Pro:", error);
    res.status(500).send("Erro interno ao gerar o feed XML.");
  }
});
