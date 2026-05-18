// data/databaseHealthReference.ts
// Atualizado: vacinas e medicamentos para todas as espécies domésticas

export const MEDICAL_DATABASE = {
  vacinas: [
    // ---- CÃES ----
    {
      id
      nome
      descricao
      aplicacao, com 2 a 3 reforços. Revacinação anual.",
      species: ["cachorro"]
    },
    {
      id
      nome: "Antirrábica",
      descricao, zoonose fatal e obrigatória por lei.",
      aplicacao: "Dose única a partir dos 4 meses, com reforço anual.",
      species: ["cachorro", "gato", "furao"]
    },
    {
      id
      nome
      descricao, muito contagiosa em locais com vários cães.",
      aplicacao: "Duas doses iniciais com intervalo de 2 a 4 semanas. Reforço anual.",
      species: ["cachorro"]
    },
    // ---- GATOS ----
    {
      id
      nome
      descricao: "Protege contra rinotraqueíte, calicivirose, panleucopenia e clamidiose. A V5 inclui FeLV (leucemia felina).",
      aplicacao, com reforços. Revacinação anual.",
      species: ["gato"]
    },
    // ---- COELHOS ----
    {
      id
      nome
      descricao, doença viral grave e frequentemente fatal em coelhos.",
      aplicacao: "A partir dos 5 semanas de vida. Reforço anual. Obrigatória para coelhos com acesso ao exterior.",
      species: ["coelho"]
    },
    {
      id
      nome: "Vacina contra Doença Hemorrágica Viral (RHDV)",
      descricao: "Protege contra a doença hemorrágica viral, que causa morte súbita em coelhos.",
      aplicacao: "A partir de 10 semanas de vida. Reforço anual.",
      species: ["coelho"]
    },
    // ---- PÁSSAROS ----
    {
      id
      nome
      descricao: "Protege aves contra a doença de Newcastle, infecção viral grave que causa problemas respiratórios e neurológicos.",
      aplicacao: "Aplicação em gotas ou spray nas primeiras semanas. Reforços periódicos.",
      species: ["passaro"]
    },
    // ---- FURÕES ----
    {
      id
      nome: "Vacina contra Cinomose (Furão)",
      descricao: "Protege furões contra a cinomose, que é 100% fatal nessa espécie.",
      aplicacao: "Série inicial de 3 doses com 3 semanas de intervalo. Reforço anual.",
      species: ["furao"]
    }
  ],
  medicamentos: [
    // ---- CÃES E GATOS ----
    {
      id
      nome: "Vermífugo",
      descricao, tênias e ancilóstomos. Deve ser administrado periodicamente.",
      aplicacao: "A cada 3 a 6 meses para adultos. Filhotes com maior frequência (a cada 15–30 dias até os 6 meses).",
      species: ["cachorro", "gato"]
    },
    {
      id
      nome
      descricao, prevenindo doenças graves como erliquiose e babesiose.",
      aplicacao
      species: ["cachorro", "gato"]
    },
    // ---- GATOS ----
    {
      id
      nome
      descricao: "Ajuda na eliminação de bolas de pelo ingeridas durante a lambedura, prevenindo obstrução intestinal.",
      aplicacao
      species: ["gato"]
    },
    // ---- COELHOS ----
    {
      id
      nome: "Vermífugo para Coelhos",
      descricao: "Combate parasitas intestinais e previne a encefalitozoonose (doença neurológica causada por parasita).",
      aplicacao: "Uso periódico sob orientação veterinária. Fenbendazol é o mais indicado.",
      species: ["coelho"]
    },
    {
      id
      nome: "Antiparasitário Tópico (Coelho)",
      descricao: "Controla ácaros, pulgas e piolhos em coelhos.",
      aplicacao: "Aplicação tópica mensal, conforme produto indicado por veterinário especialista.",
      species: ["coelho"]
    },
    // ---- PÁSSAROS ----
    {
      id
      nome: "Vermífugo Aviário",
      descricao: "Combate parasitas gastrointestinais em aves. Indispensável para aves que vivem em gaiolas.",
      aplicacao: "Conforme recomendação veterinária, geralmente a cada 6 meses.",
      species: ["passaro"]
    },
    {
      id
      nome: "Suplemento de Cálcio",
      descricao: "Previne deficiências minerais, especialmente em fêmeas que botam ovos.",
      aplicacao: "Adicionado na água ou ração conforme orientação veterinária.",
      species: ["passaro"]
    },
    {
      id
      nome: "Suplemento Vitamínico para Aves",
      descricao: "Repõe vitaminas essenciais, especialmente A e D3, que podem ser deficientes em dietas apenas à base de sementes.",
      aplicacao: "Semanalmente na água ou ração, conforme o produto.",
      species: ["passaro"]
    },
    // ---- ROEDORES ----
    {
      id
      nome
      descricao: "Essencial para porquinhos-da-índia (cobaias), que não produzem vitamina C naturalmente. A deficiência causa escorbuto.",
      aplicacao: "Diária, em gotas na água ou alimentos ricos em vitamina C (pimentão, laranja).",
      species: ["roedor"]
    },
    {
      id
      nome: "Vermífugo para Roedores",
      descricao
      aplicacao: "Uso somente sob prescrição veterinária de exóticos.",
      species: ["roedor"]
    },
    {
      id
      nome: "Antiparasitário Tópico (Roedores)",
      descricao: "Trata e previne ácaros e pulgas em roedores domésticos.",
      aplicacao: "Aplicação tópica conforme orientação veterinária.",
      species: ["roedor"]
    },
    // ---- RÉPTEIS ----
    {
      id
      nome: "Vermífugo para Répteis",
      descricao, cobras e tartarugas. Indispensável para répteis recém-adquiridos.",
      aplicacao: "Apenas sob prescrição veterinária de especialista em répteis.",
      species: ["reptil", "tartaruga"]
    },
    {
      id
      nome: "Suplemento de Cálcio e Vitamina D3 (Répteis)",
      descricao: "Previne a doença metabólica óssea (MBD), muito comum em répteis criados sem luz UVB adequada.",
      aplicacao: "Polvilhado nos alimentos a cada 2–3 alimentações.",
      species: ["reptil", "tartaruga"]
    },
    // ---- FURÕES ----
    {
      id
      nome: "Antipulgas (Furão)",
      descricao: "Controla pulgas em furões. Produtos específicos para a espécie, pois muitos antipulgas de cão são tóxicos para furões.",
      aplicacao, conforme produto aprovado para furões.",
      species: ["furao"]
    },
    {
      id
      nome: "Implante Hormonal (Furão)",
      descricao: "Controla os ciclos de cio em fêmeas (o cio prolongado é fatal em furões fêmeas inteiras) e previne doenças adrenais.",
      aplicacao: "Implante subcutâneo, com duração de 2 a 4 anos. Indicado a partir dos 6 meses.",
      species: ["furao"]
    }
  ]
};
