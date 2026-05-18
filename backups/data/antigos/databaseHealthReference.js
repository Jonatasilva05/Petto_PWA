// frontend/pages/data/databaseHealthReference.js

export const MEDICAL_DATABASE = {
  vacinas: [
    // ---- CÃES ----
    {
      id: "vacina_v10_cao",
      nome: "Polivalente (V8 ou V10)",
      descricao: "Protege contra cinomose, hepatite infecciosa, parvovirose, adenovirose e leptospirose.",
      aplicacao: "Iniciar entre 6 a 8 semanas de vida, com 2 a 3 reforços. Revacinação anual.",
      species: ["cachorro"]
    },
    {
      id: "vacina_rabica_cao_gato",
      nome: "Antirrábica",
      descricao: "Previne a raiva, zoonose fatal e obrigatória por lei.",
      aplicacao: "Dose única a partir dos 4 meses, com reforço anual.",
      species: ["cachorro", "gato", "furao"]
    },
    {
      id: "vacina_gripe_canina",
      nome: "Gripe Canina (Tosse dos Canis)",
      descricao: "Protege contra a traqueobronquite infecciosa canina, muito contagiosa em locais com vários cães.",
      aplicacao: "Duas doses iniciais com intervalo de 2 a 4 semanas. Reforço anual.",
      species: ["cachorro"]
    },
    // ---- GATOS ----
    {
      id: "vacina_v4_gato",
      nome: "Polivalente Felina (V4 ou V5)",
      descricao: "Protege contra rinotraqueíte, calicivirose, panleucopenia e clamidiose. A V5 inclui FeLV (leucemia felina).",
      aplicacao: "Iniciar com 60 dias de vida, com reforços. Revacinação anual.",
      species: ["gato"]
    },
    // ---- COELHOS ----
    {
      id: "vacina_mixomatose_coelho",
      nome: "Vacina contra Mixomatose",
      descricao: "Protege contra a mixomatose, doença viral grave e frequentemente fatal em coelhos.",
      aplicacao: "A partir dos 5 semanas de vida. Reforço anual. Obrigatória para coelhos com acesso ao exterior.",
      species: ["coelho"]
    },
    {
      id: "vacina_doenca_hemorragica_coelho",
      nome: "Vacina contra Doença Hemorrágica Viral (RHDV)",
      descricao: "Protege contra a doença hemorrágica viral, que causa morte súbita em coelhos.",
      aplicacao: "A partir de 10 semanas de vida. Reforço anual.",
      species: ["coelho"]
    },
    // ---- PÁSSAROS ----
    {
      id: "vacina_newcastle",
      nome: "Vacina contra Newcastle",
      descricao: "Protege aves contra a doença de Newcastle, infecção viral grave que causa problemas respiratórios e neurológicos.",
      aplicacao: "Aplicação em gotas ou spray nas primeiras semanas. Reforços periódicos.",
      species: ["passaro"]
    },
    // ---- FURÕES ----
    {
      id: "vacina_cinomose_furao",
      nome: "Vacina contra Cinomose (Furão)",
      descricao: "Protege furões contra a cinomose, que é 100% fatal nessa espécie.",
      aplicacao: "Série inicial de 3 doses com 3 semanas de intervalo. Reforço anual.",
      species: ["furao"]
    }
  ],
  medicamentos: [
    // ---- CÃES E GATOS ----
    {
      id: "vermifugo_oral_cao_gato",
      nome: "Vermífugo",
      descricao: "Combate parasitas intestinais como lombrigas, tênias e ancilóstomos. Deve ser administrado periodicamente.",
      aplicacao: "A cada 3 a 6 meses para adultos. Filhotes com maior frequência (a cada 15–30 dias até os 6 meses).",
      species: ["cachorro", "gato"]
    },
    {
      id: "antipulgas_carrapatos_cao_gato",
      nome: "Antipulgas e Carrapatos",
      descricao: "Controla pulgas e carrapatos, prevenindo doenças graves como erliquiose e babesiose.",
      aplicacao: "Mensal ou trimestral, conforme o produto (pipeta, oral, coleira).",
      species: ["cachorro", "gato"]
    },
    // ---- GATOS ----
    {
      id: "malte_gato",
      nome: "Pasta de Malte",
      descricao: "Ajuda na eliminação de bolas de pelo ingeridas durante a lambedura, prevenindo obstrução intestinal.",
      aplicacao: "Uso regular 2 a 3 vezes por semana ou conforme necessidade.",
      species: ["gato"]
    },
    // ---- COELHOS ----
    {
      id: "vermifugo_coelho",
      nome: "Vermífugo para Coelhos",
      descricao: "Combate parasitas intestinais e previne a encefalitozoonose (doença neurológica causada por parasita).",
      aplicacao: "Uso periódico sob orientação veterinária. Fenbendazol é o mais indicado.",
      species: ["coelho"]
    },
    {
      id: "antiparasitario_coelho",
      nome: "Antiparasitário Tópico (Coelho)",
      descricao: "Controla ácaros, pulgas e piolhos em coelhos.",
      aplicacao: "Aplicação tópica mensal, conforme produto indicado por veterinário especialista.",
      species: ["coelho"]
    },
    // ---- PÁSSAROS ----
    {
      id: "vermifugo_aves",
      nome: "Vermífugo Aviário",
      descricao: "Combate parasitas gastrointestinais em aves. Indispensável para aves que vivem em gaiolas.",
      aplicacao: "Conforme recomendação veterinária, geralmente a cada 6 meses.",
      species: ["passaro"]
    },
    {
      id: "suplemento_calcio_aves",
      nome: "Suplemento de Cálcio",
      descricao: "Previne deficiências minerais, especialmente em fêmeas que botam ovos.",
      aplicacao: "Adicionado na água ou ração conforme orientação veterinária.",
      species: ["passaro"]
    },
    {
      id: "suplemento_vitaminas_aves",
      nome: "Suplemento Vitamínico para Aves",
      descricao: "Repõe vitaminas essenciais, especialmente A e D3, que podem ser deficientes em dietas apenas à base de sementes.",
      aplicacao: "Semanalmente na água ou ração, conforme o produto.",
      species: ["passaro"]
    },
    // ---- ROEDORES ----
    {
      id: "vitamina_c_roedor",
      nome: "Vitamina C",
      descricao: "Essencial para porquinhos-da-índia (cobaias), que não produzem vitamina C naturalmente. A deficiência causa escorbuto.",
      aplicacao: "Diária, em gotas na água ou alimentos ricos em vitamina C (pimentão, laranja).",
      species: ["roedor"]
    },
    {
      id: "vermifugo_roedor",
      nome: "Vermífugo para Roedores",
      descricao: "Combate parasitas intestinais em hamsters, gerbils e outros roedores.",
      aplicacao: "Uso somente sob prescrição veterinária de exóticos.",
      species: ["roedor"]
    },
    {
      id: "antiparasitario_roedor",
      nome: "Antiparasitário Tópico (Roedores)",
      descricao: "Trata e previne ácaros e pulgas em roedores domésticos.",
      aplicacao: "Aplicação tópica conforme orientação veterinária.",
      species: ["roedor"]
    },
    // ---- RÉPTEIS ----
    {
      id: "vermifugo_reptil",
      nome: "Vermífugo para Répteis",
      descricao: "Controla parasitas internos em lagartos, cobras e tartarugas. Indispensável para répteis recém-adquiridos.",
      aplicacao: "Apenas sob prescrição veterinária de especialista em répteis.",
      species: ["reptil", "tartaruga"]
    },
    {
      id: "suplemento_calcio_reptil",
      nome: "Suplemento de Cálcio e Vitamina D3 (Répteis)",
      descricao: "Previne a doença metabólica óssea (MBD), muito comum em répteis criados sem luz UVB adequada.",
      aplicacao: "Polvilhado nos alimentos a cada 2–3 alimentações.",
      species: ["reptil", "tartaruga"]
    },
    // ---- FURÕES ----
    {
      id: "antipulgas_furao",
      nome: "Antipulgas (Furão)",
      descricao: "Controla pulgas em furões. Produtos específicos para a espécie, pois muitos antipulgas de cão são tóxicos para furões.",
      aplicacao: "Mensal, conforme produto aprovado para furões.",
      species: ["furao"]
    },
    {
      id: "hormonio_furao",
      nome: "Implante Hormonal (Furão)",
      descricao: "Controla os ciclos de cio em fêmeas (o cio prolongado é fatal em furões fêmeas inteiras) e previne doenças adrenais.",
      aplicacao: "Implante subcutâneo, com duração de 2 a 4 anos. Indicado a partir dos 6 meses.",
      species: ["furao"]
    }
  ]
};