# Weather App — Backlog Priorizado

## Pré-condições

Antes de congelar os contratos de produção, aprovar as decisões da spec:

- **OQ-02:** campos meteorológicos, fuso e contrato de dados.
- **OQ-03:** matriz de navegadores, acessibilidade, metas de performance e timeout.
- **OQ-04:** cobertura, limites, termos, atribuição e disponibilidade do Open-Meteo.

**Prioridades:** P0 = núcleo funcional e testes necessários para concluir as fatias v1; P1 = hardening de qualidade/compatibilidade; P2 = medição de performance enquanto as metas continuam propostas. Se OQ-03 aprovar metas como gates de lançamento, reclassificar as tarefas correspondentes como bloqueadoras.

**Tamanho:** P = módulo ou teste isolado; M = fluxo coeso envolvendo até duas responsabilidades; G = integração ponta a ponta ou validação com múltiplos ambientes.

## Entrega 1 — Tipos

### T-01 — Definir os tipos de domínio

- **Tipo:** Data
- **Descrição:** declarar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e tipos de estado/erro do plano.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Critérios de aceite:** `Unit` é exatamente `"celsius" | "fahrenheit"`; tipos declaram os campos do Data Model; coordenadas podem faltar em resultados de geocoding; arquivo compila em TypeScript strict.
- **Rastreabilidade:** FR-02 a FR-05, Data Model.

## Entrega 2 — Funções puras

### T-02 — Mapear resultados de geocoding para City

- **Tipo:** Data
- **Descrição:** validar e mapear JSON de busca sem acesso a rede ou estado.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/mapGeocodingResponse.ts`.
- **Critérios de aceite:** mapeia `id`, `name`, `admin1`, `country`, `country_code`, coordenadas e timezone; lista ausente/vazia retorna `[]`; resultado sem coordenadas é representável e não selecionável; entrada malformada retorna erro tipado.
- **Rastreabilidade:** FR-01, FR-02, AC-01, AC-03, AC-04, AC-06.

### T-03 — Mapear resposta de forecast para WeatherData

- **Tipo:** Data
- **Descrição:** validar e normalizar `current`, arrays `daily`, timezone e unidades.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/mapForecastResponse.ts`.
- **Critérios de aceite:** `daily.time[i]` define a data e os valores do mesmo índice; campo ausente fica `undefined`; data ausente não produz dia; unidades divergentes geram erro de validação.
- **Rastreabilidade:** FR-03, FR-04, AC-07 a AC-11.

### T-04 — Implementar conversão de temperatura

- **Tipo:** Data
- **Descrição:** converter Celsius canônico para Celsius/Fahrenheit sem arredondar.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Critérios de aceite:** `0 °C -> 32 °F`, `25.5 °C -> 77.9 °F`, `-10 °C -> 14 °F` e `0 °F -> -17.777... °C`; entrada não é mutada; arredondamento fica fora da conversão.
- **Rastreabilidade:** FR-05, AC-12 a AC-14.

### T-05 — Implementar formatação pt-BR

- **Tipo:** Data
- **Descrição:** formatar datas, horários e números como funções puras.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/formatters.ts`.
- **Critérios de aceite:** `2026-11-11 17:05` formata como `11/11/2026 17:05`; `1234.5` formata como `1.234,5`; argumentos iguais produzem strings iguais.
- **Rastreabilidade:** NFR-02.

### T-06 — Mapear códigos meteorológicos WMO

- **Tipo:** Data
- **Descrição:** fornecer rótulos pt-BR para códigos WMO e fallback.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Critérios de aceite:** códigos `3` e `61` retornam rótulos pt-BR não vazios; código `999` retorna `Condição indisponível`.
- **Rastreabilidade:** FR-03, FR-04.

## Entrega 3 — Services

### T-07 — Implementar service de geocoding

- **Tipo:** Data
- **Descrição:** encapsular endpoint, query, transporte, timeout e erros de geocoding.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/openMeteoService.ts`.
- **Critérios de aceite:** envia query trimada ao endpoint aprovado e encaminha JSON validado ao mapper; lista vazia retorna `[]`; erros de rede, timeout, HTTP e JSON inválido são tipados; não chama forecast.
- **Rastreabilidade:** FR-01, FR-06, AC-01 a AC-04, AC-16, AC-17.

