# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo para que usuários consultem condições meteorológicas de cidades. O briefing define quatro capacidades centrais: buscar cidades, visualizar o clima atual, consultar a previsão de cinco dias e alternar a unidade de temperatura entre Celsius e Fahrenheit. A aplicação também deve ser utilizável em dispositivos móveis.

O problema de negócio, os públicos prioritários e os detalhes da experiência ainda não foram especificados. Esta análise registra os requisitos conhecidos e destaca as decisões que precisam de validação antes da especificação detalhada.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário procure uma cidade e selecione o local desejado para consultar informações meteorológicas.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar uma previsão do tempo para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e refletir a unidade escolhida nas informações de temperatura exibidas.
- **RF-05 — Usar em dispositivos móveis:** disponibilizar as funções de busca, consulta do clima e alternância de unidade em dispositivos móveis.

Os campos meteorológicos específicos, a apresentação da previsão e o comportamento de busca ainda precisam ser definidos.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve se adaptar a telas de dispositivos móveis e permitir a utilização das funções centrais nesses dispositivos.
- **RNF-02 — Usabilidade:** os controles de busca, seleção de cidade e alternância de unidade devem ser compreensíveis e operáveis em telas menores.

O briefing não define metas de desempenho, disponibilidade, acessibilidade, navegadores suportados ou requisitos de segurança; esses atributos precisam ser detalhados na especificação.

## Riscos

| Categoria | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| Produto | Público, necessidade e critérios de sucesso não estão definidos; a solução pode não atender ao uso prioritário. | Alta | Alto: esforço investido sem adoção ou valor demonstrável. | Validar personas, situações de uso e métricas de sucesso antes de fechar a spec; priorizar o fluxo principal com usuários representativos. |
| Produto | Escopo da primeira versão e conteúdo do clima/previsão estão indefinidos. | Alta | Alto: expansão de escopo, retrabalho e divergência sobre o que significa “pronto”. | Delimitar o MVP e os campos de cada tela; registrar critérios de aceite e decisões sobre o período de cinco dias. |
| Produto | Busca pode retornar cidades homônimas ou com nomes/localidades ambíguas. | Alta | Médio: usuário consulta a previsão do lugar errado e perde confiança no produto. | Exibir país e região nos resultados; validar a seleção antes de carregar os dados. |
| Técnico | Indisponibilidade, lentidão ou limite de requisições da fonte meteorológica pode interromper consultas. | Média | Alto: clima atual e previsão deixam de carregar ou demoram demais. | Verificar cobertura e limites do provedor; tratar erros e timeout, permitir nova tentativa e definir cache com indicação de horário dos dados. |
| Técnico | Cobertura, atualização, fuso horário ou precisão dos dados podem variar por local e provedor. | Média | Alto: previsões incompletas, desatualizadas ou associadas ao dia incorreto. | Validar localidades e respostas representativas; normalizar fusos e horários, exibir a atualização e definir o comportamento para dados ausentes. |
| Técnico | Conversões de unidade ou formatação local podem ser inconsistentes entre clima atual e previsão. | Média | Médio: informação confusa e decisões equivocadas do usuário. | Centralizar conversões e formatação; indicar unidades explicitamente e cobrir valores-limite com testes unitários. |
| Técnico | Estados de carregamento, vazio, falha de rede e dados antigos não estão especificados. | Média | Alto: tela sem resposta útil ou dado antigo interpretado como atual. | Definir estados e ações de recuperação; testar falhas e informar claramente quando/quanto os dados foram atualizados. |
| Técnico | Requisito móvel não delimita navegadores, plataformas nem tamanhos de tela. | Média | Médio: fluxo principal pode falhar em dispositivos prioritários sem ser detectado antes da entrega. | Definir matriz mínima de suporte e validar busca, leitura e controles em viewports móveis e desktop. |
| Produto | Necessidades de acessibilidade e idioma/localidade não foram priorizadas. | Média | Alto: parte do público pode não conseguir usar a aplicação ou interpretar os dados. | Definir idiomas e critérios de acessibilidade; validar teclado, leitor de tela, contraste e formatos locais nos fluxos principais. |
| Produto/Técnico | Uso futuro de localização ou telemetria sem finalidade, consentimento e retenção definidos pode criar risco de privacidade. | Baixa | Alto: perda de confiança e possíveis obrigações de conformidade. | Não coletar localização/telemetria sem necessidade aprovada; documentar finalidade, consentimento, retenção e minimização antes de implementar. |

## Perguntas em Aberto

