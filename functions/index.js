const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

exports.apiCanalPro = onRequest(async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection('properties')
            .where('status', '==', 'Disponível')
            .get();

        let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xmlString += `<Carga xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
        xmlString += `  <Imoveis>\n`;

        snapshot.forEach(doc => {
            const property = doc.data();
            xmlString += `    <Imovel>\n`;
            
            // <CodigoImovel>
            const code = property.code || doc.id;
            xmlString += `      <CodigoImovel>${escapeXml(code)}</CodigoImovel>\n`;
            
            // <TipoImovel>
            if (property.type) {
                xmlString += `      <TipoImovel>${escapeXml(property.type)}</TipoImovel>\n`;
            }
            
            // <PrecoVenda> e <PrecoLocacao>
            const category = property.category ? String(property.category).toLowerCase() : '';
            const price = property.pricing?.price || property.price || '';
            const rentPrice = property.pricing?.rentPrice || property.rentPrice || '';

            if (category.includes('venda') || category.includes('ambos')) {
                if (price) xmlString += `      <PrecoVenda>${escapeXml(price)}</PrecoVenda>\n`;
            }
            if (category.includes('loca') || category.includes('alug') || category.includes('ambos')) {
                if (rentPrice) xmlString += `      <PrecoLocacao>${escapeXml(rentPrice)}</PrecoLocacao>\n`;
                else if (price && !category.includes('ambos') && !category.includes('venda')) {
                    xmlString += `      <PrecoLocacao>${escapeXml(price)}</PrecoLocacao>\n`;
                }
            }

            // Bairro e Cidade
            const bairro = property.location?.bairro || property.bairro || '';
            if (bairro) xmlString += `      <Bairro>${escapeXml(bairro)}</Bairro>\n`;

            const cidade = property.location?.cidade || property.cidade || '';
            if (cidade) xmlString += `      <Cidade>${escapeXml(cidade)}</Cidade>\n`;

            // Quartos, Banheiros, Vagas, Suítes, Área Útil
            const quartos = property.bedrooms || property.quartos || '';
            if (quartos !== '') xmlString += `      <QtdDormitorios>${escapeXml(quartos)}</QtdDormitorios>\n`;

            const banheiros = property.bathrooms || property.banheiros || '';
            if (banheiros !== '') xmlString += `      <QtdBanheiros>${escapeXml(banheiros)}</QtdBanheiros>\n`;

            const vagas = property.parkingSpaces || property.vagas || '';
            if (vagas !== '') xmlString += `      <QtdVagas>${escapeXml(vagas)}</QtdVagas>\n`;

            const suites = property.suites || '';
            if (suites !== '') xmlString += `      <QtdSuites>${escapeXml(suites)}</QtdSuites>\n`;

            const area = property.area || property.areaUtil || '';
            if (area !== '') xmlString += `      <AreaUtil>${escapeXml(area)}</AreaUtil>\n`;
            
            // Fotos
            if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
                xmlString += `      <Fotos>\n`;
                property.photos.forEach((photoUrl, index) => {
                    const url = typeof photoUrl === 'string' ? photoUrl : (photoUrl.url || photoUrl.src || '');
                    if (url) {
                        const isPrincipal = index === 0 ? '1' : '0';
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

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(xmlString);
    } catch (error) {
        console.error("Erro ao gerar XML Canal Pro:", error);
        res.status(500).send("Erro interno ao gerar o feed XML.");
    }
});