### T-08 — Implementar service de forecast

- **Tipo:** Data
- **Descrição:** consultar clima atual e cinco dias para as coordenadas selecionadas.
- **Dependências:** T-01, T-03; aprovação de OQ-02/OQ-04.
- **Arquivos prováveis:** `src/services/openMeteoService.ts`.
- **Critérios de aceite:** request envia coordenadas, campos `current`/`daily`, cinco dias, timezone e unidades aprovadas; resposta é mapeada antes de retornar `WeatherData`; rede, timeout, HTTP e JSON inválido retornam erros tipados.
- **Rastreabilidade:** FR-02 a FR-04, FR-06, AC-05 a AC-11, AC-16, AC-17.

## Entrega 4 — Hook e estado

### T-09 — Implementar estado de busca e seleção

- **Tipo:** UI
- **Descrição:** coordenar query, resultados, estados de busca e seleção explícita.
- **Dependências:** T-01, T-07.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:** query vazia gera zero chamadas; submissão válida transita `idle -> loading -> success|empty|error`; cidade sem coordenadas não é selecionável; resposta antiga não sobrescreve busca mais recente.
- **Rastreabilidade:** FR-01, FR-02, FR-06.

### T-10 — Implementar estado de forecast e retry

- **Tipo:** UI
- **Descrição:** coordenar clima/forecast, falhas, retry e descarte de resposta obsoleta.
- **Dependências:** T-09, T-08.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:** sucesso, ausência de dados e falha produzem estados distintos; request usa coordenadas da seleção ativa; erro preserva query/cidade; retry manual gera uma nova chamada; resposta antiga é ignorada.
- **Rastreabilidade:** FR-03, FR-04, FR-06.

### T-11 — Implementar estado da unidade

- **Tipo:** UI
- **Descrição:** adicionar unidade inicial Celsius e alternância local.
- **Dependências:** T-09, T-10, T-04.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:** estado inicial é `celsius`; ações alternam `celsius <-> fahrenheit`; cidade/período não mudam; alternar unidade não chama service.
- **Rastreabilidade:** FR-05.

## Entrega 5 — Componentes

### T-12 — Criar componente de busca

- **Tipo:** UI
- **Descrição:** criar campo controlado, submissão por botão/Enter e validação vazia.
- **Dependências:** T-09.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Critérios de aceite:** submeter `  São Paulo  ` chama `onSubmit("São Paulo")` uma vez; vazio não chama callback e mostra erro associado; campo tem label acessível e foco visível.
- **Rastreabilidade:** FR-01, AC-01, AC-02, NFR-02, NFR-03.

### T-13 — Criar componente de resultados e seleção

- **Tipo:** UI
- **Descrição:** exibir localidades e solicitar seleção explícita.
- **Dependências:** T-01, T-09.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Critérios de aceite:** exibe nome/região/país disponíveis; resultado sem coordenadas tem ação desabilitada e explicação; render inicial não chama `onSelect`; Enter/Space seleciona resultado válido.
- **Rastreabilidade:** FR-02, AC-03 a AC-06, NFR-03.

### T-14 — Criar visualizações de clima atual e previsão

