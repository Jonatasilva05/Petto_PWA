// data/encyclopediaMedi.ts
// Atualizado: linguagem simples e acessível para leigos

export const ENCYCLOPEDIA_MEDI= [

  // ===================================================
  // CACHORRO
  // ===================================================
  {
    species_value: 'cachorro',
    vaccines: [
      {
        id: 'vacina_v10_cao',
        nome)',
        alias: ['Múltipla', 'Polivalente'],
        previne_trata: ["Cinomose", "Parvovirose", "Hepatite Infecciosa", "Parainfluenza", "Leptospirose"],
        esquema: {
          primario: 'Começa quando o filhote tem entre 6 e 8 semanas de vida. São aplicadas de 2 a 3 doses, com intervalo de 3 a 4 semanas entre cada uma.',
          reforco, durante toda a vida do animal.',
          observacoes: 'Essa é a vacina mais importante do cão. A versão V10 protege contra mais tipos de leptospirose do que a V8.'
        },
        regra: {
          contraindicacoes: ["Cão doente ou com febre no dia da vacina", "Reação alérgica a doses anteriores"],
          efeitos_comuns: ["Dorzinha no local da injeção", "Sonolência no dia da vacina", "Febre baixa por até 24 horas — isso é normal e significa que o corpo está respondendo à vacina"],
          observacoes: 'Se o cão ficar letárgico por mais de 2 dias ou apresentar inchaço no focinho após a vacina, leve ao veterinário imediatamente.'
        }
      },
      {
        id: 'vacina_rabica_cao_gato',
        nome: 'Antirrábica (Raiva)',
        alias: ['Vacina da Raiva'],
        previne_trata: ["Raiva"],
        esquema: {
          primario: 'Uma única dose a partir dos 3 a 4 meses de idade.',
          reforco, sem exceção. É obrigatória por lei.',
          observacoes: 'A raiva não tem cura. É uma doença que mata tanto animais quanto pessoas. Vacinar é a única forma de proteger seu pet e sua família.'
        },
        regra: {
          efeitos_comuns: ["Dorzinha ou inchaço pequeno no local da injeção — passa em 1 a 2 dias"],
          observacoes: 'Nunca pule o reforço anual. Independente de o animal não sair de casa.'
        }
      },
      {
        id: 'vacina_gripe_canina',
        nome)',
        alias: ['Bordetella', 'Tosse dos Canis'],
        previne_trata: ["Traqueobronquite Infecciosa Canina — uma tosse muito contagiosa entre cães"],
        esquema: {
          primario, dependendo do tipo do produto (oral ou injetável).',
          reforco: 'Uma vez por ano.',
          observacoes: 'Ideal para cães que frequentam petshops, creches, hotéis, parques ou qualquer local com outros cães.'
        },
        regra: {
          contraindicacoes: ["Cão com sintomas respiratórios no momento da vacinação"],
          efeitos_comuns: ["Espirros por 1 a 2 dias (quando a vacina é aplicada no nariz)", "Tosse leve passageira"],
          observacoes: 'Pense nela como a "gripe" dos cães — fácil de passar de um para o outro em ambientes fechados.'
        }
      }
    ],
    medications: [
      {
        id: 'vermifugo_oral_cao_gato',
        nome: 'Vermífugo',
        alias: ['Remédio de verme', 'Antiparasitário interno'],
        previne_trata: ["Vermes intestinais (lombrigas, tênias, ancilóstomos)", "Giárdia (em alguns tipos)"],
        regra: {
          quando_usar, mesmo que o cão pareça saudável — muitos vermes não causam sintomas visíveis.',
          intervalo: 'A cada 3 meses para cães adultos. Filhotes com até 6 meses devem tomar a cada 15 a 30 dias.',
          contraindicacoes: ["Fêmeas grávidas devem usar apenas produtos liberados para gestação", "Animais muito debilitados — consulte o veterinário antes"],
          efeitos_comuns: ["Diarreia ou vômito leve se o cão tiver muitos vermes — o corpo está eliminando os parasitas"],
          observacoes: 'Crianças podem ser infectadas pelos mesmos vermes dos pets. Por isso, vermifugar o pet regularmente também protege a família.'
        }
      },
      {
        id: 'antipulgas_carrapatos_cao_gato',
        nome: 'Antipulgas e Carrapatos',
        alias: ['Remédio de pulga', 'Antiparasitário externo'],
        previne_trata: ["Pulgas", "Carrapatos", "Piolhos", "Sarna (alguns tipos)"],
        regra: {
          quando_usar, independente da estação. No verão e período chuvoso o risco aumenta muito.',
          intervalo: 'Depende do produto, pipetas mensais ou coleiras que duram até 8 meses.',
          contraindicacoes: ["Filhotes muito jovens ou leves — verifique o peso mínimo na embalagem"],
          efeitos_comuns: ["Irritação leve no local onde a pipeta foi aplicada — passe em 1 a 2 dias"],
          observacoes: 'Pulgas podem causar anemia em filhotes pequenos. Carrapatos transmitem doenças sérias como a Erliquiose e a Babesiose (Doença do Carrapato). Não pule esse tratamento.'
        }
      }
    ]
  },

  // ===================================================
  // GATO
  // ===================================================
  {
    species_value: 'gato',
    vaccines: [
      {
        id: 'vacina_v4_gato',
        nome)',
        alias: ['Quádrupla Felina', 'Quíntupla Felina'],
        previne_trata: ["Rinotraqueíte (herpes felino)", "Calicivirose", "Panleucopenia (cinomose dos gatos)", "Clamidiose"],
        esquema: {
          primario: 'Começa com 60 dias de vida. São 2 a 3 doses com intervalo de 3 semanas.',
          reforco: 'Uma vez por ano.',
          observacoes: 'A V5 inclui proteção extra contra a Leucemia Felina (FeLV) e é indicada para gatos que saem de casa ou convivem com outros gatos não testados.'
        },
        regra: {
          contraindicacoes: ["Gato doente ou com febre"],
          efeitos_comuns: ["Sonolência por até 24 horas", "Falta de apetite passageira", "Dorzinha local"],
          observacoes: 'Mesmo gatos que vivem 100% dentro de casa devem ser vacinados — vírus podem entrar na sola do seu sapato.'
        }
      },
      {
        id: 'vacina_rabica_cao_gato',
        nome: 'Antirrábica (Raiva)',
        alias: ['Vacina da Raiva'],
        previne_trata: ["Raiva"],
        esquema: {
          primario: 'Dose única a partir dos 3 a 4 meses.',
          reforco, obrigatório por lei.',
        },
        regra: {
          efeitos_comuns: ["Dorzinha no local, leve sonolência"],
          observacoes: 'Obrigatória mesmo para gatos que vivem dentro de casa.'
        }
      }
    ],
    medications: [
      {
        id: 'vermifugo_oral_cao_gato',
        nome: 'Vermífugo',
        alias: ['Remédio de verme'],
        previne_trata: ["Vermes intestinais", "Toxoplasmose (prevenção indireta)"],
        regra: {
          quando_usar, a cada 3 meses para adultos. Filhotes: a cada 15 a 30 dias até os 6 meses.',
          contraindicacoes: ["Gatas grávidas: usar apenas produtos específicos para gestação"],
          efeitos_comuns: ["Vômito ou diarreia leve — indica que havia vermes sendo eliminados"],
          observacoes, pode ser perigoso para gestantes humanas. Manter o gato vermifugado é uma medida de proteção para toda a família.'
        }
      },
      {
        id: 'antipulgas_carrapatos_cao_gato',
        nome: 'Antipulgas e Carrapatos',
        alias: ['Remédio de pulga'],
        previne_trata: ["Pulgas", "Carrapatos", "Piolhos"],
        regra: {
          quando_usar: 'O ano todo.',
          intervalo, dependendo do produto.',
          contraindicacoes: ["Filhotes com menos de 8 semanas", "NUNCA use produto de cão em gato — pode ser fatal"],
          efeitos_comuns: ["Irritação leve no local da pipeta"],
          observacoes: 'Existem produtos específicos para gatos. Jamais use um antipulgas de cão em gato.'
        }
      },
      {
        id: 'malte_gato',
        nome: 'Pasta de Malte',
        alias: ['Removedor de bola de pelo', 'Malte'],
        previne_trata: ["Acúmulo de bolas de pelo no estômago e intestino"],
        regra: {
          quando_usar: 'Especialmente em gatos de pelo longo ou que tossem e vomitam pelos com frequência.',
          intervalo, ou conforme orientação veterinária.',
          efeitos_comuns: ["Fezes mais escuras e amolecidas — isso é normal, os pelos estão sendo eliminados"],
          observacoes: 'Gatos se limpam lambendo o próprio corpo e engolindo muito pelo. Sem ajuda, esse pelo pode virar uma "bola" que causa vômitos, constipação e até obstrução intestinal. A pasta de malte "lubrifica" e ajuda o pelo a passar naturalmente pelas fezes.'
        }
      }
    ]
  },

  // ===================================================
  // COELHO
  // ===================================================
  {
    species_value: 'coelho',
    vaccines: [
      {
        id: 'vacina_mixomatose_coelho',
        nome: 'Vacina contra Mixomatose',
        previne_trata: ["Mixomatose — doença viral grave que causa inchaços no corpo e é frequentemente fatal"],
        esquema: {
          primario: 'A partir das 5 semanas de vida.',
          reforco: 'Uma vez por ano.',
          observacoes: 'Fundamental para coelhos que têm acesso ao quintal ou que vivem em áreas onde há mosquitos e pulgas, que transmitem a doença.'
        },
        regra: {
          efeitos_comuns: ["Inchaço pequeno no local da aplicação"],
          observacoes: 'Não há tratamento eficaz para mixomatose. A vacina é a única proteção.'
        }
      },
      {
        id: 'vacina_doenca_hemorragica_coelho',
        nome: 'Doença Hemorrágica Viral (RHDV)',
        previne_trata: ["Doença Hemorrágica Viral — mata o coelho em menos de 72 horas, geralmente sem sintomas prévios"],
        esquema: {
          primario: 'A partir das 10 semanas de vida.',
          reforco: 'Anual.',
          observacoes: 'O vírus pode chegar até coelhos de apartamento através de roupas, sapatos e até vento. Não espere o animal adoecer.'
        },
        regra: {
          efeitos_comuns: ["Leve letargia no dia da vacinação"],
          observacoes: 'Poucos veterinários no Brasil trabalham com coelhos. Busque um especialista em animais exóticos.'
        }
      }
    ],
    medications: [
      {
        id: 'vermifugo_coelho',
        nome: 'Vermífugo para Coelhos (Fenbendazol)',
        previne_trata: ["Parasitas intestinais", "Encefalitozoonose — doença neurológica causada por um parasita microscópico"],
        regra: {
          quando_usar, e periodicamente conforme orientação veterinária.',
          contraindicacoes: ["Fêmeas grávidas — usar apenas com orientação veterinária"],
          efeitos_comuns: ["Fezes mais moles transitoriamente"],
          observacoes: 'A encefalitozoonose é silenciosa e pode causar torcicolo, perda de equilíbrio e convulsões. O fenbendazol é o medicamento de escolha e só deve ser usado sob orientação veterinária.'
        }
      }
    ]
  },

  // ===================================================
  // PÁSSARO
  // ===================================================
  {
    species_value: 'passaro',
    vaccines: [
      {
        id: 'vacina_newcastle',
        nome: 'Vacina contra Newcastle',
        previne_trata: ["Doença de Newcastle — causa problemas respiratórios, digestivos e neurológicos nas aves, com alta mortalidade"],
        esquema: {
          primario, em gotas na água ou spray.',
          reforco: 'Periódico, conforme manejo e risco da região.',
          observacoes: 'Obrigatória em criações comerciais. Para aves de companhia, é recomendada em áreas com surtos registrados.'
        },
        regra: {
          observacoes: 'Consulte um veterinário especialista em aves (ornitólogo) para saber se é necessária na sua região.'
        }
      }
    ],
    medications: [
      {
        id: 'vermifugo_aves',
        nome: 'Vermífugo Aviário',
        previne_trata: ["Parasitas gastrointestinais que causam perda de peso, diarreia e fraqueza nas aves"],
        regra: {
          quando_usar: 'A cada 6 meses ou quando o veterinário indicar após exame de fezes.',
          contraindicacoes: ["Aves muito debilitadas sem acompanhamento veterinário"],
          efeitos_comuns: ["Fezes mais amolecidas por 1 a 2 dias"],
          observacoes: 'Aves disfarçam muito bem sinais de doença. Exames preventivos e vermifugação regular são a melhor estratégia.'
        }
      },
      {
        id: 'suplemento_calcio_aves',
        nome: 'Suplemento de Cálcio',
        previne_trata: ["Deficiência de cálcio", "Osteoporose aviária", "Problemas na casca dos ovos"],
        regra: {
          quando_usar: 'Regularmente em fêmeas que botam ovos, ou quando indicado pelo veterinário.',
          intervalo: 'Conforme instrução do produto ou do veterinário.',
          observacoes: 'Fêmeas que botam ovos sem fertilização (ovos claros) perdem muito cálcio. Sem reposição, podem desenvolver fraturas e convulsões.'
        }
      },
      {
        id: 'suplemento_vitaminas_aves',
        nome: 'Suplemento Vitamínico para Aves',
        previne_trata: ["Deficiência de vitaminas A e D3", "Fraqueza e imunidade baixa"],
        regra: {
          quando_usar).',
          intervalo: 'Semanal na água ou conforme indicação do produto.',
          observacoes: 'Dietas à base só de sementes são deficientes em vitaminas essenciais. O ideal é oferecer frutas, verduras e ração balanceada junto com o suplemento.'
        }
      }
    ]
  },

  // ===================================================
  // ROEDOR
  // ===================================================
  {
    species_value: 'roedor',
    vaccines: [],
    medications: [
      {
        id: 'vitamina_c_roedor',
        nome: 'Vitamina C',
        previne_trata: ["Escorbuto em porquinhos-da-índia (cobaias)"],
        regra: {
          quando_usar, especialmente para porquinhos-da-índia — eles não produzem vitamina C naturalmente e morrem sem ela.',
          intervalo: 'Diário, em gotas na água ou em alimentos ricos em vitamina C como pimentão, laranja e salsinha.',
          observacoes: 'Hamsters e gerbils não precisam de suplementação de vitamina C. Mas cobaias (porquinhos-da-índia) precisam dela todo dia. Sinais de deficiência, recusa em se mover.'
        }
      },
      {
        id: 'vermifugo_roedor',
        nome: 'Vermífugo para Roedores',
        previne_trata: ["Parasitas intestinais em hamsters, gerbils e outros roedores"],
        regra: {
          quando_usar: 'Apenas sob prescrição de veterinário especialista em exóticos.',
          contraindicacoes: ["Nunca use vermífugos de cão ou gato em roedores — a dose e o produto são diferentes"],
          observacoes: 'Roedores são muito sensíveis a medicamentos. Nunca automedique — leve ao veterinário de exóticos.'
        }
      }
    ]
  },

  // ===================================================
  // RÉPTIL
  // ===================================================
  {
    species_value: 'reptil',
    vaccines: [],
    medications: [
      {
        id: 'vermifugo_reptil',
        nome: 'Vermífugo para Répteis',
        previne_trata: ["Parasitas internos — muito comuns em lagartos, cobras e tartarugas recém-adquiridos"],
        regra: {
          quando_usar: 'Em todo réptil novo trazido para casa. Também periodicamente a cada 6 meses.',
          contraindicacoes: ["Nunca use vermífugos de mamíferos em répteis"],
          observacoes: 'Quase todos os répteis comprados em lojas ou criadores carregam parasitas. É fundamental fazer exame de fezes e vermifugar com veterinário de exóticos.'
        }
      },
      {
        id: 'suplemento_calcio_reptil',
        nome: 'Suplemento de Cálcio e Vitamina D3',
        previne_trata: ["Doença Metabólica Óssea (MBD) — causa ossos moles, fraturas espontâneas e morte"],
        regra: {
          quando_usar: 'Em todos os répteis que não têm acesso à luz solar natural ou lâmpada UVB adequada.',
          intervalo: 'Polvilhar diretamente nos insetos ou alimentos a cada 2 a 3 refeições.',
          observacoes: 'A Doença Metabólica Óssea é a causa número 1 de morte em répteis domésticos. Répteis sem luz UVB não conseguem produzir vitamina D3, que é essencial para absorver o cálcio. Resultado: ossos que se quebram com facilidade. Isso é 100% prevenível com o suplemento certo e iluminação adequada.'
        }
      }
    ]
  },

  // ===================================================
  // PEIXE
  // ===================================================
  {
    species_value: 'peixe',
    vaccines: [],
    medications: []
  },

  // ===================================================
  // TARTARUGA
  // ===================================================
  {
    species_value: 'tartaruga',
    vaccines: [],
    medications: [
      {
        id: 'vermifugo_reptil',
        nome: 'Vermífugo para Tartarugas',
        previne_trata: ["Parasitas intestinais — comuns em tartarugas de qualquer idade"],
        regra: {
          quando_usar: 'Em tartarugas recém-adquiridas e periodicamente a cada 6 meses.',
          contraindicacoes: ["Tartarugas em hibernação", "Animais em estado de fraqueza sem orientação veterinária"],
          observacoes: 'Tartarugas são animais resistentes, mas parasitas silenciosos podem causar perda de peso progressiva e morte. Use sempre um veterinário de exóticos.'
        }
      },
      {
        id: 'suplemento_calcio_reptil',
        nome: 'Suplemento de Cálcio e Vitamina D3',
        previne_trata: ["Amolecimento do casco (MBD)", "Fraturas espontâneas", "Problemas de crescimento"],
        regra: {
          quando_usar: 'Sempre que a tartaruga não tiver acesso direto ao sol ou lâmpada UVB.',
          intervalo: 'A cada 2 a 3 refeições, polvilhado nos alimentos.',
          observacoes: 'Um casco mole ou deformado em tartaruga é sinal de deficiência de cálcio. O casco é parte do esqueleto — quando ele amolece, o animal está sofrendo. Com suplementação e luz UVB correta, isso não acontece.'
        }
      }
    ]
  },

  // ===================================================
  // FURÃO
  // ===================================================
  {
    species_value: 'furao',
    vaccines: [
      {
        id: 'vacina_cinomose_furao',
        nome: 'Vacina contra Cinomose (para Furões)',
        previne_trata: ["Cinomose — doença viral que é 100% fatal em furões, sem cura"],
        esquema: {
          primario: 'Série de 3 doses com intervalo de 3 semanas, iniciando com 6 a 8 semanas de vida.',
          reforco: 'Anual.',
          observacoes: 'Diferente de cães, furões não sobrevivem à cinomose. A vacinação é absolutamente obrigatória.'
        },
        regra: {
          efeitos_comuns: ["Sonolência", "Falta de apetite por 24 horas"],
          contraindicacoes: ["Furões doentes no dia da vacina"],
          observacoes: 'Use somente vacinas aprovadas para furões — algumas vacinas caninas contêm adjuvantes que causam reações graves nessa espécie.'
        }
      },
      {
        id: 'vacina_rabica_cao_gato',
        nome: 'Antirrábica (Raiva)',
        previne_trata: ["Raiva"],
        esquema: {
          primario: 'Dose única a partir dos 3 meses.',
          reforco: 'Anual.',
        },
        regra: {
          observacoes: 'Use vacinas aprovadas para furões. A raiva é zoonose — protege o animal e toda a família.'
        }
      }
    ],
    medications: [
      {
        id: 'antipulgas_furao',
        nome: 'Antipulgas para Furão',
        previne_trata: ["Pulgas", "Anemia (em casos severos de infestação)"],
        regra: {
          quando_usar, o ano todo.',
          contraindicacoes: ["NUNCA use produtos de cão ou gato em furão sem orientação veterinária — muitos são tóxicos para furões"],
          observacoes: 'Furões são muito sensíveis a toxinas. Existem produtos seguros e específicos para a espécie — consulte um veterinário de exóticos.'
        }
      },
      {
        id: 'hormonio_furao',
        nome: 'Implante Hormonal (para Furões Fêmea)',
        previne_trata: ["Anemia aplástica por cio prolongado — fatal em fêmeas não castradas", "Doenças adrenais"],
        regra: {
          quando_usar: 'Em fêmeas a partir dos 6 meses de vida, antes do primeiro cio.',
          intervalo: 'O implante dura de 2 a 4 anos.',
          observacoes: 'Fêmeas de furão que entram no cio e não acasalam ficam em cio contínuo, o que leva à anemia aplástica e morte. Isso é 100% prevenível com castração cirúrgica ou implante hormonal. Esse medicamento salva vidas.'
        }
      },
      {
        id: 'vermifugo_oral_cao_gato',
        nome: 'Vermífugo',
        previne_trata: ["Parasitas intestinais"],
        regra: {
          quando_usar: 'A cada 3 meses.',
          contraindicacoes: ["Usar apenas produtos aprovados para furões"],
          observacoes: 'Furões podem ser parasitados pelos mesmos vermes de cães e gatos. A dosagem é diferente — sempre consulte um veterinário de exóticos.'
        }
      }
    ]
  },

  // ===================================================
  // OUTRO
  // ===================================================
  {
    species_value: 'outro',
    vaccines: [],
    medications: []
  }
];
