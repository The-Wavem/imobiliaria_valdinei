Sistema baseado no protótipo: [Imobiliária Valdinei](https://prototipo-valdinei.web.app/) 

Pesquisar: 

Guia: Integração de Dados do IPPUC no seu Admin

1\. A Fonte dos Dados (Onde buscar)

-   Portal: [GeoCuritiba](https://geocuritiba.ippuc.org.br/).
-   Tecnologia: Serviços REST via ArcGIS Server.
-   Endpoints principais: Limites de bairros, ciclovias, zoneamento e equipamentos urbanos.

2\. A Mágica do "Onde estou?" (Geocodificação Reversa)

-   Como funciona: Você pega a latitude/longitude do cliente e faz uma consulta de "Ponto no Polígono" (Spatial Query) na API do IPPUC.
-   Resultado: A API te responde o nome oficial do bairro de Curitiba onde o cliente está.

3\. Como exibir no Google Maps

-   Opção Leve (GeoJSON): Baixe os limites dos bairros no GeoCuritiba em formato `.geojson` e carregue direto na camada de dados do Google Maps (`map.data.loadGeoJson`). É ótimo para performance.
-   Opção Dinâmica (WMS/ArcGIS): Conecte o Google Maps diretamente ao servidor do IPPUC para exibir camadas que atualizam sozinhas (como obras ou novos binários).

4\. O que você ganha com isso

-   Precisão: Você usa a divisão oficial da prefeitura (evita erros de endereços mal digitados).
-   Visual Profissional: Dashboards com mapas de calor e análise de densidade de clientes por região.

5\. Atenção

-   Escopo: Só funciona para o território de Curitiba.
-   Uso: Sempre dê uma olhada nos termos de uso do GeoCuritiba para garantir que sua aplicação está dentro das normas de dados abertos.