- **Tipo:** UI
- **Descrição:** renderizar valores normalizados, datas e campos ausentes.
- **Dependências:** T-01, T-03, T-06, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/DailyForecast.tsx`.
- **Critérios de aceite:** heading mostra `city.name`; clima renderiza campos aprovados recebidos; cada `ForecastDay.date` gera uma linha em ordem; campo ausente mostra `Indisponível`; menos de cinco dias não cria linhas extras.
- **Rastreabilidade:** FR-03, FR-04, AC-07 a AC-11.

### T-15 — Criar controle de unidade

- **Tipo:** UI
- **Descrição:** alternar C/F usando valores derivados de Celsius.
- **Dependências:** T-04, T-11, T-14.
- **Arquivos prováveis:** `src/components/TemperatureUnitControl.tsx`.
- **Critérios de aceite:** todas as temperaturas exibem unidade; `0`, `25.5` e `-10 °C` aparecem como `32.0`, `77.9` e `14.0 °F`; cidade/datas e número de requests não mudam.
- **Rastreabilidade:** FR-05, AC-12 a AC-14.

### T-16 — Criar apresentação de estados de request

- **Tipo:** UI
- **Descrição:** apresentar loading, vazio, erro e ação de retry.
- **Dependências:** T-09, T-10.
- **Arquivos prováveis:** `src/components/RequestStatus.tsx`.
- **Critérios de aceite:** loading/empty/error têm mensagens pt-BR distintas; retry só aparece para `retryable=true` e chama callback uma vez; status é anunciado semanticamente e mantém foco visível.
- **Rastreabilidade:** FR-06, AC-15 a AC-18, NFR-03.

## Entrega 6 — Integração incremental

### T-17 — Preparar a raiz HTML

- **Tipo:** Infra
- **Descrição:** declarar alvo e módulo de entrada da aplicação no HTML.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `index.html`.
- **Critérios de aceite:** existe exatamente um elemento `id="root"`; documento referencia `/src/main.tsx` como módulo.
- **Rastreabilidade:** Overview, plataforma web.

### T-18 — Criar shell React e ponto de entrada

- **Tipo:** UI
- **Descrição:** montar `App` no elemento raiz e disponibilizar shell inicial.
- **Dependências:** T-17.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Critérios de aceite:** `main.tsx` monta `App` em `#root`; `App` renderiza heading `Weather App`; `pnpm build` termina com código 0.
- **Rastreabilidade:** Overview, NFR-01.

### T-19 — Aplicar estilos globais e Tailwind

- **Tipo:** UI
- **Descrição:** conectar Tailwind ao entrypoint e aplicar o tema global inicial.
- **Dependências:** T-18.
- **Arquivos prováveis:** `src/index.css`, `src/main.tsx`.
- **Critérios de aceite:** `main.tsx` importa `index.css`; CSS contém diretivas Tailwind e tema dark glassmorphism; `pnpm build` termina com código 0.
- **Rastreabilidade:** NFR-01 e convenções de estilo do projeto.

### T-20 — Integrar a primeira fatia: busca e seleção

- **Tipo:** UI
- **Descrição:** conectar busca, resultados e estado de request no App sem exigir forecast.
- **Dependências:** T-12, T-13, T-16, T-18, T-19.
- **Arquivos prováveis:** `src/App.tsx`.
- **Critérios de aceite:** `pnpm dev` permite buscar cidade, ver resultados/loading/vazio/erro e selecionar cidade; seleção não inicia forecast nesta fatia; componentes não chamam `fetch`.
- **Rastreabilidade:** FR-01, FR-02, FR-06.

### T-21 — Integrar clima atual e previsão

- **Tipo:** UI
- **Descrição:** estender o App para consultar e exibir clima/forecast após seleção.
- **Dependências:** T-20, T-08, T-10, T-14.
- **Arquivos prováveis:** `src/App.tsx`.
- **Critérios de aceite:** após selecionar cidade com coordenadas, UI chama forecast e exibe clima atual e até cinco dias; erros/vazios usam RequestStatus; `pnpm build` passa.
- **Rastreabilidade:** FR-03, FR-04, FR-06.

### T-22 — Integrar alternância de unidade

- **Tipo:** UI
- **Descrição:** conectar o controle de unidade à tela meteorológica.
- **Dependências:** T-21, T-11, T-15.
- **Arquivos prováveis:** `src/App.tsx`.
- **Critérios de aceite:** alternar C/F atualiza todas as temperaturas sem nova chamada ao service e sem alterar cidade/datas.
- **Rastreabilidade:** FR-05.

## Entrega 7 — Testes

### T-23 — Testar mapper de geocoding

- **Tipo:** Test
- **Descrição:** cobrir mapeamento, lista vazia, coordenadas ausentes e entrada inválida.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/lib/mapGeocodingResponse.test.ts`.
- **Critérios de aceite:** asserts verificam campos `City`, `[]` para lista vazia/ausente, não seleção sem coordenadas e erro tipado; teste passa sem rede.
- **Rastreabilidade:** AC-01, AC-03, AC-04, AC-06.

### T-24 — Testar mapper de forecast

- **Tipo:** Test
- **Descrição:** validar arrays diárias, campos ausentes, unidades e timezone.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/lib/mapForecastResponse.test.ts`.
- **Critérios de aceite:** fixture de cinco dias mapeia índices/datas; campo ausente fica `undefined`; data ausente não cria dia; unidade incompatível gera erro.
- **Rastreabilidade:** AC-07 a AC-11.