- **Problema e resultado esperado:** Qual necessidade concreta do usuário ou do negócio a aplicação deve resolver, e como será medido o sucesso? **Impacto:** sem um resultado e métricas, não há base para priorizar funcionalidades nem avaliar se o produto atende ao objetivo.
- **Público e contexto de uso:** Quem são os usuários prioritários e em quais situações consultarão o clima (por exemplo, planejamento ou decisão imediata)? **Impacto:** decisões de conteúdo, fluxo e prioridade podem favorecer o público errado.
- **Escopo da primeira versão:** As quatro capacidades citadas são o escopo completo ou há outras necessidades obrigatórias, como favoritos, histórico, alertas, compartilhamento, autenticação ou persistência no servidor? **Impacto:** sem limites explícitos, o escopo pode crescer durante a especificação e comprometer prazo e esforço.
- **Plataforma:** “Utilizável em dispositivos móveis” significa uma aplicação web responsiva, um aplicativo nativo ou ambos? **Impacto:** a escolha altera arquitetura, distribuição, custos e critérios de aceite.
- **Dispositivos e navegadores:** Quais sistemas operacionais, navegadores e larguras de tela precisam ser suportados? **Impacto:** sem uma matriz de suporte, compatibilidade e responsividade não podem ser verificadas objetivamente.
- **Cobertura geográfica:** Quais países ou regiões devem ser cobertos? **Impacto:** cobertura e qualidade de geocodificação e previsão variam por localização, podendo tornar a busca ou os dados inadequados para parte dos usuários.
- **Entrada da busca:** A busca aceita nomes de cidades apenas ou também país, região, código postal e acentos/nomes alternativos? Deve sugerir resultados enquanto a pessoa digita? **Impacto:** sem definir entradas e sugestões, ficam indeterminados o comportamento, a latência percebida e os casos de teste da busca.
- **Desambiguação:** Quais informações devem identificar resultados com nomes iguais ou semelhantes (país, estado/região ou coordenadas)? **Impacto:** o usuário pode selecionar a cidade errada e receber previsões irrelevantes.
- **Localização do usuário:** A pessoa deve poder usar a localização atual? Se sim, a solicitação de permissão é automática ou iniciada por ela? **Impacto:** isso afeta fluxo, permissões, privacidade e comportamento quando o acesso é negado; não deve ser presumido a partir da busca por cidade.
- **Clima atual:** Quais campos devem ser exibidos além da temperatura (por exemplo, condição, sensação térmica, umidade, vento ou precipitação)? **Impacto:** sem um conjunto mínimo definido, conteúdo, layout e completude da resposta variam por interpretação.
- **Significado de “cinco dias”:** O período inclui hoje? A partir de qual fuso horário e horário do dia começa a contagem? **Impacto:** diferentes interpretações produzem datas e quantidade de dias distintas, além de afetar o layout e a validação.
- **Granularidade da previsão:** A previsão deve ser somente diária ou também horária? Quais valores e condições devem aparecer por período? **Impacto:** a decisão altera a quantidade de dados, a apresentação e a complexidade de obtenção e teste.
- **Atualidade dos dados:** Com que frequência os dados devem ser atualizados e qual atraso máximo é aceitável? **Impacto:** sem um limite de atualidade, não é possível escolher política de atualização/cache nem comunicar se os dados ainda são confiáveis.
- **Unidades e preferências:** Celsius/Fahrenheit se aplica apenas à temperatura ou também devem ser escolhidas unidades de vento, precipitação e distância? Qual unidade inicial e a preferência deve persistir entre visitas? **Impacto:** conversões parciais ou preferências inconsistentes podem confundir o usuário e gerar retrabalho no modelo de dados e na interface.
- **Idioma e formatos locais:** Quais idiomas são necessários e como devem ser formatados datas, horários, números e unidades? **Impacto:** idioma e localidade afetam busca, rótulos e leitura dos dados; decisões tardias podem exigir retrabalho amplo de interface.
- **Estados de falha e vazio:** O que deve ocorrer quando não há resultados, a previsão está indisponível ou a API/rede falha? Deve haver nova tentativa ou indicação de dados anteriores? **Impacto:** sem esses fluxos, o usuário pode ficar sem orientação e a equipe não tem critérios para considerar a experiência resiliente.
- **Uso sem conexão e cache:** A aplicação precisa funcionar offline ou mostrar dados armazenados? Por quanto tempo dados antigos podem ser apresentados? **Impacto:** a resposta determina armazenamento, regras de expiração e como evitar apresentar informação desatualizada como atual.
- **Fonte e restrições de dados:** Qual provedor será usado? Há limites de uso, cobertura, custo, atribuição ou requisitos de chave/API? **Impacto:** a escolha pode impor custos, limites de requisição ou restrições técnicas e legais incompatíveis com a solução planejada.
- **Desempenho e disponibilidade:** Quais metas de tempo de carregamento, resposta da busca e disponibilidade são aceitáveis? **Impacto:** sem metas, não há critério objetivo para avaliar desempenho nem orientar cache, monitoramento ou tratamento de falhas.
- **Acessibilidade:** Quais padrões e necessidades de acessibilidade devem ser atendidos, incluindo teclado, leitores de tela e contraste? **Impacto:** sem critérios, uma interface pode impedir o uso por pessoas com deficiência e não há validação de aceite consistente.
- **Privacidade e telemetria:** Serão coletados dados de uso ou localização? Para qual finalidade, por quanto tempo e com qual consentimento? **Impacto:** coleta não definida pode criar riscos de privacidade e obrigações de conformidade; sem métricas, também fica difícil avaliar adoção e sucesso.

