# Weather App Product Specification

## Overview

O Weather App permite que uma pessoa pesquise uma cidade, selecione a localidade correta e consulte o clima atual e uma previsão de cinco dias. A interface permite alternar a temperatura entre Celsius e Fahrenheit e deve ser utilizável em dispositivos móveis.

O objetivo funcional da versão inicial é tornar essa consulta possível sem cadastro. O público prioritário e o resultado de negócio ainda não foram validados; as personas deste documento são hipóteses, não segmentos confirmados.

Decisões confirmadas para esta versão:

- Fonte meteorológica: Open-Meteo, sem API key.
- Período da previsão: hoje e os quatro dias seguintes.
- Unidade inicial: Celsius; o usuário pode alternar para Fahrenheit.
- Sem autenticação e sem persistência de dados no servidor.
- Idioma da interface: pt-BR.
- Plataforma desta entrega: aplicação web responsiva, conforme a stack React + Vite do repositório; aplicativo nativo fica fora do escopo.

Baseline funcional proposta para aprovação antes do desenvolvimento: clima atual com temperatura, condição, sensação térmica, umidade e vento; previsão diária com mínima/máxima, condição e probabilidade de precipitação; datas no fuso local da cidade; temperaturas com uma casa decimal. Metas de qualidade propostas estão em Non-Functional Requirements.

## Functional Requirements

- **FR-01 — Buscar cidades:** permitir busca por nome de cidade submetida por botão ou Enter. Remover espaços externos, preservar Unicode e pontuação válida e enviar a busca ao geocoding do Open-Meteo. Não enviar consulta vazia; não implementar sugestões automáticas na v1.
- **FR-02 — Selecionar localidade:** mostrar nome da cidade e, quando disponíveis, região e país. Não selecionar resultados automaticamente. Ao selecionar, usar latitude/longitude do resultado escolhido para as consultas meteorológicas; se a localização não tiver coordenadas, informar que não é possível consultar essa localidade.
- **FR-03 — Consultar clima atual:** apresentar, conforme a baseline proposta, temperatura, condição, sensação térmica, umidade e velocidade do vento para a localidade selecionada. Campo ausente deve ser marcado como indisponível, nunca convertido em zero ou reutilizado de outra localidade.
- **FR-04 — Consultar previsão de cinco dias:** apresentar uma linha diária para hoje e os quatro dias seguintes, segundo o fuso local da cidade. A baseline proposta inclui mínima/máxima, condição e probabilidade de precipitação para cada dia; previsão horária não faz parte da v1.
- **FR-05 — Alternar unidade de temperatura:** iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit. Converter todas as temperaturas de clima atual e previsão, exibir uma casa decimal e manter a mesma localidade e período.
- **FR-06 — Comunicar estados de consulta:** apresentar estados distintos de carregamento, vazio e erro. Erros recuperáveis devem preservar consulta/localidade e oferecer nova tentativa manual. Após 8 segundos sem resposta, encerrar o carregamento e apresentar erro de timeout; este limite é uma proposta sujeita a aprovação.

## User Stories

As personas abaixo são hipóteses derivadas do discovery e precisam de validação com usuários.

- **US-01 (FR-01 — Buscar cidades):** Como decisora do dia a dia, quero buscar uma cidade pelo nome para consultar o clima do lugar que me interessa.
- **US-02 (FR-02 — Selecionar localidade):** Como pessoa consultando um destino, quero comparar os dados de localização dos resultados para selecionar a cidade correta.
- **US-03 (FR-03 — Consultar clima atual):** Como decisora do dia a dia, quero ver as condições atuais da cidade selecionada para decidir como me preparar antes de sair.
- **US-04 (FR-04 — Consultar previsão de cinco dias):** Como planejador da semana, quero consultar a previsão de hoje e dos quatro dias seguintes para escolher quando realizar uma atividade.
- **US-05 (FR-05 — Alternar unidade de temperatura):** Como planejador da semana, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-06 (FR-06 — Comunicar estados de consulta):** Como pessoa consultando um destino, quero receber uma mensagem clara e poder tentar novamente quando uma consulta falhar para continuar buscando a previsão do lugar correto.

## Acceptance Criteria

Os cenários usam relógio fixo e respostas controladas do Open-Meteo. Os campos e metas marcados como baseline proposta só se tornam contrato de lançamento após aprovação em Open Questions.