### T-25 — Testar conversão de temperatura

- **Tipo:** Test
- **Descrição:** validar conversão e precisão numérica isoladamente.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/lib/temperature.test.ts`.
- **Critérios de aceite:** asserts incluem `0 °C = 32 °F`, `25.5 °C = 77.9 °F`, `-10 °C = 14 °F` e `0 °F = -17.777... °C`; teste passa.
- **Rastreabilidade:** AC-12 a AC-14.

### T-26 — Testar formatação e rótulos WMO

- **Tipo:** Test
- **Descrição:** cobrir formato pt-BR e códigos suportados/desconhecidos.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/lib/formatters.test.ts`, `tests/lib/weatherCodes.test.ts`.
- **Critérios de aceite:** asserts verificam `11/11/2026 17:05`, `1.234,5`, rótulos não vazios para 3/61 e fallback exato para 999; testes passam sem rede.
- **Rastreabilidade:** NFR-02, FR-03, FR-04.

### T-27 — Testar service de geocoding

- **Tipo:** Test
- **Descrição:** verificar endpoint de busca com `fetch` controlado.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/services/openMeteoGeocoding.test.ts`.
- **Critérios de aceite:** asserts verificam URL/parâmetros, payload mapeado, rede, timeout via fake timers, abort, 429, 5xx e JSON inválido; sem rede externa.
- **Rastreabilidade:** AC-01 a AC-04, AC-16, AC-17.

### T-28 — Testar service de forecast

- **Tipo:** Test
- **Descrição:** verificar endpoint meteorológico com `fetch` controlado.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/services/openMeteoForecast.test.ts`.
- **Critérios de aceite:** asserts verificam coordenadas, `current`/`daily`, timezone/unidades aprovados, payload normalizado, rede, timeout, abort, HTTP não-success e JSON inválido; sem rede externa.
- **Rastreabilidade:** AC-05 a AC-11, AC-16 a AC-18.

### T-29 — Testar estado de busca e seleção

- **Tipo:** Test
- **Descrição:** verificar transições e concorrência de busca com services mockados.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/hooks/useWeatherSearch.test.ts`.
- **Critérios de aceite:** asserts cobrem cinco estados, zero requests para input vazio, seleção explícita, coordenadas ausentes e respostas A/B fora de ordem; teste passa.
- **Rastreabilidade:** AC-01 a AC-06.

### T-30 — Testar estado de forecast e retry

- **Tipo:** Test
- **Descrição:** verificar sucesso, vazio, erro, retry e concorrência meteorológica.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/hooks/useWeatherData.test.ts`.
- **Critérios de aceite:** asserts cobrem loading/success/empty/error, retry com exatamente uma nova chamada, timeout e resposta obsoleta; teste passa com services mockados.
- **Rastreabilidade:** AC-07 a AC-11, AC-15 a AC-19.

### T-31 — Testar estado e alternância de unidade

- **Tipo:** Test
- **Descrição:** garantir que unidade controla apenas a apresentação.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/hooks/useWeatherUnit.test.ts`.
- **Critérios de aceite:** espera `celsius`, observa `fahrenheit` e o retorno a `celsius`; spy do service mantém a mesma contagem de chamadas; teste passa.
- **Rastreabilidade:** AC-12 a AC-14.

### T-32 — Testar busca e resultados

- **Tipo:** Test
- **Descrição:** cobrir interação e estados dos componentes de busca/seleção.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/CityResults.test.tsx`.
- **Critérios de aceite:** asserts cobrem Enter/botão, query trimada, vazio sem callback, homônimos, coordenadas ausentes e seleção por teclado; testes passam sem rede.
- **Rastreabilidade:** FR-01, FR-02, AC-01 a AC-06, NFR-03.

### T-33 — Testar visualizações meteorológicas

