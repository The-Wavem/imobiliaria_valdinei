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
      return { usage: 'Residential', type: 'Residential / Apartment' };
  }
  if (typeStr.includes('casa') || typeStr.includes('sobrado') || typeStr.includes('chácara') || typeStr.includes('chacara') || typeStr.includes('sítio') || typeStr.includes('sitio') || typeStr.includes('fazenda') || typeStr.includes('villa')) {
      return { usage: 'Residential', type: 'Residential / Home' };
  }
  if (typeStr.includes('terreno') || typeStr.includes('lote') || typeStr.includes('área') || typeStr.includes('area')) {
      return { usage: 'Residential', type: 'Residential / Land Lot' };
  }
  if (typeStr.includes('comercial') || typeStr.includes('loja') || typeStr.includes('galpão') || typeStr.includes('galpao') || typeStr.includes('barracão') || typeStr.includes('barracao') || typeStr.includes('sala') || typeStr.includes('prédio') || typeStr.includes('predio') || typeStr.includes('ponto')) {
      return { usage: 'Commercial', type: 'Commercial / Building' };
  }
  
  return null;
};

const featureMapper = {
  'aceita animais': 'Pets Allowed',
  'ar-condicionado': 'Cooling',
  'closet': 'Closet',
  'cozinha americana': 'American Kitchen',
  'lareira': 'Fireplace',
  'mobiliado': 'Furnished',
  'varanda gourmet': 'Gourmet Balcony',
  'academia': 'Gym',
  'churrasqueira': 'BBQ',
  'cinema': 'Media Room',
  'espaço gourmet': 'Gourmet Area',
  'jardim': 'Garden Area',
  'piscina': 'Pool',
  'playground': 'Playground',
  'quadra de squash': 'Squash',
  'quadra de tênis': 'Tennis court',
  'quadra poliesportiva': 'Sports Court',
  'acesso para deficientes': 'Disabled Access',
  'bicicletário': 'Bicycles Place',
  'coworking': 'Coworking',
  'elevador': 'Elevator',
  'lavanderia': 'Laundry',
  'sauna': 'Sauna',
  'spa': 'Spa',
  'portaria 24h': 'Concierge 24h',
  'pet friendly': 'Pets Allowed'
};