- **AC-01 (FR-01):** Given o campo contém `  São Paulo  `, When a pessoa submeter a busca, Then uma única solicitação de geocoding é feita com `São Paulo`, preservando os caracteres Unicode.
- **AC-02 (FR-01):** Given o campo está vazio ou contém apenas espaços, When a pessoa submeter a busca, Then nenhuma solicitação é feita e uma mensagem de validação é exibida junto ao campo.
- **AC-03 (FR-01):** Given o geocoding retorna localidades, When a busca terminar, Then cada resultado exibe nome da cidade e os campos de região/país fornecidos pela resposta.
- **AC-04 (FR-01):** Given o geocoding retorna lista vazia, When a busca terminar, Then a interface exibe estado sem resultados e nenhuma solicitação meteorológica é feita.
- **AC-05 (FR-02):** Given dois resultados com coordenadas distintas, When a pessoa selecionar o segundo, Then a seleção fica identificada na interface e a próxima solicitação meteorológica contém exatamente a latitude e longitude do segundo resultado.
- **AC-06 (FR-02):** Given resultados homônimos com região/país disponíveis, When forem exibidos, Then os valores de região/país aparecem em cada resultado; se esses campos faltarem, latitude/longitude são exibidas como alternativa de distinção.
- **AC-07 (FR-03):** Given uma resposta atual com temperatura `20`, condição `Chuva`, sensação `19`, umidade `80` e vento `10`, When a localidade for carregada em Celsius, Then a interface mostra esses valores associados à localidade e rotula temperatura/sensação em `°C`, umidade em `%` e vento em `km/h`.
- **AC-08 (FR-03):** Given um dos campos definidos na baseline está ausente, When a resposta for exibida, Then somente esse campo aparece como `Indisponível` e os demais campos válidos permanecem visíveis.
- **AC-09 (FR-04):** Given o relógio de teste está fixado em `2026-11-11` no fuso retornado para a cidade e a resposta contém cinco datas diárias, When a previsão for exibida, Then há exatamente cinco linhas para as datas locais de 11 a 15 de novembro de 2026 em ordem crescente.
- **AC-10 (FR-04):** Given a resposta diária contém mínima, máxima, condição e probabilidade de precipitação, When cada linha for exibida, Then cada valor corresponde à mesma data da resposta e probabilidade é rotulada em `%`.
- **AC-11 (FR-04):** Given a resposta contém menos de cinco dias, When a previsão for exibida, Then apenas os dias recebidos são mostrados, a interface identifica a previsão como incompleta e não cria dias ou valores fictícios.
- **AC-12 (FR-05):** Given temperaturas carregadas em clima atual e previsão, When a tela inicial aparecer, Then todas estão em Celsius, com uma casa decimal e unidade `°C`.
- **AC-13 (FR-05):** Given temperaturas de `0`, `25.5` e `-10 °C` distribuídas entre clima atual e previsão, When a pessoa selecionar Fahrenheit, Then os valores correspondentes são `32.0`, `77.9` e `14.0 °F`, sem alteração da cidade ou datas.
- **AC-14 (FR-05):** Given valores em Fahrenheit, incluindo `32.0 °F`, When a pessoa selecionar Celsius, Then `32.0 °F` passa a `0.0 °C` e nenhuma temperatura permanece com rótulo incompatível.
- **AC-15 (FR-06):** Given uma solicitação de rede pendente, When a pessoa iniciar busca ou consulta, Then um estado de carregamento acessível é exibido e removido ao concluir ou falhar.
- **AC-16 (FR-06):** Given uma falha de rede, resposta HTTP não-success ou timeout, When a falha ocorrer, Then a interface mostra erro distinto do estado sem resultados, mantém a consulta/localidade e apresenta ação de tentar novamente.
- **AC-17 (FR-06):** Given a solicitação ultrapassa 8 segundos, When o timeout disparar, Then o carregamento termina e o estado de erro aparece; uma resposta tardia não substitui o resultado de uma tentativa mais recente.
- **AC-18 (FR-06):** Given uma solicitação falhou, When a pessoa selecionar tentar novamente e a segunda solicitação retornar sucesso, Then a segunda solicitação é enviada e substitui o erro pelo conteúdo retornado.
- **AC-19 (FR-06):** Given buscas A e B foram enviadas nessa ordem e B termina primeiro, When a resposta de A chegar depois, Then a interface continua exibindo os resultados de B.

## Non-Functional Requirements