- **Tipo:** Test
- **Descrição:** cobrir apresentação de clima atual e previsão diária.
- **Dependências:** T-14, T-21.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/DailyForecast.test.tsx`.
- **Critérios de aceite:** asserts cobrem cidade, valores fornecidos, datas em ordem, campos ausentes e previsão incompleta sem linhas inventadas; testes passam sem rede.
- **Rastreabilidade:** FR-03, FR-04, AC-07 a AC-11.

### T-34 — Testar controle de unidade

- **Tipo:** Test
- **Descrição:** cobrir alternância C/F no componente de temperatura.
- **Dependências:** T-15, T-22.
- **Arquivos prováveis:** `tests/components/TemperatureUnitControl.test.tsx`.
- **Critérios de aceite:** asserts cobrem unidade inicial Celsius, valores renderizados C/F, rótulos compatíveis, volta a Celsius e zero chamadas adicionais ao service; teste passa sem rede.
- **Rastreabilidade:** FR-05, AC-12 a AC-14.

### T-35 — Testar estados do componente RequestStatus

- **Tipo:** Test
- **Descrição:** verificar estados loading, erro, vazio e sucesso, além de retry.
- **Dependências:** T-16.
- **Arquivos prováveis:** `tests/components/RequestStatus.test.tsx`.
- **Critérios de aceite:** cada status renderiza mensagem distinta; retry só aparece para `retryable=true` e chama callback uma vez; teste de teclado alcança retry; passa sem rede.
- **Rastreabilidade:** FR-06, AC-15 a AC-18, NFR-03.

### T-36 — Configurar projetos Playwright

- **Tipo:** Infra
- **Descrição:** declarar projetos de navegador e viewports conforme OQ-03.
- **Dependências:** aprovação de OQ-03.
- **Arquivos prováveis:** `playwright.config.ts`.
- **Critérios de aceite:** projetos correspondem aos navegadores aprovados; projeto mobile declara viewport/touch acordados; `testDir` é `tests/e2e` e `webServer.url` corresponde ao Vite.
- **Rastreabilidade:** NFR-01, NFR-03.

### T-37 — Cobrir fluxo principal em desktop e mobile

- **Tipo:** Test
- **Descrição:** testar o fluxo de ponta a ponta interceptando Open-Meteo nos projetos desktop e mobile.
- **Dependências:** T-20, T-21, T-22, T-32, T-33, T-34, T-35, T-36.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`, `tests/fixtures/openMeteo.ts`.
- **Critérios de aceite:** busca -> seleção -> clima/5 dias -> C/F sem request adicional roda nos projetos Chromium desktop e mobile; busca vazia e erro/retry também rodam em mobile; requests são interceptados; `pnpm test:e2e -- tests/e2e/weather-flow.spec.ts` passa.
- **Rastreabilidade:** US-01 a US-06, AC-01 a AC-19, NFR-01.

## Entrega 8 — Hardening

### T-38 — Validar viewports e navegadores aprovados