## Personas

As personas abaixo são hipóteses iniciais derivadas do briefing e devem ser validadas com usuários. Os tempos sugeridos são metas de discovery, não requisitos aprovados.

- **Decisora do dia a dia:** consulta o clima antes de sair para decidir o que vestir ou levar. **Objetivo principal:** entender rapidamente as condições atuais de uma cidade. **Contexto de uso:** principalmente mobile, em consultas curtas. **Métrica de sucesso:** consegue encontrar e interpretar o clima atual em até 30 segundos, sem ajuda; validar se esse tempo é adequado.
- **Planejador da semana:** organiza atividades ao ar livre e compara os próximos dias antes de escolher uma data. **Objetivo principal:** identificar quais dias atendem melhor aos seus planos. **Contexto de uso:** principalmente desktop para comparar a previsão, com consultas complementares no mobile. **Métrica de sucesso:** consegue selecionar um dia adequado entre os cinco apresentados sem refazer a busca; depende de a previsão incluir os campos relevantes, como condição e precipitação.
- **Pessoa consultando um destino:** vai viajar ou visitar outra cidade e precisa conferir as condições no local correto. **Objetivo principal:** localizar o destino e entender o clima esperado antes de sair. **Contexto de uso:** principalmente mobile, durante o planejamento ou deslocamento; desktop como contexto secundário. **Métrica de sucesso:** seleciona a cidade correta entre resultados ambíguos e encontra sua previsão na mesma tentativa, sem reiniciar a busca.

## Suposições

- O fluxo principal é buscar uma cidade, selecioná-la e consultar suas informações meteorológicas.
- A unidade Celsius/Fahrenheit se refere, no mínimo, aos valores de temperatura exibidos; a conversão de outras grandezas depende de confirmação.
- “Usar em dispositivos móveis” indica que as funções centrais devem estar acessíveis em uma tela móvel, mas não determina se o produto será web ou nativo.
- O briefing não solicita cadastro, localização automática, favoritos, alertas ou compartilhamento; essas capacidades não são tratadas como requisitos nesta análise.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Justificativa: atende à consulta de geocodificação e previsão sem exigir que o produto gerencie uma chave de API. **Resolve:** provedor inicial e necessidade de chave na pergunta sobre fonte e restrições de dados. **Ainda precisa ser verificado:** cobertura, limites de uso, termos, atribuição e disponibilidade.
- **Período da previsão: hoje + quatro dias seguintes.** Justificativa: fixa uma interpretação única para “cinco dias” e torna previsível a lista de datas apresentada. **Resolve:** se o dia atual está incluído na pergunta sobre o significado de “cinco dias”. **Ainda precisa ser definido:** fuso horário e horário de corte usados para determinar o dia atual.
- **Unidade padrão: Celsius.** Justificativa: estabelece uma unidade inicial consistente para a primeira consulta. **Resolve:** a unidade inicial na pergunta sobre unidades e preferências. **Ainda precisa ser definido:** persistência da preferência e unidades de outras grandezas; a alternância entre Celsius e Fahrenheit permanece requisito.
- **Sem autenticação e sem persistência de servidor.** Justificativa: mantém a primeira versão focada na consulta meteorológica sem exigir contas ou armazenamento remoto de dados do usuário. **Resolve:** parte da pergunta sobre escopo da primeira versão. **Ainda precisa ser definido:** se preferências serão mantidas localmente no dispositivo.
- **Idioma da interface: pt-BR.** Justificativa: define um idioma inicial para rótulos e conteúdo da interface. **Resolve:** o idioma inicial na pergunta sobre idiomas e formatos locais. **Ainda precisa ser definido:** formatos de data, hora e números, além de eventual suporte a outros idiomas.