exports.apiCanalPro = onRequest(async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("properties")
      .where("status", "==", "Disponível")
      .get();

    let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlString += `<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync  http://xml.vivareal.com/vrsync.xsd">\n`;
    xmlString += `  <Header>\n`;
    xmlString += `    <Provider>The Wavem</Provider>\n`;
    xmlString += `    <Email>contato@thewavem.com</Email>\n`;
    xmlString += `    <PublishDate>${new Date().toISOString()}</PublishDate>\n`;
    xmlString += `  </Header>\n`;
    xmlString += `  <Listings>\n`;

    snapshot.forEach((doc) => {
      const property = doc.data();

      // Validação Rígida: Requisitos Mínimos para Integração
      const rawTipo = property.type || property.tipoImovel || property.tipo || "";
      const mapped = mapPropertyType(rawTipo);

      const cidade = property.location?.cidade || property.cidade || "";
      const bairro = property.location?.bairro || property.bairro || "";
      const area = Number(property.area || property.areaUtil || 0);

      const rawPrice = property.pricing?.price || property.price || 0;
      const rawRentPrice = property.pricing?.rentPrice || property.rentPrice || 0;
      const hasValidPrice = Number(rawPrice) > 0 || Number(rawRentPrice) > 0;

      const hasPhotos = property.photos && Array.isArray(property.photos) && property.photos.length > 0;

      if (!mapped || !cidade || !bairro || area <= 0 || !hasValidPrice || !hasPhotos) {
        return; // Pula este imóvel pois está incompleto ou o tipo não é suportado pelo portal
      }

      xmlString += `    <Listing>\n`;

      const code = property.code || doc.id;
      xmlString += `      <ListingID>${escapeXml(code)}</ListingID>\n`;

      const title = property.title || property.content?.summary || `Lindo imóvel em ${escapeXml(cidade)}`;
      xmlString += `      <Title><![CDATA[${title}]]></Title>\n`;

      // TransactionType
      const price = Number(rawPrice);
      const rentPrice = Number(rawRentPrice);
      let transactionType = 'For Sale';
      if (price > 0 && rentPrice > 0) {
        transactionType = 'Sale/Rent';
      } else if (rentPrice > 0) {
        transactionType = 'For Rent';
      }
      xmlString += `      <TransactionType>${transactionType}</TransactionType>\n`;

      // Media
      xmlString += `      <Media>\n`;
      property.photos.forEach((photoUrl, index) => {
        const url = typeof photoUrl === "string" ? photoUrl : photoUrl.url || photoUrl.src || "";
        if (url) {
          const isPrimary = index === 0 ? "true" : "false";
          xmlString += `        <Item medium="image" primary="${isPrimary}">${escapeXml(url)}</Item>\n`;
        }
      });
      xmlString += `      </Media>\n`;

      // Details
      xmlString += `      <Details>\n`;
      xmlString += `        <UsageType>${mapped.usage}</UsageType>\n`;
      xmlString += `        <PropertyType>${mapped.type}</PropertyType>\n`;
      
      const obs = property.content?.description || property.description || property.observacoes || "";
      if (obs) {
        xmlString += `        <Description><![CDATA[${obs}]]></Description>\n`;
      }
      
      if (price > 0) {
        xmlString += `        <ListPrice currency="BRL">${price}</ListPrice>\n`;
      }
      if (rentPrice > 0) {
        xmlString += `        <RentalPrice currency="BRL" period="Monthly">${rentPrice}</RentalPrice>\n`;
      }
      
      const condo = Number(property.pricing?.condominio || property.condominio || 0);
      if (condo > 0) {
        xmlString += `        <PropertyAdministrationFee currency="BRL">${condo}</PropertyAdministrationFee>\n`;
      }
      
      const iptu = Number(property.pricing?.iptu || property.iptu || 0);
      if (iptu > 0) {
        xmlString += `        <Iptu currency="BRL" period="Yearly">${iptu}</Iptu>\n`;
      }
      
      xmlString += `        <LivingArea unit="square metres">${area}</LivingArea>\n`;
      
      const quartos = property.bedrooms || property.quartos || "";
      if (quartos !== "") xmlString += `        <Bedrooms>${escapeXml(quartos)}</Bedrooms>\n`;
      
      const suites = property.suites || property.location?.suites || "";
      if (suites !== "") xmlString += `        <Suites>${escapeXml(suites)}</Suites>\n`;
      
      const banheiros = property.bathrooms || property.banheiros || "";
      if (banheiros !== "") xmlString += `        <Bathrooms>${escapeXml(banheiros)}</Bathrooms>\n`;
      
      const vagas = property.parkingSpaces || property.vagas || "";
      if (vagas !== "") xmlString += `        <Garage>${escapeXml(vagas)}</Garage>\n`;

      const unitFloor = property.unitFloor || "";
      if (unitFloor !== "") xmlString += `        <UnitFloor>${escapeXml(unitFloor)}</UnitFloor>\n`;

      const buildings = property.buildings || property.condoData?.buildings || "";
      if (buildings !== "") xmlString += `        <Buildings>${escapeXml(buildings)}</Buildings>\n`;

      const floors = property.floors || property.condoData?.floors || "";
      if (floors !== "") xmlString += `        <Floors>${escapeXml(floors)}</Floors>\n`;

      const unitsPerFloor = property.unitsPerFloor || property.condoData?.unitsPerFloor || "";
      if (unitsPerFloor !== "") xmlString += `        <UnitsPerFloor>${escapeXml(unitsPerFloor)}</UnitsPerFloor>\n`;

      const yearBuilt = property.yearBuilt || property.condoData?.yearBuilt || "";
      if (yearBuilt !== "") xmlString += `        <YearBuilt>${escapeXml(yearBuilt)}</YearBuilt>\n`;
      
      // Concatena características do imóvel e do condomínio
      const featsImovel = property.features || property.comodidades || property.caracteristicas || [];
      const featsCondo = property.condoFeatures || property.caracteristicasCondominio || [];
      const todasCaracteristicas = [].concat(featsImovel, featsCondo);

      let featuresXml = "";
      
      if (todasCaracteristicas.length > 0) {
        todasCaracteristicas.forEach(feat => {
           if (!feat) return;
           const featKey = String(feat).toLowerCase().trim();
           const mappedFeat = featureMapper[featKey];
           
           // Valida e evita gerar tags duplicadas
           if (mappedFeat && !featuresXml.includes(`>${escapeXml(mappedFeat)}<`)) {
             featuresXml += `          <Feature>${escapeXml(mappedFeat)}</Feature>\n`;
           }
        });
      }

      if (featuresXml) {
        xmlString += `        <Features>\n${featuresXml}        </Features>\n`;
      }

      xmlString += `      </Details>\n`;

      // Location
      const displayAddress = property.displayAddress || property.location?.displayAddress || "All";
      xmlString += `      <Location displayAddress="${escapeXml(displayAddress)}">\n`;
      xmlString += `        <Country abbreviation="BR">Brasil</Country>\n`;
      
      const estadoXml = property.location?.estado || property.location?.uf || property.estado || property.uf || "";
      if (estadoXml) xmlString += `        <State abbreviation="${escapeXml(estadoXml)}">${escapeXml(estadoXml)}</State>\n`;
      
      if (cidade) xmlString += `        <City>${escapeXml(cidade)}</City>\n`;
      if (bairro) xmlString += `        <Neighborhood>${escapeXml(bairro)}</Neighborhood>\n`;
      
      const street = property.location?.logradouro || property.location?.street || property.logradouro || property.rua || "";
      if (street) xmlString += `        <Address>${escapeXml(street)}</Address>\n`;
      
      const streetNumber = property.location?.numero || property.location?.number || property.numero || property.number || "";
      if (streetNumber) xmlString += `        <StreetNumber>${escapeXml(streetNumber)}</StreetNumber>\n`;
      
      let zip = property.location?.cep || property.location?.zipCode || property.cep || property.zipCode || "";
      if (zip) {
        zip = String(zip).replace(/\D/g, "");
        if (zip.length === 8) {
           zip = `${zip.substring(0, 5)}-${zip.substring(5)}`;
        }
        xmlString += `        <PostalCode>${escapeXml(zip)}</PostalCode>\n`;
      }
      
      xmlString += `      </Location>\n`;

      // ContactInfo
      xmlString += `      <ContactInfo>\n`;
      xmlString += `        <Name>Imobiliária Valdinei</Name>\n`;
      xmlString += `        <Email>contato@imobiliariavaldinei.com.br</Email>\n`;
      // Adicione a tag <Telephone> se necessário, ex:
      // xmlString += `        <Telephone>(41) 98859-1433</Telephone>\n`;
      xmlString += `      </ContactInfo>\n`;

      xmlString += `    </Listing>\n`;
    });

    xmlString += `  </Listings>\n`;
    xmlString += `</ListingDataFeed>\n`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xmlString);
  } catch (error) {
    console.error("Erro ao gerar XML Canal Pro (VRSync):", error);
    res.status(500).send("Erro interno ao gerar o feed XML VRSync.");
  }
});