- **Tipo:** Test
- **Descrição:** executar o fluxo principal em mobile, tablet e desktop.
- **Dependências:** T-36, T-37; aprovação de OQ-03.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`, `playwright.config.ts`.
- **Critérios de aceite:** fluxo roda em `320x720`, `390x844`, `768x1024` e `1440x900`; `scrollWidth <= clientWidth`; controles permanecem operáveis em cada projeto aprovado.
- **Rastreabilidade:** NFR-01.

### T-39 — Adicionar scanner de acessibilidade

- **Tipo:** Infra
- **Descrição:** instalar integração axe para Playwright.
- **Dependências:** aprovação de OQ-03.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Critérios de aceite:** `@axe-core/playwright` consta em `devDependencies`, lockfile está atualizado e `pnpm install --frozen-lockfile` termina com código 0.
- **Rastreabilidade:** NFR-03.

### T-40 — Testar acessibilidade automatizada e teclado

- **Tipo:** Test
- **Descrição:** auditar telas principais e navegação por teclado.
- **Dependências:** T-20, T-39; aprovação de OQ-03.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Critérios de aceite:** axe reporta zero violações críticas/sérias nas telas de busca/resultado; Tab/Enter completa busca/seleção com foco visível; resultados são reportados sem declarar conformidade total só pelo scanner.
- **Rastreabilidade:** NFR-03.

### T-41 — Medir performance e latência de geocoding

- **Tipo:** Test
- **Descrição:** medir performance móvel e latência sob ambiente de rede acordado.
- **Dependências:** T-37; aprovação de OQ-03.
- **Arquivos prováveis:** `lighthouserc.cjs`, `tests/e2e/performance.spec.ts`.
- **Critérios de aceite:** relatório registra LCP, CLS, INP p75 quando dados de campo estiverem disponíveis e p95 de geocoding em 10 Mbps/100 ms RTT; compara com `LCP <= 2.5 s`, `CLS <= 0.1`, `INP <= 200 ms`, `geocoding p95 <= 3 s` aprovados.
- **Rastreabilidade:** NFR-04.

## Entrega por Fatias Verticais

| Fatia | Tarefas | Resultado demonstrável |
| --- | --- | --- |
| 1. Busca e seleção | Implementar T-01, T-02, T-07, T-09, T-12, T-13, T-16 a T-20; validar com T-23, T-27, T-29, T-32 e T-35 | App executável permite buscar cidade, ver resultados/loading/vazio/erro e selecionar localidade; não chama forecast antes da fatia seguinte. |
| 2. Clima atual e previsão | Implementar T-03, T-05, T-06, T-08, T-10, T-14 e T-21; validar com T-24, T-26, T-28 e T-30 | Após seleção, App exibe clima atual e até cinco dias, incluindo campos parciais e estados de erro. |
| 3. Conversão C/F | Implementar T-04, T-11, T-15 e T-22; validar com T-25, T-31, T-34, T-36 e T-37 | Pessoa alterna unidades sem refazer requests e sem alterar cidade/datas; fluxo principal passa em desktop e mobile. |
| 4. Qualidade de lançamento | Executar T-38 a T-41 após aprovação de OQ-03 | Viewports/navegadores, acessibilidade e performance são verificados contra os gates aprovados. |

## Prioridade e Tamanho

P0 bloqueia o núcleo v1; P1 fecha qualidade de lançamento; P2 mede metas de performance ainda propostas e pode subir de prioridade após OQ-03. P = pequeno/isolado, M = médio/coeso, G = integração ou validação abrangente.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | P |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | P |
| T-06 | P0 | P |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | P |
| T-12 | P0 | P |
| T-13 | P0 | P |
| T-14 | P0 | M |
| T-15 | P0 | P |
| T-16 | P0 | P |
| T-17 | P0 | P |
| T-18 | P0 | P |
| T-19 | P0 | P |
| T-20 | P0 | M |
| T-21 | P0 | G |
| T-22 | P0 | M |
| T-23 | P0 | P |
| T-24 | P0 | P |
| T-25 | P0 | P |
| T-26 | P1 | P |
| T-27 | P0 | P |
| T-28 | P0 | P |
| T-29 | P0 | P |
| T-30 | P0 | P |
| T-31 | P0 | P |
| T-32 | P0 | M |
| T-33 | P0 | M |
| T-34 | P0 | P |
| T-35 | P0 | P |
| T-36 | P1 | M |
| T-37 | P0 | G |
| T-38 | P1 | M |
| T-39 | P1 | P |
| T-40 | P1 | M |
| T-41 | P2 | G |

## Matriz de rastreabilidade — Requisitos funcionais

| Requisito da spec | Implementação | Testes/verificação |
| --- | --- | --- |
| FR-01 — Buscar cidades | T-02, T-07, T-09, T-12, T-13, T-20 | T-23, T-27, T-29, T-32, T-35, T-37 |
| FR-02 — Selecionar localidade | T-02, T-08, T-09, T-13, T-20, T-21 | T-23, T-28, T-29, T-32, T-37 |
| FR-03 — Consultar clima atual | T-03, T-06, T-08, T-10, T-14, T-21 | T-24, T-26, T-28, T-30, T-33, T-37 |
| FR-04 — Consultar previsão de cinco dias | T-03, T-05, T-08, T-10, T-14, T-21 | T-24, T-26, T-28, T-30, T-33, T-37 |
| FR-05 — Alternar unidade de temperatura | T-04, T-11, T-15, T-22 | T-25, T-31, T-34, T-37 |
| FR-06 — Comunicar estados de consulta | T-07, T-08, T-09, T-10, T-16, T-20, T-21 | T-27 a T-30, T-35, T-37 |

Todos os requisitos funcionais FR-01 a FR-06 têm implementação e testes associados; nenhum está sem tarefa correspondente.