- **NFR-01 — Compatibilidade:** baseline proposta: web responsiva de 320 px a 1920 px; Chrome, Edge, Firefox e Safari nas versões atual e anterior. **Verificação:** executar os fluxos de busca, seleção, consulta e unidade em 320×720, 768×1024 e 1440×900; não pode haver rolagem horizontal da página nem controle inacessível.
- **NFR-02 — Localidade:** idioma `pt-BR`, data `dd/MM/yyyy`, relógio de 24 horas, separadores numéricos de `pt-BR`. **Verificação:** a fixture `2026-11-11 17:05` aparece como `11/11/2026 17:05`; `1234.5` aparece como `1.234,5`.
- **NFR-03 — Acessibilidade:** baseline proposta WCAG 2.2 AA; controles operáveis por teclado, nomes acessíveis e estados comunicados semanticamente. **Verificação:** fluxo central completo sem mouse, foco visível em cada controle e zero violações críticas ou sérias no scanner automatizado; scanner não substitui avaliação manual de conformidade.
- **NFR-04 — Desempenho:** baseline proposta: LCP ≤ 2,5 s e CLS ≤ 0,1 na mediana de três execuções do Lighthouse Mobile; p75 de INP ≤ 200 ms após haver dados reais suficientes; resultado de geocoding p95 ≤ 3 s sob 10 Mbps e RTT de 100 ms.
- **NFR-05 — Timeout:** baseline proposta: encerrar solicitações sem resposta após 8 s, sem retries automáticos em loop. **Verificação:** relógio controlado em 7,9 s mantém loading; em 8,0 s muda para erro e oferece retry.
- **NFR-06 — Atualidade:** buscar dados ao selecionar uma cidade e em tentativa manual; não atualizar silenciosamente em segundo plano. Exibir horário fornecido pela fonte quando disponível. **Verificação:** nenhuma nova solicitação meteorológica ocorre sem seleção ou retry do usuário.
- **NFR-07 — Privacidade:** não exigir conta, persistir dados no servidor, solicitar localização ou coletar telemetria na v1. **Verificação:** fluxos não exibem pedido de permissão de localização nem enviam identificadores de usuário ou eventos de telemetria.

## Traceability

| User Story | Requisito funcional | Critérios de aceite | NFRs relevantes |
| --- | --- | --- | --- |
| US-01 — Buscar cidades | FR-01 | AC-01, AC-02, AC-03, AC-04 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 |
| US-02 — Selecionar localidade | FR-02 | AC-05, AC-06 | NFR-01, NFR-03, NFR-04 |
| US-03 — Consultar clima atual | FR-03 | AC-07, AC-08 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06 |
| US-04 — Consultar previsão de cinco dias | FR-04 | AC-09, AC-10, AC-11 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06 |
| US-05 — Alternar unidade de temperatura | FR-05 | AC-12, AC-13, AC-14 | NFR-01, NFR-02, NFR-03 |
| US-06 — Comunicar estados de consulta | FR-06 | AC-15, AC-16, AC-17, AC-18, AC-19 | NFR-01, NFR-03, NFR-04, NFR-05, NFR-06 |

NFR-07 (privacidade) aplica-se transversalmente a todas as histórias.

## Edge Cases

Uma resposta de geocoding sem resultados é uma busca válida sem correspondência, não uma falha da API; não prova que a cidade inexiste fora da cobertura do provedor.

| Caso | Comportamento esperado |
| --- | --- |
| Cidade inexistente ou geocoding sem resultados | Exibir “Nenhuma cidade encontrada para <consulta>”, manter a consulta editável e não solicitar previsão. Não afirmar que a cidade não existe fora da cobertura do provedor. |
| Campo vazio ou somente espaços | Não enviar requisição; exibir validação junto ao campo e manter foco nele. |
| Acentos, Unicode, hífen, apóstrofo ou caracteres de marcação | Remover apenas espaços externos; preservar/URL-encode o texto na requisição e renderizar como texto. Não executar nem interpretar entrada como marcação. Regras de alias e busca sem/ com diacríticos continuam abertas. |
| API indisponível, erro HTTP ou limite de requisições | Exibir erro, não estado sem resultados; manter consulta/cidade e permitir retry manual. Não tratar falha como dado válido. |
| Timeout | Após 8 s, terminar loading e oferecer retry manual. Ignorar resposta tardia se uma requisição mais nova já estiver ativa. |
| Resposta parcial | Exibir campos válidos e `Indisponível` nos campos aprovados que faltam; não preencher com zero, dado anterior ou valor fabricado. |
| Menos de cinco dias na resposta | Mostrar somente datas fornecidas, identificar previsão incompleta e nunca fabricar dias. |
| Cidades homônimas | Nunca selecionar automaticamente; exibir região/país e, se faltarem, coordenadas retornadas. Se os resultados continuarem indistinguíveis, exigir seleção explícita e não presumir a cidade correta. |
| Busca concorrente | Somente a resposta da busca mais recente pode atualizar a lista; respostas anteriores são ignoradas. |
| Alternância de unidade durante carregamento | Manter a unidade escolhida no estado da interface e renderizar a resposta que chegar nessa unidade, sem mostrar valores com rótulo misto. |
| Sem conexão | Exibir erro de rede e permitir nova tentativa; não prometer funcionamento offline nem apresentar cache como atual. |

Outros casos já identificados, ainda sem comportamento completo definido:

Mudanças de data perto da meia-noite usam o fuso local da cidade retornado pelo provedor, sujeito à aprovação da baseline em Open Questions.

## Assumptions

- A fonte Open-Meteo será usada para geocodificação e dados meteorológicos, sem API key, conforme a decisão do discovery.
- O fluxo principal é buscar uma cidade, selecionar um resultado e consultar clima atual e previsão.
- A previsão contém cinco datas diárias consecutivas: hoje mais quatro dias no fuso local retornado pelo provedor, sujeito à aprovação da baseline.
- Celsius é a unidade inicial, e o controle de unidade afeta todas as temperaturas apresentadas.
- A interface é em pt-BR; formatos de data, horário e número ainda serão decididos.
- Não haverá login nem persistência no servidor nesta versão; isso não implica que preferências serão salvas localmente.
- As personas são hipóteses de trabalho, não evidência de pesquisa com usuários.
- Os campos meteorológicos e as metas de qualidade descritos como baseline ainda aguardam aprovação; não devem ser tratados como requisito contratado antes do aceite.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| O produto pode não atender à necessidade prioritária por falta de validação de público, problema e resultado esperado. | Alta | Alto: baixo uso ou valor não demonstrável. | Validar problema e fluxo prioritário com usuários antes de congelar a spec; definir uma métrica de sucesso de produto. |
| Ambiguidade entre cidades pode levar à consulta do local errado. | Alta | Médio: previsão irrelevante e perda de confiança. | Exibir atributos de desambiguação disponíveis e exigir seleção explícita quando houver múltiplos resultados. |
| A fonte pode ficar lenta, indisponível ou limitar requisições. | Média | Alto: consultas não carregam ou demoram. | Confirmar termos, cobertura e limites; definir timeout, tentativa novamente, política de cache e comunicação de falha. |
| Fuso horário, cobertura e atualidade da fonte podem divergir das expectativas do usuário. | Média | Alto: dias ou condições apresentados incorretamente ou desatualizados. | Aprovar regra de fuso e atualização; validar respostas para localidades e transições de data representativas. |
| Campos meteorológicos e granularidade indefinidos podem causar retrabalho em conteúdo, integração e interface. | Alta | Alto: dados ou layout precisam ser refeitos após a implementação. | Fechar o conjunto mínimo de campos para clima atual e previsão antes do desenho detalhado e do desenvolvimento. |
| Conversões ou rótulos de unidade inconsistentes podem confundir usuários. | Média | Médio: interpretação incorreta das temperaturas. | Aplicar conversão de forma consistente, rotular valores e validar o fluxo de alternância com testes de aceite. |
| Requisitos de plataforma, acessibilidade e desempenho não têm limites mensuráveis. | Média | Alto: incompatibilidade ou barreiras de uso só são descobertas tardiamente. | Definir matriz de suporte e critérios quantitativos/de acessibilidade antes de estabelecer aceite de lançamento. |

## Out of Scope

Não fazem parte do escopo confirmado desta versão:

- Autenticação, contas de usuário e persistência de dados no servidor.
- Favoritos, histórico de consultas, alertas meteorológicos e compartilhamento.
- Aplicativos nativos, localização do dispositivo, telemetria e suporte offline.
- Previsão horária; a baseline da v1 é uma linha diária por data.
- Persistência local de cidade ou unidade entre recargas; a decisão ainda está em aberto.

## Open Questions

As baselines propostas precisam de aprovação antes de serem consideradas critérios de produção. OQ-02 a OQ-04 bloqueiam o congelamento do contrato de dados e dos critérios de lançamento.

- **OQ-01 — Resultado de produto:** qual problema e métrica de sucesso serão priorizados? Validar ou substituir as personas hipotéticas.
- **OQ-02 — Contrato de dados:** aprovar a baseline de campos atuais e diários, a probabilidade de precipitação e o uso do fuso local da cidade. Isso define o payload, os rótulos e os fixtures de teste.
- **OQ-03 — Qualidade de lançamento:** aprovar ou substituir a matriz de navegadores, WCAG 2.2 AA, metas de Core Web Vitals, limite de 3 s para geocoding e timeout de 8 s.
- **OQ-04 — Open-Meteo em produção:** validar cobertura das regiões alvo, limites, termos, atribuição, disponibilidade e comportamento HTTP de rate limit.
- **OQ-05 — Cobertura e busca:** quais países/regiões são obrigatórios? Código postal, sugestões, aliases e correspondência com/sem diacríticos continuam fora do contrato da v1 até decisão.
- **OQ-06 — Preferência local:** a unidade ou cidade pesquisada deve sobreviver a recarga? O padrão atual é não persistir localmente; confirmar antes de implementação.
