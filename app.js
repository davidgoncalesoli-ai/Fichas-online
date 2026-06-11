const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const safeStorage = {
  get(key){ try { return window.localStorage?.getItem(key); } catch { return null; } },
  set(key,value){ try { window.localStorage?.setItem(key,value); } catch {} }
};
function readJsonStorage(keys, fallback){
  for(const key of keys){
    const value = safeStorage.get(key);
    if(!value) continue;
    try { return JSON.parse(value); } catch {}
  }
  return fallback;
}
function openDialog(id){
  const dialog = $('#'+id);
  if(!dialog) return;
  if(typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
}
const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const makeId = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random());

const ATTRS = ['Força','Destreza','Constituição','Inteligência','Sabedoria','Presença'];
const ATTR_KEY = {FOR:'Força', DES:'Destreza', CON:'Constituição', INT:'Inteligência', SAB:'Sabedoria', PRE:'Presença'};
const SKILLS = [
  ['Acrobacia','Destreza',false], ['Atletismo','Força',false], ['Direção','Sabedoria',false], ['Enganação','Presença',false],
  ['Feitiçaria','Inteligência',true], ['Furtividade','Destreza',false], ['História','Inteligência',false], ['Intimidação','Presença',false],
  ['Intuição','Sabedoria',false], ['Investigação','Inteligência',false], ['Medicina','Sabedoria',true], ['Ocultismo','Sabedoria',false],
  ['Ofício','Inteligência',true], ['Percepção','Sabedoria',false], ['Performance','Presença',false], ['Persuasão','Presença',false],
  ['Prestidigitação','Destreza',true], ['Sobrevivência','Sabedoria',false], ['Tecnologia','Inteligência',false], ['Teologia','Inteligência',false],
  ['Luta','Força',false], ['Pontaria','Destreza',false], ['Fortitude','Constituição',false], ['Reflexos','Destreza',false], ['Astúcia','Inteligência',false], ['Vontade','Sabedoria',false]
];

const APTITUDE_KEYS = [
  {key:'aura', name:'Aura', sigla:'AU', desc:'Compreensão e refinamento da própria energia amaldiçoada.'},
  {key:'controle', name:'Controle e Leitura', sigla:'CL', desc:'Controle bruto da energia, leitura de fluxos e percepção amaldiçoada.'},
  {key:'barreira', name:'Barreira', sigla:'BAR', desc:'Uso e refinamento de técnicas de barreira.'},
  {key:'dominio', name:'Domínio', sigla:'DOM', desc:'Usos simples e avançados de domínio, incluindo expansão.'},
  {key:'reversa', name:'Energia Reversa', sigla:'ER', desc:'Reversão da energia amaldiçoada para cura e regeneração.'}
];

const APTITUDE_LIBRARY = [
  {category:'Aura', req:{aura:1}, name:'Aura Reforçada', text:'Aptidão de aura para reforçar o corpo ou a presença da energia. Placeholder estrutural para cadastrar o texto exato do livro.'},
  {category:'Aura', req:{aura:2}, name:'Aura Ameaçadora', text:'Aptidão de aura de nível intermediário. Texto completo será transcrito na etapa de biblioteca.'},
  {category:'Controle e Leitura', req:{controle:1}, name:'Leitura de Energia', text:'Permite representar leitura e percepção de fluxo amaldiçoado. Estrutura pronta para requisito por CL.'},
  {category:'Controle e Leitura', req:{controle:2}, name:'Controle Refinado', text:'Aptidão de controle intermediário. Mantida como entrada inicial até cadastro completo.'},
  {category:'Barreira', req:{barreira:1}, name:'Barreira Simples', text:'Aptidão básica de barreira. Estrutura de requisito por BAR já funcional.'},
  {category:'Barreira', req:{barreira:3}, name:'Barreira Avançada', text:'Aptidão avançada de barreira. Exemplo de bloqueio por nível de aptidão.'},
  {category:'Domínio', req:{dominio:1}, name:'Domínio Simples', text:'Aptidão ligada a domínio. Exemplo inicial para DOM.'},
  {category:'Domínio', req:{dominio:5}, name:'Expansão de Domínio', text:'Entrada estrutural para expansão. Deve ser detalhada conforme a técnica e as regras do livro.'},
  {category:'Energia Reversa', req:{reversa:1}, name:'Energia Reversa', text:'Aptidão base para uso de energia reversa. Exemplo inicial para ER.'},
  {category:'Energia Reversa', req:{reversa:3}, name:'Regeneração Aprimorada', text:'Aptidão avançada de energia reversa. Exemplo de requisito maior.'},
  {category:'Especial', req:{}, name:'Aptidão Personalizada', text:'Modelo livre para registrar aptidões próprias, adaptações ou permissões do narrador.'}
];


const TALENT_LIBRARY = [
  {name:'Afinidade com Técnica', level:1, category:'Geral', prereq:'Possuir técnica/feitiços', req:{hasTechnique:true}, text:'Você desenvolve melhor sua técnica amaldiçoada. Ao obter este talento, recebe um Feitiço adicional; nos níveis 5, 10, 15 e 20 recebe mais um Feitiço adicional.'},
  {name:'Artesão Amaldiçoado', level:1, category:'Geral', prereq:'—', text:'Você se especializa na criação de Ferramentas Amaldiçoadas. Torna-se capaz de criá-las conforme o guia do livro e recebe treinamento em Ofício (Ferreiro) ou Ofício (Canalizador), ou melhora uma delas caso já possua ambas.'},
  {name:'Ataque Infalível', level:1, category:'Combate', prereq:'—', text:'Uma vez por rodada, após a rolagem de dano de um ataque armado ou desarmado, você pode repetir a rolagem e deve ficar com o novo resultado. Seus níveis de dano da arma não podem ser reduzidos.'},
  {name:'Atenção Infalível', level:1, category:'Percepção', prereq:'—', text:'Você recebe +5 em Atenção e não pode ser surpreendido enquanto estiver consciente.'},
  {name:'Dedicação Recompensadora', level:1, category:'Recursos', prereq:'—', text:'Você recebe itens adicionais conforme seu grau. Os aumentos de itens não são cumulativos; use a descrição do livro/narrador para definir os itens por grau.'},
  {name:'Favorecido pela Sorte', level:1, category:'Sorte', prereq:'—', text:'Você tem 3 pontos de sorte. Ao fazer uma rolagem, pode gastar 1 ponto para rolar outro d20 e escolher qual resultado usar. Recupera 1 ponto quando um inimigo tira 20 em ataque contra você.'},
  {name:'Adepto de Combate', level:1, category:'Adepto', prereq:'Mestre em Intuição; não possuir mais que dois talentos com o nome Adepto', req:{skillMaster:'Intuição', maxAdepto:2}, text:'Você aprende um estilo de combate da especialização Especialista em Combate, considerando seu nível de personagem para os efeitos.'},
  {name:'Adepto de Feitiçaria', level:1, category:'Adepto', prereq:'Mestre em Feitiçaria; possuir Feitiços; não possuir mais que dois talentos com o nome Adepto', req:{skillMaster:'Feitiçaria', hasTechnique:true, maxAdepto:2}, text:'Você recebe uma Mudança de Fundamento da habilidade Domínio dos Fundamentos do Especialista em Técnica, exceto Técnica Rápida. Pode reduzir o custo da mudança em 1 uma quantidade de vezes por cena igual ao seu bônus de treinamento.'},
  {name:'Alma Inquebrável', level:1, category:'Defesa', prereq:'Constituição 14', req:{attr:{'Constituição':14}}, text:'Você se torna treinado em Integridade e recebe Redução de Dano contra Dano na Alma igual a 1/4 do seu nível de personagem.'},
  {name:'Apaziguador de Técnica', level:8, category:'Combate', prereq:'Treinado em Astúcia; Nível 8', req:{skillTrained:'Astúcia'}, text:'Quando um inimigo usa uma técnica de Ação Comum ou maior em seu alcance corpo-a-corpo, você pode realizar um golpe de oportunidade e forçar teste de concentração. Se falhar, o feitiço sofre penalidade, redução ou anulação conforme o tipo.'},
  {name:'Aptidão Desenvolvida', level:1, category:'Aptidão', prereq:'Não ser Restringido', req:{notOrigin:'Restringido'}, text:'Escolha uma aptidão amaldiçoada para aumentar seu nível de aptidão em 1. Use também a aba Aptidões para ajustar o nível correspondente.'},
  {name:'Expansão Maestral', level:10, category:'Domínio', prereq:'Expansão de Domínio Completa', req:{hasDomain:true}, text:'Você pode utilizar expansões de domínio com apenas uma mão livre e expandir o domínio não causa ataques de oportunidade contra você.'},
  {name:'Familiaridade com Técnica', level:12, category:'Origem', prereq:'Origem Inato; Nível 12', req:{origin:'Inato'}, text:'Seu primeiro Feitiço de Marca Registrada melhora a redução de custo em PE ou sustentação. Também pode escolher Feitiços adicionais como Marca Registrada igual à metade do bônus de treinamento.'},
  {name:'Manual de Técnica', level:5, category:'Origem', prereq:'Origem Herdado; Treinamento em História ou Ocultismo; Nível 5', req:{origin:'Herdado', anySkillTrained:['História','Ocultismo']}, text:'Você pode criar um Feitiço de um nível acima do maior a que possui acesso, com custo aumentado em 50%. Ao liberar aquele nível, deve aprendê-lo e pode criar outro.'},
  {name:'Expansão de Reserva', level:8, category:'Origem', prereq:'Origem Derivado; Nível 8', req:{origin:'Derivado'}, text:'Sua reserva de energia melhora: recuperar energia da reserva vira ação livre, concede PE temporário igual à metade do bônus de treinamento e pode ser usada por descanso longo.'},
  {name:'Quebra de Limites', level:1, category:'Origem', prereq:'Origem Restringido', req:{origin:'Restringido'}, text:'Aumenta dois atributos diferentes em 2, exceto o atributo com maior limite, e aumenta o limite dos dois atributos escolhidos em 2. Ajuste os atributos manualmente na aba Status.'},
  {name:'Talento Personalizado', level:1, category:'Livre', prereq:'Definido pelo narrador', text:'Use este modelo para criar talentos próprios da campanha.'}
];


const TECHNIQUE_LIBRARY = [
  {
    name:'Boneco de Palha',
    source:'Enciclopédia Amaldiçoada',
    type:'Técnica inata',
    text:'Técnica baseada em martelo, pregos e boneca de palha. Permite disparar pregos, explodi-los e criar ligações por vestígios para refletir dano.'
  },
  {
    name:'Boogie Woogie',
    source:'Enciclopédia Amaldiçoada',
    type:'Técnica inata',
    text:'Técnica de troca de posição. Permite trocar lugares entre criaturas e objetos válidos ao cumprir o gatilho da técnica.'
  },
  {
    name:'Cópia',
    source:'Enciclopédia Amaldiçoada',
    type:'Técnica inata',
    text:'Técnica voltada para copiar e utilizar técnicas alheias sob condições definidas pelo narrador e pela ficha.'
  },
  {
    name:'Técnica própria',
    source:'Personalizada',
    type:'Livre',
    text:'Modelo livre para técnica criada pelo jogador. Use o campo de funcionamento básico para registrar regras, limites e equipamentos.'
  }
];

const ITEM_ENCHANTMENT_LIBRARY = [
  {name:'Afiada', applies:['Arma'], grade:'Terceiro+', prereq:'Arma com dano cortante ou perfurante', damageBonus:0, properties:'Fatal d8', text:'A energia amaldiçoada se concentra na lâmina ou ponta. A arma recebe Fatal d8; se já possuir Fatal, aumente o dado em um nível.'},
  {name:'Amplificadora', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Após Ataque', text:'Após acertar um ataque com esta arma, o próximo Feitiço de Dano ou Técnica Marcial de Ataque até o fim do próximo turno causa dados extras iguais à metade do BT.'},
  {name:'Armazenadora', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Armazena 5 PE', text:'Durante um descanso longo pode armazenar 5 PE na arma. Enquanto a empunhar, o portador pode recuperar essa energia.'},
  {name:'Balanceada', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'+2 manobras', text:'Enquanto empunhar a arma, recebe +2 em testes de manobras.'},
  {name:'Canalizadora', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'+2 CD Amaldiçoada', text:'Enquanto empunhar a arma, a sua CD Amaldiçoada aumenta em 2.'},
  {name:'Cano Alongado', applies:['Arma'], grade:'Terceiro+', prereq:'Apenas armas à distância', damageBonus:0, properties:'+alcance', text:'A arma tem o alcance aumentado em 1/4 do total em metros.'},
  {name:'Certeira', applies:['Arma'], grade:'Terceiro+', prereq:'Não pode ter Destruidora', damageBonus:0, properties:'Crítico -1', text:'Reduz a margem de crítico da arma em 1. Não pode ser usada junto com Destruidora.'},
  {name:'Compartimento', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Óleo/veneno', text:'Cria um compartimento para armazenar uma mistura, óleo ou veneno aplicável na arma. Pode usar em combate como ação livre.'},
  {name:'Complementar', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'+2 CD Especialização/Estilo', text:'Enquanto empunhar, recebe +2 na CD de Especialização e de Estilo Marcial.'},
  {name:'Cruel', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:3, properties:'+3 dano', text:'A arma passa a ter partes mais perigosas. Recebe +3 em rolagens de dano.'},
  {name:'Defensora', applies:['Arma'], grade:'Terceiro+', prereq:'Apenas armas corpo a corpo', damageBonus:0, properties:'Aparar', text:'A arma recebe o traço Aparar. Se já possuir Aparar, o bônus de Defesa fornecido aumenta em 1.'},
  {name:'Destruidora', applies:['Arma'], grade:'Terceiro+', prereq:'Não pode ter Certeira', damageBonus:0, properties:'+1 dado no crítico', text:'A arma causa um dado de dano adicional em um acerto crítico.'},
  {name:'Discreta', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'+5 esconder arma', text:'Recebe +5 em Furtividade e Prestidigitação para esconder apenas esta arma.'},
  {name:'Drenadora', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'PE temporário ao matar', text:'Uma vez por turno, ao matar criatura que utiliza energia amaldiçoada, recebe PE temporário conforme o grau da criatura.'},
  {name:'Elemental', applies:['Arma'], grade:'Segundo+', prereq:'Ferramenta de Segundo Grau', damageBonus:0, properties:'Troca tipo de dano', text:'Escolha um dano elemental. A arma pode trocar seu tipo de dano para esse elemento escolhido.'},
  {name:'Harmonizada', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Crítico reduz custo', text:'Ao acertar crítico, reduz em 1 o custo da próxima habilidade que gaste PE ou Estamina até o fim do próximo turno.'},
  {name:'Horrenda', applies:['Arma'], grade:'Terceiro+', prereq:'Já possuir outro encantamento', damageBonus:0, properties:'+CD medo', text:'Habilidades que exigem TR e causam Abalado ou Amedrontado têm CD aumentada pelo bônus de ferramenta da arma.'},
  {name:'Longa', applies:['Arma'], grade:'Terceiro+', prereq:'Apenas armas corpo a corpo', damageBonus:0, properties:'+1,5m alcance', text:'O alcance da arma aumenta em 1,5 metros.'},
  {name:'Otimizada', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Saque livre; +2 iniciativa', text:'Sacar esta arma é uma Ação Livre e, enquanto empunhar, recebe +2 em Iniciativa.'},
  {name:'Penetrante', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Ignora RD', text:'Ataques com a arma ignoram redução de dano igual ao bônus de treinamento do portador.'},
  {name:'Poderosa', applies:['Arma'], grade:'Terceiro+', prereq:'Ter Cruel na arma', damageBonus:2, properties:'+2 dano', text:'Adiciona +2 às rolagens de dano da arma.'},
  {name:'Potente', applies:['Arma'], grade:'Primeiro+', prereq:'Primeiro Grau', damageBonus:0, properties:'+1 dado de dano padrão', text:'Adiciona mais um dado de dano ao dano padrão da arma. Ajuste a fórmula de dano manualmente se necessário.'},
  {name:'Precisa', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, attackBonus:2, properties:'+2 ataque', text:'Recebe +2 em jogadas de ataque manejando esta arma.'},
  {name:'Reluzente', applies:['Arma'], grade:'Terceiro+', prereq:'—', damageBonus:0, properties:'Finta/cega; furtividade -5', text:'Recebe +2 para fintar; em crítico pode deixar o alvo Desprevenido ou Cego. Penaliza Furtividade em locais iluminados.'},
  {name:'Retorno', applies:['Arma'], grade:'Terceiro+', prereq:'Arma de arremesso', damageBonus:0, properties:'Retorna à mão', text:'Ao arremessar, se não estiver completamente presa, retorna para a mão do portador após completar o ataque.'},
  {name:'Sintonizada', applies:['Arma'], grade:'Segundo+', prereq:'Ferramenta de Segundo Grau', damageBonus:0, properties:'+1d8 elemental situacional', text:'Escolha um dano não físico/não alma. Após causar esse dano com Feitiço ou Aptidão, ataques com a arma causam +1d8 do mesmo tipo até o próximo turno.'},
  {name:'Avassalador', applies:['Escudo'], grade:'Terceiro+', prereq:'Ter Destruidor no escudo', properties:'Dano +3 níveis', text:'Se usado para atacar, o dano do escudo conta como três níveis acima.'},
  {name:'Bloqueador', applies:['Escudo'], grade:'Terceiro+', prereq:'—', properties:'Meia cobertura', text:'Criaturas atrás de você a 1,5m recebem efeitos de Meia Cobertura.'},
  {name:'Espinhoso', applies:['Escudo'], grade:'Terceiro+', prereq:'—', properties:'Dano +1 nível', text:'Caso o escudo seja usado para atacar, o dano conta como um nível acima.'},
  {name:'Reforçado', applies:['Escudo'], grade:'Terceiro+', prereq:'—', properties:'+2 RD físico', text:'Recebe 2 de RD adicional contra dano físico.'},
  {name:'Blindado', applies:['Uniforme'], grade:'Quarto+', prereq:'—', properties:'+2 Defesa', text:'A Defesa concedida pelo uniforme aumenta em 2.'},
  {name:'Furtivo', applies:['Uniforme'], grade:'Quarto+', prereq:'—', properties:'+Furtividade', text:'Recebe bônus em Furtividade igual ao custo do uniforme.'},
  {name:'Material Pesado', applies:['Uniforme'], grade:'Quarto+', prereq:'Revestimento médio ou robusto', properties:'+2 Fortitude', text:'Concede +2 em TRs de Fortitude.'},
  {name:'Maldição Personalizada', applies:['Arma','Escudo','Uniforme','Geral'], grade:'Livre', prereq:'Definido pelo narrador', damageBonus:0, properties:'Personalizada', text:'Use para registrar uma maldição, encantamento ou modificação própria da campanha.'}
];

const DOMAIN_LIBRARY = [
  {name:'Expansão de Domínio Incompleta', type:'Incompleta', technique:'Domínio próprio', level:8, cost:'15 PE', area:'4,5m × bônus de treinamento', duration:'1 + DOM rodadas', text:'Expande o domínio interno de maneira incompleta. Use para registrar os efeitos escolhidos conforme o guia de criação.'},
  {name:'Expansão de Domínio Completa', type:'Completa', technique:'Domínio próprio', level:10, cost:'20 PE', area:'Esfera de 9m', duration:'3 + DOM rodadas', text:'Fecha uma barreira e prende alvos dentro dela. Use para registrar efeitos internos, externos e condições.'},
  {name:'Expansão de Domínio Sem Barreiras', type:'Sem barreiras', technique:'Domínio próprio', level:20, cost:'20 PE + acerto garantido', area:'Superior à completa', duration:'Conforme domínio', text:'Modelo para expansão sem barreiras. Requer domínio extremamente refinado e acerto garantido.'},
  {name:'Puro Amor Mútuo', type:'Letal', technique:'Cópia', level:10, cost:'—', area:'Esfera de 9m', duration:'Bônus de maestria rodadas', text:'Expansão de domínio da Cópia. Manifesta katanas com técnicas copiadas e permite escolher uma técnica copiada como acerto garantido.'},
  {name:'Sentença de Morte', type:'Não-letal', technique:'Técnica do Julgamento', level:10, cost:'—', area:'Esfera de 9m', duration:'Conforme julgamento', text:'Expansão em forma de tribunal, com estado de não-violência e julgamento conduzido pelo shikigami Juiz.'},
  {name:'Caixão da Montanha de Ferro', type:'Letal', technique:'Chamas do Desastre', level:10, cost:'—', area:'Esfera de 9m', duration:'Bônus de maestria rodadas', text:'Domínio vulcânico com calor intenso, dano queimante e fortalecimento das habilidades de chamas.'},
  {name:'Aposta Mortal Indolente', type:'Não-letal', technique:'Trem do Puro Amor', level:4, cost:'10 PE', area:'Conforme técnica', duration:'Conforme resultado', text:'Expansão vinculada à técnica Trem do Puro Amor, baseada no jogo de pachinko e em recompensas.'},
  {name:'Expansão Personalizada', type:'Livre', technique:'Técnica própria', level:1, cost:'Definir', area:'Definir', duration:'Definir', text:'Modelo livre para criar uma expansão original da campanha.'}
];


const ITEM_LIBRARY = [
  {
    "name": "Adaga",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Pf",
    "properties": "Crítico 18; Apunhaladora, arremessável [6/18m], fineza, leve, marcial, modular Ct",
    "text": "Faca curta e discreta, ótima para personagens ágeis e ataques oportunistas."
  },
  {
    "name": "Bastão",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d6/1d8 Im",
    "properties": "Crítico 19; Amplo, dupla, marcial, versátil",
    "text": "Arma simples de impacto, boa para estilo marcial e uso com uma ou duas mãos."
  },
  {
    "name": "Clava",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8/1d10 Im",
    "properties": "Crítico 20; Versátil",
    "text": "Arma direta e pesada de impacto."
  },
  {
    "name": "Espada Curta",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Ct",
    "properties": "Crítico 19; Fineza, leve, marcial, modular Pf",
    "text": "Lâmina curta, leve e precisa."
  },
  {
    "name": "Faixas",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "Especial",
    "properties": "Especial",
    "text": "Faixas usadas como apoio aos ataques desarmados. Podem virar ferramenta amaldiçoada."
  },
  {
    "name": "Foice",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Ct",
    "properties": "Crítico 19; Fineza, leve, marcial",
    "text": "Arma leve de corte do grupo haste."
  },
  {
    "name": "Lança",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6/1d8 Pf",
    "properties": "Crítico 19; Arremessável [6/18m], estendida, versátil",
    "text": "Arma simples de alcance e perfuração."
  },
  {
    "name": "Leque",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Im",
    "properties": "Crítico 18; Fineza, enérgica, leve, especial",
    "text": "Leque de combate com uso especial aberto/fechado."
  },
  {
    "name": "Machado",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8/1d10 Ct",
    "properties": "Crítico 20; Versátil",
    "text": "Machado simples de corte."
  },
  {
    "name": "Mangual",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8 Im",
    "properties": "Crítico 20; Ampla, enérgica",
    "text": "Arma de impacto com movimentos amplos."
  },
  {
    "name": "Manoplas",
    "category": "Arma simples",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "Especial",
    "properties": "Aparar, duas mãos, dupla, especial, pesado [16]",
    "text": "Manoplas completas que usam o dano desarmado base e melhoram com Força."
  },
  {
    "name": "Martelo",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8/1d10 Im",
    "properties": "Crítico 20; Versátil",
    "text": "Martelo de combate simples."
  },
  {
    "name": "Soco Inglês",
    "category": "Arma simples",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "Especial",
    "properties": "Enérgica, especial, fineza, marcial",
    "text": "Usa o dano desarmado e aplica efeitos críticos do grupo Faca."
  },
  {
    "name": "Tridente",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6/1d8 Pf",
    "properties": "Crítico 19; Arremessável [6/18m], estendida, versátil",
    "text": "Arma de haste perfurante."
  },
  {
    "name": "Arco Curto",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d6 Pf",
    "properties": "Crítico 19; Duas mãos, mortal d10, alcance [24/48m]",
    "text": "Arma simples à distância."
  },
  {
    "name": "Besta Leve",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8 Pf",
    "properties": "Crítico 19; Mortal d10, leve, alcance [24/48m], recarga [1]",
    "text": "Besta leve de recarga curta."
  },
  {
    "name": "Pistola",
    "category": "Arma simples",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "1d10 Pf",
    "properties": "Crítico 20; Alcance [36/72m], emperrar, leve, recarga [12]",
    "text": "Arma de fogo simples, com chance de emperrar."
  },
  {
    "name": "Azagaia",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Pf",
    "properties": "Crítico 20; Leve, alcance [12/24m]",
    "text": "Arma de arremesso simples."
  },
  {
    "name": "Dardo",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d4 Pf",
    "properties": "Crítico 18; Leve, alcance [12/24m], especial",
    "text": "Bom para aplicação de venenos."
  },
  {
    "name": "Faca de Arremesso",
    "category": "Arma simples",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Pf",
    "properties": "Crítico 20; Leve, alcance [12/24m], modular Ct",
    "text": "Faca feita para arremesso."
  },
  {
    "name": "Adagas Duplas",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "2d4 Pf",
    "properties": "Crítico 18; Apunhaladora, duas mãos, fineza, leve, marcial, modular Ct, especial",
    "text": "Par de adagas ligadas; conta como arma de duas mãos e dificulta desarme."
  },
  {
    "name": "Adaga de Aparar",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d4 Pf",
    "properties": "Crítico 18; Aparar, apunhaladora, fineza, leve, marcial, modular Ct",
    "text": "Adaga defensiva para aparar golpes."
  },
  {
    "name": "Alabarda",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d10 Ct",
    "properties": "Crítico 20; Duas mãos, estendida, modular Pf, pesada [14], especial",
    "text": "Arma longa que ajuda em manobras de derrubar."
  },
  {
    "name": "Chicote",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d4 Ct",
    "properties": "Crítico 19; Estendida, fineza, leve, especial",
    "text": "Permite agarrar com alcance e bônus em Agarrar."
  },
  {
    "name": "Chicote de Corrente",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d6/1d8 Im",
    "properties": "Crítico 19; Estendida, pesada [14], versátil, especial",
    "text": "Corrente que pode acoplar em arma corpo-a-corpo."
  },
  {
    "name": "Chicote Espinhento",
    "category": "Arma complexa",
    "cost": 3,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Ct + 1d6 Pf",
    "properties": "Crítico 19; Estendida, fineza, leve, especial",
    "text": "Causa dano cortante e perfurante ao mesmo tempo."
  },
  {
    "name": "Clava Pesada",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "2d6 Im",
    "properties": "Crítico 20; Duas mãos, pesada [16], oscilante",
    "text": "Clava robusta de grande impacto."
  },
  {
    "name": "Corrente de Aço",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "2d4/2d6 Im",
    "properties": "Crítico 20; Estendida, enérgica, pesada [14], versátil",
    "text": "Corrente pesada para impacto e controle de distância."
  },
  {
    "name": "Espada de Gancho",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "1d8 Ct",
    "properties": "Crítico 20; Fineza, leve, marcial, especial",
    "text": "Pode puxar o alvo 1,5m ao acertar."
  },
  {
    "name": "Espada Longa",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8/1d10 Ct",
    "properties": "Crítico 20; Modular Pf, versátil",
    "text": "Espada versátil clássica."
  },
  {
    "name": "Katana",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6/1d8 Ct",
    "properties": "Crítico 19; Versátil, fatal d10, fineza",
    "text": "Lâmina precisa e fatal."
  },
  {
    "name": "Espada Grande",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d12 Ct",
    "properties": "Crítico 20; Ampla, duas mãos, modular Pf, pesada [14]",
    "text": "Espada de duas mãos para dano alto."
  },
  {
    "name": "Espada Colossal",
    "category": "Arma complexa",
    "cost": 3,
    "qty": 1,
    "weight": 4,
    "damage": "2d8 Ct",
    "properties": "Crítico 20; Ampla, duas mãos, modular Im, pesada [20], especial",
    "text": "Espada enorme, muito pesada e destrutiva."
  },
  {
    "name": "Foice Grande",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d8/1d10 Ct",
    "properties": "Crítico 20; Ampla, versátil",
    "text": "Foice maior para golpes amplos."
  },
  {
    "name": "Kusarigama",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "1d6/1d6",
    "properties": "Crítico 19; Duas mãos, dupla, especial, estendida, enérgica",
    "text": "Alterna entre foice e peso; concede bônus em manobras."
  },
  {
    "name": "Lança Grande",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d12 Pf",
    "properties": "Crítico 20; Duas mãos, enérgica, estendida, pesada [14]",
    "text": "Lança pesada de alto dano."
  },
  {
    "name": "Machado Grande",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d10 Ct",
    "properties": "Crítico 20; Ampla, duas mãos, pesada [16]",
    "text": "Machado grande de duas mãos."
  },
  {
    "name": "Martelo Grande",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d12 Im",
    "properties": "Crítico 20; Duas mãos, pesada [16]",
    "text": "Martelo grande para impacto pesado."
  },
  {
    "name": "Nunchaku",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8 Im",
    "properties": "Crítico 19; Dupla, enérgica, fineza, marcial",
    "text": "Arma marcial rápida."
  },
  {
    "name": "Nunchaku Pesado",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "2d6 Im",
    "properties": "Crítico 20; Duas mãos, dupla, estendida, marcial, pesada [14], enérgica",
    "text": "Versão pesada do nunchaku."
  },
  {
    "name": "Rapieira",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d8 Pf",
    "properties": "Crítico 19; Fineza, mortal d10",
    "text": "Arma precisa de perfuração."
  },
  {
    "name": "Arco Longo",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d10 Pf",
    "properties": "Crítico 19; Duas mãos, mortal d12, alcance [30/60m]",
    "text": "Arco de maior alcance e dano."
  },
  {
    "name": "Bazuca",
    "category": "Arma complexa",
    "cost": 4,
    "qty": 1,
    "weight": 4,
    "damage": "3d12 Im",
    "properties": "Crítico 19; Alcance [9/18m], duas mãos, emperrar, recarga [1], especial, pesada [16]",
    "text": "Arma explosiva em área; munições custam espaço/custo 1."
  },
  {
    "name": "Besta Pesada",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d12 Pf",
    "properties": "Crítico 20; Pesada [14], alcance [45/90m], recarga [1], mortal d12",
    "text": "Besta pesada de alto impacto."
  },
  {
    "name": "Escopeta",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "2d6 Pf",
    "properties": "Crítico 20; Alcance [9/18m], duas mãos, emperrar, especial, recarga [2]",
    "text": "Afeta alvo e criaturas em cone curto."
  },
  {
    "name": "Metralhadora",
    "category": "Arma complexa",
    "cost": 3,
    "qty": 1,
    "weight": 4,
    "damage": "1d12 Pf",
    "properties": "Crítico 19; Alcance [30/60m], duas mãos, emperrar, especial, recarga [30]",
    "text": "Alta cadência; pode atacar adicionalmente com ação bônus."
  },
  {
    "name": "Rifle",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "2d8 Pf",
    "properties": "Crítico 20; Alcance [60/120m], duas mãos, emperrar, recarga [20]",
    "text": "Arma de fogo de longo alcance."
  },
  {
    "name": "Rifle de Precisão",
    "category": "Arma complexa",
    "cost": 3,
    "qty": 1,
    "weight": 4,
    "damage": "2d10 Pf",
    "properties": "Crítico 19; Alcance [120/240m], duas mãos, emperrar, recarga [5]",
    "text": "Arma de disparo extremamente longo."
  },
  {
    "name": "Chakram",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "2d4 Ct",
    "properties": "Crítico 20; Arremessável [12/24m], especial, leve",
    "text": "Retorna para a mão após o arremesso."
  },
  {
    "name": "Kunai",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d6 Pf",
    "properties": "Crítico 19; Apunhaladora, arremessável [9/18m], fineza, leve",
    "text": "Arma de arremesso precisa."
  },
  {
    "name": "Rede",
    "category": "Arma complexa",
    "cost": 2,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Alcance [9/27m], especial",
    "text": "Ao acertar, deixa o alvo Enredado."
  },
  {
    "name": "Shuriken",
    "category": "Arma complexa",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "1d4 Ct",
    "properties": "Crítico 18; Arremessável [12/24m], mortal d8, leve",
    "text": "Projétil leve e mortal em crítico."
  },
  {
    "name": "Uniforme comum",
    "category": "Uniforme",
    "cost": 0,
    "qty": 1,
    "weight": 0,
    "damage": "—",
    "properties": "Penalidade —",
    "text": "Uniforme básico de identificação jujutsu. Sem modificação defensiva."
  },
  {
    "name": "Uniforme com Revestimento Leve",
    "category": "Uniforme",
    "cost": 1,
    "qty": 1,
    "weight": 0,
    "damage": "+2 Defesa",
    "properties": "Penalidade —",
    "text": "Uniforme com reforço leve; não ocupa espaço."
  },
  {
    "name": "Uniforme com Revestimento Médio",
    "category": "Uniforme",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "+4 Defesa",
    "properties": "Penalidade -2 Destreza",
    "text": "Uniforme com placas/camadas adicionais; ocupa 2 espaços."
  },
  {
    "name": "Uniforme com Revestimento Robusto",
    "category": "Uniforme",
    "cost": 3,
    "qty": 1,
    "weight": 4,
    "damage": "+6 Defesa",
    "properties": "Penalidade -4 Destreza",
    "text": "Uniforme robusto, semelhante a armadura; ocupa 4 espaços."
  },
  {
    "name": "Uniforme Sob Medida",
    "category": "Uniforme",
    "cost": 2,
    "qty": 1,
    "weight": 0,
    "damage": "+1 Defesa",
    "properties": "Penalidade —",
    "text": "Uniforme ajustado ao corpo; concede +2 em Acrobacia e Furtividade."
  },
  {
    "name": "Escudo Pequeno",
    "category": "Escudo",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d3",
    "properties": "RD 2; Penalidade 0",
    "text": "Escudo defensivo. Se atacar com ele, deixa de fornecer RD até o início do próximo turno."
  },
  {
    "name": "Escudo Leve",
    "category": "Escudo",
    "cost": 1,
    "qty": 1,
    "weight": 2,
    "damage": "1d4",
    "properties": "RD 2; Penalidade -1",
    "text": "Escudo defensivo. Se atacar com ele, deixa de fornecer RD até o início do próximo turno."
  },
  {
    "name": "Escudo Médio",
    "category": "Escudo",
    "cost": 2,
    "qty": 1,
    "weight": 2,
    "damage": "1d6",
    "properties": "RD 4; Penalidade -2",
    "text": "Escudo defensivo. Se atacar com ele, deixa de fornecer RD até o início do próximo turno."
  },
  {
    "name": "Escudo Pesado",
    "category": "Escudo",
    "cost": 3,
    "qty": 1,
    "weight": 2,
    "damage": "1d8",
    "properties": "RD 6; Penalidade -4",
    "text": "Escudo defensivo. Se atacar com ele, deixa de fornecer RD até o início do próximo turno."
  },
  {
    "name": "Kit de Alfaiate",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria acessórios especiais e uniformes sob medida/revestidos durante interlúdios."
  },
  {
    "name": "Kit de Alquimia",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria Misturas, incluindo venenos e substâncias com efeitos variados."
  },
  {
    "name": "Kit de Canalizador",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria itens espirituais e auxilia na criação de ferramentas amaldiçoadas."
  },
  {
    "name": "Kit de Cozinheiro",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Permite preparar refeições com benefícios especiais em descansos."
  },
  {
    "name": "Kit de Entalhador",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria talismãs e amuletos entalhados com selos."
  },
  {
    "name": "Kit de Ferreiro",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria e melhora armas, escudos e ferramentas amaldiçoadas."
  },
  {
    "name": "Kit de Farmacêutico",
    "category": "Kit",
    "cost": 1,
    "qty": 1,
    "weight": 1,
    "damage": "—",
    "properties": "Ferramentas de Ofício",
    "text": "Cria fármacos, antídotos e remédios."
  },
  {
    "name": "Antídoto Simples",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Neutraliza venenos de custo 1 ou de maldição de quarto grau; ação bônus."
  },
  {
    "name": "Brinco da Comunicação",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Permite comunicação mental entre até 7 usuários sintonizados em 30m."
  },
  {
    "name": "Chaveiro Canalizador",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta a CD Amaldiçoada em +1."
  },
  {
    "name": "Injeção Estimulante",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Carga única; +2 em perícias de um atributo por 10 minutos; ação bônus."
  },
  {
    "name": "Mix Energético Pequeno",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Recupera 3 pontos de estamina; ação bônus."
  },
  {
    "name": "Óleo Amolador",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Aplica em até duas armas; concede Mortal d6 por um dia."
  },
  {
    "name": "Óleo Flamejante",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Aplica em até duas armas; concede Modular Queimante por 10 minutos."
  },
  {
    "name": "Pérola Carregada",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Espiritual",
    "text": "Recupera 3 pontos de energia amaldiçoada; ação bônus."
  },
  {
    "name": "Remédio Simples",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Permite gastar até 4 dados de vida para se curar; ação comum."
  },
  {
    "name": "Símbolo da Vida",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Destrua como ação bônus para curar 10 PV em si mesmo."
  },
  {
    "name": "Talismã de Barreira",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Invoca quatro paredes com 15 PV cada; ação bônus."
  },
  {
    "name": "Veneno Debilitante",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Contato; reduz o deslocamento do alvo pela metade."
  },
  {
    "name": "Veneno Intenso",
    "category": "Item especial",
    "cost": 1,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Contato; alvo fica Envenenado por uma rodada."
  },
  {
    "name": "Amuleto do Vislumbre",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Visão no escuro 9m, +2 em Percepção e visão especial 1/dia."
  },
  {
    "name": "Antídoto Intermediário",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Neutraliza venenos de custo 2 ou de maldição de terceiro grau ou inferior."
  },
  {
    "name": "Apanhador de Saúde",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Ao ser curado, recebe +1 por dado, limitado à metade do nível."
  },
  {
    "name": "Bracelete do Vigor",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta os PV máximos em 10."
  },
  {
    "name": "Conjunto de Pérolas Carregadas",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Espiritual",
    "text": "Recupera 6 pontos de energia amaldiçoada; ação bônus."
  },
  {
    "name": "Faixa de Foco",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "+2 para manter concentração e 1/dia evita perder concentração."
  },
  {
    "name": "Injeção de Adrenalina",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Reduz Exaustão em 1 até o final da cena; ação bônus."
  },
  {
    "name": "Mix Energético Médio",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Recupera 6 pontos de estamina; ação bônus."
  },
  {
    "name": "Pulseira Magistral",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Torna o usuário treinado em uma perícia à escolha enquanto usada."
  },
  {
    "name": "Remédio Intermediário",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Permite gastar até 8 dados de vida para se curar; ação comum."
  },
  {
    "name": "Símbolo de Vida Florescente",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Destrua como ação bônus para curar 25 PV em si mesmo."
  },
  {
    "name": "Talismã de Barreira Superior",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Invoca quatro paredes com 25 PV; pode ser usado como bônus ou reação."
  },
  {
    "name": "Veneno Desnorteante",
    "category": "Item especial",
    "cost": 2,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Contato; alvo fica Desprevenido por uma rodada."
  },
  {
    "name": "Anéis do Conhecimento",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta Sabedoria em +2, podendo superar o limite até 30."
  },
  {
    "name": "Antídoto Superior",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Neutraliza venenos de custo 3 ou de maldição de segundo grau ou inferior."
  },
  {
    "name": "Faixas Céleres",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta Destreza em +2, podendo superar o limite até 30."
  },
  {
    "name": "Mistura Profana",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Reduz custos de habilidades de energia em 1 durante uma cena; depois gera Exaustão 1."
  },
  {
    "name": "Mix Energético Grande",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Recupera 10 pontos de estamina; ação bônus."
  },
  {
    "name": "Ombreiras do Vigor Superior",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta os PV máximos em 20."
  },
  {
    "name": "Ornamento Fascinante",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta Presença em +2, podendo superar o limite até 30."
  },
  {
    "name": "Pingente do Intelecto",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Aumenta Inteligência em +2, podendo superar o limite até 30."
  },
  {
    "name": "Pulseira Primacial",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Torna o usuário mestre em uma perícia em que já seja treinado."
  },
  {
    "name": "Remédio Complexo",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Permite gastar até 12 dados de vida para se curar; ação comum."
  },
  {
    "name": "Terço de Pérolas Carregadas",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Espiritual",
    "text": "Recupera 10 pontos de energia amaldiçoada; ação bônus."
  },
  {
    "name": "Veneno Maldito",
    "category": "Item especial",
    "cost": 3,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Contato; alvo fica Exposto e Envenenado por três rodadas."
  },
  {
    "name": "Antídoto Absoluto",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Fármaco",
    "text": "Neutraliza venenos de custo 4 ou de maldição de primeiro grau ou inferior."
  },
  {
    "name": "Elixir da Vida",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Espiritual",
    "text": "Permite usar todos os dados de vida, melhora Fortitude e Integridade pelo resto da cena."
  },
  {
    "name": "Laço da Vida",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Acessório",
    "text": "Evita uma morte, cura metade dos PV e gera Exaustão 1; é consumido."
  },
  {
    "name": "Lágrima de Shinigami",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Mistura",
    "text": "Veneno letal: perda de vida, redução de Defesa e aumento de custo de energia."
  },
  {
    "name": "Símbolo de Vida Absoluta",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Ação livre; recupera todos os PV e concede PV temporários."
  },
  {
    "name": "Talismã do Ápice",
    "category": "Item especial",
    "cost": 4,
    "qty": 1,
    "weight": 0.5,
    "damage": "—",
    "properties": "Talismã",
    "text": "Transforma um atributo escolhido em 30 por 1 minuto; é consumido."
  },
  {
    "name": "Ferramenta Amaldiçoada — Arma Base",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 1,
    "damage": "Variável",
    "properties": "Grau 4 a 1; encantamentos conforme arma",
    "text": "Modelo para ferramenta amaldiçoada criada a partir de uma arma comum."
  },
  {
    "name": "Ferramenta Amaldiçoada — Escudo Base",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 2,
    "damage": "Variável",
    "properties": "Grau 4 a 1; encantamentos conforme escudo",
    "text": "Modelo para ferramenta amaldiçoada criada a partir de escudo."
  },
  {
    "name": "Ferramenta Amaldiçoada — Uniforme Base",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 0,
    "damage": "Variável",
    "properties": "Grau 4 a 1; encantamentos conforme uniforme",
    "text": "Modelo para uniforme amaldiçoado criado pela mesa."
  },
  {
    "name": "Lâmina da Totalidade",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 2,
    "damage": "Espada longa",
    "properties": "Grau especial, certeira, harmonizada, longa, sintonizada",
    "text": "Ferramenta amaldiçoada de grau especial. Permite escolher tipo de dano elemental ao atacar, conforme a Enciclopédia."
  },
  {
    "name": "Véu da Noite",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 1,
    "damage": "Adaga",
    "properties": "Grau especial, certeira, discreta, fidedigna, infalível",
    "text": "Adaga de grau especial ligada a escuridão e invisibilidade."
  },
  {
    "name": "Égide do Vigia",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 2,
    "damage": "Escudo pesado",
    "properties": "Grau especial, isolante, reforçado",
    "text": "Escudo de grau especial com aura protetora para aliados próximos."
  },
  {
    "name": "Couraça do Guardião",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 4,
    "damage": "Armadura",
    "properties": "Grau especial, defesa",
    "text": "Armadura de grau especial para proteção elevada."
  },
  {
    "name": "Item personalizado",
    "category": "Ferramenta amaldiçoada",
    "cost": "especial",
    "qty": 1,
    "weight": 0,
    "damage": "—",
    "properties": "Personalizado",
    "text": "Modelo livre para item criado pelo jogador ou narrador."
  }
];

const ORIGINS = [
  {name:'Inato', desc:'Técnica natural do personagem; base comum para feiticeiros.'},
  {name:'Herdado', desc:'Ligado a clã/linhagem e tradição familiar.'},
  {name:'Derivado', desc:'Poder desenvolvido por contato, circunstância ou adaptação.'},
  {name:'Restringido', desc:'Físico excepcional em troca de limitações com energia.'},
  {name:'Feto Amaldiçoado Híbrido', desc:'Mistura de humanidade e maldição.'},
  {name:'Sem Técnica', desc:'Personagem sem técnica inata, focado em outros recursos.'},
  {name:'Corpo Amaldiçoado Mutante', desc:'Existência artificial/mutante com regras próprias.'}
];

const CLASSES = {
  'Lutador': {hp1:12, hpFixed:6, pe:4, peKeyOnce:false, keys:['Força','Destreza'], trainings:'Armas simples, armas marciais e escudo leve. TR Fortitude ou Reflexos. Ofício, Atletismo ou Acrobacia e mais 3 perícias.', defaultSkills:['Ofício','Atletismo'], baseAbilities:['Corpo Treinado','Empolgação']},
  'Especialista em Combate': {hp1:12, hpFixed:6, pe:4, peKeyOnce:false, keys:['Força','Destreza','Sabedoria'], trainings:'Todas as armas e escudos. TR Fortitude ou Reflexos. Duas Ofício, Atletismo ou Acrobacia e mais 3 perícias.', defaultSkills:['Ofício','Atletismo'], baseAbilities:['Repertório do Especialista','Arte do Combate']},
  'Especialista em Técnica': {hp1:10, hpFixed:5, pe:6, peKeyOnce:true, keys:['Inteligência','Sabedoria'], trainings:'Armas simples e armas a distância. TR Astúcia ou Vontade. Duas entre Ofício, Feitiçaria, Ocultismo e mais 2 perícias.', defaultSkills:['Feitiçaria','Ocultismo'], baseAbilities:['Domínio dos Fundamentos']},
  'Controlador': {hp1:10, hpFixed:5, pe:5, peKeyOnce:true, keys:['Presença','Sabedoria'], trainings:'Armas simples e armas a distância. TR Astúcia ou Vontade. Ofício, Percepção, Persuasão e mais 2 perícias.', defaultSkills:['Ofício','Percepção','Persuasão'], baseAbilities:['Treinamento em Controle']},
  'Suporte': {hp1:10, hpFixed:5, pe:5, peKeyOnce:true, keys:['Presença','Sabedoria'], trainings:'Armas simples e escudos. TR Astúcia ou Vontade. Duas Ofício, Medicina, Prestidigitação e mais 3 perícias.', defaultSkills:['Ofício','Medicina','Prestidigitação'], baseAbilities:['Suporte em Combate']},
  'Restringido': {hp1:16, hpFixed:7, pe:0, stamina:4, peKeyOnce:false, keys:['Força','Destreza','Constituição','Inteligência','Sabedoria','Presença'], trainings:'Todas as armas e escudos. TR Fortitude e Reflexos. Ofício e mais 4 perícias, exceto Feitiçaria.', defaultSkills:['Ofício','Atletismo','Luta'], baseAbilities:['Restrito pelos Céus']}
};

const ABILITY_LIBRARY = [
  {
    "class": "Lutador",
    "level": 1,
    "name": "Corpo Treinado",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 1,
    "name": "Empolgação",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Reflexo Evasivo",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Aparar Ataque",
    "kind": "Escolha",
    "text": "Você rebate um ataque com outro ataque, assim conseguindo aparar um golpe.\n\nQuando for alvo de um ataque corpo a corpo, você pode gastar 1 PE e sua reação para realizar uma jogada de ataque contra o atacante. Caso seu teste supere o do inimigo, você evita o ataque."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Aparar Projéteis",
    "kind": "Escolha",
    "text": "Utilizando de sua agilidade e reflexos, você consegue tentar aparar projéteis em sua direção, reduzindo o dano deles. Quando receber um ataque à distância, você pode gastar 1 PE e sua reação para tentar aparar o projétil, reduzindo o dano recebido em 2d6 + modificador de atributo-chave + bônus de treinamento."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Ataque Inconsequente",
    "kind": "Escolha",
    "text": "Você baixa a guarda para atacar de maneira inconsequente, aumentando seu potencial de dano. Uma vez por rodada, ao realizar um ataque, você pode escolher receber vantagem na jogada de ataque e +5 na rolagem de dano dele. Porém, ao realizar um ataque inconsequente, você fica Desprevenido por 1 rodada."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Caminho da Mão Vazia",
    "kind": "Escolha",
    "text": "Mesmo diante a possibilidade de brandir armas marciais, você decide se ater as mãos vazias e se aperfeiçoar nesse caminho. Todo ataque desarmado que você realizar causa dano adicional igual ao seu bônus de treinamento e você soma metade do seu bônus de treinamento em jogadas de ataque desarmados."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Complementação Marcial",
    "kind": "Escolha",
    "text": "Suas habilidades marciais complementam certas manobras, deixando-as mais eficientes. Enquanto estiver desarmado ou empunhando uma arma marcial, você recebe um bônus de +2 em testes para Desarmar, Derrubar ou Empurrar, assim como para resistir a esses efeitos.\n\n 53"
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Deboche Desconcertante",
    "kind": "Escolha",
    "text": "Cheio de si, você consegue debochar de um inimigo de uma maneira que o desconcerta.\n\nComo uma Ação Bônus, escolha uma criatura que possa te ver ou ouvir: realize um teste de Intimidação contra um teste de Vontade dela, no qual você recebe um bônus de +2. Caso você suceda, a criatura recebe uma penalidade igual ao seu bônus de treinamento em todos os testes que ela realizar até o começo do seu próximo turno. [Pré-Requisito: Treinado em Intimidação]",
    "prereq": "Treinado em Intimidação",
    "req": {
      "skillTrained": "Intimidação"
    }
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Dedicação em Arma",
    "kind": "Escolha",
    "text": "Ao invés de contar apenas com seus punhos, você se dedica a certas armas.\n\nEscolha três armas para serem suas Armas Dedicadas, as quais não podem possuir as propriedades Duas Mãos ou Pesada, exceto caso já possuam a propriedade Marcial.\n\nSuas armas escolhidas passam a ser contadas como marciais, se não forem, e enquanto empunhar uma Arma Dedicada, o dano dela aumenta em 1 nível."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Esquiva Rápida",
    "kind": "Escolha",
    "text": "Com agilidade, você se prepara para esquivar de ataques. Como uma Ação Bônus, realize um teste de Acrobacia contra a Atenção de um inimigo dentro do seu alcance corpo a corpo. Caso suceda no teste, o alvo recebe metade do seu modificador de Destreza como penalidade em jogadas de ataque feitas contra você até o começo do seu próximo turno."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Finta Melhorada",
    "kind": "Escolha",
    "text": "Você desenvolva sua finta para que se torne mais eficiente e se adaptar ao seu corpo. Você pode optar por utilizar Destreza ao invés de Presença em testes de Enganação para fintar. Além disso, acertar um inimigo desprevenido pela sua finta causa um dado de dano adicional."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Impacto Misto",
    "kind": "Escolha",
    "text": "Você consegue misturar o uso de armas adequadas com seus ataques desarmados.\n\nQuando acertar uma criatura com um ataque com arma marcial, você recebe +2 em jogadas de ataque e dano desarmados até o começo do seu próximo turno. Nos níveis 5, 10, 15 e 20, o bônus em dano aumenta em +1, enquanto nos níveis 6, 12 e 18 o bônus em jogadas de ataque aumenta em +1."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Kiai Intimidador",
    "kind": "Escolha",
    "text": "Sendo a exteriorização da energia e força corporal, um kiai é liberado diante um bom golpe, intimidando com um grito.\n\nUma vez por rodada, quando conseguir um crítico em um ataque corpo a corpo você pode, como uma ação livre, realizar um teste de Intimidação contra Vontade do alvo e, caso suceda, ela fica Abalada por uma rodada. Se aplicar esta habilidade em uma criatura que já está Abalada, ela fica Amedrontada."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Mãos Amaldiçoadas",
    "kind": "Escolha",
    "text": "Como um feiticeiro, você consegue incorporar o jujutsu em seu combate a curta distância. Quando utilizar um Feitiço ofensivo com alcance de Toque, você pode substituir a jogada de ataque de técnica por uma jogada de ataque corpo a corpo e, também, somar seu modificador de Força ou Destreza no total."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Puxar um Ar",
    "kind": "Escolha",
    "text": "Você consegue respirar fundo e puxar as forças guardadas em seu interior para continuar lutando. Você pode, como uma Ação Bônus, realizar uma rolagem do seu dano desarmado e se curar nesse valor. Esta habilidade pode ser usada uma quantidade de vezes igual ao seu bônus de treinamento, por descanso curto ou longo.\n\n 54"
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Quebrando Tudo",
    "kind": "Escolha",
    "text": "O cenário e ambiente ao seu redor conta com várias armas e, lutando para quebrar tudo, você aprimora seu uso de armas improvisadas. Como parte de um ataque, você pode agarrar um objeto pequeno ou menor adjacente a você. Objetos usados de arma improvisada (Página 326) recebem +1d no dano e são considerados armas marciais."
  },
  {
    "class": "Lutador",
    "level": 2,
    "name": "Resistir",
    "kind": "Escolha",
    "text": "Você pode utilizar da energia para fortalecer seu corpo e resistir com mais eficiência. Quando realizar um teste de resistência de Fortitude ou Reflexos, você pode gastar até 2PE para receber um bônus de +2 para cada PE gasto."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Implemento Marcial",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Ação Ágil",
    "kind": "Escolha",
    "text": "Você otimiza o seu tempo de ação. Uma vez por rodada, você pode gastar 2PE para receber uma Ação Ágil, a qual pode ser utilizada para Andar, Desengajar ou Esconder."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Acrobata",
    "kind": "Escolha",
    "text": "Ao invés da força, você usa a agilidade para poder saltar. Você passa a utilizar Destreza como atributo para calcular sua distância de pulo, assim como pode utilizar Acrobacia no lugar de Atletismo em testes para aumentar a sua distância de salto."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Atacar e Recuar",
    "kind": "Escolha",
    "text": "Você consegue atacar e aproveitar a brecha do golpe para se afastar do inimigo.\n\nUma vez por turno, quando acertar uma criatura com um ataque, você pode gastar 1 PE para se mover até 4,5 metros para longe da criatura acertada. Este movimento não causa ataques de oportunidade. [PréRequisito: Esquiva Rápida]"
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Brutalidade",
    "kind": "Escolha",
    "text": "Existe uma brutalidade guardada no seu interior, a qual pode ser canalizada como uma fúria para combate. Como uma Ação Livre, você pode gastar 2PE para adentrar no estado de Brutalidade: enquanto nesse estado, você recebe +2 em jogadas de ataque corpo a corpo e dano. Entretanto, enquanto estiver em Brutalidade, você não pode manter a concentração nem utilizar Feitiços ou Técnicas de Estilo. Caso já estivesse se concentrando em algo, a concentração quebra. A Brutalidade se encerra no final do seu turno caso você não tenha atacado ninguém nele ou caso você a encerre como uma Ação Livre. Nos níveis 8, 12, 16 e 20 você pode gastar 2 PE a mais para aumentar o bônus em jogadas de ataque e dano em +1."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Defesa Marcial",
    "kind": "Escolha",
    "text": "Você é capaz de incorporar a leveza de seus movimentos em sua defesa. Enquanto estiver desarmado ou empunhando uma arma marcial, você soma 1 + metade do seu Bônus de Treinamento à sua Defesa. [PréRequisito: Complementação Marcial]\n\n 55"
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Devolver Projéteis",
    "kind": "Escolha",
    "text": "Sua capacidade de aparar é aprimorada, abrindo também oportunidades para os devolver. O dado de Aparar Projéteis se torna 3d10 e soma também o seu Nível de Lutador. Caso você use Aparar Projéteis e o dano se torne nulo ou negativo, você pode devolver o projétil como parte da reação, causando no atacante o dano que você receberia. [Pré-Requisito: Aparar Projéteis]",
    "prereq": "Aparar Projéteis",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Fluxo",
    "kind": "Escolha",
    "text": "Conforme se empolga, você cada vez mais se aproxima de entrar “na zona”, um estado de completo foco e imersão na luta. A cada nível de empolgação que você subir, você recebe +1 em rolagens de dano e, no começo de toda rodada, recebe 4 pontos de vida temporários para cada nível de empolgação acima do primeiro."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Fúria da Vingança",
    "kind": "Escolha",
    "text": "Seus aliados são importantes, e você irá vingá-los caso necessário. Ao ver um personagem aliado (Invocações não são consideradas) chegar a 0 pontos de vida e cair, você recebe os seguintes benefícios durante uma rodada: seus ataques causam 4 de dano adicional; sua Defesa aumenta em 2; você recebe +2 em TRs de Fortitude e Vontade. Os benefícios são aplicados apenas contra o inimigo alvo da vingança e outras criaturas que tentarem o impedir de alcançá-lo."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Imprudência Motivadora",
    "kind": "Escolha",
    "text": "Em certos momentos, ser imprudente e se desafiar o motiva a triunfar. Ao iniciar uma cena de combate, você pode escolher lutar com uma restrição auto imposta, escolha um dos seus sensos ou membros (como não usar a visão ou não usar uma das pernas), até o final da cena, recebe as mesmas penalidades de perder um membro (Veja Ferimentos Complexos, página 315). Se vencer o combate com a restrição, você recupera uma quantidade de PE igual ao seu nível de personagem;\n\nrecebe +2 em rolagens de ataque e tem sua margem de crítico reduzida em 1 até o fim da missão atual."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Músculos Desenvolvidos",
    "kind": "Escolha",
    "text": "Sua força o fez ter músculos desenvolvidos, os quais por consequência acabaram ficando mais preparados para receber golpes, sendo mais difícil o acertar de maneira efetiva. Ao obter esta habilidade, você pode optar por somar seu Modificador de Força ao invés de Destreza em sua Defesa, modificando o cálculo padrão."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Redirecionar Força",
    "kind": "Escolha",
    "text": "Você consegue redirecionar um golpe direcionado a você, mudando o alvo.\n\nQuando um inimigo errar um ataque corpo a corpo contra você, você pode gastar 2PE e sua reação para tentar redirecionar o ataque: escolha outra criatura dentro do alcance do golpe e, caso o resultado da jogada de ataque dela seja superior à Defesa do novo alvo, ele recebe o ataque."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Segura pra Mim",
    "kind": "Escolha",
    "text": "Uma criatura agarrada pode ser utilizada como escudo. Quando for alvo de um ataque corpo a corpo ou uma habilidade com alvo único, você pode gastar 3 PE para tentar colocar uma criatura que esteja agarrando na frente, faça um teste de Atletismo contra o Atletismo ou Acrobacia da criatura agarrada. Se for bem sucedido, a criatura recebe os efeitos do ataque ou habilidade no seu lugar e você imediatamente para de agarrar ela."
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Sobrevivente",
    "kind": "Escolha",
    "text": "Como um lutador, você deve sobreviver, recuperando-se quando sente a vitalidade esvaindo. Enquanto estiver com menos da metade dos seus pontos de vida máximos, sempre que começar seu turno, você recupera 1d6 + seu modificador de Constituição em pontos de vida. Esta habilidade não funciona caso esteja Inconsciente ou nos portões da morte. Nos níveis 8, 12, 16 e 20, a cura aumenta em 1d6. [Pré-Requisito: Constituição 16]",
    "prereq": "Constituição 16",
    "req": {
      "attr": {
        "Constituição": 16
      }
    }
  },
  {
    "class": "Lutador",
    "level": 4,
    "name": "Voadora",
    "kind": "Escolha",
    "text": "Você consegue investir em uma voadora, acumulando potência conforme a distância aumenta. Quando realizar uma Investida, e estiver desarmado, você pode gastar 3PE para realizar uma Voadora. Caso o faça, você causa 1d8 de dano adicional para cada 3 metros que se deslocar até o alvo, limitado pelo seu modificador de Força ou Destreza.\n\n 56"
  },
  {
    "class": "Lutador",
    "level": 5,
    "name": "Gosto pela Luta",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 5. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Aprimoramento Marcial",
    "kind": "Escolha",
    "text": "Você aprimora suas habilidades marciais para deixar mais difícil resistir as suas técnicas de Lutador. Você passa a somar metade do seu Bônus de Treinamento em sua CD de Especialização."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Ataque Extra",
    "kind": "Escolha",
    "text": "Você consegue atacar mais rápido, otimizando seus golpes. Ao realizar a ação Atacar, você pode gastar 2 PE para atacar duas vezes ao invés de uma."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Brutalidade Sanguinária",
    "kind": "Escolha",
    "text": "Em meio a brutalidade, o sangue pode o renovar. Enquanto no estado de Brutalidade, sempre que tiver um acerto crítico ou reduzir a vida de uma criatura a 0 ou menos, você aumenta o nível de dano dos seus ataques corpo a corpo em 1, acumulando até um limite igual ao seu bônus de treinamento. Esse aumento dura enquanto permanecer com o estado de Brutalidade ativo. [Pré-Requisito:\n\nBrutalidade]",
    "prereq": "Brutalidade",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Corpo Calejado",
    "kind": "Escolha",
    "text": "De tanto combater e receber golpes, todo seu corpo já está calejado e mais resistente.\n\nVocê passa a adicionar metade do seu Modificador de Constituição na sua Defesa e recebe pontos de vida adicionais igual ao seu nível de Lutador."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Eliminar e Continuar",
    "kind": "Escolha",
    "text": "Eliminar um inimigo e o ver cair serve apenas como um incentivo para continuar.\n\nSempre que um inimigo ao qual você causou dano cair ou morrer dentro de 9 metros, você recebe 2d6 + nível de personagem + modificador de atributochave em PV temporários, os quais acumulam. No nível 8, o valor aumenta para 3d6, no nível 12 aumenta para 4d6, no nível 16 aumenta para 4d8 e no nível 20 aumenta para 4d12.\n\n 57"
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Foguete sem Ré",
    "kind": "Escolha",
    "text": "Se dedicando a avançar sem olhar para trás, você consegue usar da sua energia para o impulsionar em uma investida direta.\n\nComo uma ação completa, você gasta 6 PE para se mover até uma distância igual ao dobro do seu deslocamento; sempre que passar por uma criatura durante essa investida, ela deve realizar um teste de resistência de Reflexos, sofrendo Xd10 + modificador de Força ou Destreza (onde X é o seu bônus de treinamento) de dano de Impacto e não podendo realizar Ataques de Oportunidade contra você em uma falha.\n\nAo terminar seu movimento adjacente a uma criatura, você pode realizar um ataque contra ela."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Golpe da Mão Aberta",
    "kind": "Escolha",
    "text": "Você é capaz de realizar um ataque potente, utilizando a palma da mão. Como uma ação comum, você pode gastar 4 PE para realizar um golpe de mão aberta.\n\nVocê realiza um ataque desarmado contra um alvo dentro do seu alcance corpo a corpo e, em um acerto, ele deve realizar um teste de resistência de Fortitude e, em um fracasso, ele fica Desorientado, Enjoado e Exposto até o início do seu próximo turno.\n\nO Golpe da Mão Aberta conta como um ataque desarmado para propósitos de habilidades que apenas funcionam com ataques e você não pode usar ataque extra com esse golpe."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Ignorar Dor",
    "kind": "Escolha",
    "text": "Seu desejo por uma boa luta é constante, permitindo-o até mesmo ignorar parte da dor que seja infligida em você. Você recebe redução de danos contra todos os tipos, menos alma, igual ao seu nível de empolgação atual. Contra danos físicos, a redução de dano é dobrada."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Manobras Finalizadoras",
    "kind": "Escolha",
    "text": "Após toda uma sequência empolgante, você sabe exatamente como finalizar o seu combo com uma manobra ainda mais impactante. Você libera acesso a novas manobras, listadas no final da especialização. Ao realizar um ataque, você pode realizar uma Manobra Finalizadora."
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Poder Corporal",
    "kind": "Escolha",
    "text": "Cultivando e priorizando seu próprio corpo, você expande o poder dele. O dano de seus ataques desarmados aumenta em 2 níveis e, uma vez por rodada, ao realizar um ataque desarmado, você pode escolher realizar uma Manobra como parte do ataque, aplicando seu efeito juntamente do dano. [Pré-Requisito: Caminho da Mão Vazia]",
    "prereq": "Caminho da Mão Vazia",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Potência Superior",
    "kind": "Escolha",
    "text": "A potência que você consegue colocar em suas manobras se torna superior. Quando Derrubar um inimigo com sucesso, ele também recebe 2d6 + seu modificador de Força de dano de impacto; quando Empurrar um inimigo, a distância padrão se torna 4,5 metros ao invés de 1,5 metros. [PréRequisito: Complementação Marcial]"
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Sequência Inconsequente",
    "kind": "Escolha",
    "text": "Não se limitando a apenas um ataque, você assume uma postura inconsequente durante todo seu período de atacar. Quando utilizar Ataque Inconsequente, você passa a receber o dano adicional em todos seus ataques realizados durante o turno. [PréRequisito: Ataque Inconsequente]"
  },
  {
    "class": "Lutador",
    "level": 6,
    "name": "Um com a Arma",
    "kind": "Escolha",
    "text": "Você começa a se tornar apenas um com as armas para as quais se dedicou. Uma quantidade de vezes igual a metade do seu nível de Lutador, por descanso curto, suas armas dedicadas conseguem superar resistência ao tipo de dano delas em um ataque. Caso erre o ataque, o uso não é consumido. Uma vez por rodada, ao ser desarmado de uma das suas armas dedicadas, você pode utilizar sua reação para evitar, mantendo-se em posse da arma. [Pré-Requisito: Dedicação em Arma]\n\n 58",
    "prereq": "Dedicação em Arma",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Aptidões de Luta",
    "kind": "Escolha",
    "text": "Você aprimora suas aptidões de energia necessárias para a luta. Ao obter esta habilidade, você pode aumentar o seu nível de aptidão em Aura ou Controle e Leitura em 1. Você pode pegar esta habilidade duas vezes, uma para cada aptidão."
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Ataques Ressoantes",
    "kind": "Escolha",
    "text": "Você sabe aproveitar bem brechas na defesa dos inimigos. Uma vez por rodada, quando um inimigo dentro do seu alcance corpo a corpo é atingido por um ataque de uma criatura o flanqueando, você pode gastar 2 PE para fazer um ataque corpo a corpo contra a criatura.\n\n O impacto dos seus ataques ressoa e atinge outros inimigos próximos do seu alvo. Ao realizar um ataque contra um inimigo, você pode gastar 2 pontos de energia amaldiçoada para que todos os inimigos adjacentes ao alvo, com a Defesa inferior ao resultado do seu ataque, recebam dano igual a metade do dano causado no alvo."
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Brutalidade Aprimorada",
    "kind": "Escolha",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 8. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Feitiço e Punho",
    "kind": "Escolha",
    "text": "Com precisão, você consegue agir rapidamente para utilizar do jujutsu e complementar com seu corpo. Uma vez por rodada, quando utilizar um Feitiço de dano com alvo único, você pode gastar 2PE para realizar um ataque corpo a corpo contra o mesmo alvo, desde que ele esteja dentro do seu alcance. [Pré-Requisito:\n\nMãos Amaldiçoadas]",
    "prereq": "Mãos Amaldiçoadas",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Golpear Brecha",
    "kind": "Escolha",
    "text": "Você consegue aproveitar de um golpe aparado para atacar a brecha que se abre na defesa do inimigo. Quando utilizar Aparar Ataque e conseguir aparar com sucesso, você pode gastar 2PE adicionais para realizar um ataque contra o inimigo como parte da reação. [Pré-Requisito:\n\nAparar Ataque]\n\n 59",
    "prereq": "Aparar Ataque",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Oportunista",
    "kind": "Escolha",
    "text": "Uma boa pancada deixa qualquer um despreparado para o que vem a seguir.\n\nQuando conseguir um acerto crítico em um ataque corpo a corpo, você pode fazer com que o alvo do ataque receba desvantagem contra um TR à sua escolha, até o início do seu próximo turno.\n\nNão há necessidade de armas se o seu corpo já é a mais letal entre elas. Enquanto estiver desarmado, sua margem de crítico diminui em 1 e seus ataques ignoram RD igual ao seu bônus de treinamento. [PréRequisito: Poder Corporal]"
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Pancada Desnorteante",
    "kind": "Escolha",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 8. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 8,
    "name": "Punhos Letais",
    "kind": "Escolha",
    "text": "Aprimorando no fluxo que você impõe no seu corpo, ele te deixa ainda mais resistente. Ao entrar no estado de brutalidade, você recebe uma quantidade de pontos de vida temporários igual ao seu nível + modificador do atributo para CD de Especialização. O bônus inicial em dano se torna +4 e o aumento no dano por ponto de energia adicional gasto se torna +2. [Pré-Requisito: Brutalidade]",
    "prereq": "Brutalidade",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 9,
    "name": "Teste de Resistência Mestre",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 9. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Alma Quieta",
    "kind": "Escolha",
    "text": "Sua alma é imperturbável durante uma boa luta. Você recebe vantagem para resistir às seguintes condições: Condenado, Enfeitiçado e Fragilizado. [Pré-Requisito:\n\nTreinado em Vontade]",
    "prereq": "Treinado em Vontade",
    "req": {
      "skillTrained": "Vontade"
    }
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Corpo Sincronizado",
    "kind": "Escolha",
    "text": "Seu corpo está sempre em sincronia.\n\nVocê recebe vantagem para resistir às seguintes condições: Caído e Exposto.\n\n[Pré-Requisito: Treinado em Fortitude]",
    "prereq": "Treinado em Fortitude",
    "req": {
      "skillTrained": "Fortitude"
    }
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Empolgar-se",
    "kind": "Escolha",
    "text": "Em certos momentos, a própria antecipação que você guarda para uma luta pode se transformar na empolgação necessária. Uma quantidade de vezes igual ao seu Bônus de treinamento, por descanso longo, você pode escolher subir dois níveis de empolgação, ao invés de um, no começo de um turno em que ele aumentaria."
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Impacto Demolidor",
    "kind": "Escolha",
    "text": "Você consegue colocar tanta força em um golpe que o alvo se torna uma bola de demolição. Como uma Ação Comum, realize uma jogada de ataque corpo a corpo contra um alvo dentro do seu alcance corpo a corpo e, caso acerte, você causa o dano do ataque e realiza a ação Empurrar como parte dele: a distância total que o alvo será empurrado é dobrada e ele quebra todo objeto ou obstáculos em sua parede, como paredes ou contêiners, recebendo o Dano de Fontes Externas (p.327). Não é possível utilizar Ataque Extra nesta ação. [PréRequisito: Potência Superior]\n\n 60"
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Insistência",
    "kind": "Escolha",
    "text": "Deixando o seu desejo se ampliar ainda mais, você se torna um lutador insistente e difícil de derrubar. Uma vez por cena, caso você fosse ter os seus pontos de vida reduzidos a 0, você pode escolher retornar ao nível de empolgação 1 para continuar de pé, curando-se em um valor igual a uma rolagem de dano do seu ataque desarmado. Após usar essa habilidade, até que realize um descanso longo, o seu nível máximo de empolgação abaixa em 1. [PréRequisito: Ignorar Dor]"
  },
  {
    "class": "Lutador",
    "level": 10,
    "name": "Mente em Paz",
    "kind": "Escolha",
    "text": "Sua mente continua em paz mesmo durante o combate. Você recebe vantagem para resistir às seguintes condições Amedrontado, Atordoado e Confuso. [PréRequisito: Treinado em Astúcia]"
  },
  {
    "class": "Lutador",
    "level": 11,
    "name": "Empolgação Máxima",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 11. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 12,
    "name": "Armas Absolutas",
    "kind": "Escolha",
    "text": "Sua dominância com as Armas Dedicadas chega ao ápice, tornando-as uma parte íntegra de si mesmo. Enquanto estiver empunhando uma Arma Dedicada, você pode gastar 2PE para receber os seguintes bônus por uma rodada: você escolhe aumentar sua Defesa em 3 ou receber +3 em Jogadas de Ataque e, uma vez por ataque, ao errar com uma arma dedicada, você pode rolar novamente o ataque, ficando com o melhor resultado. Para cada rodada após a primeira, você deve gastar mais 2PE para manter, ou os bônus se encerram. [Pré-Requisito: Um Com a Arma]",
    "prereq": "Um Com a Arma",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 12,
    "name": "Corpo Arsenal",
    "kind": "Escolha",
    "text": "Você se torna plenamente consciente do complexo arsenal que o seu corpo é, podendo o utilizar ofensivamente de diferentes maneiras. Quando realizar um acerto crítico com um ataque desarmado, você pode optar por infligir o efeito de um grupo adicional entre Bastão, Haste ou Martelo. [Pré-Requisito: Punhos Letais]",
    "prereq": "Punhos Letais",
    "req": {}
  },
  {
    "class": "Lutador",
    "level": 12,
    "name": "Seja Água",
    "kind": "Escolha",
    "text": "Não se colocando dentro de uma única forma, você aprende a se mover como a água, adaptando-se e não se prendendo.\n\nSeu Deslocamento aumenta em 3 metros, você ignora terreno difícil por fontes físicas (como detritos ou solo destruído) e, uma vez por rodada, pode evitar ser agarrado sem a necessidade de teste."
  },
  {
    "class": "Lutador",
    "level": 12,
    "name": "Tempestade Sufocante",
    "kind": "Escolha",
    "text": "Seus golpes marciais são tão rápidos e potentes que se tornam uma tempestade que sufoca e destrói a guarda dos inimigos.\n\nPara cada ataque corpo a corpo desarmado ou com arma marcial que você acertar em um mesmo alvo, ele recebe -1 na Defesa e em Testes de Resistência realizados contra você, acumulando até um máximo igual ao seu bônus de treinamento. O prejuízo dura até o começo do próximo turno da criatura afetada."
  },
  {
    "class": "Lutador",
    "level": 16,
    "name": "Corpo Supremo",
    "kind": "Escolha",
    "text": "Você alcançou um alto nível como lutador e levou seu corpo ao limite. Você recebe mais 3 metros de movimento adicionais, +4 na sua Defesa e redução de dano igual a metade do seu nível de personagem contra dano cortante, perfurante e de impacto, além de mais um tipo à sua escolha, exceto alma. Contra os outros tipos de dano não escolhidos, a redução de dano é igual a 1/4 do seu nível.\n\n 61"
  },
  {
    "class": "Lutador",
    "level": 16,
    "name": "Duro na Queda",
    "kind": "Escolha",
    "text": "Quando estiver nas portas da morte, você pode escolher receber uma falha garantida para fazer um teste de Vontade contra a CD X, sendo X igual a 15 + 1 para cada 3 pontos de vida negativos. Se passar, você levanta com 1 de vida e recebe 1 ponto de exaustão. [Pré-Requisito: Treinado em Vontade]",
    "prereq": "Treinado em Vontade",
    "req": {
      "skillTrained": "Vontade"
    }
  },
  {
    "class": "Lutador",
    "level": 16,
    "name": "Manobras Finalizadoras Aprimoradas",
    "kind": "Escolha",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 16. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Lutador",
    "level": 20,
    "name": "Lutador Superior",
    "kind": "Automática",
    "text": "Entrada oficial de Lutador, desbloqueada no nível 20. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 1,
    "name": "Repertório do Especialista",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 1,
    "name": "Arte do Combate",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Arremessos Potentes",
    "kind": "Escolha",
    "text": "Você se torna capaz de arremessar armas com mais potência. Seus ataques com armas de arremesso contam como um nível de dano acima. Além disso, no começo do seu turno, você pode gastar 1PE para fazer com que seus ataques com armas de arremesso ignorem RD igual ao seu bônus de treinamento."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Arsenal Cíclico",
    "kind": "Escolha",
    "text": "Ao invés de se limitar a uma única arma, você mantém uma ciclagem do seu arsenal para golpear com eficiência. Uma vez por rodada, você pode sacar ou trocar um item com uma ação livre. Ao realizar um golpe com um grupo de armas e trocar para outra arma de outro grupo na mesma rodada ou na próxima, você recebe +1d até o fim do seu próximo turno com a arma trocada."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Assumir Postura",
    "kind": "Escolha",
    "text": "A postura que uma pessoa mantém em combate molda suas capacidades, fornecendo grandes benefícios. Ao obter esta habilidade, você recebe acesso às posturas, explicadas e listadas no final da especialização."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Disparos Sincronizados",
    "kind": "Escolha",
    "text": "Você consegue sincronizar seus disparos e tiros, fazendo-os parecer um só. Caso esteja manejando duas armas a distância ou de fogo, você pode usar suas ações de ataque juntas para tentar sincronizar os dois tiros. Realize os dois ataques e, caso ambos acertem, você combina o dano em uma única instância, depois adicionando efeitos aplicáveis para ambas as armas, além de aplicar resistências ou fraquezas apenas uma vez.\n\n 67"
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Escudeiro Agressivo",
    "kind": "Escolha",
    "text": "Seu uso do escudo é não só defensivo, mas também agressivo. Uma vez por rodada, ao realizar uma ação de ataque e estiver empunhando um escudo, você pode gastar 1 ponto de energia amaldiçoada para fazer um ataque adicional com o escudo."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Extensão do Corpo",
    "kind": "Escolha",
    "text": "Suas armas são praticamente extensões do seu próprio corpo. Seu alcance em ataques com armas corpo a corpo aumenta em 1,5 metros e você recebe um bônus de +2 em jogadas de ataque e em testes para evitar ser desarmado."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Flanqueador Superior",
    "kind": "Escolha",
    "text": "Você sabe perfeitamente como manter um flanco perigoso. Enquanto estiver flanqueando uma criatura, a criatura flanqueada recebe -2 em testes de resistência."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Golpe Falso",
    "kind": "Escolha",
    "text": "Você é capaz de fingir desferir um golpe, distraindo seus inimigos para auxiliar aliados. Como reação a um aliado atacando um inimigo dentro do seu alcance de ataque, você realiza o golpe falso. O inimigo deve realizar um TR de Astúcia e, caso falhe, o seu aliado recebe vantagem no teste de ataque."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Golpes Potentes",
    "kind": "Escolha",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Indomável",
    "kind": "Escolha",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Pistoleiro Iniciado",
    "kind": "Escolha",
    "text": "Atirando com volatilidade, você consegue impor mais poder nas suas armas em troca de um risco maior. Quando for realizar um ataque com uma arma de fogo, antes da jogada de ataque, você pode escolher aumentar a margem de Emperrar em 2 e, em troca, você causa 1 dado de dano adicional caso acerte."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Posicionamento Ameaçador",
    "kind": "Escolha",
    "text": "Você sabe se posicionar de maneira estratégica, fazendo com que um inimigo que possa o ver te reconheça como uma constante ameaça, mesmo distante. A menos que esteja furtivo, você pode conceder os benefícios de Flanco para aliados, mesmo utilizando armas a distância ou de fogo, desde que o alvo do flanco esteja dentro do primeiro alcance da sua arma."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Precisão Definitiva",
    "kind": "Escolha",
    "text": "Você se torna capaz de canalizar a energia amaldiçoada na sua arma de maneira a alcançar uma precisão definitiva, seja para acertar ou para destruir. Quando faz um ataque, você pode gastar 1 ponto de energia amaldiçoada para receber +2 na rolagem para acertar. A cada quatro níveis, você pode gastar 1 ponto a mais para aumentar o bônus em +2. Você também pode optar por adicionar esse bônus na rolagem de dano ao invés da de acerto, com um bônus de +4 ao invés de +2 para esse uso.\n\n A furtividade e discrição podem ser essenciais em um combate, para se mover de maneira apropriada. Você recebe um bônus de +2 em rolagens de Furtividade.\n\nSua penalidade em furtividade por atacar e fazer outras ações chamativas é reduzida para -5.\n\nDiante o quão extenso e cansativo um combate pode ser, você é capaz de focar e recuperar seu vigor. Uma quantidade de vezes igual ao seu bônus de treinamento você pode usar sua ação bônus para se curar em um valor igual a 1d10 + o dobro do seu modificador de Constituição + bônus de treinamento, aumentando em um dado a cada 4 níveis. Você recupera todos os usos em um descanso longo ou metade em um descanso curto."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Presença Suprimida",
    "kind": "Escolha",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Revigorar",
    "kind": "Escolha",
    "text": "Seus golpes se tornam inatamente mais potentes, sendo capaz de manejar armas extraindo seu máximo. Sempre que você estiver usando uma arma com a qual você seja treinado o dano dela aumenta em um nível e suas rolagens de dano recebem um bônus de +2.\n\nEm combate, você não se deixa render, resistindo ao que vier. Uma quantidade de vezes por descanso curto ou longo igual a metade do seu nível de personagem, você pode gastar 1 ponto de energia amaldiçoada para rolar novamente um teste de resistência em que você falhar, ficando com o melhor resultado."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Tiro Falso",
    "kind": "Escolha",
    "text": "Você consegue fingir falsos disparos, distraindo um inimigo. Como reação a um aliado atacando um inimigo dentro do seu alcance de ataque, caso esteja manejando uma arma a distância ou de fogo, você realiza um tiro falso, fingindo que dispararia. O inimigo deve realizar um TR de Astúcia e, caso falhe, o seu aliado recebe vantagem no teste de ataque."
  },
  {
    "class": "Especialista em Combate",
    "level": 2,
    "name": "Zona de Risco",
    "kind": "Escolha",
    "text": "Ter uma arma com o alcance maior o permite criar uma efetiva zona de risco. Uma vez por rodada, se estiver empunhando uma arma corpo-a-corpo com a propriedade Estendida e um inimigo entrar no seu alcance de ataque, você pode gastar 2 pontos de energia amaldiçoada para realizar um ataque contra ele.\n\n 68"
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Golpe Especial",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Aprender Postura",
    "kind": "Escolha",
    "text": "Você continua seu estudo sobre as posturas utilizadas em combate, expandindo seu repertório. Você aprende uma postura adicional à sua escolha. No 10° nível você aprende outra postura. [Pré-Requisito:\n\nAssumir Postura]",
    "prereq": "Assumir Postura",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Armas Escolhidas",
    "kind": "Escolha",
    "text": "Um tipo de arma ressoa de maneira única com você, e ela foi escolhida como seu caminho. Escolha um grupo de arma: seus ataques com armas dele tem o nível de dano aumentado em 3."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Arremesso Rápido",
    "kind": "Escolha",
    "text": "Utilizando de armas leves e menores, você consegue as arremessar com velocidade.\n\nUma vez por rodada, ao realizar um ataque com uma arma de arremesso, você pode gastar 1PE para realizar um ataque com arma de arremesso contra outro alvo.\n\nVocê arremessa outra arma ou a mesma arma utilizada antes, desde que ela possua a propriedade Retorno."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Técnicas de Avanço",
    "kind": "Escolha",
    "text": "As técnicas de avanço envolvem a mistura do deslocamento com os golpes. Ao obter esta habilidade, você aprende duas artes de combate de avanço, listadas no final da especialização."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Buscar Oportunidade",
    "kind": "Escolha",
    "text": "Você sabe como encontrar a oportunidade certa para fazer o que é necessário. Como uma Ação Livre, realize um teste de Percepção com CD16 + 2 para cada inimigo em campo. Caso suceda no teste, você pode utilizar Andar, Desengajar ou Esconder como Ação Livre."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Compensar Erro",
    "kind": "Escolha",
    "text": "Você se torna habilidoso o suficiente para compensar erros com a liberação bruta de energia. Uma vez por rodada, quando errar um ataque com uma arma corpo a corpo, você pode gastar até uma quantidade de PE igual ao seu bônus de treinamento para causar dano no alvo do ataque. Para cada ponto gasto, o alvo recebe 1d10 de dano Energético com o seu modificador de força, destreza ou sabedoria sendo somado ao total.\n\n 69"
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Especialista em Escudo",
    "kind": "Escolha",
    "text": "Você se especializa completamente na defesa e no uso de escudos. Você passa a somar o aumento base em RD do seu escudo em testes de resistência de Reflexos e Fortitude."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Espírito de Luta",
    "kind": "Escolha",
    "text": "O combate é um caminho, no qual você nutre um espírito intenso para lutar.\n\nComo uma Ação Livre, você pode gastar 1PE para receber um bônus de +2 em jogadas de ataque até o fim da cena. Além disso, ao utilizar esta habilidade, você ganha PV temporários igual ao seu nível de personagem."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Grupo Favorito",
    "kind": "Escolha",
    "text": "Você descobre como utilizar melhor um certo tipo de armas. Escolha um grupo de armas: você recebe acesso ao efeito de crítico do grupo enquanto manejando uma arma que pertença a ele."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Guarda Estudada",
    "kind": "Escolha",
    "text": "Sua guarda surge a partir do estudo e da reflexão. Você passa a somar metade do seu modificador de Sabedoria na sua Defesa, limitado pelo seu nível. Além disso, você pode escolher um Teste de Resistência para receber um bônus de +2."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Mente Oculta",
    "kind": "Escolha",
    "text": "Você treinou sua mente para se ocultar, aguçando-a para encontrar os lugares certos. Você passa a adicionar também o seu bônus de sabedoria em rolagens de Furtividade."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Preparo Imediato",
    "kind": "Escolha",
    "text": "Utilizando do seu preparo, você consegue rapidamente se colocar pronto para agir.\n\nDurante uma rolagem de iniciativa, você pode gastar 3 pontos de preparo para utilizar Preparar, mas apenas para uma ação bônus. A partir do 10° nível, você pode optar por gastar 7 pontos de preparo para preparar uma ação comum."
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Recarga Rápida",
    "kind": "Escolha",
    "text": "Você se treinou e preparou para conseguir recarregar rapidamente. O custo em ações para recarregar armas a distância que você empunhar diminui em um nível;\n\ncusto de ação comum se torna ação bônus e ação bônus se torna ação livre.\n\n 70"
  },
  {
    "class": "Especialista em Combate",
    "level": 4,
    "name": "Uso Rápido",
    "kind": "Escolha",
    "text": "Para ter mais versatilidade e acessibilidade ao seu inventário de ferramentas, você agiliza o uso delas. Ao utilizar uma ação para usar um item, você pode pagar 1 ponto de energia para usar um item adicional."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Renovação pelo Sangue",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 6. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Acervo Amplo",
    "kind": "Escolha",
    "text": "Seu acervo para o combate é amplo, conseguindo internalizar e manifestar qualquer estilo que desejar. Ao obter esta habilidade, você aprende mais um Estilo de Combate. Após meditar por 1 hora, você pode trocar quais estilos de combate você possui."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Aprimoramento Especializado",
    "kind": "Escolha",
    "text": "Você aprimora suas habilidades de combate para deixar mais difícil resistir as suas técnicas de Especialista em Combate. Você passa a somar metade do modificador do seu atributo chave em sua CD de Especialização."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Ataque Extra",
    "kind": "Escolha",
    "text": "Você consegue atacar mais rápido, otimizando seus golpes. Ao realizar a ação Atacar, você pode gastar 2 PE para atacar duas vezes ao invés de uma."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Crítico Melhorado",
    "kind": "Escolha",
    "text": "Você aguça o seu olhar para tornar mais fácil encaixar um golpe certeiro. A margem do seu acerto crítico reduz em um número."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Crítico Potente",
    "kind": "Escolha",
    "text": "Acertar um golpe certeiro é realmente devastador para você. Ao acertar um ataque crítico, ele causa 1 dado de dano adicional."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Feitiçaria Implementada",
    "kind": "Escolha",
    "text": "O jujutsu é um recurso indispensável, o qual você implementa no seu combate.\n\nUma vez por rodada, quando utilizar um Feitiço de dano, você pode gastar 2PE para realizar um ataque contra uma criatura que tenha sido afetada por ela, como Ação Livre. [Pré-Requisito: Treinado em Feitiçaria]",
    "prereq": "Treinado em Feitiçaria",
    "req": {
      "skillTrained": "Feitiçaria"
    }
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Fluxo Perfeito",
    "kind": "Escolha",
    "text": "Em certos momentos, o fluxo do combate é perfeito em sua mente. Caso você acerte todos os seus ataques no turno, no seu próximo turno você ganha 1 ponto de energia amaldiçoada temporária. No 12° nível, esse valor se torna 2.\n\n 71"
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Olhos de Águia",
    "kind": "Escolha",
    "text": "Seu olhar é afiado e preciso como o de uma águia, permitindo-o mirar mais rapidamente. Você pode gastar 1 PE para usar Mirar como uma ação livre."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Manejo Especial",
    "kind": "Escolha",
    "text": "A maneira a qual você maneja suas armas é única, feita com maestria inerente ao portador. Você pode escolher uma propriedade de ferramenta amaldiçoada para ser aplicada em toda arma que você estiver manejando, se possível."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Marcar Inimigo",
    "kind": "Escolha",
    "text": "Após um golpe, você marca um inimigo como seu no campo de batalha, impedindo-o de atacar e retaliando tentativas de o ignorar. Quando acertar uma criatura com um ataque corpo a corpo, você pode escolher marcá-la até o final do seu próximo turno: enquanto a criatura marcada estiver dentro de 4,5 metros de você, ela recebe -4 em jogadas de ataque e, adicionalmente, caso a criatura marcada cause dano em alguém além de você, você pode gastar 1PE para realizar um ataque como Ação Bônus contra ela no seu próximo turno. Você pode realizar este ataque uma quantidade de vezes igual ao seu modificador de Força, Destreza ou Sabedoria por descanso curto. Caso seja incapacitado, desmaiado ou morto, o efeito da habilidade é cancelado."
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Mira Destrutiva",
    "kind": "Escolha",
    "text": "Ao invés de apenas acertar, você é capaz de mirar para destruir completamente, em um disparo difícil, mas recompensador.\n\nQuando utilizar a ação Mirar, você optar por deixar de receber vantagem para mirar em uma parte específica do corpo: escolha entre Olho, Braço, Perna ou Ferida Interna e, no seu próximo ataque, você recebe -15 na jogada de ataque, mas, caso acerte, o alvo recebe a consequência do membro de acordo com a tabela de Ferimentos Complexos durante uma rodada. [PréRequisito: Treinado em Percepção]"
  },
  {
    "class": "Especialista em Combate",
    "level": 6,
    "name": "Preparação Rápida",
    "kind": "Escolha",
    "text": "A arte das posturas já está encravada em sua mente, tornando-se algo rápido e imediato. Entrar em uma postura se torna uma Ação Livre e elas não são canceladas caso você seja empurrado. [Pré-Requisito:\n\nAssumir Postura]\n\n 72",
    "prereq": "Assumir Postura",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Aptidões de Combate",
    "kind": "Escolha",
    "text": "Você aprimora suas aptidões de energia necessárias para dominar o combate. Ao obter esta habilidade, você pode aumentar o seu nível de aptidão em Aura ou Controle e Leitura em 1. Você pode pegar esta habilidade duas vezes, uma para cada aptidão."
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Técnicas da Força",
    "kind": "Escolha",
    "text": "As técnicas da força permitem uma concentração ainda maior da sua potência e poder. Ao obter esta habilidade, você aprende duas artes de combate da força, listadas no final da especialização."
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Destruição Dupla",
    "kind": "Escolha",
    "text": "Duas armas em mãos, o dobro de destruição para seus inimigos. Enquanto estiver lutando com duas armas de grupos diferentes, seu ataque com a segunda arma causa 1 dado de dano adicional e, caso consiga um acerto crítico, você pode gastar 1PE para aplicar o Efeito Crítico do grupo das duas armas que você maneja ao mesmo tempo, caso sejam de grupos diferentes."
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Espírito Incansável",
    "kind": "Escolha",
    "text": "Nada pode abalar o seu espírito para lutar, o qual se torna ainda mais persistente.\n\nQuando utilizar Espírito de Luta, você pode optar por gastar 2PE ao invés de 1, aumentando o bônus em ataques para +5 e fazendo com que os pontos de vida temporários ganhos se tornam o seu bônus de ataque, ao invés do Nível do Personagem, já considerando o bônus da habilidade. [Pré-Requisito: Espírito de Luta]",
    "prereq": "Espírito de Luta",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Pistoleiro Avançado",
    "kind": "Escolha",
    "text": "Suas técnicas como pistoleiro se tornam ainda mais afiadas, conseguindo tomar riscos maiores e encontrar novas oportunidades com as armas. Você pode optar por aumentar o Emperrar em até 6, ao invés de 2, causando 1 dado de dano adicional para cada outros 2 que aumentar. Além disso, caso uma criatura dentro do primeiro alcance da sua arma de fogo tente se mover, você pode gastar sua Reação para realizar um ataque contra ela e, se acertar, ela recebe dano e ela perde 4,5 metros de movimento até o final do turno dela. [Pré-Requisito: Pistoleiro Iniciado]",
    "prereq": "Pistoleiro Iniciado",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Ricochete Constante",
    "kind": "Escolha",
    "text": "Imbuídas com energia, suas armas de arremesso colidem e explodem em energia, ricocheteando para um próximo alvo.\n\nQuando for ativar Arremessos Potentes, você pode pagar 5PE ao invés de 1 para que, até o final do turno, seus ataques com armas de arremesso possam acertar uma criatura à sua escolha dentro de 4,5 metros do alvo do ataque, caso sua jogada de ataque supere a Defesa da outra criatura."
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Sombra Viva",
    "kind": "Escolha",
    "text": "Você é como uma sombra, movendo-se rapidamente e de maneira imperceptível.\n\nUma vez por rodada, você pode utilizar Esgueirar e se mover todo o seu movimento, ao invés de apenas metade.\n\nAlém disso, uma vez por rodada, caso fosse ser encontrado por uma criatura o procurando, você pode utilizar sua Reação para realizar outro teste de Furtividade e, caso o resultado do novo teste supere a Percepção do inimigo o procurando, você continua escondido. [Pré-Requisito:\n\nTreinado em Furtividade]",
    "prereq": "Treinado em Furtividade",
    "req": {
      "skillTrained": "Furtividade"
    }
  },
  {
    "class": "Especialista em Combate",
    "level": 8,
    "name": "Surto de Ação",
    "kind": "Escolha",
    "text": "Em momentos cruciais, você consegue se forçar a agir mais, excedendo suas capacidades normais. Uma quantidade de vezes igual a metade do seu bônus de treinamento, por descanso longo, você pode, uma vez por rodada, gastar 5 pontos de energia amaldiçoada para realizar uma ação comum a mais no seu turno.\n\n 73"
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Análise Acelerada",
    "kind": "Escolha",
    "text": "Você já se acostumou a analisar o campo de batalha como um reflexo ou instinto.\n\nUtilizar a ação de Análise se torna uma ação bônus."
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Armas Perfeitas",
    "kind": "Escolha",
    "text": "Suas armas escolhidas se tornaram perfeitas, sabendo como contornar fraquezas e defesas. Seus ataques com uma arma do grupo escolhido em Armas Escolhidas ignoram 10 de RD ao tipo de dano dela. [Pré-Requisito: Armas Escolhidas]",
    "prereq": "Armas Escolhidas",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Assassinar",
    "kind": "Escolha",
    "text": "Durante o primeiro momento, você é capaz de extrair letalidade absoluta, golpeando um inimigo desprevenido com um bote poderoso. Durante a primeira rodada de um combate, ao atacar uma criatura desprevenida a partir da furtividade ou surpresa, seu primeiro ataque é um crítico garantido. [Pré-Requisito: Mestre em Furtividade]",
    "prereq": "Mestre em Furtividade",
    "req": {
      "skillMaster": "Furtividade"
    }
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Ataque Concentrado",
    "kind": "Escolha",
    "text": "Ao invés de desferir vários golpes, você concentra tudo em um único brandir. Ao utilizar a ação Atacar, você pode gastar PE equivalentes a metade do custo de Ataque Extra e/ou Surto de Ação, até um limite igual ao máximo de vezes que poderia usá-los dentro do seu turno. Para cada vez que o fizer, você adiciona metade dos dados de dano de um ataque (mínimo 1 dado) à rolagem de dano do seu próximo ataque. Ao utilizar esta habilidade, considera-se que ataque extra e/ou Surto de Ação foram utilizados, não podendo os realizar novamente no mesmo turno.\n\n[Pré-Requisito: Ataque Extra]",
    "prereq": "Ataque Extra",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Chuva de Arremessos",
    "kind": "Escolha",
    "text": "Você consegue extrair rapidez dos seus arremessos, realizando-os em um ritmo absurdo e influenciado pela energia. Como uma ação completa você pode escolher realizar uma quantidade de ataques com armas de arremesso igual ao seu bônus de treinamento. Para cada ataque após o primeiro, você gasta 1 ponto de energia amaldiçoada e você só pode continuar realizando ataques enquanto ainda tenha armas de arremesso em sua posse.\n\n[Pré-Requisito: Arremessos Potentes e Arremesso Rápido]",
    "prereq": "Arremessos Potentes e Arremesso Rápido",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 10,
    "name": "Potência Antes de Cair",
    "kind": "Escolha",
    "text": "Ao reconhecer que em breve você irá cair, você consegue impactar grandemente o combate antes dessa queda. Se você for cair para 0 de vida, você pode realizar um turno impedindo o turno atual. Ao ter 0 de vida neste turno, tomar dano resulta em falhas no teste de morte. Quando o turno acaba, você fica inconsciente e recebe um nível de exaustão. Pode ser usada uma vez por descanso longo.\n\n 74"
  },
  {
    "class": "Especialista em Combate",
    "level": 12,
    "name": "Técnicas de Saque",
    "kind": "Escolha",
    "text": "As técnicas de saque permitem que o próprio ato de sacar uma arma se torna destrutivo. Ao obter esta habilidade, você aprende duas artes de combate de saque, listadas no final da especialização."
  },
  {
    "class": "Especialista em Combate",
    "level": 12,
    "name": "Ciclagem Absoluta",
    "kind": "Escolha",
    "text": "O ciclo mantido entre seu arsenal é absoluto, conectando armas diferentes com facilidade. Você passa a poder, durante o seu turno, trocar a arma que esteja manejando toda vez que atacar.\n\nAlém disso, sempre que trocar para outra arma de outro grupo durante seu turno, você recebe um bônus de +2 na próxima jogada de ataque que realizar. [PréRequisito: Arsenal Cíclico]"
  },
  {
    "class": "Especialista em Combate",
    "level": 12,
    "name": "Manejo Único",
    "kind": "Escolha",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 12. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Combate",
    "level": 12,
    "name": "Mestre Pistoleiro",
    "kind": "Escolha",
    "text": "Em suas mãos, as armas podem extrair todo o seu potencial, agora sendo as ferramentas de um mestre. Fazer uma arma emperrada funcionar novamente se torna uma ação de movimento e sua margem de crítico com armas de fogo aumenta em 1. [Pré-Requisito: Pistoleiro Avançado]",
    "prereq": "Pistoleiro Avançado",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 12,
    "name": "Sincronia Perfeita",
    "kind": "Escolha",
    "text": "Você está em perfeita sincronia com suas armas, as quais se tornam uma parte do seu corpo, deixando-o ainda mais livre. O alcance adicional concedido por Extensão do Corpo aumenta para 3 metros e recebe vantagem em testes para evitar ser desarmado. [Pré-Requisito:\n\nExtensão do Corpo]\n\n Desenvolvendo ainda mais no seu próprio manejo de armas, você alcança um nível especial. Você escolhe mais uma propriedade para ser aplicada em toda arma que estiver manejando e, no começo de uma cena de combate, pode pagar 2 pontos de energia para receber uma propriedade única durante o resto da cena. Essa propriedade pode tanto ser criada pelo jogador, quanto ser uma das já existentes. [Pré-Requisito: Manejo Especial]",
    "prereq": "Extensão do Corpo",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 16,
    "name": "Crítico Aperfeiçoado",
    "kind": "Escolha",
    "text": "Seu senso de combate se torna ainda mais afiado e letal, encaixando críticos com maior facilidade. A margem do seu acerto crítico reduz em dois números, ao invés de um. [Pré-Requisito: Crítico Melhorado]\n\n 75",
    "prereq": "Crítico Melhorado",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 16,
    "name": "Mestre da Postura",
    "kind": "Escolha",
    "text": "Você se torna um mestre completo das posturas, dominando-as de uma maneira que poucos são capazes, até mesmo as mesclando. Quando entrar em postura, você pode assumir duas posturas ao mesmo tempo, recebendo os benefícios de ambas. [Pré-Requisito: Assumir Postura]",
    "prereq": "Assumir Postura",
    "req": {}
  },
  {
    "class": "Especialista em Combate",
    "level": 20,
    "name": "Autossuficiente",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Combate, desbloqueada no nível 20. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Técnica",
    "level": 1,
    "name": "Domínio dos Fundamentos",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Técnica, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Técnica",
    "level": 1,
    "name": "Conjuração Aprimorada",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Técnica, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Abastecido pelo Sangue",
    "kind": "Escolha",
    "text": "O sangue de seus inimigos também é capaz de o abastecer, trazendo mais energia amaldiçoada. Quando um inimigo morre dentro de 12 metros de você, você pode usar sua reação para recuperar uma quantidade de energia amaldiçoada igual ao seu modificador de Inteligência ou Sabedoria, ao absorver os vestígios de sua energia. Você pode realizar essa ação uma vez por descanso longo. No nível 8 aumenta para duas vezes e no nível 16 para três vezes."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Conhecimento Aplicado",
    "kind": "Escolha",
    "text": "Sendo um especialista em técnicas, você as conhece muito bem e consegue aplicar esse conhecimento de maneira defensiva contra outros usuários de técnica. Sempre que for realizar um teste de resistência contra o efeito de um Feitiço, você pode gastar pontos de energia amaldiçoada igual a metade do seu bônus de treinamento para receber um bônus: para cada ponto gasto, você adiciona +2 no teste de resistência."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Conjuração Defensiva",
    "kind": "Escolha",
    "text": "Após uma conjuração, você mantém parte da energia amaldiçoada como um revestimento em seu corpo. Ao usar um Feitiço, você pode gastar 2 PE para, até o começo do seu próximo turno, receber um bônus em Defesa e um valor em RD igual ao nível do Feitiço usado."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Economia de Energia",
    "kind": "Escolha",
    "text": "Enquanto descansando você armazena parte de sua energia em uma economia reserva. Após um descanso curto, sua reserva é igual a 1d4, após um descanso longo esse valor é 1d6, aumentando em um dado a cada 5 níveis. Como uma ação comum, você pode adicionar a energia da reserva no seu valor atual. A economia não acumula."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Explosão Encadeada",
    "kind": "Escolha",
    "text": "Um bom desempenho em uma conjuração o permite aumentar o poder destrutivo, encadeando a força. Ao rolar o dano máximo em um dado de dano de um Feitiço de dano, você rola mais um dado de dano de mesmo valor, adicionando o resultado ao total de dano. Tal habilidade funciona apenas uma vez por dado do Feitiço: caso role-se um dado adicional por causa de Explosão Encadeada, e tal seja dano máximo, não se ativa novamente."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Finta Amaldiçoada",
    "kind": "Escolha",
    "text": "Você é capaz de enganar com falsas conjurações de técnica. Você pode utilizar Fintar com seu atributo-chave ao invés de Presença e os efeitos de Desprevenido por fintar são aplicados na sua próxima conjuração de Feitiço."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Mente Plácida",
    "kind": "Escolha",
    "text": "Sua mente é sempre plácida, dificultando que sua concentração seja quebrada.\n\nQuando realizar um teste para manter concentração, você pode gastar 1 ponto de energia para receber um bônus de +3 ou 2 pontos de energia para receber +5, e a Classe de Dificuldade sempre será reduzida em um valor igual ao seu modificador de Inteligência ou sabedoria."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Nova Habilidade",
    "kind": "Escolha",
    "text": "Uma nova ideia surge em sua mente, a qual você transforma em uma habilidade inédita. Ao obter esta habilidade, você pode imediatamente criar dois novos Feitiços ou três variações de liberação.\n\nVocê pode pegar essa habilidade repetidas vezes.\n\n 82"
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Perturbação Amaldiçoada",
    "kind": "Escolha",
    "text": "Energia amaldiçoada é energia negativa, e você consegue extrair essa negatividade e a impor em um inimigo, prejudicando o seu desempenho. Como uma ação comum, você pode gastar 2 pontos de energia amaldiçoada para perturbar uma criatura dentro de 9 metros, a qual deve realizar um TR de Vontade. Caso a criatura falhe, ela receberá um prejuízo em rolagens igual ao seu modificador de Inteligência ou Sabedoria; caso a criatura suceda, esse prejuízo é apenas metade do bônus escolhido. A perturbação dura por uma quantidade de rolagens igual ao seu bônus de treinamento."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Reação Rápida",
    "kind": "Escolha",
    "text": "Você sempre reage rápido quando uma situação de combate começa. Você passa a adicionar seu modificador de Inteligência ou Sabedoria no seu bônus de iniciativa."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Reforço Amaldiçoado",
    "kind": "Escolha",
    "text": "Você reforça as suas habilidades, tornando mais difícil resistir a elas. Sua CD de Especialização e Amaldiçoada aumenta em +2. No nível 10, esse aumento se torna +3 e no nível 20, se torna +4."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Sobrecarregar",
    "kind": "Escolha",
    "text": "Focando em sobrecarregar as suas habilidades, você pode consumir energia para a deixar quase impossível de resistir.\n\nQuando usar um Feitiço que força um teste de resistência você pode gastar pontos de energia amaldiçoada igual ao seu bônus de treinamento para aumentar a dificuldade do teste. Para cada ponto gasto, a dificuldade aumenta em 1.\n\n 83"
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Técnicas de Combate",
    "kind": "Escolha",
    "text": "Você decide se versar em técnicas essenciais de combate, em busca de conseguir se defender em casos extremos.\n\nVocê pode escolher duas armas quaisquer para se tornar treinado, caso não tenha, e para poder utilizar Inteligência ou Sabedoria nas jogadas de ataque e dano enquanto as manejando."
  },
  {
    "class": "Especialista em Técnica",
    "level": 2,
    "name": "Zelo Recompensador",
    "kind": "Escolha",
    "text": "O seu zelo diante si mesmo é recompensador: sempre que você suceder em um teste de resistência para evitar o efeito de um Feitiço, você recebe 1 ponto de energia amaldiçoada temporário. A partir do nível 14 você passa a receber 2 pontos temporários, ao invés de 1."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Adiantar Evolução",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Técnica, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Até a Última Gota",
    "kind": "Escolha",
    "text": "Você vai sempre utilizar até a última gota de energia amaldiçoada que houver em seu corpo. Uma vez por descanso longo, caso esteja com menos da metade do seu máximo de energia amaldiçoada, você pode usar uma ação comum para recuperar 1d4 + seu modificador de Int/ Sab em pontos de energia, aumentando em um dado a cada 5 níveis. Entretanto, é um processo exaustivo, e você recebe um ponto de exaustão após usar essa habilidade."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Ciclagem Maldita",
    "kind": "Escolha",
    "text": "Alternar entre suas habilidades permite que você encaixe cada uma de maneira diferente, beneficiando a ciclagem. Quando utilizar um Feitiço de dano diferente do último Feitiço que você utilizou anteriormente, ele causa uma quantidade de dados de dano adicionais igual a metade do seu bônus de treinamento."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Determinação Energizada",
    "kind": "Escolha",
    "text": "A partir da energia, você consegue criar uma determinação superior para a sua mente, acelerando-a ou reforçando-a.\n\nQuando fizer um teste de resistência de Astúcia ou de Vontade, você pode pagar 1 ponto de energia amaldiçoada para receber vantagem no teste, aumentando em +1PE para cada teste após o primeiro, na mesma rodada."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Energia Focalizada",
    "kind": "Escolha",
    "text": "Você foca a sua energia em algum aspecto do seu corpo, assim potencializando alguma resistência sua. Você escolhe uma perícia de Teste de Resistência (Fortitude, Reflexos, Astúcia e Vontade) para ter metade do seu modificador de Sabedoria ou Inteligência somado a rolagens dela."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Energia Inacabável",
    "kind": "Escolha",
    "text": "Você aumenta ainda mais a quantidade de energia amaldiçoada que você possui. Seu máximo de energia amaldiçoada aumenta em um valor igual a metade do seu nível de Especialista em Técnicas."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Epifania Amaldiçoada",
    "kind": "Escolha",
    "text": "Ao desvendar mais da energia amaldiçoada, você obtém uma nova capacidade envolvendo-a. Ao obter essa habilidade, você aprende uma Aptidão Amaldiçoada. No nível 12 você recebe outra aptidão amaldiçoada."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Explosão Defensiva",
    "kind": "Escolha",
    "text": "Reagindo a um ataque com uma grande explosão de energia amaldiçoada, você consegue reduzir os danos dele. Como uma Reação, quando for atingido por um ataque corpo a corpo, você pode gastar até uma quantidade de PE igual ao seu bônus de treinamento: para cada PE gasto, você reduz o dano em 5 e empurra o atacante em 3 metros para longe de si. [Pré-Requisito:\n\nAptidão Cobrir-se]",
    "prereq": "Aptidão Cobrir-se",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Feitiço Favorito",
    "kind": "Escolha",
    "text": "Um dos seus Feitiços é o seu favorito, sendo levado para um nível superior de maneira natural. Ao obter esta habilidade, escolha um Feitiço: ele recebe uma Melhoria de Ritual permanente, a qual não pode ser alterada após escolhida. A Melhoria concedida por esta habilidade contabiliza como um efeito já aplicado ao realizar um ritual."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Feitiços Refinados",
    "kind": "Escolha",
    "text": "Seus Feitiços como um todo são refinados pelo seu controle de energia, sendo mais difícil resistir a eles. Você passa a somar metade do seu bônus de treinamento no cálculo de CD dos seus Feitiços e Aptidões Amaldiçoadas."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Movimentos Imprevisíveis",
    "kind": "Escolha",
    "text": "Você aprende a se mover de maneira imprevisível, dificultando tentativas de ataque contra você. Você pode adicionar seu modificador de Inteligência ou de Sabedoria na sua Defesa, limitado pelo seu nível."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Naturalidade com Rituais",
    "kind": "Escolha",
    "text": "Realizar rituais se torna algo mais natural para sua mente, permitindo-o colocar o raciocínio acima da agilidade. Você pode utilizar Inteligência no lugar de Destreza em testes de Prestidigitação para realizar rituais. [Pré-Requisito: Treinado em Prestidigitação]\n\n 84",
    "prereq": "Treinado em Prestidigitação",
    "req": {
      "skillTrained": "Prestidigitação"
    }
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Preparação de Técnicas",
    "kind": "Escolha",
    "text": "Você consegue preparar habilidades para assim economizar energia ao usá-las. Você pode preparar dois Feitiços por descanso longo, para conjurar com custo reduzido pela metade, na primeira vez que as usar.\n\nO nível do Feitiço deve ser um; no nível 5, você pode preparar Feitiços de nível dois;\n\nno nível 12 você pode preparar Feitiços de nível três; no nível 16 você pode preparar Feitiços de nível quatro e no nível 20 você pode preparar Feitiços de nível cinco."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Olhar Preciso",
    "kind": "Escolha",
    "text": "Sua visão é precisa e, consequentemente, sua mira também. Você recebe um bônus de +2 em rolagens de ataque para Feitiços e aptidões amaldiçoadas. A cada 4 níveis, esse bônus aumenta em +1."
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Sacrifício pela Energia",
    "kind": "Escolha",
    "text": "Você é capaz de até mesmo sacrificar a sua própria vida para conseguir mais energia amaldiçoada, em casos de urgência. Você pode se infligir dano para recuperar energia amaldiçoada. Para cada 6 de dano que você causar a si mesmo, você recupera 2 pontos de energia amaldiçoada. Os pontos de vida perdidos por meio desta habilidade não podem ser restaurados até o final do próximo descanso, e qualquer cura que fosse restaurar vida além desse novo limite, é reduzida pela metade e transformada em pontos de vida temporários. Caso cause dano a si mesmo igual ou superior a metade da sua vida máxima, você recebe 1 ponto de exaustão.\n\n 85"
  },
  {
    "class": "Especialista em Técnica",
    "level": 4,
    "name": "Versatilidade em Fundamentos",
    "kind": "Escolha",
    "text": "Além de dominar, você também é versátil no que se diz os fundamentos das técnicas.\n\nDurante um descanso curto, você pode alterar quais Mudanças de Fundamentos você possui, até um limite de trocas igual a metade do seu bônus de treinamento. Em um descanso longo, este limite de trocas se torna seu bônus de treinamento."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Bastião Interior",
    "kind": "Escolha",
    "text": "Com uma mente convicta e resistente, você transforma seu interior em um bastião.\n\nVocê recebe vantagem para resistir às condições amedrontado, desorientado e enfeitiçado. [Pré-Requisito: Treinado em Vontade]",
    "prereq": "Treinado em Vontade",
    "req": {
      "skillTrained": "Vontade"
    }
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Combate Amaldiçoado",
    "kind": "Escolha",
    "text": "Ampliando no uso de armas corpo-acorpo, você assume um estilo de combate amaldiçoado que a incorpora no uso da sua energia. Todo ataque feito com uma arma com a qual você se tornou treinado graças a Técnicas de Combate causa dano adicional igual ao seu bônus de treinamento. Você pode também pode gastar 2 pontos de energia amaldiçoada para que a arma em sua posse cause dano como se fosse um nível de dano acima durante todo o combate.\n\n[Pré-Requisito: Técnicas de Combate]",
    "prereq": "Técnicas de Combate",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Correção",
    "kind": "Escolha",
    "text": "Você consegue se corrigir caso esteja para perder o foco. Uma vez por rodada, quando você for perder a concentração em um Feitiço, você pode gastar pontos de energia amaldiçoada igual ao nível do Feitiço para evitar perder a concentração nele."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Dominância em Feitiço",
    "kind": "Escolha",
    "text": "Você usa tanto um Feitiço da sua técnica que você passa a dominar ele completamente e otimizar seu uso ao máximo. O custo de um Feitiço a sua escolha diminui em um valor igual a metade do nível dele, arredondado para cima."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Elevar Aptidão",
    "kind": "Escolha",
    "text": "Como um mestre em técnicas jujutsu no geral, você eleva seu nível em uma das aptidões. Ao obter esta habilidade, você aumenta um dos seus Níveis de Aptidão em 1. Você pode pegar esta habilidade uma quantidade de vezes igual ao seu bônus de treinamento."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Especialização",
    "kind": "Escolha",
    "text": "Você aprimora seus conhecimentos, tornando-se exímio em certas perícias. Ao obter esta habilidade, você se torna mestre em 3 perícias nas quais você seja treinado, a sua escolha."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Incapaz de Falhar",
    "kind": "Escolha",
    "text": "Sua maestria sobre as aptidões torna mais difícil falhar. Ao realizar uma rolagem de aptidão amaldiçoada, exceto com Aptidões de Domínio, você pode gastar 2 pontos de energia amaldiçoada para adicionar um valor igual ao seu modificador de Inteligência ou Sabedoria no resultado.\n\nVocê só pode utilizar esta habilidade uma vez por Aptidão usada na rodada."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Mente Repartida",
    "kind": "Escolha",
    "text": "Você é capaz de repartir sua mente em duas seções. Você pode se manter concentrando em duas fontes diferentes simultaneamente."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Nível Perfeito",
    "kind": "Escolha",
    "text": "Você escolhe um nicho de feitiços para ser aprimorada. Todos os seus Feitiços de um nível a sua escolha têm a CD de resistência aumentada em 2. Nos níveis 12 e 18 você pode escolher outro nível de Feitiço para ter a CD aumentada em 2."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Passo Rápido",
    "kind": "Escolha",
    "text": "Você se move agilmente, preparado para se afastar caso necessário. Quando um inimigo se aproxima de você e você entra no alcance corpo a corpo dele, você pode, como uma reação, afastar-se em uma distância igual a metade do seu movimento. Tal movimento não permite um ataque de oportunidade."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Potência Concentrada",
    "kind": "Escolha",
    "text": "Quando for disparar uma manifestação de sua técnica, você é capaz de se preparar e concentrar para aumentar o poder.\n\nUma vez por rodada, você pode gastar uma Ação de Movimento para fazer com que seu próximo Feitiço de dano com alvo único cause dano adicional igual a 5 multiplicado pelo nível do Feitiço."
  },
  {
    "class": "Especialista em Técnica",
    "level": 6,
    "name": "Ritualista",
    "kind": "Escolha",
    "text": "Você é familiar com a aplicação de rituais em suas conjurações, conseguindo ampliar a capacidade deles. Você recebe um bônus de +2 em testes para realizar Conjuração em Ritual e, uma quantidade de vezes igual a metade do seu bônus de treinamento, por Descanso Longo, você pode optar por colocar 1 melhoria adicional nela.\n\n 86"
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Expansão dos Fundamentos",
    "kind": "Escolha",
    "text": "Você expande seu domínio sobre os fundamentos, versando-se em novas maneiras de modificar as técnicas. Ao obter esta habilidade, você aprende mais uma Mudança de Fundamento. No nível 12, você aprende outro adicional."
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Físico Amaldiçoado Defensivo",
    "kind": "Escolha",
    "text": "Reconhecendo o potencial da energia amaldiçoada para o proteger, você foca nessas aplicações, tornando-se mais capaz de resistir. A quantidade de PEs que você pode gastar com a aptidão Cobrir-se aumenta em 2. Caso possua Cobertura Avançada, aumenta em +1.\n\n[Pré-Requisito: Aptidão Cobrir-se]",
    "prereq": "Aptidão Cobrir-se",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Imbuir com Técnica",
    "kind": "Escolha",
    "text": "Você se torna capaz de imbuir armas com a sua própria técnica, potencializandoas grandemente. Quando for utilizar um Feitiço de dano, que não seja de um tipo especial ou em área, você pode, como uma Ação Bônus, gastar 2 PE adicionais para a imbuir em uma arma que esteja manejando, desde que seja treinado com a arma e o Feitiço seja uma Ação Comum ou inferior. Se acertar o ataque, além de causar dano, você causa o efeito do Feitiço, como após ataque. Caso o Feitiço seja de TR, não será necessário um teste para efeito, aplicando-o diretamente, com exceção de Condições, que ainda irão exigir um TR.\n\n[Pré-Requisito: Combate Amaldiçoado]",
    "prereq": "Combate Amaldiçoado",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Liberações Expandidas",
    "kind": "Escolha",
    "text": "Você encontra maneiras de ter um repertório de liberações máximas maior.\n\nAo obter esta habilidade, você recebe uma Liberação Máxima adicional. Nos níveis 12 e 16 você recebe mais uma liberação máxima.\n\n 87"
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Mira Aperfeiçoada",
    "kind": "Escolha",
    "text": "Sua mira para feitiços é mais afiada, permitindo-o acertar com maior precisão diante preparo. Você pode utilizar Mirar para jogadas de ataque amaldiçoado e recebe a Mudança de Fundamento Técnica Precisa. Caso já possua Técnica Precisa, o bônus conferido por ela aumenta em +1.\n\n[Pré-Requisito: Olhar Preciso]",
    "prereq": "Olhar Preciso",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Primeiro Disparo",
    "kind": "Escolha",
    "text": "Quando um combate se inicia, você é o primeiro a disparar. Durante a rolagem da iniciativa, você pode usar uma habilidade cujo custo de tempo seja Ação Bônus ou Ação Livre. [Pré-Requisito: Treinado em Reflexos]",
    "prereq": "Treinado em Reflexos",
    "req": {
      "skillTrained": "Reflexos"
    }
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Revestimento Constante",
    "kind": "Escolha",
    "text": "Seu corpo está constantemente revestido com a sua energia amaldiçoada. Você recebe redução de dano contra todos os tipos, exceto na alma, igual ao seu bônus de treinamento. [Pré-Requisito: Aptidão Cobrir-se]",
    "prereq": "Aptidão Cobrir-se",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 8,
    "name": "Sustentação Avançada",
    "kind": "Escolha",
    "text": "Seu corpo agora é capaz de dividir a liberação de energia entre dois feitiços diferentes. Você pode manter um feitiço sustentado adicional e, no começo do combate, pode ativar um feitiço sustentado à sua escolha como Ação Livre, desde que ele possua um custo de Ação Bônus ou inferior."
  },
  {
    "class": "Especialista em Técnica",
    "level": 10,
    "name": "Foco Amaldiçoado",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Técnica, desbloqueada no nível 10. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Especialista em Técnica",
    "level": 10,
    "name": "Destruição Ampla",
    "kind": "Escolha",
    "text": "Quanto mais você conseguir abranger em sua conjuração, mais você é capaz de destruir. Quando utilizar um Feitiço em área, ela causa 5 de dano adicional para cada criatura além da primeira que estiver sendo afetada por ela."
  },
  {
    "class": "Especialista em Técnica",
    "level": 10,
    "name": "Destruição Focada",
    "kind": "Escolha",
    "text": "Ao invés de espalhar a destruição, você a foca em um único ponto ou criatura.\n\nQuando utilizar um Feitiço de dano de alvo único, ela ignora RD igual ao seu Modificador de Inteligência ou Sabedoria e tem seu dano aumentado em uma quantidade de dados igual a metade do seu bônus de treinamento."
  },
  {
    "class": "Especialista em Técnica",
    "level": 10,
    "name": "Economia de Energia Avançada",
    "kind": "Escolha",
    "text": "Sua economia reserva se torna ainda maior, expandindo seu estoque. Os dados da energia colocada na economia aumentam para d6 em um descanso curto e d8 em um descanso longo. Colocar energia da economia no estoque atual agora é uma ação bônus. [Pré-Requisito:\n\nEconomia de Energia]",
    "prereq": "Economia de Energia",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 10,
    "name": "Sentidos Aguçados",
    "kind": "Escolha",
    "text": "O domínio sobre a energia aguça seus sentidos ao limite, transformando-o em alguém que não deixa nenhum detalhe escapar, nem mesmo nos mínimos movimentos e mudanças. Sua atenção aumenta em um valor igual a metade do seu bônus de Inteligência ou Sabedoria, e você adiciona o mesmo bônus a rolagens de Percepção. Além disso, você pode gastar 2 pontos de energia para, ao estar no ar, se manter estável nele, de pé, usando dos seus sentidos para perceber o ar como uma plataforma. [Pré-Requisito: Mestre em Percepção]",
    "prereq": "Mestre em Percepção",
    "req": {
      "skillMaster": "Percepção"
    }
  },
  {
    "class": "Especialista em Técnica",
    "level": 12,
    "name": "Esgrimista Jujutsu",
    "kind": "Escolha",
    "text": "Mesclando técnicas de combate e feitiçaria ao máximo, você se torna digno de ser visto como um esgrimista jujutsu. Quando utilizar Combate Amaldiçoado, você pode também utilizar um Feitiço Auxiliar tendo você mesmo como alvo, desde que seu custo padrão seja uma Ação Bônus. [PréRequisito: Combate Amaldiçoado]"
  },
  {
    "class": "Especialista em Técnica",
    "level": 12,
    "name": "Expansão Maestral",
    "kind": "Escolha",
    "text": "Você pode utilizar expansões de domínio possuindo apenas uma mão livre e ataques a distância não causam ataques de oportunidade contra você enquanto expandindo. [Pré-Requisito: Aptidão Expansão de Domínio Completa]",
    "prereq": "Aptidão Expansão de Domínio Completa",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 12,
    "name": "Explosão Máxima",
    "kind": "Escolha",
    "text": "O potencial de aumento para o poder destrutivo de suas técnicas é ainda maior, levando-o ao máximo. Para cada resultado máximo que conseguir, além de rolar um dado adicional, você soma +4 ao total de dano.\n\n[Pré-Requisito: Explosão Encadeada]",
    "prereq": "Explosão Encadeada",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 12,
    "name": "Mestre das Aptidões",
    "kind": "Escolha",
    "text": "Você é um mestre no uso das aptidões amaldiçoadas, conseguindo reservar um pouco do seu potencial para elas.\n\nNo começo de toda rodada, você recebe PE temporários igual a metade do seu Bônus de Treinamento, os quais podem ser utilizados exclusivamente no uso de Aptidões Amaldiçoadas. Estes pontos não podem acumular, mas são contabilizados separadamente de outros PEs temporários."
  },
  {
    "class": "Especialista em Técnica",
    "level": 12,
    "name": "Versatilidade Ampliada",
    "kind": "Escolha",
    "text": "Ser versátil no uso dos próprios feitiços é uma grande vantagem, e você decide investir nela. Todos seus Feitiços recebem 1 variação de liberação e você pode escolher um deles para ter uma variação de cada nível que você possua acesso.\n\n 88"
  },
  {
    "class": "Especialista em Técnica",
    "level": 16,
    "name": "Manipulação Perfeita",
    "kind": "Escolha",
    "text": "Seu conhecimento sobre a manipulação de energia é melhorado, permitindo que você escolha uma quantidade de Feitiços igual ao seu bônus de treinamento para terem seu custo reduzido em um valor igual a metade dele. [Pré-Requisito: Dominância em Habilidade]\n\n 89",
    "prereq": "Dominância em Habilidade",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 16,
    "name": "Sustentação Mestre",
    "kind": "Escolha",
    "text": "Com o passar do tempo, você descobriu novas formas de como dispersar energia pelo seu corpo, conseguindo sustentar mais feitiços e com maior eficiência. Você pode manter três feitiços sustentados ao invés de dois. Além disso, seu custo para sustentar feitiços é diminuído em 1, com um mínimo de 1. [Pré-Requisito:\n\nSustentação Avançada]",
    "prereq": "Sustentação Avançada",
    "req": {}
  },
  {
    "class": "Especialista em Técnica",
    "level": 20,
    "name": "O Honrado",
    "kind": "Automática",
    "text": "Entrada oficial de Especialista em Técnica, desbloqueada no nível 20. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Controlador",
    "level": 1,
    "name": "Treinamento em Controle",
    "kind": "Automática",
    "text": "Entrada oficial de Controlador, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Aceleração",
    "kind": "Escolha",
    "text": "Estimulando-as com seus comandos, você é capaz de forçar uma aceleração maior em invocações. Uma vez por rodada, você pode fazer com que uma Invocação se mova duas vezes ao invés de uma."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Camuflagem Aprimorada",
    "kind": "Escolha",
    "text": "Você consegue se mesclar no meio das suas invocações, camuflando-se. Você pode, como uma Ação Comum, camuflar-se em meio as suas invocações adjacentes a você:\n\npara cada Invocação, todo ataque feito contra você tem 10% de chance de errar (1 em 1d10). Essa camuflagem dura até que não haja mais invocações adjacentes, e a chance de erro é diminuída conforme as invocações deixam de estar adjacentes."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Chamado Destruidor",
    "kind": "Escolha",
    "text": "Um acerto preciso de uma invocação incentiva as outras a acompanhar, como um chamado destrutivo. Quando uma das suas invocações conseguir um acerto crítico em uma ação de ataque você pode, como uma Ação Livre, pagar 2 PE para fazer com que uma das suas invocações adjacentes ataque o mesmo alvo que recebeu o crítico."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Companheiro Amaldiçoado",
    "kind": "Escolha",
    "text": "Uma das suas invocações se torna seu companheiro, tornando-se mais capaz de ajudar. Escolha uma invocação sua: ela se torna o seu companheiro amaldiçoado.\n\nUma vez por rodada, a invocação escolhida pode utilizar Apoiar como Ação Livre. Durante um descanso ou interlúdio, você pode alternar a invocação que é seu companheiro amaldiçoado, caso a invocação escolhida anteriormente tenha sido exorcizada.\n\n 93"
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Dor Partilhada",
    "kind": "Escolha",
    "text": "Você e uma invocação conseguem criar um laço para partilhar dor, e isso pode acabar amenizando-a. Quando utilizar a ação Invocar, você pode escolher formar um laço com uma delas: caso você e a invocação escolhida com o laço fossem receber quantidades diferentes de dano de uma mesma habilidade em área, ambos recebem o menor entre os dois valores de dano."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Frenesi da Invocação",
    "kind": "Escolha",
    "text": "Você consegue fazer com que suas invocações se rendam a um frenesi brutal, mas arriscado. Uma vez por rodada, quando uma invocação realizar uma ação de ataque, você pode fazer com que ela realize essa ação duas vezes, ao invés de uma; com exceção de Ações com Custo.\n\nMas, por uma rodada, ataques contra ela terão vantagem e ela terá a sua Defesa reduzida em 5 e -5 em testes de resistência."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Guarda Viva",
    "kind": "Escolha",
    "text": "Suas invocações atuam como uma guarda viva para você, auxiliando em sua defesa.\n\nPara cada Invocação que estiver dentro de 3 metros de você, sua Defesa aumenta em 1."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Invocações Móveis",
    "kind": "Escolha",
    "text": "Você prepara suas invocações para se moverem com mais velocidade. O Deslocamento de todas suas Invocações aumenta em 1,5 metros. Nos níveis 6, 12 e 18 elas recebem +1,5 metros."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Invocações Resistentes",
    "kind": "Escolha",
    "text": "Você torna suas invocações mais resistentes, amplificando a vitalidade delas. Os Pontos de Vida Máximos de todas suas Invocações aumentam em um valor igual ao seu Bônus de Treinamento multiplicado por cinco."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Invocações Treinadas",
    "kind": "Escolha",
    "text": "Você faz com que suas invocações sejam mais aptas em habilidades. Todas suas Invocações se tornam treinadas em uma quantidade de Perícias adicional igual a metade do seu bônus de treinamento."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Melhoria de Controlador",
    "kind": "Escolha",
    "text": "Estudando novas táticas e especializandose em aspectos específicos, você aplica certas melhorias em todas suas invocações.\n\nAo obter esta habilidade, escolha uma das quatro melhorias especificadas no final da especialização. Você pode pegar essa habilidade quatro vezes, uma para cada melhoria."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Otimização de Energia",
    "kind": "Escolha",
    "text": "Você consegue otimizar o gasto de energia das habilidades mais exaustivas das suas invocações. Ao adquirir essa habilidade e em um descanso curto ou longo, você pode escolher uma habilidade com custo de cada invocação para ter esse custo reduzido em 1PE."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Proteger Invocação",
    "kind": "Escolha",
    "text": "Você sabe do valor das suas invocações, podendo até mesmo utilizar delas para sacrifícios em prol de si mesmas. Caso uma invocação sobre seu controle, dentro de um alcance igual a metade do Deslocamento de outra Invocação, vá receber dano suficiente para ser dissipada ou exorcizada, você pode gastar sua reação para fazer com que ela se mova até ficar adjacente a ela e receber esse dano por ela. Além disso, caso você esteja no alcance de ataque de uma invocação que foi atacada, você pode gastar sua reação também para reduzir o dano que ela receberá em um valor igual a Xd6 + seu modificador de Presença ou Sabedoria. X é igual ao seu bônus de treinamento."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Rede de Detecção",
    "kind": "Escolha",
    "text": "Juntamente das suas invocações, você se atenta e é auxiliado por elas para não perder nenhum detalhe. Para cada invocação dentro de 3 metros de você, você recebe +2 em rolagens de Percepção e seu valor de atenção aumenta em 2.\n\n 94"
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Técnicas de Combate",
    "kind": "Escolha",
    "text": "Você decide se versar em técnicas essenciais de combate, em busca de conseguir se defender em casos extremos.\n\nVocê pode escolher duas armas quaisquer para se tornar treinado, caso não tenha, e para poder utilizar Inteligência ou Sabedoria nas jogadas de ataque e dano enquanto as manejando."
  },
  {
    "class": "Controlador",
    "level": 2,
    "name": "Visionário",
    "kind": "Escolha",
    "text": "Você expande sua visão para a criação de invocações, conseguindo as conferir mais aspectos únicos. Sempre que for criar uma invocação, a quantidade de ações e/ ou características que ela pode receber aumenta em um valor igual a metade do seu bônus de treinamento. Colocar ações e/ou características adicionais através desta habilidade ainda aumenta o custo da invocação normalmente."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Ação Corretiva",
    "kind": "Escolha",
    "text": "Sempre atento ao campo de batalha, você consegue corrigir falhas de suas invocações. Quando uma invocação dentro de 9 metros de você realizar uma rolagem de perícia e obter um valor menor do que 10 no dado, você pode gastar 2 pontos de energia amaldiçoada para transformar o resultado em um 10."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Acompanhamento Amaldiçoado",
    "kind": "Escolha",
    "text": "Uma das suas invocações pode ser colocada para o acompanhar de perto, reagindo aos seus golpes. Quando utilizar Invocar, você pode escolher uma das invocações para o acompanhar. Quando realizar um ataque contra uma criatura que esteja dentro do seu alcance e do alcance da Invocação, ela pode gastar uma Reação para utilizar uma ação de ataque ou auxílio, tendo como alvo você ou a criatura atacada."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Ataque em Conjunto",
    "kind": "Escolha",
    "text": "Você consegue unificar seus comandos para fazer com que suas invocações ataquem em conjunto. Uma vez por rodada, como uma Ação Comum, você pode fazer com que todas as suas invocações ativas utilizem uma ação de ataque contra um mesmo alvo, pagando 2PE para cada invocação além da primeira. Para cada invocação participando do ataque em conjunto, todas recebem um bônus de +1 na jogada de ataque. Você pode, também, optar por participar do Ataque em Conjunto caso o alvo esteja no seu alcance. Você pode usar essa habilidade uma quantidade de vezes igual ao seu modificador de Sabedoria ou Presença por descanso longo.\n\n 95"
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Autonomia",
    "kind": "Escolha",
    "text": "Assumindo uma abordagem diferente, você traz uma invocação a campo com autonomia, deixando-a agir de maneira independente enquanto foca em seu objetivo. Ao ativar uma invocação, você pode pagar uma quantidade adicional de PE igual a 2 para cada grau dela (2 para quarto grau, 10 para grau especial). Caso o faça, aquela invocação recebe um turno próprio dentro de combate, no qual ela pode realizar uma ação por turno, além de se mover, sem a necessidade de comandos.\n\nA invocação irá seguir o que você desejar que ela faça, além de ainda contar para o seu número de invocações ativas e poder realizar outros comandos feitos durante o seu turno."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Companheiro Avançado",
    "kind": "Escolha",
    "text": "O seu companheiro amaldiçoado se torna ainda mais avançado, conseguindo se versar em mais uma função, que é a de um aliado. Ao obter essa habilidade, o seu companheiro amaldiçoado se torna também um aliado de um tipo a sua escolha. Ele começa como um aliado iniciante. Os efeitos do companheiro como Aliado são aplicados a você ou ao aliado mais próximo da invocação, dentro de um alcance igual a metade do movimento dela.\n\nNo nível 6 se torna um veterano e no nível 12 se torna um mestre. Pré-Requisito:\n\nCompanheiro Amaldiçoado."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Crítico Brutal",
    "kind": "Escolha",
    "text": "A brutalidade de um golpe bem encaixado por uma invocação é ampliada. Os acertos críticos da sua invocação causam 1 dado de dano adicional e, quando causar um crítico em uma criatura, você pode escolher diminuir o Deslocamento dela em um valor igual a 1,5 metros multiplicado pelo seu Bônus de Treinamento ou diminuir a Defesa dela em um valor igual a metade do seu Bônus de Treinamento. Qualquer um dos prejuízos dura até o começo do seu próximo turno."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Domador de Maldições",
    "kind": "Escolha",
    "text": "Você se prepara para ser capaz de domar maldições com efetividade superior.\n\nSempre que estiver no processo de domar uma maldição, você possui vantagem em todas as rolagens envolvidas no processo, além de poder anular sua primeira falha, tendo outra chance."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Invocação às Cegas",
    "kind": "Escolha",
    "text": "Entrada oficial de Controlador, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Invocação Parcial",
    "kind": "Escolha",
    "text": "Nem sempre é necessário trazer uma invocação por completo para se beneficiar de suas capacidades. Você pode utilizar de suas ações para realizar a ação de uma invocação que não esteja ativa; como uma ação comum, você utiliza uma ação complexa ou, como uma ação bônus, uma ação simples, de uma invocação a sua escolha."
  },
  {
    "class": "Controlador",
    "level": 4,
    "name": "Potencial Superior",
    "kind": "Escolha",
    "text": "Suas invocações possuem um potencial superior para desenvolver seus atributos.\n\nTodas suas invocações recebem 2 pontos de atributo adicionais por grau (2 para quatro grau, 10 para grau especial)."
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Combate em Alcateia",
    "kind": "Escolha",
    "text": "Você se torna parte da própria alcateia das suas invocações, golpeando com mais poder enquanto cercado delas. Enquanto manejando uma arma escolhida em Técnicas de Combate, você tem seu dano com ela aumentado em 1 nível para cada Invocação que esteja com a criatura no alcance de ataque dela. [Pré-Requisito:\n\nTécnicas de Combate e Apogeu - Controle Sintonizado.]",
    "prereq": "Técnicas de Combate e Apogeu - Controle Sintonizado.",
    "req": {}
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Concentrar Poder",
    "kind": "Escolha",
    "text": "Priorizando qualidade acima de quantidade, você consegue concentrar o poder em uma única invocação. Enquanto estiver com apenas uma invocação em campo, você recebe benefícios de acordo com o seu nível de personagem, indicando o quanto a quantidade reduzida a aprimora. Você pode encontrar os benefícios e detalhes no final da especialização. [Pré-Requisito: Apogeu Controle Concentrado]",
    "prereq": "Apogeu Controle Concentrado",
    "req": {}
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Hoste Amaldiçoada",
    "kind": "Escolha",
    "text": "Você se foca em formar um exército de baixo nível. Ao utilizar Criar Horda, durante o processo de criação você pode escolher por reduzir o limite de grau do Líder em 1 para criar duas hordas ao invés de uma. As hordas criadas desta maneira contam como apenas uma para o seu limite de hordas em campo. [PréRequisito: Apogeu - Controle Disperso]"
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Invocações Econômicas",
    "kind": "Escolha",
    "text": "Trazer algumas das suas invocações para o combate se torna mais econômico, permitindo-o trazê-las mais frequentemente quando retiradas.\n\nVocê pode escolher duas invocações para terem o seu custo da invocação ou ativação reduzido em 2. No nível 12 você pode escolher mais uma, assim como no nível 18.\n\n 97"
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Proteção Avançada de Invocação",
    "kind": "Escolha",
    "text": "Aprofundando-se ainda mais em técnicas defensivas para suas invocações, você se torna mais capaz. Quando usar sua reação para receber dano por sua invocação, você receberá apenas metade do dano total.\n\nAlém disso, a reação para reduzir dano normal tem seu valor aumentado para Xd8. Caso esteja adjacente a invocação você pode, ao invés do padrão, gastar 2 PE para utilizar o efeito como Ação Livre.\n\nPré-Requisito: Proteger Invocação."
  },
  {
    "class": "Controlador",
    "level": 6,
    "name": "Táticas de Alcateia",
    "kind": "Escolha",
    "text": "Caso tenha uma criatura agressiva sendo flanqueada por uma das suas invocações, a Defesa dela diminui em um valor igual a metade seu bônus de treinamento, e ele recebe uma penalidade em todos os testes de resistência com o mesmo valor."
  },
  {
    "class": "Controlador",
    "level": 8,
    "name": "Aptidões de Controle",
    "kind": "Escolha",
    "text": "Você aprimora suas aptidões de energia necessárias para ser um mestre controlador. Ao obter esta habilidade, você pode aumentar o seu nível de aptidão em Aura, Controle e Leitura ou Barreira em 1. Você pode pegar esta habilidade três vezes, uma para cada aptidão."
  },
  {
    "class": "Controlador",
    "level": 8,
    "name": "Atacar e Invocar",
    "kind": "Escolha",
    "text": "Priorizando um combate próximo e em meio as suas invocações, você consegue trazê-las junto de um golpe. Quando você utilizar a ação Atacar, você pode gastar 2 PE para trazer uma invocação ao campo, considerando como se ela já estivesse presente para efeitos e uso de habilidades, como Acompanhamento Amaldiçoado."
  },
  {
    "class": "Controlador",
    "level": 8,
    "name": "Golpes Ágeis",
    "kind": "Escolha",
    "text": "Seus ataques se tornam mais ágeis, visando permitir comandar as invocações e ainda assim atacar por si só. Uma vez por rodada, quando uma Invocação sua utilizar o efeito de Acompanhamento Amaldiçoado, você pode gastar 2PE para realizar um ataque armado ou desarmado adicional. [Pré-Requisito:\n\nAcompanhento Amaldiçoado]",
    "prereq": "Acompanhento Amaldiçoado",
    "req": {}
  },
  {
    "class": "Controlador",
    "level": 8,
    "name": "Técnicas de Oportunidade",
    "kind": "Escolha",
    "text": "Suas invocações se tornam aptas a novas técnicas de combate, encontrando boas oportunidades. Após obter essa habilidade, suas invocações passam a poder usar Ações de Ataque como uma reação, seguindo o mesmo gatilho de um ataque de oportunidade. Não é possível utilizar Ações com Custo como oportunidade."
  },
  {
    "class": "Controlador",
    "level": 10,
    "name": "Buchas de Canhão",
    "kind": "Escolha",
    "text": "Invocações de menor grau não possuem muito valor sozinhas, mas são ótimas para compor uma horda. Você não precisa mais pagar PEs adicionais para colocar invocações de quarto grau como membros de uma horda ou invocá-la."
  },
  {
    "class": "Controlador",
    "level": 10,
    "name": "Crítico Aprimorado",
    "kind": "Escolha",
    "text": "Um 19 se torna crítico também para suas invocações. Ao conseguir um crítico você pode, também, escolher entre os seguintes efeitos: diminuir o acerto do inimigo em um valor igual a metade do seu bônus de treinamento ou diminuir todas as RDs dele em um valor igual ao seu bônus de treinamento. Além disso, você escolhe dois efeitos ao invés de apenas um. PréRequisito: Crítico Brutal."
  },
  {
    "class": "Controlador",
    "level": 10,
    "name": "Flanco Avançado",
    "kind": "Escolha",
    "text": "Você aprimora as técnicas de flanco das suas invocações, transformando-as em obstáculos ainda maiores para os inimigos.\n\nCaso tenha uma criatura agressiva dentro do alcance de ação de pelo menos duas de suas invocações, além de receber os efeitos da habilidade Táticas de Alcateia, sempre que essa criatura recebe um ataque, ela recebe 1d8 de dano adicional, aumentando em +1d8 para cada invocação além das duas primeiras. Pré-Requisito: Táticas de Alcateia."
  },
  {
    "class": "Controlador",
    "level": 10,
    "name": "Resistência Sobrecarregada",
    "kind": "Escolha",
    "text": "Você pode sobrecarregar a resistência das suas invocações a partir da sua própria energia amaldiçoada. Ao ativar ou invocar uma invocação, você pode gastar uma quantidade de PE igual a metade do seu bônus de treinamento e, para cada ponto gasto, a invocação tem seus pontos de vida aumentados em 10. Pré-Requisito:\n\nInvocações Resistentes.\n\n 98"
  },
  {
    "class": "Controlador",
    "level": 16,
    "name": "Fantoche Supremo",
    "kind": "Escolha",
    "text": "Durante um descanso, você é capaz de reforçar o poderio de uma invocação que pareça que será essencial. Você pode, durante um descanso longo, escolher uma Invocação para ser o seu Fantoche Supremo, o qual recebe os seguintes benefícios: os pontos de vida da invocação aumentam em um valor igual ao seu bônus de treinamento multiplicado por cinco; a Defesa da invocação aumenta em um valor igual ao dobro do seu bônus de treinamento; o movimento da invocação aumenta em 4,5 metros e ela pode realizar uma ação complexa adicional todo turno.\n\nPorém, você só pode Invocar o seu fantoche supremo uma vez por descanso longo.\n\n 99"
  },
  {
    "class": "Controlador",
    "level": 16,
    "name": "Mestre do Controle",
    "kind": "Escolha",
    "text": "Você se torna um mestre do controle, levando suas técnicas ao limite. Uma vez por rodada você pode, como uma ação livre, gastar 2PE para fazer com que uma invocação sua se mova e realize uma ação complexa adicional."
  },
  {
    "class": "Suporte",
    "level": 1,
    "name": "Suporte em Combate",
    "kind": "Automática",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Amizade Inquebrável",
    "kind": "Escolha",
    "text": "Escolha um Aliado Jogador. Este aliado é considerado permanentemente seu “Amigo”. Ao terminar seu turno ao lado de seu Amigo, você pode como ação livre realizar a Ação “Apoiar” no mesmo. Caso o Amigo morra, você só pode escolher outro amigo no próximo interlúdio."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Análise Profunda",
    "kind": "Escolha",
    "text": "Sua presença é motivadora, e o mesmo vale para um comando dado por você.\n\nComo uma ação livre, você pode falar um comando para um aliado e gastar 2 pontos de energia amaldiçoada para que, quando o aliado realize a ação comandada, ele receba um bônus igual ao seu bônus de treinamento na rolagem usada na ação.\n\n Você consegue analisar profundamente um inimigo, deduzindo aspectos dele.\n\nVocê pode gastar 1 ponto de energia amaldiçoada para, como uma ação comum, analisar uma criatura, realizando uma rolagem de Percepção com CD igual a 15 + ND da criatura. Caso você suceda, você descobre uma característica dela (pontos de vida, bônus em perícia ou ataque, por exemplo). Para cada 5 pontos excedentes no resultado do teste, você descobre uma característica adicional.\n\nVocê só pode usar essa habilidade uma vez em cada criatura, por cena."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Apoio Avançado",
    "kind": "Escolha",
    "text": "Estudando para se tornar mais versátil, você consegue dominar outros campos de estudos. Você se torna treinado em uma quantidade de perícias igual a metade do seu bônus de treinamento. Você recebe também um bônus de +2 em uma perícia qualquer.\n\n Ao utilizar a ação de Apoiar, você pode fortalecer seu apoio com um efeito à sua escolha, com as possibilidades listadas no final da especialização."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Conceder Outra Chance",
    "kind": "Escolha",
    "text": "Você pode conceder a um aliado outra chance em um teste no qual ele falhou. Ao ver um aliado dentro de 6 metros falhar em um teste, você pode gastar 3 pontos de energia amaldiçoada para fazer com que ele role novamente, ficando com o melhor resultado. Você pode utilizar essa habilidade uma quantidade de vezes igual ao seu bônus de treinamento, por descanso longo; em um descanso curto, você recupera metade dos usos.\n\n 105"
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Comando Motivador",
    "kind": "Escolha",
    "text": "Você consegue compreender e destrinchar o ambiente ao seu redor, encontrando pontos de vantagem no terreno. Como uma Ação de Movimento, realize um teste de Percepção com CD definida pelo Narrador e, caso suceda, você percebe pontos estratégicos sobre ele (como coberturas, terrenos difíceis e outros) e, até o final da cena, recebe um bônus igual ao seu bônus de treinamento em testes de Percepção que envolvam procurar e encontrar coisas ou pessoas no terreno analisado."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Desvendar Terreno",
    "kind": "Escolha",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Expandir Repertório",
    "kind": "Escolha",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Mobilidade Avançada",
    "kind": "Escolha",
    "text": "Em prol de alcançar mais rapidamente o lugar onde seu suporte é requisitado você recebe um bônus de +3 metros em seu movimento. Além disso, caso um aliado caia nas portas da morte, você pode, como uma reação, mover-se metade do seu movimento na direção dele."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Otimização de Espaço",
    "kind": "Escolha",
    "text": "Você organiza melhor o seu inventário e o seu espaço. Você recebe espaços de item adicionais no seu inventário, em um valor igual ao seu bônus de treinamento."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Pronto para Agir",
    "kind": "Escolha",
    "text": "Você adiciona seu modificador de Presença a Iniciativa. Além disso, seus aliados recebem um bônus igual a metade do modificador."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Protetor",
    "kind": "Escolha",
    "text": "Quando um aliado dentro de 1,5m de você é atacado, você pode gastar 1 PE para, como uma Ação Livre, diminuir o dano causado no ataque feito contra ele em Xd10 + seu modificador de Presença ou sabedoria, onde X é igual ao seu bônus de treinamento. É necessário estar com um escudo equipado para utilizar esta habilidade."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Técnicas de Combate",
    "kind": "Escolha",
    "text": "Você decide se versar em técnicas essenciais de combate, em busca de conseguir se defender em casos extremos.\n\nVocê pode escolher duas armas quaisquer para se tornar treinado, caso não tenha, e para poder utilizar Inteligência ou Sabedoria nas jogadas de ataque e dano enquanto as manejando."
  },
  {
    "class": "Suporte",
    "level": 2,
    "name": "Transmitir Conhecimento",
    "kind": "Escolha",
    "text": "Durante um descanso, você pode transmitir conhecimento para seus aliados, preparando-os. Durante um descanso curto, você pode conceder treinamento temporário em perícias com as quais você seja treinado para seus aliados, com um limite igual a metade do seu bônus de treinamento. Durante um descanso longo, essa quantidade é igual a bônus de treinamento.\n\n 106"
  },
  {
    "class": "Suporte",
    "level": 3,
    "name": "Presença Inspiradora",
    "kind": "Automática",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 3. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Apoios Versáteis",
    "kind": "Escolha",
    "text": "Ao obter esta habilidade, você aprende um apoio avançado adicional. No 10° nível você recebe outro apoio avançado."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Guarda Sincronizada",
    "kind": "Escolha",
    "text": "Um cuida do outro e, mantendo essa mentalidade, você consegue estabelecer uma guarda em sintonia com seus aliados próximos. Você pode utilizar uma Ação Bônus para sintonizar a guarda de todos seus aliados dentro de 7,5 metros que possam te ver ou ouvir: para cada aliado dentro do alcance, todos os outros recebem +1 na Defesa."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Inspirar Aliados",
    "kind": "Escolha",
    "text": "Você sabe como dar a inspiração necessária para os seus aliados. Uma vez por cena, você pode gastar 1 ponto de energia amaldiçoada e usar sua ação bônus para inspirar uma quantidade de aliados igual a metade do seu bônus de treinamento.\n\nUma quantidade de vezes igual ao seu modificador de presença ou sabedoria, dentro de 10 minutos, esses aliados podem escolher adicionar 2d3 em uma jogada de ataque, teste de habilidade ou teste de resistência, mas apenas uma vez por teste."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Intervenção",
    "kind": "Escolha",
    "text": "Intervindo rapidamente para impedir uma aflição pior, você é capaz de remover condições antes que elas se acentuem.\n\nComo uma Ação Comum, você pode gastar 3 PE para encerrar uma condição fraca afetando um aliado dentro de alcance de toque. Nos níveis 6, 12 e 18 você se torna capaz de encerrar condições médias, fortes e extremas respectivamente, com o custo em PE aumentando em 3 para cada nível superior a fraca."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Negação Crítica",
    "kind": "Escolha",
    "text": "Você é capaz de negar uma falha crítica dos seus aliados, impedindo o pior de acontecer. Uma quantidade de vezes igual a 1 + metade do seu bônus de treinamento, por cena, você pode pagar 3 PE para negar uma falha crítica que você possa ver dentro de 12 metros.\n\n 107"
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "No Último Segundo",
    "kind": "Escolha",
    "text": "Ao iniciar uma rodada com um ou mais aliados com 2 fracassos nos testes da porta da morte, aumente sua iniciativa atual em combate em +5. Caso você aja primeiro que um dos seus aliados nas portas da morte por causa deste bônus de iniciativa, você anula terreno difícil, tem seu movimento aumentado em 4,5m e recebe +5 de Defesa contra Ataques de Oportunidade durante a rodada."
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Pré-Análise",
    "kind": "Escolha",
    "text": "Você inconscientemente analisa o território a sua volta, sendo assim você não pode ser surpreendido e seu valor de atenção recebe um bônus de +5. Você pode escolher um aliado para não ser surpreendido. [Pré-Requisito: Treinado em Percepção]",
    "prereq": "Treinado em Percepção",
    "req": {
      "skillTrained": "Percepção"
    }
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Recompensa pelo Sucesso",
    "kind": "Escolha",
    "text": "Você recompensa aqueles que você comanda, com um sucesso mais difícil sendo extremamente gratificante. Ao utilizar Comando Motivador, você pode escolher reduzir o bônus fornecido por ela pela metade e, caso o aliado motivado ainda assim consiga suceder, ele ganha 2 PE. [Pré-Requisito: Comando Motivador]",
    "prereq": "Comando Motivador",
    "req": {}
  },
  {
    "class": "Suporte",
    "level": 4,
    "name": "Sintonização Vital",
    "kind": "Escolha",
    "text": "Quando curar um aliado, você pode gastar 3 pontos de energia amaldiçoada para que outra criatura dentro de 3 metros (incluindo você) recupere uma quantidade de pontos de vida igual a metade da cura original."
  },
  {
    "class": "Suporte",
    "level": 5,
    "name": "Versatilidade",
    "kind": "Automática",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 5. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Contra-Ataque",
    "kind": "Escolha",
    "text": "Uma quantidade de vezes igual ao dobro do seu modificador de Presença ou Sabedoria, por descanso curto ou longo, você pode, como uma reação, gastar 1 ponto de energia amaldiçoada para aumentar a Defesa de um aliado em um valor igual ao seu bônus de treinamento e, se você fizer com que um ataque que iria acertar se torne um erro, você ou o aliado protegido podem pagar 1 ponto de energia amaldiçoada para realizar um ataque contra o inimigo."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Cura Avançada em Grupo",
    "kind": "Escolha",
    "text": "Você pode usar sua habilidade de cura em grupo: quando a utilizar em um alvo, você pode pagar 2 pontos de energia amaldiçoada para curar mais um alvo, com um limite igual ao seu bônus de treinamento."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Devolver na Mesma Moeda",
    "kind": "Escolha",
    "text": "Quando um aliado que você possa ver é afetado por uma condição, você pode gastar 2 PE para, como uma Ação Livre, fazer com que o próximo teste de resistência realizado por um inimigo para evitar uma condição do aliado possua desvantagem."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Disseminar Cura",
    "kind": "Escolha",
    "text": "Ao utilizar um Feitiço de cura, você pode escolher um alvo adicional, gastando uma quantidade de PE igual ao nível da técnica adicional."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Incitar Vigor",
    "kind": "Escolha",
    "text": "Você é capaz de utilizar de processos para incitar o vigor em uma criatura, puxando de seu potencial latente. Como uma ação bônus, você pode gastar 3 pontos de energia para fazer com que uma criatura a alcance de toque possa gastar seus dados de vida para se curar."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Inimigo Comum",
    "kind": "Escolha",
    "text": "Você pode gastar 2 pontos de energia amaldiçoada para, como uma ação bônus, escolher um inimigo comum entre uma quantidade de pessoas igual ao seu modificador de Presença ou sabedoria.\n\nSempre que uma pessoa atacar o inimigo em comum, adiciona-se metade do seu bônus de Presença ou sabedoria na rolagem de acerto e o modificador inteiro nas rolagens de dano. Caso uma das pessoas escolhida ataque uma criatura que não for o inimigo comum, e o inimigo comum estiver vivo, ela para de receber os bônus."
  },
  {
    "class": "Suporte",
    "level": 6,
    "name": "Posicionamento Estratégico",
    "kind": "Escolha",
    "text": "Em certos momentos, você não precisa se mover, mas outros se beneficiariam de um melhor posicionamento. Durante o seu turno, você pode deixar de se mover (reduzir seu movimento a 0), para permitir que um dos seus aliados se mova, como Ação Livre.\n\n 108"
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Aptidões de Suporte",
    "kind": "Escolha",
    "text": "Você aprimora suas aptidões de energia necessárias para ser um grande suporte.\n\nAo obter esta habilidade, você pode aumentar o seu nível de aptidão em Aura, Controle e Leitura ou Energia Reversa em 1. Você pode pegar esta habilidade três vezes, uma para cada aptidão."
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Contaminar com Determinação",
    "kind": "Escolha",
    "text": "Uma vez por cena, você pode gastar 4 pontos de energia amaldiçoada para, como uma ação comum, fazer com que você e dois aliados recebam vantagem em todo teste de resistência por duas rodadas. Você pode fazer com que mais aliados recebam vantagem, mas para cada aliado a mais, o custo da habilidade aumenta em 2 pontos de energia."
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Criar Medicina",
    "kind": "Escolha",
    "text": "Nem sempre é possível estar próximo aos seus aliados, então você desenvolve uma técnica para criar remédios portáteis.\n\nDurante um descanso curto, você pode escolher recuperar 2 pontos de energia a menos para criar uma quantidade de remédios igual a metade do seu bônus de treinamento; em um descanso longo, a quantidade é igual ao seu bônus de treinamento e você recupera 4 pontos de energia a menos. Um remédio cura em um valor igual a sua cura da habilidade Suporte em Combate, dura 1 dia e consome uma ação comum para ser usado. [PréRequisito: Treinado em Ferramentas de Médico]"
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Cura Aperfeiçoada",
    "kind": "Escolha",
    "text": "Sua cura é quase perfeita em sua consistência. Caso você tire 1 ou 2 em um dado de cura, você pode escolher rolar novamente o dado, ficando com o melhor resultado."
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Elevar Sucesso",
    "kind": "Escolha",
    "text": "Como um suporte, você consegue elevar a tentativa de resistência de um aliado.\n\nQuando um aliado dentro de 4,5 metros suceder em um teste de resistência você pode, como uma reação, gastar 2PE para somar +5 ao resultado do teste dele, com a possibilidade de se tornar um sucesso crítico."
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Físico Controlado",
    "kind": "Escolha",
    "text": "Você controla o seu físico a partir dos conhecimentos médicos e da energia amaldiçoada. Você passa a somar seu modificador de presença ou de sabedoria, ao invés de constituição, nos pontos de vida, mas com um limite de +4. Ao adquirir essa habilidade, você calcula novamente a sua vida, levando em conta a alteração do atributo usado. [Pré-Requisito: Treinado em Fortitude]",
    "prereq": "Treinado em Fortitude",
    "req": {
      "skillTrained": "Fortitude"
    }
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Motivação pelo Triunfo",
    "kind": "Escolha",
    "text": "Neutralizar um dos inimigos incentiva você e seus aliados a continuarem lutando, independente de quem o tenha eliminado.\n\nQuando um inimigo tem seus pontos de vida reduzidos a 0 ou é morto por você ou um dos aliados presentes na cena, você pode conceder uma quantidade de pontos de vida temporários igual ao dobro do seu nível de Suporte para todos os aliados que tenham causado dano nesse inimigo. Caso o inimigo seja um Lacaio, essa quantidade é reduzida pela metade."
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Pressão do Médico",
    "kind": "Escolha",
    "text": "Ao entrar nas portas da morte, você não fica inconsciente. Ao invés de não agir, você pode tentar se estabilizar sozinho com CD aumentada em +10, porém ao fazer isso, você recebe uma falha nos testes de morte.\n\n[Pré-Requisito: Mestre em Medicina]",
    "prereq": "Mestre em Medicina",
    "req": {
      "skillMaster": "Medicina"
    }
  },
  {
    "class": "Suporte",
    "level": 8,
    "name": "Sustentação Avançada",
    "kind": "Escolha",
    "text": "Seu corpo agora é capaz de dividir a liberação de energia entre dois feitiços diferentes. Você pode manter um feitiço sustentado adicional e, no começo do combate, pode ativar um feitiço sustentado à sua escolha como Ação Livre, desde que ele possua um custo de Ação Bônus ou inferior."
  },
  {
    "class": "Suporte",
    "level": 10,
    "name": "Medicina Infalível",
    "kind": "Automática",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 10. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Suporte",
    "level": 10,
    "name": "Descarga Reanimadora",
    "kind": "Escolha",
    "text": "Você descobriu uma técnica para descarregar energia reversa de maneira a reanimar imediatamente alguém caído.\n\nCaso haja um aliado nas portas da morte, dentro do seu alcance de toque, você pode usar uma Ação Completa e gastar 10 pontos de energia amaldiçoada para o estabilizar imediatamente, independente de quanta vida negativa ele tenha, e recupere pontos de vida igual a uma rolagem da sua cura de Suporte em Combate. Se o turno dele já tiver passado e ele não ter agido por estar nas portas da morte, ele pode realizar o turno imediatamente após o seu. [PréRequisito: Aptidão Cura Amplificada]"
  },
  {
    "class": "Suporte",
    "level": 10,
    "name": "Necessidade de Continuar",
    "kind": "Escolha",
    "text": "Para você, continuar presente no campo de batalha é mais do que uma necessidade, pois você é o suporte necessário. Quatro vezes por cena, se você estiver com menos da metade da sua vida máxima, você recebe um valor de pontos de vida temporários igual ao seu bônus da perícia Medicina + seu modificador de Presença ou Sabedoria, no começo do seu turno.\n\n[Pré-Requisito: Treinado em Vontade]",
    "prereq": "Treinado em Vontade",
    "req": {
      "skillTrained": "Vontade"
    }
  },
  {
    "class": "Suporte",
    "level": 10,
    "name": "Olhar Aguçado",
    "kind": "Escolha",
    "text": "Seus olhos são treinados para encontrar os pontos fracos dos inimigos: você pode gastar 2 pontos de energia amaldiçoada e usar sua ação bônus para analisar um inimigo, descobrindo onde é melhor o acertar, fazendo com que o primeiro ataque de todo aliado cause dano adicional igual ao seu bônus de treinamento multiplicado por 5. Você só pode usar essa habilidade duas vezes por criatura. [Pré-Requisito:\n\nTreinado em Percepção]",
    "prereq": "Treinado em Percepção",
    "req": {
      "skillTrained": "Percepção"
    }
  },
  {
    "class": "Suporte",
    "level": 10,
    "name": "Táticas Defensivas",
    "kind": "Escolha",
    "text": "Você pode escolher um tipo de dano Elemental para que você e dois aliados sejam resistentes. Em um descanso longo, você pode trocar esses tipos de dano e os aliados recebendo o benefício.\n\n 110"
  },
  {
    "class": "Suporte",
    "level": 12,
    "name": "Ajustes em Equipamento",
    "kind": "Escolha",
    "text": "Você se torna capaz de fazer ajustes nos equipamentos dos seus aliados, durante um tempo de descanso. Durante um descanso curto, você pode escolher uma quantidade de equipamentos igual ao seu Bônus de Treinamento, os quais recebem o efeito de um Encantamento que não possuam e atendam aos requisitos. Durante um Descanso Longo, essa quantidade se torna o dobro do seu Bônus de Treinamento.\n\nO efeito dos Encantamentos fica ativo até o próximo descanso. [Pré-Requisito:\n\nTreinado em Ferramentas de Ferreiro]",
    "prereq": "Treinado em Ferramentas de Ferreiro",
    "req": {
      "skillTrained": "Ferramentas de Ferreiro"
    }
  },
  {
    "class": "Suporte",
    "level": 12,
    "name": "Interferência",
    "kind": "Escolha",
    "text": "Você se torna capaz de interferir nas ações dos inimigos. Como uma reação, você pode gastar 2 pontos de energia amaldiçoada para forçar um inimigo dentro de 9 metros a rolar novamente um teste, ficando com o menor resultado. Além disso, após usar essa habilidade você pode conceder a um aliado dentro de 4,5 metros vantagem na próxima rolagem dele."
  },
  {
    "class": "Suporte",
    "level": 12,
    "name": "Não Desista!",
    "kind": "Escolha",
    "text": "Ao ver um aliado atingir 0 ou menos de vida ao receber dano, você pode, gastando 3 de PE, fazer um teste de Persuasão contra a CD de estabilização. Caso você passe, o aliado continua de pé e não entra nas portas da morte, ficando com 0 de vida ao invés do normal, durante uma rodada. Enquanto essa rodada durar, a vida necessária para ele cair nas portas da morte se torna -100 ou a vida máxima negativa, o que for menor.\n\nSe a rodada acabar e ele ainda estiver com 0 de vida ou menos, ele caíra nas portas da morte, recebendo 1 falha. Caso o aliado possua uma habilidade que permita o mesmo continuar agindo mesmo depois de bater 0, como “Mesmo Morto” ou “Potência Antes de Cair”, ao invés disso, você anula o efeito negativo das habilidades (No caso de mesmo morto, seria receber uma falha, no caso de potência antes de cair, seria a exaustão). Esta habilidade pode ser utilizada para negar efeitos negativos de habilidades apenas uma quantidade de vezes igual a metade do seu bônus de treinamento.\n\n 111"
  },
  {
    "class": "Suporte",
    "level": 12,
    "name": "Sobrecura",
    "kind": "Escolha",
    "text": "Ao curar um aliado você pode fazer com que essa cura supere o máximo de vida dele: caso ele fique com o máximo de vida por meio da sua cura, ele recebe o dobro do excedente como vida temporária, com um limite igual ao dobro do seu nível de suporte. Você pode, também, escolher conceder 5 multiplicado por seu modificador de Presença ou Sabedoria de Vida Temporária a alguém que já esteja com a vida completa com um uso da sua cura."
  },
  {
    "class": "Suporte",
    "level": 12,
    "name": "Reação Necessária",
    "kind": "Escolha",
    "text": "Você sabe que, em certos momentos, sua reação é necessária, mesmo que isso signifique ir além do esperado. Uma vez por rodada, caso não possua uma reação, você pode gastar 3 pontos de energia amaldiçoada para realizar uma reação adicional."
  },
  {
    "class": "Suporte",
    "level": 14,
    "name": "Apoio Abrangente",
    "kind": "Escolha",
    "text": "Você é capaz de apoiar e melhorar isso de maneira mais abrangente. Quando utilizar Apoio Avançado, você pode colocar dois efeitos ao invés de um só. [Pré-Requisito:\n\nApoio Avançado]",
    "prereq": "Apoio Avançado",
    "req": {}
  },
  {
    "class": "Suporte",
    "level": 14,
    "name": "Apoios Avançados",
    "kind": "Escolha",
    "text": "Após obter a habilidade “Apoio Avançado”, escolha um dos apoios abaixo para ser capaz de aplicar quando utilizar a ação Apoiar:\n\n• Apoio Curativo. Quando apoiar um aliado, você pode escolher gastar uma carga da habilidade Suporte em Combate para curar o aliado com ela como parte da ação.\n\n• Apoio Defensivo. Quando apoiar um aliado, você pode escolher aumentar a Defesa dele em um valor igual metade do seu bônus de treinamento até o começo do próximo turno.\n\n• Apoio Focado. Quando apoiar um aliado, você pode escolher, além da vantagem, conceder um bônus no teste que ele realizar igual a metade do seu modificador de Presença ou Sabedoria.\n\n• Apoio Ofensivo. Quando apoiar um aliado, você pode gastar 2 PE para realizar um ataque como parte da ação.\n\n• Apoio Estratégico. Ao utilizar a ação de apoio, você pode aumentar a CD do próximo teste que force TR do Aliado em um valor igual a metade do seu Bônus de Treinamento. [Pré-Requisito: Nível 6]\n\nVocê recebe acesso a um novo apoio avançado nos níveis 6 e 12.\n\n 113",
    "prereq": "Nível 6",
    "req": {}
  },
  {
    "class": "Suporte",
    "level": 16,
    "name": "Purificação da Alma",
    "kind": "Escolha",
    "text": "Suas capacidades se tornaram tão grandes que você inconscientemente se tornou ciente do traçado de uma alma, assim podendo curar diretamente as almas das pessoas. Uma quantidade de vezes igual ao seu modificador de presença você pode restaurar a integridade de alguém em 50%. E, além disso, você domina ainda mais as técnicas de cura: o seu Bônus de Treinamento é adicionado ao número de usos da sua cura."
  },
  {
    "class": "Suporte",
    "level": 16,
    "name": "Sustentação Mestre",
    "kind": "Escolha",
    "text": "Com o passar do tempo, você descobriu novas formas de como dispersar energia pelo seu corpo, conseguindo sustentar mais feitiços e com maior eficiência. Você pode manter três feitiços sustentados ao invés de dois. Além disso, seu custo para sustentar feitiços é diminuído em 1, com um mínimo de 1. [Pré-Requisito:\n\nSustentação Avançada]",
    "prereq": "Sustentação Avançada",
    "req": {}
  },
  {
    "class": "Suporte",
    "level": 20,
    "name": "Suporte Absoluto",
    "kind": "Automática",
    "text": "Entrada oficial de Suporte, desbloqueada no nível 20. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 1,
    "name": "Restrito pelos Céus",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 1. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Ataque Furtivo",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Versatilidade",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 2. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Ataque Inconsequente",
    "kind": "Escolha",
    "text": "Você baixa a guarda para atacar de maneira inconsequente, aumentando seu potencial de dano. Uma vez por rodada, ao realizar um ataque, você pode escolher receber vantagem na jogada de ataque e +5 na rolagem de dano dele. Porém, ao realizar um ataque inconsequente, você fica Desprevenido por 1 rodada."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Apropriar-se",
    "kind": "Escolha",
    "text": "Você recebe um bônus de +3 em testes para Desarmar ou evitar ser desarmado."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Aproximação Instintiva",
    "kind": "Escolha",
    "text": "Quando um inimigo termina o turno dentro de uma distância igual a metade do seu deslocamento você pode, como uma ação livre, se mover até metade do seu movimento para um espaço mais próximo do inimigo. Essa movimentação não causa ataques de oportunidade e ignora terreno difícil. Caso, com essa movimentação, a criatura acabe em seu alcance de ataque, você pode gastar 2 pontos de estamina para realizar uma manobra contra ela."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Existência Imperceptível",
    "kind": "Escolha",
    "text": "Com níveis mínimos de energia, você sabe como se esconder e tornar sua existência em algo imperceptível. Você recebe um bônus de +2 em rolagens de Furtividade.\n\nAlém disso, sua penalidade em Furtividade por atacar e fazer outras ações chamativas é reduzida para -4."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Finta Melhorada",
    "kind": "Escolha",
    "text": "Você desenvolva sua finta para que se torne mais eficiente e se adaptar ao seu corpo. Você pode optar por utilizar Destreza ao invés de Presença em testes de Enganação para fintar. Além disso, acertar um inimigo desprevenido pela sua finta causa um dado de dano adicional."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Golpe Impactante",
    "kind": "Escolha",
    "text": "Seu primeiro golpe encaixado é acompanhado de um grande impacto.\n\nUma vez por rodada, ao realizar um ataque corpo a corpo contra um alvo, você pode também, como parte do mesmo ataque, realizar a ação de Empurrar contra o mesmo alvo. Caso tenha sucesso em empurrar, ele recebe Xd6 de dano adicional, onde X é igual a metade do seu modificador de Força."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Imitação",
    "kind": "Escolha",
    "text": "Você consegue imitar técnicas e estilos de combate de outras pessoas, desde que tal não dependa da energia amaldiçoada. Ao ver uma habilidade ativa de especialização marcial, manobra ou postura, você pode escolher a copiar como uma reação, e deve a usar no seu próximo turno, ou perderá a cópia. Você só pode manter uma coisa copiada por vez, e só usa uma vez cada uma delas. Porém, quando copiar algo, você pode tentar aprender aquilo, realizando um teste de percepção com CD35, a qual diminui em 2 para cada vez que você copiar a mesma habilidade e tentar a aprender.\n\nSe suceder em aprender, você não precisa ver alguém a usando para poder copiar, necessitando de uma ação bônus, e a quantidade de usos se torna a quantidade padrão da habilidade, ao invés de uma só.\n\nVocê pode aprender uma habilidade ativa e uma postura ou manobra; durante um interlúdio você pode escolher trocar uma habilidade aprendida por outra que possa ver durante o interlúdio, tentando a copiar com o teste de percepção, o qual é feito com vantagem. Caso o que for copiado gaste energia amaldiçoada, você paga o custo em pontos de estamina."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Manejo Superior",
    "kind": "Escolha",
    "text": "Você sabe manejar armas como ninguém, extraindo seu máximo. O dano de toda arma que você manejar conta como um nível acima e suas rolagens de dano recebem um bônus igual ao seu bônus de treinamento."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Roubo de Habilidade",
    "kind": "Escolha",
    "text": "Em busca de se adaptar, você consegue até mesmo roubar as habilidades dos outros.\n\nAo obter essa habilidade, você pode aprender uma habilidade de Especialista em Combate ou Lutador, desde que tal não dependa do uso de energia amaldiçoada.\n\nVocê usa seus níveis de Restringido para os requisitos. Você pode pegar essa habilidade uma quantidade de vezes igual ao seu bônus de treinamento, roubando habilidades diferentes. Você não pode roubar habilidades base das outras especializações, exceto Golpe Especial."
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Surto de Adrenalina",
    "kind": "Escolha",
    "text": "Como uma ação livre, você pode gastar 3 pontos de estamina para entrar em um estado onde seu corpo está no limite.\n\nEnquanto em um surto de adrenalina, você recebe os seguintes benefícios: você recebe redução de dano a todos os tipos de dano igual a metade do seu nível de personagem, você recebe um bônus igual a 1 + metade do seu bônus de treinamento em testes de resistência de fortitude e reflexos, e você recebe um bônus em percepção igual ao seu bônus de treinamento. Um surto dura uma rodada, e você pode gastar 1 ponto de estamina adicional para cada rodada após a primeira que deseje o manter ativo.\n\n 118"
  },
  {
    "class": "Restringido",
    "level": 2,
    "name": "Valorizar Invocação",
    "kind": "Escolha",
    "text": "Tendo domado maldições, elas se tornam invocações úteis dentro de combate, e você passa a valorizar elas quando necessário.\n\nCaso uma das suas invocações dentro de 3 metros vá ser exorcizada, você pode gastar 1 ponto de estamina e usar sua reação para se colocar a frente dela, recebendo o golpe letal em troca de manter a invocação viva.\n\nCaso vá defender uma invocação, você recebe pontos de vida temporários igual ao seu nível de personagem."
  },
  {
    "class": "Restringido",
    "level": 3,
    "name": "Esquiva Sobre-humana",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 3. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Implemento Celeste",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Dádiva do Céu",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 4. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Ação Ágil",
    "kind": "Escolha",
    "text": "Você otimiza o seu tempo de ação. Uma vez por rodada, você pode gastar 2PE para receber uma Ação Ágil, a qual pode ser utilizada para Andar, Desengajar ou Esconder."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Adrenalina Intensificadora",
    "kind": "Escolha",
    "text": "Sua adrenalina também intensifica o seu corpo e as suas capacidades. Ao entrar em um surto de adrenalina, você pode escolher pagar 2 pontos de estamina adicionais para poder distribuir um bônus de +4 entre as perícias de Atletismo e Acrobacia, da maneira que desejar (+3 em uma e +1 em outra, por exemplo), além de poder pagar 1 ponto de estamina para se conceder vantagem em uma rolagem de Atletismo e Acrobacia, uma vez por cena cada. Ao obter a Restrição Definitiva, o bônus de +4 se torna +8."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Caçador de Feiticeiros",
    "kind": "Escolha",
    "text": "Sua especialização é conseguir lidar com feiticeiros, preparando-se para os caçar, tanto resistindo melhor quanto destruindo melhor. No começo de uma cena você pode gastar 2 pontos de estamina para receber 2 de RD, +1 em testes de resistência e ataques, além de causar +1d6 de dano contra todos os feiticeiros presentes na cena. A cada 5 níveis você pode gastar mais 2 pontos para aumentar os bônus; +2 de RD, +1 de bônus e +1d6 de dano para cada 2 pontos adicionais."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Desenvolver Ideias",
    "kind": "Escolha",
    "text": "Você tem uma percepção de como desenvolver as suas ideias de técnicas marciais e manobras, expandindo o seu repertório. Você recebe duas técnicas marciais adicionais ao obter essa habilidade."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Foco no Inimigo",
    "kind": "Escolha",
    "text": "Ao iniciar um combate, você pode gastar 2 pontos de estamina e escolher um inimigo para ser seu foco. Ao atacar o inimigo que é seu foco você recebe um bônus de +2 para acertar e causa 1d6 de dano a mais, que aumenta para 1d8 no nível 6, 1d10 no nível 12 e 1d12 no nível 16, além de receber +5 em testes de Percepção para procurar o inimigo e em sua Atenção contra ele. Ao matar o inimigo em que você possui foco, você pode usar sua reação para passar o foco para outro inimigo dentro de 9 metros de você. Caso ataque outra criatura que não seja seu foco, a habilidade se encerra."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Ponto Cego",
    "kind": "Escolha",
    "text": "Você consegue sempre perceber um ponto cego na guarda do inimigo, se posicionando em tal. Se mover pelo espaço de um inimigo não conta como terreno difícil, e sempre que você estiver no espaço de um inimigo, você recebe camuflagem leve, fazendo com que ataques contra você tenham 20% de chance de falhar (1 ou 2 em 1d10). A partir do 10° nível, você pode realizar uma rolagem de furtividade contra um alvo o qual esteja dentro do espaço dele; caso seu resultado seja superior ao valor de atenção dele, você passa a receber uma camuflagem total, fazendo com seus ataques tenham 40% de chance de falhar (1 a 4 em 1d10)."
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Resiliência pela Adrenalina",
    "kind": "Escolha",
    "text": "A adrenalina pulsando no seu corpo o deixa mais resiliente e resistente. Sempre que você realizar um teste de resistência durante um Surto de Adrenalina, você pode pagar 1 ponto de estamina para adicionar 2d3 ao resultado. Caso seja um teste em que você não seja treinado, e se você falhar, você pode rolar novamente.\n\n[Pré-Requisito: Surto de Adrenalina]",
    "prereq": "Surto de Adrenalina",
    "req": {}
  },
  {
    "class": "Restringido",
    "level": 4,
    "name": "Técnicas de Memorização",
    "kind": "Escolha",
    "text": "Você estuda e se versa em uma maneira de conseguir memorizar uma quantidade maior de fatores. Ao obter essa habilidade, você pode aprender uma habilidade adicional a partir da Imitação. Caso tenha a habilidade Imitação Perfeita, você pode aprender mais uma habilidade adicional.\n\n[Pré-Requisito: Imitação]\n\n 119",
    "prereq": "Imitação",
    "req": {}
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Aprimoramento Celeste",
    "kind": "Escolha",
    "text": "Você passa a somar metade do modificador do seu atributo chave em sua CD de Especialização."
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Ataque Extra",
    "kind": "Escolha",
    "text": "Você consegue atacar mais rápido, otimizando seus golpes. Ao realizar a ação Atacar, você pode gastar 2 PE para atacar duas vezes ao invés de uma."
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Ataque Inconsequente Aprimorado",
    "kind": "Escolha",
    "text": "O bônus em dano ao usar o ataque inconsequente aumenta para +10 e, ao utilizar a habilidade, você recebe 2d6+4 pontos de vida temporária. [PréRequisito: Ataque Inconsequente]"
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Corpo de Aço",
    "kind": "Escolha",
    "text": "Seu corpo é tão duro quanto o aço e não se curva, mantendo sua integridade. Seus pontos de vida máximos aumentam em um valor igual ao seu valor de Constituição, e você pode pagar 2 pontos de estamina para, durante uma cena, se curar em um valor igual a 2d8 + seu modificador de constituição no começo de todo turno seu. No nível 10, você pode pagar 1 ponto de estamina adicional para aumentar a cura em 1d8, assim como pode pagar mais 1 ponto no nível 15 para aumentar novamente."
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Corredor Fantasma",
    "kind": "Escolha",
    "text": "Ao se mover, você pode utilizar o movimento para andar em paredes, no entanto, não pode terminar seu turno em uma. Caso termine, você cai, respeitando as regras de queda. Você recebe um bônus de +2 em testes para reduzir dano de queda. Caso possua a dádiva Agilidade Exímia, você pode correr em tetos."
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Disparada Trovejante",
    "kind": "Escolha",
    "text": "Você consegue usar da sua agilidade para disparar como um trovão em reação a um golpe. Ao receber um ataque corpoa-corpo, você pode gastar 3 pontos de estamina para reduzir o dano a metade e se mover até 4,5 metros para longe do atacante."
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Frenesi",
    "kind": "Escolha",
    "text": "Durante o Surto de Adrenalina, você assume um frenesi intenso que aumenta o potencial ofensivo dos seus golpes: sempre que realizar um ataque, ele causa +4 de dano adicional. No 12° nível, esse bônus se torna +8, no 16° nível ele se torna +12.\n\n[Pré-Requisito: Surto de Adrenalina]",
    "prereq": "Surto de Adrenalina",
    "req": {}
  },
  {
    "class": "Restringido",
    "level": 6,
    "name": "Movimento Reativo",
    "kind": "Escolha",
    "text": "Uma vez por rodada, quando um oponente dentro de um alcance igual ao seu movimento iniciar a realização de uma ação que permitiria o uso de um ataque de oportunidade, você pode gastar 2 pontos de estamina para se locomover até ele com uma ação livre, e então gastar sua reação para executar o ataque de oportunidade.\n\n 120"
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Ainda de Pé",
    "kind": "Escolha",
    "text": "Uma vez por descanso curto ou longo, quando você for chegar a 0 pontos de vida e cair você pode escolher se manter de pé e curar em 3d10 + nível de personagem, aumentando em +1d10 nos níveis 12, 16 e 20. Caso o dano fosse suficiente para ser uma morte instantânea, você apenas resiste e fica com 1 de vida, caindo com uma falha no próximo dano que receber.\n\nSe você morrer, você morre de pé."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Arremetida Encoberta",
    "kind": "Escolha",
    "text": "Ao realizar o Ataque Furtivo da rodada, você recebe vantagem no golpe. Caso o acerto dele já tenha sido garantido por qualquer motivo, você recebe +1d no dano do Ataque Furtivo."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Barreira Inamovível",
    "kind": "Escolha",
    "text": "Sempre que você fizer um teste de resistência de Fortitude e o resultado natural do dado for menor do que seu modificador de Constituição, você pode gastar 2 pontos de estamina para transformar o resultado natural do dado no seu modificador de Constituição.\n\nVocê não pode ser movido a força e tem vantagem para resistir a ser agarrado."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Força Imparável",
    "kind": "Escolha",
    "text": "Sempre que você fizer um TR de Reflexos e o resultado natural do dado for menor do que seu modificador de Destreza, você pode gastar 2 pontos de estamina para transformar o resultado natural do dado no seu modificador de Destreza. Você se torna treinado em um teste de resistência à sua escolha e mestre em outro TR no qual já seja treinado."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Imitação Perfeita",
    "kind": "Escolha",
    "text": "Você desenvolve a habilidade de imitação.\n\nVocê se torna capaz de copiar habilidades passivas de especializações marciais e estilos de combate. Ao copiá-las, o efeito dura até o final do seu próximo turno.\n\nVocê passa a poder aprender também uma habilidade passiva e um estilo de combate, mas é mais difícil, por ser algo sutil; a CD é igual a 40, e continua diminuindo em 2 por tentativa na mesma habilidade. [PréRequisito: Imitação]\n\n 121"
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Presença Ameaçadora",
    "kind": "Escolha",
    "text": "Sua mera presença é ameaçadora, de tão poderoso você se mostra, mesmo sem energia amaldiçoada. Você pode gastar 1 ponto de estamina para demarcar a sua presença, fazendo com que toda criatura que consiga o ver realize um teste de resistência de vontade. Em uma falha, a criatura fica amedrontada por 2 rodadas, em um sucesso, fica abalada. Você só pode usar essa habilidade uma vez por cena em cada criatura."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Reação Rápida",
    "kind": "Escolha",
    "text": "Você sempre reage rápido quando uma situação de combate começa. Você passa a adicionar seu modificador de Inteligência ou Sabedoria no seu bônus de iniciativa."
  },
  {
    "class": "Restringido",
    "level": 8,
    "name": "Respeito Celeste",
    "kind": "Escolha",
    "text": "Seu poder e desenvolvimento te garantem o respeito dos céus, que concedem a sua benção para si. Ao obter essa habilidade, você recebe uma dádiva do céu adicional.\n\nA partir do nível 12, você pode pegar esta habilidade outra vez."
  },
  {
    "class": "Restringido",
    "level": 9,
    "name": "Teste de Resistência Mestre",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 9. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Restrição Definitiva",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 10. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Assassinar",
    "kind": "Escolha",
    "text": "Durante o primeiro momento, você é capaz de extrair letalidade absoluta, golpeando um inimigo desprevenido com um bote poderoso. Durante a primeira rodada de um combate, ao atacar uma criatura desprevenida a partir da furtividade ou surpresa, seu primeiro ataque é um crítico garantido. [Pré-Requisito: Mestre em Furtividade]",
    "prereq": "Mestre em Furtividade",
    "req": {
      "skillMaster": "Furtividade"
    }
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Mente Limpa",
    "kind": "Escolha",
    "text": "Você recebe vantagem para resistir às seguintes condições: Amedrontado, Cego, Enfeitiçado e Surdo."
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Perceber o Ar",
    "kind": "Escolha",
    "text": "Sua visão se torna tão apurada que você consegue perceber o próprio ar, usando-o como uma plataforma para se mover e apoiar. Você é imune a danos de queda, conseguindo se apoiar no ar, desde que a altura não seja superior ao dobro do seu movimento. Ao pular você pode realizar outro pulo em seguida, no nível 13 você pode dar dois pulos em seguida, e no nível 17 pode dar três pulos em seguida.\n\nQuando for alvo de um ataque, você pode gastar 2 pontos de estamina e sua reação para realizar um teste de acrobacia contra um teste de reflexos do atacante e, caso o resultado do seu teste supere o do atacante, você desvia do ataque.\n\n 122"
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Precisão Forçada",
    "kind": "Escolha",
    "text": "Você consegue usar do seu físico impecável para forçar precisão absoluta em um golpe.\n\nUma vez por rodada, quando você faz um ataque corpo-a-corpo, você pode pagar 3 pontos de estamina. Se acertar o ataque, causa dano máximo, sem necessidade de rolar danos."
  },
  {
    "class": "Restringido",
    "level": 10,
    "name": "Retaliação",
    "kind": "Escolha",
    "text": "Se você receber dano de um inimigo que esteja dentro de seu alcance, você pode gastar 2 pontos de estamina e usar sua reação para realizar um ataque contra ele."
  },
  {
    "class": "Restringido",
    "level": 12,
    "name": "Adrenalina Absoluta",
    "kind": "Escolha",
    "text": "Enquanto está em um surto de adrenalina, você se torna absoluto, extraindo ao máximo o seu potencial. Ao iniciar um surto de adrenalina, você pode escolher pagar 4 pontos para ativar e 2 por rodada para manter e, caso o faça, você recebe os seguintes benefícios: enquanto estiver em um surto de adrenalina, o seu ataque extra passa a custar 1 PE, você recebe +3 metros de Deslocamento e a sua DEF aumenta em 2."
  },
  {
    "class": "Restringido",
    "level": 12,
    "name": "Pináculo Físico",
    "kind": "Escolha",
    "text": "Você recebe +4 pontos de estamina máximos e pode escolher aumentar o valor de dois atributos entre Força, Destreza e Constituição em 2. No nível 16, o valor de ambos os atributos escolhidos aumentam novamente em 2."
  },
  {
    "class": "Restringido",
    "level": 12,
    "name": "Rejeitar a Morte",
    "kind": "Escolha",
    "text": "Quando estiver nas portas da morte, você pode escolher receber uma falha garantida para fazer um teste de Fortitude contra a CD X, sendo X igual a 15 + 1 para cada 3 pontos de vida negativos. Se passar, você fica com 1 de vida e recebe 1 ponto de exaustão. [Pré-Requisito: Ainda de Pé]",
    "prereq": "Ainda de Pé",
    "req": {}
  },
  {
    "class": "Restringido",
    "level": 16,
    "name": "Entre as Sombras",
    "kind": "Escolha",
    "text": "Agora o Ataque Furtivo aplica quando você está em camuflagem ou cobertura.\n\nAlém disso, quando for realizar um Ataque Furtivo, você pode ignorar parcialmente as regras de vantagem e acumular até uma vantagem adicional (totalizando 3d20).\n\nCaso ele seja um acerto garantido, além do efeito normal, a sua margem de crítico é reduzida em 2. Pré-Requisito: Arremetida Encoberta."
  },
  {
    "class": "Restringido",
    "level": 16,
    "name": "Instintos Aguçados",
    "kind": "Escolha",
    "text": "Enquanto seus pontos de estamina e de vida excederem metade do máximo deles, você recebe uma reação adicional por rodada. Pré-Requisito: Reação Rápida.\n\n 123"
  },
  {
    "class": "Restringido",
    "level": 16,
    "name": "Mesmo Morto",
    "kind": "Escolha",
    "text": "Mesmo se você não tiver mais força vital, é necessário continuar lutando até o limite.\n\nAo cair para 0 de vida, sem possuir um uso de Ainda de Pé, ao invés de ir para as Portas da Morte você continua de pé e realizando seus turnos normalmente; porém, no final de todo turno, você deve realizar um teste de resistência de Fortitude com CD25 + 1 para cada 5 pontos de vida negativos que possuir. Caso falhe no teste, você cai imediatamente, com 1 falha nos testes de morte. [Pré-Requisito: Rejeitar a Morte]",
    "prereq": "Rejeitar a Morte",
    "req": {}
  },
  {
    "class": "Restringido",
    "level": 20,
    "name": "Liberação do Destino",
    "kind": "Automática",
    "text": "Entrada oficial de Restringido, desbloqueada no nível 20. Texto completo ainda em revisão; use este campo para anotar o trecho oficial da mesa até a biblioteca ser conferida 100%."
  }
];


const ABILITY_TEXT_PATCHES = {
  'Lutador|Corpo Treinado': 'Habilidade base automática. Representa o corpo condicionado do Lutador: use como referência para registrar bônus físicos, treino corporal e interações de combate corpo-a-corpo conforme a mesa aplicar o texto oficial.',
  'Lutador|Empolgação': 'Habilidade base automática. Recurso central do Lutador para entrar no ritmo da luta. Registre aqui efeitos, gatilhos e gastos conforme a ficha do personagem.',
  'Lutador|Reflexo Evasivo': 'Habilidade automática de evolução do Lutador. Usada como marco de melhoria defensiva/evasiva; não consome escolha de evolução.',
  'Especialista em Combate|Repertório do Especialista': 'Habilidade base automática. Permite escolher um estilo/repertório de combate. Preencha o estilo escolhido nas observações da habilidade.',
  'Especialista em Combate|Arte do Combate': 'Habilidade base automática. Recurso central do Especialista em Combate, ligado aos Pontos de Preparo e opções de manobra.',
  'Especialista em Combate|Golpe Especial': 'Habilidade automática do nível 4. Não consome escolha de evolução; adiciona o marco de golpe especial da especialização.',
  'Especialista em Técnica|Domínio dos Fundamentos': 'Habilidade base automática. Você aprende Mudanças de Fundamento, começando com duas no 1º nível e recebendo outra no 12º nível. Anote as mudanças escolhidas dentro desta habilidade.',
  'Especialista em Técnica|Conjuração Aprimorada': 'Habilidade automática da especialização. Marco de melhoria da conjuração; use para registrar o benefício oficial aplicado ao personagem.',
  'Especialista em Técnica|Adiantar Evolução': 'Habilidade automática do nível 4. Não consome escolha de evolução; registra o avanço estrutural da especialização.',
  'Controlador|Treinamento em Controle': 'Habilidade base automática. Ponto central do Controlador, usado para registrar regras de invocações, controle e comando.',
  'Suporte|Suporte em Combate': 'Habilidade base automática. Recurso central do Suporte para auxiliar aliados durante cena e combate.',
  'Suporte|Presença Inspiradora': 'Habilidade automática do nível 3. Não consome escolha de evolução; registra o marco de inspiração da especialização.',
  'Suporte|Versatilidade': 'Habilidade automática do nível 5. Não consome escolha de evolução; registra a evolução ampla do Suporte.',
  'Restringido|Restrito pelos Céus': 'Habilidade base automática. Define o personagem Restringido: foco físico excepcional, sem progressão normal de aptidões amaldiçoadas por padrão.',
  'Restringido|Ataque Furtivo': 'Habilidade automática do Restringido. Não consome escolha de evolução; registra o marco ofensivo furtivo da especialização.',
  'Restringido|Esquiva Sobre-humana': 'Habilidade automática do nível 3. Não consome escolha de evolução; registra o marco defensivo/evasivo do Restringido.',
  'Restringido|Implemento Celeste': 'Habilidade automática do nível 4. Não consome escolha de evolução; registre aqui o implemento escolhido e seus efeitos.',
  'Restringido|Dádiva do Céu': 'Habilidade automática do nível 4. Não consome escolha de evolução; registra a dádiva física ligada à restrição.'
};
ABILITY_LIBRARY.forEach(a=>{
  const key=`${a.class}|${a.name}`;
  if(ABILITY_TEXT_PATCHES[key]) a.text = ABILITY_TEXT_PATCHES[key];
  if(String(a.kind||'').toLowerCase().startsWith('autom')) a.slot = 'automatica';
  else a.slot = 'escolha';
});


// Entradas estruturais por nível de desbloqueio. Elas seguram a organização por nível
// até o cadastro oficial completo de cada habilidade do Livro de Regras.
const ABILITY_UNLOCK_PLACEHOLDERS = [];
['Lutador','Especialista em Combate','Especialista em Técnica','Controlador','Suporte','Restringido'].forEach(cls=>{
  [4,6,8,10,12,14,16,18,20].forEach(lvl=>{
    if(!ABILITY_LIBRARY.some(a=>a.class===cls && abilityReqLevel(a)===lvl)){
      ABILITY_LIBRARY.push({class:cls, level:lvl, name:`${cls} — habilidade de nível ${lvl}`, text:'Espaço reservado para cadastrar a habilidade oficial desbloqueada neste nível conforme o Livro de Regras.'});
    }
  });
});

const TECH_LIBRARY = [
  {tech:'Boneco de Palha', name:'Disparo de Pregos', level:0, action:'Ação Comum', range:'9m', target:'Uma criatura', duration:'Imediata', cost:'1 PE + 1 por prego adicional', text:'Dispara pregos contra o alvo. Dano base 1d8 por prego e pode prender pregos no alvo.'},
  {tech:'Boneco de Palha', name:'Redirecionamento Constante', level:0, action:'Passiva', range:'—', target:'Pregos', duration:'—', cost:'—', text:'Redireciona pregos que não ficaram presos no alvo para melhor aproveitamento futuro.'},
  {tech:'Boneco de Palha', name:'Grampo de Cabelo', level:1, action:'Ação Comum', range:'12m', target:'Pregos', duration:'Imediata', cost:'Definir conforme mesa', text:'Explode pregos, causando dano de força em área próxima. Pode usar Reflexos ou Fortitude conforme a posição dos pregos.'},
  {tech:'Boneco de Palha', name:'Ressonância', level:1, action:'Ação Comum', range:'Infinito', target:'Boneca de palha', duration:'Imediata', cost:'Definir conforme mesa', text:'Reflete dano através de um vestígio conectado à boneca de palha.'},
  {tech:'Boneco de Palha', name:'Explosão Repentina', level:2, action:'Reação', range:'Infinito', target:'Boneca de palha', duration:'Imediata', cost:'Definir conforme mesa', text:'Usa ressonância como reação quando um aliado ataca um inimigo do qual você possui vestígio.'},
  {tech:'Boneco de Palha', name:'Decepar', level:3, action:'Ação Comum', range:'12m', target:'Uma criatura', duration:'Imediata', cost:'Definir conforme mesa', text:'Dispara um prego concentrado para causar dano elevado e obter vestígio do alvo.'},
  {tech:'Boogie Woogie', name:'Troca de Posição', level:0, action:'Livre/Especial', range:'Variável', target:'Criaturas/objetos', duration:'Imediata', cost:'Definir conforme mesa', text:'Troca posições ao bater palmas, conforme funcionamento básico da técnica.'},
  {tech:'Cópia', name:'Copiar Técnica', level:0, action:'Especial', range:'Variável', target:'Uma técnica observada', duration:'Conforme técnica', cost:'Definir conforme mesa', text:'Modelo para registrar uma técnica copiada e suas condições de uso.'},
  {tech:'Técnica própria', name:'Feitiço Personalizado', level:0, action:'Definir', range:'Definir', target:'Definir', duration:'Definir', cost:'Definir', text:'Modelo em branco para habilidade criada pelo jogador.'}
];

const RULES = [
  {title:'Automação atual', text:'PV, PE/Estamina, Defesa, Atenção, Iniciativa, CD e perícias são calculados a partir de nível, atributos, classe e treinamento.'},
  {title:'v0.7', text:'Habilidades separadas por abas de nível.'},
  {title:'v0.8', text:'Aba de habilidades corrigida para nível necessário de desbloqueio, com filtros por nível exigido.'},
  {title:'v0.9', text:'Biblioteca oficial inicial de habilidades por especialização e requisito de nível cadastrada pelo nome.'},
  {title:'v0.10', text:'Abas de nível removidas da ficha; talentos gerais e expansões de domínio ganharam biblioteca e cadastro próprio.'},
  {title:'v0.11', text:'Talentos gerais e de origem receberam biblioteca ampliada, busca, categorias e bloqueios por nível, origem, atributo, perícia e domínio.'},
  {title:'v0.13', text:'Técnica inata ganhou área própria; feitiços são adicionados em janela com filtro por técnica e nível. Inclui guia de publicação.'},
  {title:'Depois', text:'Próxima etapa: completar técnicas/feitiços do livro, textos oficiais das habilidades e iniciar biblioteca real de equipamentos/itens.'}
];

let sheets = readJsonStorage(['femSheetsV13','femSheetsV10','femSheetsV09','femSheetsV08','femSheetsV07','femSheetsV06','femSheetsV05','femSheetsV04'], []);
let activeId = safeStorage.get('femActiveV13') || safeStorage.get('femActiveV10') || safeStorage.get('femActiveV09') || safeStorage.get('femActiveV08') || safeStorage.get('femActiveV07') || safeStorage.get('femActiveV06') || safeStorage.get('femActiveV05') || safeStorage.get('femActiveV04') || null;
let wizardData = null;
let wizardStep = 0;
let abilitySheetLevelFilter = 'all';
let abilityLibraryLevelFilter = 'all';
let abilitySearchFilter = '';
let abilityClassFilter = 'current';
let abilityKindFilter = 'all';
let activeItemModIndex = null;
const wizardSteps = ['Identidade','Origem','Especialização','Atributos','Treinamentos','Resumo'];

function mod(v){ return Math.floor((Number(v||10)-10)/2); }
function sgn(v){ return v>=0 ? '+'+v : String(v); }
function halfLevel(lvl){ return Math.floor(Number(lvl||1)/2); }
function trainingBonus(level){ level=Number(level||1); if(level>=17) return 6; if(level>=13) return 5; if(level>=9) return 4; if(level>=5) return 3; return 2; }
function gradeByLevel(level){ level=Number(level||1); if(level>=17) return 'Grau Especial'; if(level>=13) return '1º Grau'; if(level>=9) return '2º Grau'; if(level>=5) return '3º Grau'; return '4º Grau'; }
function rollAttributeValue(){ const rolls=Array.from({length:4},()=>Math.floor(Math.random()*6)+1).sort((a,b)=>a-b); const kept=rolls.slice(1); return {rolls, total:kept.reduce((a,b)=>a+b,0)}; }
function rollAttributeSet(){ return Array.from({length:6},()=>rollAttributeValue()); }
function fixedAttributeSet(){ return [15,14,13,12,10,8].map(v=>({rolls:[v], total:v, fixed:true})); }
function attributePoolValues(data){ return (data.attributeRolls||[]).map(r=>Number(r.total)); }
function usedAttributeValues(data, exceptAttr=''){ const used=[]; for(const a of ATTRS){ if(a!==exceptAttr && data.attributeAssignments?.[a] !== undefined && data.attributeAssignments?.[a] !== '') used.push(Number(data.attributeAssignments[a])); } return used; }
function countValue(list,value){ return list.filter(v=>Number(v)===Number(value)).length; }
function attributeAssignmentComplete(data){ return ATTRS.every(a=>data.attributeAssignments?.[a] !== undefined && data.attributeAssignments?.[a] !== ''); }
function syncAttributesFromAssignments(data){ if(attributeAssignmentComplete(data)){ ATTRS.forEach(a=>data.attributes[a]=Number(data.attributeAssignments[a])); } return data; }
function trainValue(level, rank){ const bt=trainingBonus(level); if(rank==='master') return Math.ceil(bt*1.5); if(rank==='trained') return bt; return 0; }
function aptitudePointsTotal(sheet){
  if(sheet.origin==='Restringido' || sheet.specialization==='Restringido') return 0;
  return Math.floor(Number(sheet.level||1)/2);
}
function aptitudePointsSpent(sheet){
  const levels = sheet.aptitudeLevels || {};
  return APTITUDE_KEYS.reduce((sum,a)=>sum + Number(levels[a.key]||0),0);
}
function aptitudePointsLeft(sheet){ return aptitudePointsTotal(sheet) - aptitudePointsSpent(sheet); }
function canUseAptitude(sheet, apt){
  if(sheet.origin==='Restringido' || sheet.specialization==='Restringido') return {ok:false, reason:'Restringido não recebe aptidões amaldiçoadas por padrão.'};
  const req=apt.req||{};
  for(const [key,val] of Object.entries(req)){
    if(Number(sheet.aptitudeLevels?.[key]||0) < Number(val)){
      const label = APTITUDE_KEYS.find(a=>a.key===key)?.sigla || key;
      return {ok:false, reason:`Requer ${label} ${val}.`};
    }
  }
  if(sheet.aptitudeChoices?.some(x=>x.name===apt.name)) return {ok:false, reason:'Já adicionada.'};
  return {ok:true, reason:'Disponível'};
}
function skillTotal(sheet, skill){ const rank=sheet.skillRanks?.[skill.name] || 'none'; const extra=Number(sheet.skillExtras?.[skill.name]||0); return mod(sheet.attributes[skill.attr]) + halfLevel(sheet.level) + trainValue(sheet.level, rank) + extra; }
function current(){ return sheets.find(s=>s.id===activeId); }
function save(){ safeStorage.set('femSheetsV13', JSON.stringify(sheets)); if(activeId) safeStorage.set('femActiveV13', activeId); }
function blankSheet(){
  const skillRanks={}, skillExtras={}; SKILLS.forEach(([name])=>{ skillRanks[name]='none'; skillExtras[name]=0; });
  return { id:makeId(), name:'', player:'', level:1, grade:'4º Grau', origin:'Inato', specialization:'Lutador', innateTechnique:'', innateTechniqueText:'', keyAttribute:'Força', hp:0, hpMax:0, pe:0, peMax:0, defense:10, attention:10, initiative:0, movement:9, dc:10, attributes:{'Força':10,'Destreza':10,'Constituição':10,'Inteligência':10,'Sabedoria':10,'Presença':10}, attributeMethod:'rolling', attributeRolls:[], attributeAssignments:{}, skillRanks, skillExtras, aptitudeLevels:{aura:0,controle:0,barreira:0,dominio:0,reversa:0}, aptitudeChoices:[], abilities:[], talents:[], techniques:[], domains:[], attacks:[], items:[], traits:'', ideals:'', bonds:'', complications:'', innateDomain:'', notes:'', automationNotes:'' };
}
function normalize(sheet){
  const base=blankSheet();
  sheet = {...base, ...sheet, attributes:{...base.attributes, ...(sheet.attributes||{})}, attributeAssignments:{...base.attributeAssignments, ...(sheet.attributeAssignments||{})}, skillRanks:{...base.skillRanks, ...(sheet.skillRanks||{})}, skillExtras:{...base.skillExtras, ...(sheet.skillExtras||{})}, aptitudeLevels:{...base.aptitudeLevels, ...(sheet.aptitudeLevels||{})}};
  sheet.attributeRolls = Array.isArray(sheet.attributeRolls) ? sheet.attributeRolls : [];
  ['abilities','talents','techniques','domains','attacks','items','aptitudeChoices'].forEach(k=>sheet[k]=Array.isArray(sheet[k])?sheet[k]:[]);
  sheet.domains = sheet.domains.map(d=>({name:d.name||'', type:d.type||'', technique:d.technique||'', level:d.level ?? '', cost:d.cost||'', area:d.area||'', duration:d.duration||'', text:d.text||''}));
  sheet.techniques = sheet.techniques.map(t=>({name:t.name||'', tech:t.tech || t.technique || '', level:t.level ?? '', action:t.action||'', range:t.range||'', target:t.target||'', duration:t.duration||'', cost:t.cost||'', text:t.text||''}));
  sheet.abilities = sheet.abilities.map(a=>({level:a.level ?? a.nivel ?? '', class:a.class ?? a.classe ?? '', kind:a.kind ?? '', name:a.name||'', text:a.text||''}));
  sheet.items = sheet.items.map(it=>({name:it.name||'', category:it.category||'Item', cost:it.cost??'', qty:it.qty||1, weight:it.weight||0, damage:it.damage||'', properties:it.properties||'', grade:it.grade||'', enchantmentCharges:it.enchantmentCharges??'', uniqueAbility:it.uniqueAbility||'', modifications:Array.isArray(it.modifications)?it.modifications:[], text:it.text||''}));
  return sheet;
}
function applyAutoValues(sheet, opts={keepCurrent:true}){
  sheet=normalize(sheet);
  const cls=CLASSES[sheet.specialization] || CLASSES.Lutador;
  if(!cls.keys.includes(sheet.keyAttribute)) sheet.keyAttribute = cls.keys[0];
  const con=mod(sheet.attributes['Constituição']);
  const key=mod(sheet.attributes[sheet.keyAttribute] || 10);
  const hp = Math.max(1, cls.hp1 + con + (Math.max(1, sheet.level)-1)*(cls.hpFixed + con));
  let pe = cls.pe ? cls.pe * sheet.level : (cls.stamina ? cls.stamina * sheet.level : 0);
  if(cls.peKeyOnce) pe += key;
  sheet.hpMax = hp;
  sheet.peMax = Math.max(0, pe);
  if(!opts.keepCurrent || !sheet.hp) sheet.hp = hp;
  if(!opts.keepCurrent || !sheet.pe) sheet.pe = sheet.peMax;
  sheet.grade = gradeByLevel(sheet.level);
  sheet.dc = 10 + halfLevel(sheet.level) + trainingBonus(sheet.level) + key;
  sheet.defense = 10 + mod(sheet.attributes['Destreza']) + (sheet.specialization==='Restringido' ? Math.min(sheet.level, Math.max(mod(sheet.attributes['Força']), mod(sheet.attributes['Constituição']), 0)) : 0);
  sheet.attention = 10 + skillTotal(sheet, {name:'Percepção', attr:'Sabedoria'});
  sheet.initiative = skillTotal(sheet, {name:'Reflexos', attr:'Destreza'});
  sheet.movement = sheet.origin==='Restringido' || sheet.specialization==='Restringido' ? 12 : 9;
  const auto = [];
  auto.push(`BT +${trainingBonus(sheet.level)}; metade do nível: ${halfLevel(sheet.level)}; CD: ${sheet.dc}.`);
  auto.push(`PV sugerido: ${cls.hp1}+CON no 1º nível; depois ${cls.hpFixed}+CON por nível.`);
  auto.push(cls.stamina ? `Estamina sugerida: ${cls.stamina} por nível.` : `PE sugerido: ${cls.pe} por nível${cls.peKeyOnce ? ' + modificador do atributo-chave uma vez' : ''}.`);
  auto.push(`Treinamentos da especialização: ${cls.trainings}`);
  auto.push(`Aptidões: ${aptitudePointsSpent(sheet)}/${aptitudePointsTotal(sheet)} pontos usados.`);
  sheet.automationNotes = auto.join('\n');
  return sheet;
}
function applyDefaultSkills(sheet){
  sheet=normalize(sheet); const cls=CLASSES[sheet.specialization] || CLASSES.Lutador;
  [...(cls.defaultSkills||[]),'Fortitude','Reflexos'].forEach(s=>{ if(sheet.skillRanks[s]) sheet.skillRanks[s]='trained'; });
  if(['Especialista em Técnica','Controlador','Suporte'].includes(sheet.specialization)){ sheet.skillRanks['Astúcia']='trained'; sheet.skillRanks['Vontade']='trained'; }
  if(sheet.specialization==='Restringido'){ sheet.skillRanks['Fortitude']='trained'; sheet.skillRanks['Reflexos']='trained'; sheet.skillRanks['Feitiçaria']='none'; }
  return sheet;
}
function addBaseAbilities(sheet){
  const cls=CLASSES[sheet.specialization] || CLASSES.Lutador;
  cls.baseAbilities.forEach(name=>{ if(!sheet.abilities.some(a=>a.name===name)){ const lib=ABILITY_LIBRARY.find(a=>a.name===name); sheet.abilities.push({name, class:sheet.specialization, level:lib?.level || 1, kind:lib?.kind || 'Automática', text:lib?.text || 'Habilidade base da especialização.'}); } });
}

function activateTab(id){ $$('.tab').forEach(t=>t.classList.toggle('active', t.id===id)); $$('.nav button').forEach(b=>b.classList.toggle('active', b.dataset.tab===id)); }
function activateSubtab(id){ $$('.subtab').forEach(t=>t.classList.toggle('active', t.id===id)); $$('.subnav button').forEach(b=>b.classList.toggle('active', b.dataset.subtab===id)); }

function renderSheetList(){
  const wrap=$('#sheetList');
  if(!sheets.length){ wrap.innerHTML='<p class="muted">Nenhuma ficha criada.</p>'; return; }
  wrap.innerHTML=sheets.map(s=>`<button class="sheet-item ${s.id===activeId?'active':''}" data-sheet="${s.id}"><strong>${esc(s.name||'Sem nome')}</strong><span>${esc(s.origin)} • ${esc(s.specialization)} • Nv. ${esc(s.level)}</span></button>`).join('');
  $$('[data-sheet]').forEach(b=>b.onclick=()=>{ activeId=b.dataset.sheet; save(); renderAll(); activateTab('fichas'); });
}
function renderEditor(){
  const sheet=current();
  $('#emptyState').classList.toggle('hidden', !!sheet);
  $('#sheetEditor').classList.toggle('hidden', !sheet);
  if(!sheet) return;
  applyAutoValues(sheet); save();
  $('#currentName').textContent=sheet.name || 'Sem nome';
  $('#currentSummary').textContent=`${sheet.origin || 'Sem origem'} • ${sheet.specialization || 'Sem especialização'} • ${sheet.innateTechnique || 'Sem técnica inata definida'}`;
  $('[data-view="level"]').textContent=sheet.level;
  $('#btView').textContent='+'+trainingBonus(sheet.level);
  $('#gradeView').textContent=sheet.grade;
  $('#dcView').textContent=sheet.dc;
  fillSelect('#originSelect', ORIGINS.map(o=>o.name), sheet.origin);
  fillSelect('#classSelect', Object.keys(CLASSES), sheet.specialization);
  fillSelect('#keyAttributeSelect', (CLASSES[sheet.specialization]||CLASSES.Lutador).keys, sheet.keyAttribute);
  $$('[data-bind]').forEach(el=>{ const key=el.dataset.bind; if(el.value !== String(sheet[key] ?? '')) el.value = sheet[key] ?? ''; el.oninput=()=>{ sheet[key] = el.type==='number' ? Number(el.value) : el.value; if(['level','origin','specialization','keyAttribute'].includes(key)){ applyAutoValues(sheet,{keepCurrent:false}); } save(); renderEditor(); }; });
  renderAttributes(sheet); renderCalcCards(sheet); renderLevelSummary(sheet); renderAptitudes(sheet); renderSkills(sheet); renderRows(sheet); renderTechLibrary();
}
function fillSelect(sel, values, selected){ const el=$(sel); if(!el) return; el.innerHTML=values.map(v=>`<option ${v===selected?'selected':''}>${esc(v)}</option>`).join(''); }
function renderAttributes(sheet){
  $('#attributes').innerHTML=ATTRS.map(a=>`<div class="attr-box"><strong>${a}</strong><input data-attr="${a}" type="number" value="${sheet.attributes[a]}"><small><span>Mod.</span><b>${sgn(mod(sheet.attributes[a]))}</b></small><button data-roll-attr="${a}">Rolar d20 ${sgn(mod(sheet.attributes[a]))}</button></div>`).join('');
  $$('[data-attr]').forEach(i=>i.oninput=()=>{ sheet.attributes[i.dataset.attr]=Number(i.value); applyAutoValues(sheet,{keepCurrent:false}); save(); renderEditor(); });
  $$('[data-roll-attr]').forEach(btn=>btn.onclick=()=>{ const a=btn.dataset.rollAttr; roll(`1d20${sgn(mod(sheet.attributes[a]))}`, a); });
}
function renderCalcCards(sheet){
  const cls=CLASSES[sheet.specialization]||CLASSES.Lutador;
  $('#calcCards').innerHTML=`
    <div class="calc-card"><span>PV máximo</span><strong>${sheet.hpMax}</strong><small>${cls.hp1}+CON; +${cls.hpFixed}+CON por nível</small></div>
    <div class="calc-card"><span>${cls.stamina?'Estamina':'PE'} máximo</span><strong>${sheet.peMax}</strong><small>${cls.stamina?cls.stamina+' por nível':cls.pe+' por nível'}</small></div>
    <div class="calc-card"><span>Defesa</span><strong>${sheet.defense}</strong><small>10 + DES${sheet.specialization==='Restringido'?' + físico limitado por nível':''}</small></div>
    <div class="calc-card"><span>CD</span><strong>${sheet.dc}</strong><small>10 + 1/2 nível + BT + atributo-chave</small></div>`;
  $$('#calcCards .calc-card').forEach(()=>{});
}
function renderLevelSummary(sheet){
  const lv=Number(sheet.level||1), bt=trainingBonus(lv), grants=[];
  grants.push(`Bônus de treinamento: +${bt}`);
  grants.push(`Metade do nível em testes: +${halfLevel(lv)}`);
  if([4,8,12,16,20].some(n=>lv>=n)) grants.push(`${Math.floor(lv/4)*2} pontos de atributo obtidos até aqui.`);
  if(lv>=10) grants.push('Pode ter uma perícia mestre por regra geral.');
  grants.push(sheet.specialization==='Restringido'?'Não recebe aptidões amaldiçoadas por padrão.':'Recebe aptidões amaldiçoadas ao subir de nível.');
  $('#levelSummary').innerHTML=grants.map((g,i)=>`<div class="rule-card"><h3>${i+1}</h3><p>${esc(g)}</p></div>`).join('');
}
function renderAptitudes(sheet){
  if(!$('#aptitudeLevels')) return;
  const total=aptitudePointsTotal(sheet), spent=aptitudePointsSpent(sheet), left=aptitudePointsLeft(sheet);
  $('#aptitudePointsView').textContent = `${Math.max(0,left)} / ${total}`;
  const blocked = sheet.origin==='Restringido' || sheet.specialization==='Restringido';
  $('#aptitudeLevels').innerHTML = APTITUDE_KEYS.map(a=>{
    const val=Number(sheet.aptitudeLevels?.[a.key]||0);
    const canUp = !blocked && val<5 && left>0;
    const canDown = val>0;
    return `<div class="apt-card"><div><strong>${a.name} <span>${a.sigla}</span></strong><p class="muted">${a.desc}</p></div><div class="apt-level"><button data-apt-down="${a.key}" ${canDown?'':'disabled'}>-</button><b>${val}</b><button data-apt-up="${a.key}" ${canUp?'':'disabled'}>+</button></div></div>`;
  }).join('') + (blocked ? '<p class="muted full">Este personagem é Restringido, então a ficha bloqueia aptidões por padrão. Se o narrador permitir exceção, use Aptidão Personalizada nas escolhas.</p>' : '');
  $('#aptitudeChoicesList').innerHTML = sheet.aptitudeChoices.length ? sheet.aptitudeChoices.map((x,i)=>row('aptitudeChoices',x,i)).join('') : '<p class="muted">Nenhuma aptidão escolhida ainda.</p>';
  $$('[data-apt-up]').forEach(btn=>btn.onclick=()=>{ const k=btn.dataset.aptUp; if(aptitudePointsLeft(sheet)>0 && Number(sheet.aptitudeLevels[k]||0)<5){ sheet.aptitudeLevels[k]=Number(sheet.aptitudeLevels[k]||0)+1; applyAutoValues(sheet,{keepCurrent:true}); save(); renderEditor(); }});
  $$('[data-apt-down]').forEach(btn=>btn.onclick=()=>{ const k=btn.dataset.aptDown; if(Number(sheet.aptitudeLevels[k]||0)>0){ sheet.aptitudeLevels[k]=Number(sheet.aptitudeLevels[k]||0)-1; applyAutoValues(sheet,{keepCurrent:true}); save(); renderEditor(); }});
}

function renderSkills(sheet){
  $('#skills').innerHTML=SKILLS.map(([name,attr,req])=>{
    const rank=sheet.skillRanks[name]||'none', extra=sheet.skillExtras[name]||0, total=skillTotal(sheet,{name,attr});
    return `<div class="skill-row"><strong>${name}${req?' *':''}</strong><span>${attr} ${sgn(mod(sheet.attributes[attr]))}</span><select data-skill-rank="${name}"><option value="none" ${rank==='none'?'selected':''}>Sem treino</option><option value="trained" ${rank==='trained'?'selected':''}>Treinado</option><option value="master" ${rank==='master'?'selected':''}>Mestre</option></select><input data-skill-extra="${name}" type="number" value="${extra}" title="Bônus extra"><span class="skill-total">${sgn(total)}</span><button data-roll-skill="${name}">d20</button></div>`;
  }).join('');
  $$('[data-skill-rank]').forEach(el=>el.oninput=()=>{ sheet.skillRanks[el.dataset.skillRank]=el.value; applyAutoValues(sheet,{keepCurrent:true}); save(); renderEditor(); });
  $$('[data-skill-extra]').forEach(el=>el.oninput=()=>{ sheet.skillExtras[el.dataset.skillExtra]=Number(el.value||0); applyAutoValues(sheet,{keepCurrent:true}); save(); renderEditor(); });
  $$('[data-roll-skill]').forEach(btn=>btn.onclick=()=>{ const name=btn.dataset.rollSkill; const def=SKILLS.find(s=>s[0]===name); roll(`1d20${sgn(skillTotal(sheet,{name,attr:def[1]}))}`, name); });
}

function abilityReqLevel(a){ return Number(a.requiredLevel ?? a.unlockLevel ?? a.level ?? 1); }
function abilityLevelLabel(level){ return level==='' || level===undefined || level===null ? 'Personalizada' : `Requer nível ${level}`; }

function abilityChoiceSlots(sheet){
  // No Livro, a partir do 2º nível o avanço pode virar habilidade de especialização ou talento.
  // O 1º nível é tratado separadamente como habilidades base automáticas.
  return Math.max(0, Number(sheet.level||1) - 1);
}
function abilityChoicesUsed(sheet){
  const chosenAbilities = (sheet.abilities||[]).filter(a => String(a.kind||'').toLowerCase() !== 'automática' && String(a.kind||'').toLowerCase() !== 'automatica').length;
  const chosenTalents = (sheet.talents||[]).length;
  return chosenAbilities + chosenTalents;
}
function automaticAbilitiesDue(sheet){
  const lv=Number(sheet.level||1), cls=sheet.specialization;
  return ABILITY_LIBRARY.filter(a => a.class===cls && String(a.kind||'').toLowerCase().startsWith('autom') && abilityReqLevel(a)<=lv);
}
function missingAutomaticAbilities(sheet){
  return automaticAbilitiesDue(sheet).filter(a => !(sheet.abilities||[]).some(x=>x.name===a.name));
}
function addMissingAutomaticAbilities(sheet){
  missingAutomaticAbilities(sheet).forEach(a=>{
    const req=abilityReqLevel(a);
    sheet.abilities.push({name:a.name, class:a.class, level:req, kind:a.kind || 'Automática', text:a.text});
  });
}
function renderAbilityProgress(sheet){
  const el=$('#abilityProgress'); if(!el) return;
  const slots=abilityChoiceSlots(sheet), used=abilityChoicesUsed(sheet), left=Math.max(0, slots-used);
  const autosDue=automaticAbilitiesDue(sheet).length, autosMissing=missingAutomaticAbilities(sheet).length;
  const over = used>slots;
  const msg = over ? `Você usou ${used-slots} escolha(s) a mais do que o esperado para o nível atual.` : `${left} escolha(s) livre(s) para habilidade ou talento.`;
  el.innerHTML = `
    <div class="progress-card ${over?'warn':''}"><span>Escolhas de evolução</span><strong>${used}/${slots}</strong><small>${esc(msg)}</small></div>
    <div class="progress-card ${autosMissing?'warn':''}"><span>Automáticas da classe</span><strong>${autosDue-autosMissing}/${autosDue}</strong><small>${autosMissing?autosMissing+' automática(s) faltando.':'Tudo certo.'}</small></div>
    <div class="progress-card"><span>Especialização</span><strong>${esc(sheet.specialization)}</strong><small>Nível ${esc(sheet.level)} • ${esc(sheet.grade||'')}</small></div>
    <div class="progress-card action"><span>Correção rápida</span><button id="addMissingAutos" ${autosMissing?'':'disabled'}>Adicionar automáticas faltantes</button><small>Não consome escolha de evolução.</small></div>`;
  $('#addMissingAutos')?.addEventListener('click',()=>{ addMissingAutomaticAbilities(sheet); save(); renderRows(sheet); renderAbilityChooser(); });
}
function abilityKnownLevels(sheet){
  const levels = new Set();
  (sheet.abilities||[]).forEach(a => {
    if(a.level==='' || a.level===undefined || a.level===null) levels.add('custom');
    else levels.add(abilityReqLevel(a));
  });
  ABILITY_LIBRARY.forEach(a=>levels.add(abilityReqLevel(a)));
  return [...levels].sort((a,b)=>{
    if(a==='custom') return 1;
    if(b==='custom') return -1;
    return a-b;
  });
}
function renderAbilityLibraryTabs(sheet){
  const el=$('#abilityLibraryTabs'); if(!el) return;
  const levels=abilityKnownLevels(sheet).filter(l=>l!=='custom');
  el.innerHTML=[`<button data-ability-lib-tab="available" class="${abilityLibraryLevelFilter==='available'?'active':''}">Disponíveis agora</button>`,
    `<button data-ability-lib-tab="locked" class="${abilityLibraryLevelFilter==='locked'?'active':''}">Bloqueadas</button>`,
    `<button data-ability-lib-tab="all" class="${abilityLibraryLevelFilter==='all'?'active':''}">Todas</button>`]
    .concat(levels.map(l=>`<button data-ability-lib-tab="${l}" class="${String(abilityLibraryLevelFilter)===String(l)?'active':''}">Nível ${l}</button>`)).join('');
  $$('[data-ability-lib-tab]').forEach(btn=>btn.onclick=()=>{ abilityLibraryLevelFilter=btn.dataset.abilityLibTab; renderAbilityChooser(); });
}
function abilityMatchesSheetFilter(a){
  if(abilitySheetLevelFilter==='all') return true;
  if(abilitySheetLevelFilter==='custom') return a.level==='' || a.level===undefined || a.level===null;
  return abilityReqLevel(a)===Number(abilitySheetLevelFilter);
}

function isAbilityKnown(sheet, name){ return (sheet.abilities||[]).some(a=>a.name===name); }
function canUseAbility(sheet,a){
  const reasons=[];
  const reqLvl=abilityReqLevel(a);
  if(a.class && a.class!==sheet.specialization) reasons.push(`classe ${a.class}`);
  if(reqLvl>Number(sheet.level||1)) reasons.push(`nível ${reqLvl}`);
  const r=a.req||{};
  if(r.skillTrained && !isSkillTrained(sheet,r.skillTrained)) reasons.push(`treinado em ${r.skillTrained}`);
  if(r.skillMaster && !isSkillMaster(sheet,r.skillMaster)) reasons.push(`mestre em ${r.skillMaster}`);
  if(r.anySkillTrained && !r.anySkillTrained.some(s=>isSkillTrained(sheet,s))) reasons.push(`treinado em ${r.anySkillTrained.join(' ou ')}`);
  if(r.attr){ Object.entries(r.attr).forEach(([k,v])=>{ if(Number(sheet.attributes?.[k]||0)<Number(v)) reasons.push(`${k} ${v}`); }); }
  if(isAbilityKnown(sheet,a.name)) reasons.push('já adicionada');
  const isAuto=String(a.kind||'').toLowerCase().startsWith('autom');
  if(!isAuto && abilityChoicesUsed(sheet) >= abilityChoiceSlots(sheet)) reasons.push('sem escolhas livres');
  return {ok:reasons.length===0, reason:reasons.length?`Bloqueada: ${reasons.join(', ')}`:(isAuto?'Automática disponível':'Disponível como escolha de evolução')};
}


function cleanDiceExpression(value){
  const raw=String(value||'').trim();
  if(!raw || raw==='—') return '';
  const first = raw.split('/')[0].trim();
  const matches = first.match(/([+-]?\s*\d*d\d+|[+-]?\s*\d+)/gi);
  return matches ? matches.join(' ').replace(/\+\s*-/g,'-') : first;
}
function weaponAttackAttribute(item, sheet){
  const text = `${item.name||''} ${item.category||''} ${item.properties||''} ${item.text||''}`.toLowerCase();
  if(/distância|distancia|arremesso|proj[eé]til|arco|besta|arma de fogo|pistola|rifle|rev[oó]lver|metralhadora|shuriken|dardo|azagaia/.test(text)) return 'Destreza';
  const str=Number(sheet.attributes?.['Força']||10), dex=Number(sheet.attributes?.['Destreza']||10);
  return mod(dex)>mod(str) ? 'Destreza' : 'Força';
}
function itemModificationBonuses(item){
  const mods=Array.isArray(item.modifications)?item.modifications:[];
  return mods.reduce((acc,m)=>{ acc.attack += Number(m.attackBonus||0); acc.damage += Number(m.damageBonus||0); return acc; }, {attack:0, damage:0});
}
function buildAttackFromItem(sheet,item){
  const attr=weaponAttackAttribute(item,sheet);
  const mods=itemModificationBonuses(item);
  const attackBonus = mod(sheet.attributes?.[attr]||10) + trainingBonus(sheet.level||1) + mods.attack;
  const damageBonus = mod(sheet.attributes?.[attr]||10) + mods.damage;
  const baseDamage = cleanDiceExpression(item.damage || item.effect || '');
  const damage = baseDamage ? `${baseDamage}${damageBonus>=0?'+':''}${damageBonus}` : `1d4${damageBonus>=0?'+':''}${damageBonus}`;
  const modNames=(item.modifications||[]).map(m=>m.name).filter(Boolean);
  return {
    name: item.name || 'Ataque com arma',
    test: `1d20${attackBonus>=0?'+':''}${attackBonus}`,
    damage,
    sourceItem: item.name || '',
    notes: `Criado automaticamente a partir do inventário. Atributo sugerido: ${attr}.${modNames.length?' Modificações consideradas: '+modNames.join(', ')+'.':''} Ajuste acerto/dano se a mesa usar outro atributo, maestria ou bônus específico.`
  };
}
function createAttackFromInventoryItem(sheet,index){
  const item = sheet.items?.[Number(index)];
  if(!item) return;
  const atk = buildAttackFromItem(sheet,item);
  sheet.attacks.push(atk);
  save();
  renderRows(sheet);
}
function createAttacksFromAllWeapons(sheet){
  const before = sheet.attacks.length;
  (sheet.items||[]).forEach((item)=>{
    const hasDamage = cleanDiceExpression(item.damage||'');
    if(!hasDamage) return;
    const exists = sheet.attacks.some(a=>a.sourceItem===item.name || a.name===item.name);
    if(!exists) sheet.attacks.push(buildAttackFromItem(sheet,item));
  });
  save();
  renderRows(sheet);
  const made = sheet.attacks.length-before;
  if(made===0) alert('Nenhum novo ataque criado. Adicione equipamentos com dano no inventário ou remova ataques duplicados.');
}


function itemTypeForEnchantments(item){
  const cat=String(item.category||'');
  if(/escudo/i.test(cat)) return 'Escudo';
  if(/uniforme|armadura|roupa/i.test(cat)) return 'Uniforme';
  if(/arma/i.test(cat) || cleanDiceExpression(item.damage||'')) return 'Arma';
  return 'Geral';
}
function itemModificationSummary(item){
  const mods=Array.isArray(item.modifications)?item.modifications:[];
  if(!mods.length) return '<p class="muted">Nenhuma maldição/modificação aplicada.</p>';
  return `<div class="tag-list">${mods.map((m,idx)=>`<span class="badge soft">${esc(m.name)}${m.damageBonus?` • dano ${m.damageBonus>0?'+':''}${m.damageBonus}`:''}${m.attackBonus?` • acerto ${m.attackBonus>0?'+':''}${m.attackBonus}`:''} <button class="chip-x" title="Remover" data-remove-item-mod="${idx}" data-item-index="__ITEM_INDEX__">×</button></span>`).join('')}</div>`;
}
function openItemModificationChooser(index){
  activeItemModIndex=Number(index);
  renderItemModificationChooser();
  openDialog('itemModDialog');
}
function renderItemModificationChooser(){
  const sheet=current(); if(!sheet) return;
  const item=sheet.items?.[activeItemModIndex];
  if(!item) return;
  const q=($('#itemModSearch')?.value||'').toLowerCase();
  const filter=$('#itemModTypeFilter')?.value || 'auto';
  const type=filter==='auto'?itemTypeForEnchantments(item):filter;
  if($('#itemModTarget')) $('#itemModTarget').textContent = `${item.name || 'Item'} • tipo sugerido: ${type}`;
  const existing=new Set((item.modifications||[]).map(m=>m.name));
  const data=ITEM_ENCHANTMENT_LIBRARY.map((m,i)=>({m,i})).filter(({m})=>{
    const matchesType = type==='all' || m.applies?.includes(type) || m.applies?.includes('Geral');
    const matchesQ = !q || JSON.stringify(m).toLowerCase().includes(q);
    return matchesType && matchesQ;
  });
  $('#itemModChooser').innerHTML = data.map(({m,i})=>`<div class="library-card"><h3>${esc(m.name)}</h3><p class="muted">${esc((m.applies||[]).join(', '))} • ${esc(m.grade||'')} • Pré-req.: ${esc(m.prereq||'—')}</p><p><b>Efeito:</b> ${esc(m.properties||'—')}${m.damageBonus?` • <b>Dano:</b> ${m.damageBonus>0?'+':''}${m.damageBonus}`:''}${m.attackBonus?` • <b>Acerto:</b> ${m.attackBonus>0?'+':''}${m.attackBonus}`:''}</p><p>${esc(m.text||'')}</p><button data-add-item-mod="${i}" ${existing.has(m.name)?'disabled':''}>${existing.has(m.name)?'Já aplicada':'Aplicar neste item'}</button></div>`).join('') || '<p class="muted">Nenhuma maldição/modificação encontrada.</p>';
  $$('[data-add-item-mod]').forEach(btn=>btn.onclick=()=>{
    const m=ITEM_ENCHANTMENT_LIBRARY[Number(btn.dataset.addItemMod)];
    const it=sheet.items?.[activeItemModIndex]; if(!it) return;
    it.modifications=Array.isArray(it.modifications)?it.modifications:[];
    it.modifications.push({name:m.name, applies:m.applies||[], grade:m.grade||'', prereq:m.prereq||'', damageBonus:m.damageBonus||0, attackBonus:m.attackBonus||0, properties:m.properties||'', text:m.text||''});
    if(m.properties && !String(it.properties||'').includes(m.name)) it.properties = [it.properties, `${m.name}: ${m.properties}`].filter(Boolean).join('; ');
    save(); renderRows(sheet); renderItemModificationChooser();
  });
}

function row(kind,x,i){
  if(kind==='items') { const modsHtml=itemModificationSummary(x).replaceAll('__ITEM_INDEX__', String(i)); return `<div class="mini-row"><div class="row-head"><span class="badge">${esc(x.category||'Item')}</span>${x.cost!==undefined && x.cost!==''?`<span class="badge soft">Custo ${esc(x.cost)}</span>`:''}${x.grade?`<span class="badge soft">Grau ${esc(x.grade)}</span>`:''}${x.damage&&x.damage!=='—'?`<span class="badge soft">${esc(x.damage)}</span>`:''}</div><input data-row="items" data-i="${i}" data-field="name" placeholder="Item" value="${esc(x.name)}"><div class="form-grid"><label>Categoria<input data-row="items" data-i="${i}" data-field="category" value="${esc(x.category||'')}"></label><label>Custo<input data-row="items" data-i="${i}" data-field="cost" value="${esc(x.cost??'')}"></label><label>Qtd.<input data-row="items" data-i="${i}" data-field="qty" type="number" value="${x.qty||1}"></label><label>Espaços<input data-row="items" data-i="${i}" data-field="weight" type="number" step="0.5" value="${x.weight||0}"></label><label>Grau/Ferramenta amaldiçoada<input data-row="items" data-i="${i}" data-field="grade" placeholder="Ex.: Terceiro, Segundo, Especial" value="${esc(x.grade||'')}"></label><label>Cargas<input data-row="items" data-i="${i}" data-field="enchantmentCharges" placeholder="Ex.: igual ao BT" value="${esc(x.enchantmentCharges??'')}"></label><label>Dano/efeito<input data-row="items" data-i="${i}" data-field="damage" value="${esc(x.damage||'')}"></label><label>Propriedades<input data-row="items" data-i="${i}" data-field="properties" value="${esc(x.properties||'')}"></label></div><div class="mod-box"><strong>Maldições / modificações</strong>${modsHtml}</div><textarea data-row="items" data-i="${i}" data-field="uniqueAbility" placeholder="Habilidade única, caso seja Grau Especial">${esc(x.uniqueAbility||'')}</textarea><textarea data-row="items" data-i="${i}" data-field="text" placeholder="Descrição, efeitos e observações">${esc(x.text||'')}</textarea><div class="row-actions"><button data-open-item-mod="${i}">Adicionar maldição/modificação</button>${cleanDiceExpression(x.damage||'')?`<button data-create-attack-from-item="${i}">Criar ataque</button>`:''}<button data-del="items" data-i="${i}">Remover</button></div></div>`; }
  if(kind==='attacks') return `<div class="mini-row"><input data-row="attacks" data-i="${i}" data-field="name" placeholder="Nome do ataque" value="${esc(x.name)}"><div class="form-grid"><label>Rolagem de acerto<input data-row="attacks" data-i="${i}" data-field="test" placeholder="Ex.: 1d20+5" value="${esc(x.test||'1d20')}"></label><label>Rolagem de dano<input data-row="attacks" data-i="${i}" data-field="damage" placeholder="Ex.: 1d8+3 ou 1d6 Ct + 1d6 Pf" value="${esc(x.damage||'1d8')}"></label></div><textarea data-row="attacks" data-i="${i}" data-field="notes" placeholder="Notas">${esc(x.notes)}</textarea><div class="row-actions"><button data-roll-attack-hit="${i}">Rolar acerto</button><button data-roll-attack-damage="${i}">Rolar dano</button><button data-del="attacks" data-i="${i}">Remover</button></div></div>`;
  if(kind==='techniques') return `<div class="mini-row"><div class="row-head"><span class="badge">${esc(x.tech || 'Feitiço')}</span>${x.level!==''?`<span class="badge soft">Nível ${esc(x.level)}</span>`:''}</div><input data-row="techniques" data-i="${i}" data-field="name" placeholder="Nome" value="${esc(x.name)}"><div class="form-grid"><input data-row="techniques" data-i="${i}" data-field="tech" placeholder="Técnica vinculada" value="${esc(x.tech||'')}"><input data-row="techniques" data-i="${i}" data-field="level" placeholder="Nível" value="${esc(x.level)}"><input data-row="techniques" data-i="${i}" data-field="action" placeholder="Conjuração" value="${esc(x.action||'')}"><input data-row="techniques" data-i="${i}" data-field="range" placeholder="Alcance" value="${esc(x.range||'')}"><input data-row="techniques" data-i="${i}" data-field="target" placeholder="Alvo" value="${esc(x.target||'')}"><input data-row="techniques" data-i="${i}" data-field="duration" placeholder="Duração" value="${esc(x.duration||'')}"><input data-row="techniques" data-i="${i}" data-field="cost" placeholder="Custo" value="${esc(x.cost||'')}"></div><textarea data-row="techniques" data-i="${i}" data-field="text" placeholder="Descrição">${esc(x.text)}</textarea><button data-del="techniques" data-i="${i}">Remover</button></div>`;
  if(kind==='abilities') return `<div class="mini-row"><div class="row-head"><span class="badge">${esc(abilityLevelLabel(x.level))}</span>${x.class?`<span class="badge soft">${esc(x.class)}</span>`:''}${x.kind?`<span class="badge soft">${esc(x.kind)}</span>`:''}</div><input data-row="abilities" data-i="${i}" data-field="name" placeholder="Nome" value="${esc(x.name)}"><div class="form-grid"><label>Nível necessário<input data-row="abilities" data-i="${i}" data-field="level" type="number" min="1" max="20" value="${esc(x.level)}" placeholder="Livre"></label><label>Classe<input data-row="abilities" data-i="${i}" data-field="class" value="${esc(x.class)}" placeholder="Opcional"></label></div><textarea data-row="abilities" data-i="${i}" data-field="text" placeholder="Descrição">${esc(x.text)}</textarea><button data-del="abilities" data-i="${i}">Remover</button></div>`;
  if(kind==='talents') return `<div class="mini-row"><div class="row-head"><span class="badge">${esc(x.category||'Talento')}</span>${x.level?`<span class="badge soft">Nível ${esc(x.level)}</span>`:''}</div><input data-row="talents" data-i="${i}" data-field="name" placeholder="Nome" value="${esc(x.name)}"><div class="form-grid"><label>Nível necessário<input data-row="talents" data-i="${i}" data-field="level" type="number" min="1" max="20" value="${esc(x.level||'')}"></label><label>Categoria<input data-row="talents" data-i="${i}" data-field="category" value="${esc(x.category||'')}"></label></div><textarea data-row="talents" data-i="${i}" data-field="text" placeholder="Descrição">${esc(x.text)}</textarea><button data-del="talents" data-i="${i}">Remover</button></div>`;
  if(kind==='domains') return `<div class="mini-row"><div class="row-head"><span class="badge">${esc(x.type||'Domínio')}</span>${x.level?`<span class="badge soft">Nível ${esc(x.level)}</span>`:''}</div><input data-row="domains" data-i="${i}" data-field="name" placeholder="Nome da expansão" value="${esc(x.name)}"><div class="form-grid"><input data-row="domains" data-i="${i}" data-field="technique" placeholder="Técnica vinculada" value="${esc(x.technique||'')}"><input data-row="domains" data-i="${i}" data-field="type" placeholder="Tipo" value="${esc(x.type||'')}"><input data-row="domains" data-i="${i}" data-field="cost" placeholder="Custo" value="${esc(x.cost||'')}"><input data-row="domains" data-i="${i}" data-field="area" placeholder="Área" value="${esc(x.area||'')}"><input data-row="domains" data-i="${i}" data-field="duration" placeholder="Duração" value="${esc(x.duration||'')}"><label>Nível necessário<input data-row="domains" data-i="${i}" data-field="level" type="number" min="1" max="20" value="${esc(x.level||'')}"></label></div><textarea data-row="domains" data-i="${i}" data-field="text" placeholder="Efeitos, acerto garantido, regras e observações">${esc(x.text)}</textarea><button data-del="domains" data-i="${i}">Remover</button></div>`;
  return `<div class="mini-row"><input data-row="${kind}" data-i="${i}" data-field="name" placeholder="Nome" value="${esc(x.name)}"><textarea data-row="${kind}" data-i="${i}" data-field="text" placeholder="Descrição">${esc(x.text)}</textarea><button data-del="${kind}" data-i="${i}">Remover</button></div>`;
}
function renderRows(sheet){
  renderAbilityProgress(sheet);
  const filteredAbilities = (sheet.abilities||[]).map((x,i)=>({x,i}));
  $('#abilitiesList').innerHTML = filteredAbilities.length ? filteredAbilities.map(({x,i})=>row('abilities',x,i)).join('') : '<p class="muted">Nenhuma habilidade adicionada.</p>';
  if($('#aptitudeChoicesList')) $('#aptitudeChoicesList').innerHTML = sheet.aptitudeChoices.length ? sheet.aptitudeChoices.map((x,i)=>row('aptitudeChoices',x,i)).join('') : '<p class="muted">Nenhuma aptidão escolhida ainda.</p>';
  $('#talentsList').innerHTML = sheet.talents.length ? sheet.talents.map((x,i)=>row('talents',x,i)).join('') : '<p class="muted">Nenhum talento cadastrado.</p>';
  if($('#domainsList')) $('#domainsList').innerHTML = sheet.domains.length ? sheet.domains.map((x,i)=>row('domains',x,i)).join('') : '<p class="muted">Nenhuma expansão de domínio cadastrada.</p>';
  $('#techniquesList').innerHTML = sheet.techniques.length ? sheet.techniques.map((x,i)=>row('techniques',x,i)).join('') : '<p class="muted">Nenhum feitiço/habilidade de técnica adicionada.</p>';
  syncTechniqueSelectors(sheet);
  $('#attacksList').innerHTML = sheet.attacks.length ? sheet.attacks.map((x,i)=>row('attacks',x,i)).join('') : '<p class="muted">Nenhum ataque cadastrado.</p>';
  $('#itemsList').innerHTML = sheet.items.length ? sheet.items.map((x,i)=>row('items',x,i)).join('') : '<p class="muted">Nenhum item cadastrado.</p>';
  { const used = sheet.items.reduce((sum,it)=>sum + Number(it.qty||1)*Number(it.weight||0),0); const limit = 8 + (mod(sheet.attributes['Força']||10)*2); const max = limit*2; $('#loadView').textContent = `${used} / ${limit} espaços${used>max?' (impossível carregar)':used>limit?' (sobrecarregado)':''}`; }
  $$('[data-row]').forEach(el=>el.oninput=()=>{ const arr=sheet[el.dataset.row]; arr[Number(el.dataset.i)][el.dataset.field] = (el.dataset.field==='level' && el.value==='') ? '' : (el.type==='number'?Number(el.value):el.value); save(); if(['items','abilities','talents','domains'].includes(el.dataset.row)) renderRows(sheet); });
  $$('[data-del]').forEach(btn=>btn.onclick=()=>{ sheet[btn.dataset.del].splice(Number(btn.dataset.i),1); save(); renderRows(sheet); });
  $$('[data-roll-attack-hit]').forEach(btn=>btn.onclick=()=>{ const atk=sheet.attacks[Number(btn.dataset.rollAttackHit)]; roll(atk.test || '1d20', `${atk.name || 'Ataque'} — acerto`); });
  $$('[data-roll-attack-damage]').forEach(btn=>btn.onclick=()=>{ const atk=sheet.attacks[Number(btn.dataset.rollAttackDamage)]; roll(atk.damage || '1d8', `${atk.name || 'Ataque'} — dano`); });
  $$('[data-create-attack-from-item]').forEach(btn=>btn.onclick=()=>createAttackFromInventoryItem(sheet, btn.dataset.createAttackFromItem));
  $$('[data-open-item-mod]').forEach(btn=>btn.onclick=()=>openItemModificationChooser(btn.dataset.openItemMod));
  $$('[data-remove-item-mod]').forEach(btn=>btn.onclick=()=>{ const it=sheet.items[Number(btn.dataset.itemIndex)]; if(!it) return; it.modifications.splice(Number(btn.dataset.removeItemMod),1); save(); renderRows(sheet); });
}

function syncTechniqueSelectors(sheet){
  const select=$('#innateTechniqueSelect');
  if(select){
    const opts=[''].concat(TECHNIQUE_LIBRARY.map(t=>t.name));
    select.innerHTML = opts.map(v=>`<option value="${esc(v)}">${v?esc(v):'Selecionar técnica da biblioteca'}</option>`).join('');
    select.value = TECHNIQUE_LIBRARY.some(t=>t.name===sheet.innateTechnique) ? sheet.innateTechnique : '';
  }
  const spellFilter=$('#spellTechniqueFilter');
  if(spellFilter){
    const techs=[...new Set(TECH_LIBRARY.map(t=>t.tech))];
    const preferred=sheet.innateTechnique && techs.includes(sheet.innateTechnique) ? sheet.innateTechnique : 'current';
    spellFilter.innerHTML = `<option value="current">Técnica atual</option><option value="all">Todas as técnicas</option>` + techs.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');
    if(!spellFilter.value) spellFilter.value=preferred;
  }
}
function renderTechLibrary(){
  const sheet=current(); if(!sheet) return;
  syncTechniqueSelectors(sheet);
  const q = ($('#techSearch')?.value || '').toLowerCase();
  const filter = $('#spellTechniqueFilter')?.value || 'current';
  const levelFilter = $('#spellLevelFilter')?.value || 'all';
  let data = TECH_LIBRARY.filter(t=>{
    const blob=JSON.stringify(t).toLowerCase();
    const techniqueOk = filter==='all' || (filter==='current' ? (sheet.innateTechnique ? t.tech===sheet.innateTechnique : true) : t.tech===filter);
    const levelOk = levelFilter==='all' || (levelFilter==='4' ? Number(t.level)>=4 : Number(t.level)===Number(levelFilter));
    return techniqueOk && levelOk && blob.includes(q);
  });
  $('#techLibrary').innerHTML = data.map((t,i)=>`<div class="library-card"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.tech)} • nível ${esc(t.level)} • ${esc(t.action)} • ${esc(t.range)} • ${esc(t.cost||'custo indefinido')}</p><p><b>Alvo:</b> ${esc(t.target||'—')} • <b>Duração:</b> ${esc(t.duration||'—')}</p><p>${esc(t.text)}</p><button data-add-tech-lib="${i}">Adicionar feitiço</button></div>`).join('') || '<p class="muted">Nenhum feitiço encontrado neste filtro.</p>';
  $$('[data-add-tech-lib]').forEach(btn=>btn.onclick=()=>{ const t=data[Number(btn.dataset.addTechLib)]; sheet.techniques.push({name:t.name, tech:t.tech, level:t.level, action:t.action, range:t.range, target:t.target, duration:t.duration, cost:t.cost||'', text:t.text}); save(); renderRows(sheet); renderTechLibrary(); });
}
function renderAbilityChooser(){
  const sheet=current(); if(!sheet) return;
  const lv=Number(sheet.level||1), cls=sheet.specialization;
  renderAbilityLibraryTabs(sheet);
  abilitySearchFilter = ($('#abilitySearch')?.value || abilitySearchFilter || '').toLowerCase();
  abilityClassFilter = $('#abilityClassFilter')?.value || abilityClassFilter || 'current';
  abilityKindFilter = $('#abilityKindFilter')?.value || abilityKindFilter || 'all';
  const filtered = ABILITY_LIBRARY.map((a,i)=>({a,i})).filter(({a})=>{
    const req=abilityReqLevel(a);
    const classForTab = a.class===cls;
    if(abilityLibraryLevelFilter==='available' && !(classForTab && req<=lv)) return false;
    else if(abilityLibraryLevelFilter==='locked' && !(classForTab && req>lv)) return false;
    else if(abilityLibraryLevelFilter!=='all' && abilityLibraryLevelFilter!=='available' && abilityLibraryLevelFilter!=='locked' && req!==Number(abilityLibraryLevelFilter)) return false;
    if(abilityClassFilter==='current' && a.class!==cls) return false;
    if(abilityClassFilter!=='all' && abilityClassFilter!=='current' && a.class!==abilityClassFilter) return false;
    const isAuto=String(a.kind||'').toLowerCase().startsWith('autom');
    if(abilityKindFilter==='automatic' && !isAuto) return false;
    if(abilityKindFilter==='choice' && isAuto) return false;
    const blob=JSON.stringify(a).toLowerCase();
    if(abilitySearchFilter && !blob.includes(abilitySearchFilter)) return false;
    return true;
  });
  $('#abilityChooser').innerHTML = filtered.map(({a,i})=>{
    const req=abilityReqLevel(a);
    const res=canUseAbility(sheet,a);
    const prereq = a.prereq ? ` • pré-req.: ${esc(a.prereq)}` : '';
    return `<div class="library-card ${res.ok?'':'unavailable'}"><h3>${esc(a.name)}</h3><p class="muted">${esc(a.class)} • ${esc(a.kind || 'Escolha')} • requisito: nível ${req}${prereq}</p><p>${esc(a.text)}</p><p class="reason">${esc(res.reason)}</p><button data-add-ability-lib="${i}" ${res.ok?'':'disabled'}>Adicionar</button></div>`;
  }).join('') || '<p class="muted">Nenhuma habilidade neste filtro.</p>';
  $$('[data-add-ability-lib]').forEach(btn=>btn.onclick=()=>{ const a=ABILITY_LIBRARY[Number(btn.dataset.addAbilityLib)]; const req=abilityReqLevel(a); sheet.abilities.push({name:a.name, class:a.class, level:req, kind:a.kind || 'Escolha', text:`${a.prereq?'Pré-requisito: '+a.prereq+'\n\n':''}${a.text}`}); save(); renderRows(sheet); renderAbilityChooser(); });
}

function renderAptitudeChooser(){
  const sheet=current(); if(!sheet) return;
  const filter=$('#aptitudeFilter')?.value || 'todas';
  const data=APTITUDE_LIBRARY.filter(a=>filter==='todas' || a.category===filter);
  $('#aptitudeChooser').innerHTML = data.map((a,i)=>{
    const res=canUseAptitude(sheet,a);
    const req=Object.entries(a.req||{}).map(([k,v])=>`${APTITUDE_KEYS.find(x=>x.key===k)?.sigla||k} ${v}`).join(', ') || 'Sem requisito';
    return `<div class="library-card ${res.ok?'':'unavailable'}"><h3>${esc(a.name)}</h3><p class="muted">${esc(a.category)} • ${esc(req)}</p><p>${esc(a.text)}</p><p class="reason">${esc(res.reason)}</p><button data-add-aptitude-lib="${i}" ${res.ok?'':'disabled'}>Adicionar</button></div>`;
  }).join('');
  $$('[data-add-aptitude-lib]').forEach(btn=>btn.onclick=()=>{ const a=data[Number(btn.dataset.addAptitudeLib)]; sheet.aptitudeChoices.push({name:a.name,text:`${a.category}\n${a.text}`}); save(); renderEditor(); renderAptitudeChooser(); });
}

function talentReqLevel(t){ return Number(t.level || t.requiredLevel || 1); }
function isSkillTrained(sheet, skill){ return (sheet.skillRanks?.[skill] || 'none') !== 'none'; }
function isSkillMaster(sheet, skill){ return (sheet.skillRanks?.[skill] || 'none') === 'master'; }
function talentKnownCount(sheet, fragment){ return (sheet.talents||[]).filter(x=>String(x.name||'').toLowerCase().includes(String(fragment||'').toLowerCase())).length; }
function canUseTalent(sheet,t){
  const reasons=[];
  const req=talentReqLevel(t);
  const r=t.req||{};
  if(req > Number(sheet.level||1)) reasons.push(`Requer nível ${req}`);
  if(sheet.talents?.some(x=>x.name===t.name)) reasons.push('Já adicionado');
  if(r.origin && sheet.origin!==r.origin) reasons.push(`Requer origem ${r.origin}`);
  if(r.notOrigin && sheet.origin===r.notOrigin) reasons.push(`Indisponível para origem ${r.notOrigin}`);
  if(r.hasTechnique && !(sheet.innateTechnique || (sheet.techniques||[]).length)) reasons.push('Requer técnica/feitiços');
  if(r.hasDomain && !(sheet.domains||[]).some(d=>String(d.name||'').toLowerCase().includes('completa') || String(d.type||'').toLowerCase().includes('completa'))) reasons.push('Requer Expansão de Domínio Completa');
  if(r.skillTrained && !isSkillTrained(sheet,r.skillTrained)) reasons.push(`Requer treino em ${r.skillTrained}`);
  if(r.skillMaster && !isSkillMaster(sheet,r.skillMaster)) reasons.push(`Requer mestre em ${r.skillMaster}`);
  if(r.anySkillTrained && !r.anySkillTrained.some(sk=>isSkillTrained(sheet,sk))) reasons.push(`Requer treino em ${r.anySkillTrained.join(' ou ')}`);
  if(r.attr){ Object.entries(r.attr).forEach(([a,v])=>{ if(Number(sheet.attributes?.[a]||0)<Number(v)) reasons.push(`Requer ${a} ${v}`); }); }
  if(r.maxAdepto && talentKnownCount(sheet,'Adepto')>=Number(r.maxAdepto)) reasons.push(`Limite de ${r.maxAdepto} talentos Adepto`);
  if(reasons.length) return {ok:false, reason:reasons.join(' • ')};
  return {ok:true, reason:t.prereq && t.prereq!=='—' ? `Disponível — conferir: ${t.prereq}` : 'Disponível'};
}
function renderTalentChooser(){
  const sheet=current(); if(!sheet) return;
  const filter=$('#talentFilter')?.value || 'available';
  const cat=$('#talentCategory')?.value || 'all';
  const q=($('#talentSearch')?.value || '').toLowerCase();
  const data=TALENT_LIBRARY.map((t,i)=>({t,i})).filter(({t})=>{
    const res=canUseTalent(sheet,t);
    if(filter==='available' && !res.ok) return false;
    if(filter==='locked' && res.ok) return false;
    if(cat!=='all' && (t.category||'Geral')!==cat) return false;
    if(q && !JSON.stringify(t).toLowerCase().includes(q)) return false;
    return true;
  });
  $('#talentChooser').innerHTML = data.map(({t,i})=>{ const res=canUseTalent(sheet,t); return `<div class="library-card ${res.ok?'':'unavailable'}"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.category||'Geral')} • nível ${talentReqLevel(t)} • ${esc(t.prereq||'—')}</p><p>${esc(t.text)}</p><p class="reason">${esc(res.reason)}</p><button data-add-talent-lib="${i}" ${res.ok?'':'disabled'}>Adicionar</button></div>`; }).join('') || '<p class="muted">Nenhum talento neste filtro.</p>';
  $$('[data-add-talent-lib]').forEach(btn=>btn.onclick=()=>{ const t=TALENT_LIBRARY[Number(btn.dataset.addTalentLib)]; sheet.talents.push({name:t.name, level:talentReqLevel(t), category:t.category||'Geral', text:`Pré-requisito: ${t.prereq||'—'}\n\n${t.text}`}); save(); renderRows(sheet); renderTalentChooser(); });
}

function renderItemChooser(){
  const sheet=current(); if(!sheet) return;
  const q=($('#itemSearch')?.value||'').toLowerCase();
  const cat=$('#itemCategoryFilter')?.value || 'all';
  const cost=$('#itemCostFilter')?.value || 'all';
  const data=ITEM_LIBRARY.map((it,i)=>({it,i})).filter(({it})=>{
    const blob=JSON.stringify(it).toLowerCase();
    const catOk = cat==='all' || it.category===cat;
    const costOk = cost==='all' || String(it.cost)===String(cost);
    return catOk && costOk && blob.includes(q);
  });
  $('#itemChooser').innerHTML = data.map(({it,i})=>`<div class="library-card"><h3>${esc(it.name)}</h3><p class="muted">${esc(it.category)} • custo ${esc(it.cost)} • espaços ${esc(it.weight)}${it.damage&&it.damage!=='—'?' • '+esc(it.damage):''}</p><p><b>Propriedades:</b> ${esc(it.properties||'—')}</p><p>${esc(it.text||'')}</p><button data-add-item-lib="${i}">Adicionar equipamento</button></div>`).join('') || '<p class="muted">Nenhum equipamento encontrado neste filtro.</p>';
  $$('[data-add-item-lib]').forEach(btn=>btn.onclick=()=>{ const it=ITEM_LIBRARY[Number(btn.dataset.addItemLib)]; sheet.items.push({name:it.name, category:it.category, cost:it.cost, qty:it.qty||1, weight:it.weight||0, damage:it.damage||'', properties:it.properties||'', grade:'', enchantmentCharges:'', uniqueAbility:'', modifications:[], text:it.text||''}); save(); renderRows(sheet); renderItemChooser(); });
}

function renderDomainChooser(){
  const sheet=current(); if(!sheet) return;
  const q=($('#domainSearch')?.value||'').toLowerCase();
  const data=DOMAIN_LIBRARY.map((d,i)=>({d,i})).filter(({d})=>JSON.stringify(d).toLowerCase().includes(q));
  $('#domainChooser').innerHTML = data.map(({d,i})=>`<div class="library-card"><h3>${esc(d.name)}</h3><p class="muted">${esc(d.technique)} • ${esc(d.type)} • nível ${esc(d.level)} • ${esc(d.cost)}</p><p><b>Área:</b> ${esc(d.area)} • <b>Duração:</b> ${esc(d.duration)}</p><p>${esc(d.text)}</p><button data-add-domain-lib="${i}">Adicionar</button></div>`).join('') || '<p class="muted">Nenhuma expansão encontrada.</p>';
  $$('[data-add-domain-lib]').forEach(btn=>btn.onclick=()=>{ const d=DOMAIN_LIBRARY[Number(btn.dataset.addDomainLib)]; sheet.domains.push({name:d.name, type:d.type, technique:d.technique, level:d.level, cost:d.cost, area:d.area, duration:d.duration, text:d.text}); save(); renderRows(sheet); renderDomainChooser(); });
}

function renderRules(){ $('#rulesSummary').innerHTML = RULES.map(r=>`<div class="rule-card"><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join(''); }
function renderAll(){ renderSheetList(); renderEditor(); renderRules(); }

function openWizard(existing=false){ wizardData = existing && current() ? structuredClone(current()) : blankSheet(); wizardData=applyAutoValues(wizardData,{keepCurrent:false}); wizardStep=0; renderWizard(); $('#wizard').showModal(); }
function renderWizard(){
  $('#wizardTitle').textContent=`${wizardStep+1}. ${wizardSteps[wizardStep]}`;
  $('#wizardProgress').style.width=`${((wizardStep+1)/wizardSteps.length)*100}%`;
  $('#wizardBack').disabled=wizardStep===0;
  $('#wizardNext').textContent=wizardStep===wizardSteps.length-1?'Salvar ficha':'Próximo';
  let html='';
  if(wizardStep===0) html=`<div class="form-grid"><label>Nome do personagem<input id="wName" value="${esc(wizardData.name)}" placeholder="Ex.: Aoi Nakamura"></label><label>Nome do jogador<input id="wPlayer" value="${esc(wizardData.player)}"></label><label>Nível inicial<input id="wLevel" type="number" min="1" max="20" value="${wizardData.level||1}"></label><label>Técnica inata, se já souber<input id="wTechnique" value="${esc(wizardData.innateTechnique)}" placeholder="Pode deixar em branco"></label></div>`;
  if(wizardStep===1) html=`<p class="muted">Escolha a origem. Algumas regras especiais ainda serão detalhadas em versões futuras.</p><div class="choice-grid">${ORIGINS.map(o=>`<div class="choice ${wizardData.origin===o.name?'active':''}" data-w-origin="${o.name}"><strong>${o.name}</strong><span>${o.desc}</span></div>`).join('')}</div>`;
  if(wizardStep===2) html=`<p class="muted">A especialização define PV, PE/Estamina, treinamentos e atributo-chave.</p><div class="choice-grid">${Object.entries(CLASSES).map(([name,c])=>`<div class="choice ${wizardData.specialization===name?'active':''}" data-w-class="${name}"><strong>${name}</strong><span>PV ${c.hp1} + CON • ${c.stamina?'Estamina '+c.stamina+'/nível':'PE '+c.pe+'/nível'} • ${c.keys.join(' ou ')}</span></div>`).join('')}</div><label style="margin-top:1rem">Atributo-chave<select id="wKey">${(CLASSES[wizardData.specialization]?.keys||[]).map(k=>`<option ${wizardData.keyAttribute===k?'selected':''}>${k}</option>`).join('')}</select></label>`;
  if(wizardStep===3){ const pool=attributePoolValues(wizardData); const hasPool=pool.length===6; const chips=hasPool ? (wizardData.attributeRolls||[]).map((r,i)=>`<span class="roll-chip">${i+1}: <b>${r.total}</b> <small>${r.fixed?'fixo':r.rolls.join(', ')}</small></span>`).join('') : '<p class="muted">Clique em rolar ou usar valores fixos para gerar os 6 valores disponíveis.</p>'; html=`<p class="muted">Método de atributos: você gera 6 valores e só pode distribuir exatamente esses valores. A rolagem usa 4d6, descarta o menor e soma os 3 restantes.</p><div class="actions-inline"><button type="button" id="rollAttrs" class="primary">Rolar atributos 4d6</button><button type="button" id="useFixed">Usar valores fixos</button><button type="button" id="clearAttrs">Limpar distribuição</button></div><div class="roll-pool">${chips}</div><div class="attribute-grid">${ATTRS.map(a=>{ const current=wizardData.attributeAssignments?.[a] ?? ''; const used=usedAttributeValues(wizardData,a); const options=['<option value="">Escolher</option>'].concat(pool.map((v,idx)=>{ const disabled=countValue(used,v) >= countValue(pool,v) && Number(current)!==v; return `<option value="${v}" ${Number(current)===v?'selected':''} ${disabled?'disabled':''}>${v} ${disabled?'— usado':''}</option>`; })).join(''); const val=current!==''?Number(current):10; return `<div class="attr-box"><strong>${a}</strong><select class="wAttrSelect" data-w-attr="${a}" ${hasPool?'':'disabled'}>${options}</select><small><span>Mod.</span><b>${sgn(mod(val))}</b></small></div>`; }).join('')}</div><p class="muted">Valores repetidos funcionam normalmente quando a rolagem gerar números iguais; cada número é tratado como um espaço disponível.</p>`; }
  if(wizardStep===4) html=`<p class="muted">Aplique uma sugestão inicial de perícias conforme a especialização. Depois você ajusta livremente na aba Perícias.</p><div class="rule-card"><h3>${esc(wizardData.specialization)}</h3><p>${esc((CLASSES[wizardData.specialization]||CLASSES.Lutador).trainings)}</p></div><button id="wApplySkills" class="primary wide" type="button">Aplicar perícias sugeridas</button><div id="wSkillPreview" class="rule-grid" style="margin-top:1rem"></div>`;
  if(wizardStep===5){ const preview=applyAutoValues(structuredClone(wizardData),{keepCurrent:false}); html=`<div class="card"><h3>${esc(preview.name || 'Sem nome')}</h3><p class="muted">${esc(preview.origin)} • ${esc(preview.specialization)} • ${esc(preview.innateTechnique || 'Sem técnica definida')}</p><p><span class="badge">PV ${preview.hpMax}</span> <span class="badge">${CLASSES[preview.specialization]?.stamina?'Estamina':'PE'} ${preview.peMax}</span> <span class="badge">BT +${trainingBonus(preview.level)}</span> <span class="badge">CD ${preview.dc}</span> <span class="badge">${preview.grade}</span></p></div><p class="muted">Ao salvar, a ficha continua editável por abas.</p>`; }
  $('#wizardBody').innerHTML=html; bindWizardStep();
}
function collectWizard(){
  if(wizardStep===0){ wizardData.name=$('#wName').value; wizardData.player=$('#wPlayer').value; wizardData.level=Number($('#wLevel').value||1); wizardData.innateTechnique=$('#wTechnique').value; }
  if(wizardStep===2){ wizardData.keyAttribute=$('#wKey')?.value || wizardData.keyAttribute; }
  if(wizardStep===3){ $$('.wAttrSelect').forEach(i=>{ wizardData.attributeAssignments[i.dataset.wAttr]=i.value===''?'':Number(i.value); }); syncAttributesFromAssignments(wizardData); }
  wizardData=applyAutoValues(wizardData,{keepCurrent:false});
}
function bindWizardStep(){
  $$('[data-w-origin]').forEach(c=>c.onclick=()=>{ wizardData.origin=c.dataset.wOrigin; if(wizardData.origin==='Restringido') wizardData.specialization='Restringido'; renderWizard(); });
  $$('[data-w-class]').forEach(c=>c.onclick=()=>{ wizardData.specialization=c.dataset.wClass; wizardData.keyAttribute=(CLASSES[wizardData.specialization]||CLASSES.Lutador).keys[0]; renderWizard(); });
  $('#wKey')?.addEventListener('input',e=>wizardData.keyAttribute=e.target.value);
  $('#rollAttrs')?.addEventListener('click',()=>{ wizardData.attributeMethod='rolling'; wizardData.attributeRolls=rollAttributeSet(); wizardData.attributeAssignments={}; renderWizard(); });
  $('#useFixed')?.addEventListener('click',()=>{ wizardData.attributeMethod='fixed'; wizardData.attributeRolls=fixedAttributeSet(); wizardData.attributeAssignments={}; renderWizard(); });
  $('#clearAttrs')?.addEventListener('click',()=>{ wizardData.attributeAssignments={}; renderWizard(); });
  $$('.wAttrSelect').forEach(sel=>sel.oninput=()=>{ wizardData.attributeAssignments[sel.dataset.wAttr]=sel.value===''?'':Number(sel.value); syncAttributesFromAssignments(wizardData); renderWizard(); });
  $('#wApplySkills')?.addEventListener('click',()=>{ wizardData=applyDefaultSkills(wizardData); renderWizardSkillPreview(); });
  renderWizardSkillPreview();
}
function renderWizardSkillPreview(){ const el=$('#wSkillPreview'); if(!el) return; const trained=Object.entries(wizardData.skillRanks||{}).filter(([,v])=>v!=='none').map(([k,v])=>`${k}: ${v==='master'?'Mestre':'Treinado'}`); el.innerHTML=trained.length?trained.map(t=>`<div class="rule-card"><p>${esc(t)}</p></div>`).join(''):'<p class="muted">Nenhuma sugestão aplicada ainda.</p>'; }
function finishWizard(){ collectWizard(); addBaseAbilities(wizardData); const idx=sheets.findIndex(s=>s.id===wizardData.id); if(idx>=0) sheets[idx]=wizardData; else sheets.push(wizardData); activeId=wizardData.id; save(); $('#wizard').close(); activateTab('fichas'); renderAll(); }

function normalizeDiceExpression(expr){
  return String(expr||'')
    .replace(/[–—]/g,'-')
    .replace(/(\d*d\d+)\s*\/\s*(\d*d\d+)/gi,'$1') // quando houver dano alternativo, usa o primeiro valor
    .replace(/[,;]/g,' + ');
}
function parseDice(expr){
  const original=String(expr||'').trim();
  const clean=normalizeDiceExpression(original);
  const terms=[];
  const re=/([+-]?\s*\d*d\d+|[+-]\s*\d+)/gi;
  let match;
  while((match=re.exec(clean))){
    const raw=match[1].replace(/\s+/g,'');
    const sign=raw.startsWith('-')?-1:1;
    const body=raw.replace(/^[+-]/,'');
    if(/d/i.test(body)){
      const [q,s]=body.toLowerCase().split('d');
      const qty=Number(q||1), sides=Number(s);
      if(!Number.isFinite(qty)||!Number.isFinite(sides)||qty<=0||sides<=0) throw new Error('Expressão de dado inválida.');
      terms.push({type:'dice', sign, qty, sides, raw});
    }else{
      const value=Number(body);
      if(Number.isFinite(value)) terms.push({type:'flat', sign, value, raw});
    }
  }
  if(!terms.length) throw new Error('Use formatos como 1d20+5, 2d8+3 ou 1d6 Ct + 1d6 Pf.');
  return {original, terms};
}
function roll(expr,label='Rolagem'){
  try{
    const parsed=parseDice(expr);
    let total=0;
    const parts=[];
    parsed.terms.forEach(term=>{
      if(term.type==='dice'){
        const rolls=Array.from({length:term.qty},()=>Math.floor(Math.random()*term.sides)+1);
        const subtotal=rolls.reduce((a,b)=>a+b,0)*term.sign;
        total+=subtotal;
        parts.push(`${term.sign<0?'- ':''}${term.qty}d${term.sides} [${rolls.join(', ')}]`);
      }else{
        total += term.sign*term.value;
        parts.push(`${term.sign>0?'+ ':'- '}${term.value}`);
      }
    });
    const text=`${label}: ${parsed.original} = ${total} (${parts.join(' ')})`;
    $('#rollResult').textContent=text;
    const div=document.createElement('div'); div.textContent=text; $('#rollHistory').prepend(div);
    activateTab('rolador');
    return total;
  } catch(e){ $('#rollResult').textContent=e.message; activateTab('rolador'); }
}

function init(){
  sheets=sheets.map(normalize);
  if(activeId && !sheets.find(s=>s.id===activeId)) activeId=sheets[0]?.id||null;
  $$('.nav button').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));
  $$('.subnav button').forEach(b=>b.onclick=()=>activateSubtab(b.dataset.subtab));
  ['startCreate','newSheet','emptyCreate'].forEach(id=>$('#'+id).onclick=()=>openWizard(false));
  $('#goSheets').onclick=()=>activateTab('fichas');
  $('#reopenWizard').onclick=()=>openWizard(true);
  $('#wizardBack').onclick=()=>{ collectWizard(); if(wizardStep>0) wizardStep--; renderWizard(); };
  $('#wizardNext').onclick=()=>{ collectWizard(); if(wizardStep===3 && !attributeAssignmentComplete(wizardData)){ alert('Distribua os 6 valores rolados/fixos entre os atributos antes de continuar.'); return; } if(wizardStep<wizardSteps.length-1){ wizardStep++; renderWizard(); } else finishWizard(); };
  $$('[data-add]').forEach(btn=>btn.onclick=()=>{ const sheet=current(); if(!sheet) return; const t=btn.dataset.add; const obj=t==='attacks'?{name:'',test:'1d20',damage:'1d8',notes:''}:t==='items'?{name:'',category:'Personalizado',cost:'',qty:1,weight:0,damage:'',properties:'',grade:'',enchantmentCharges:'',uniqueAbility:'',modifications:[],text:''}:t==='techniques'?{name:'',tech:sheet.innateTechnique||'',level:'',action:'',range:'',target:'',duration:'',cost:'',text:''}:t==='domains'?{name:'',type:'',technique:'',level:'',cost:'',area:'',duration:'',text:''}:t==='abilities'?{name:'',level:'',class:'',text:''}:t==='talents'?{name:'',level:'',category:'',text:''}:{name:'',text:''}; sheet[t].push(obj); save(); renderRows(sheet); });
  $('#recalculate').onclick=()=>{ const sheet=current(); if(!sheet)return; applyAutoValues(sheet,{keepCurrent:false}); save(); renderEditor(); };
  $('#applyClassSkills').onclick=()=>{ const sheet=current(); if(!sheet)return; applyDefaultSkills(sheet); save(); renderEditor(); };
  $('#openAbilityChooser').onclick=()=>{ renderAbilityChooser(); openDialog('abilityDialog'); };
  $('#abilitySearch')?.addEventListener('input', renderAbilityChooser);
  $('#abilityClassFilter')?.addEventListener('input', renderAbilityChooser);
  $('#abilityKindFilter')?.addEventListener('input', renderAbilityChooser);
  $('#openTalentChooser')?.addEventListener('click',()=>{ renderTalentChooser(); openDialog('talentDialog'); });
  $('#openDomainChooser')?.addEventListener('click',()=>{ renderDomainChooser(); openDialog('domainDialog'); });
  $('#openItemChooser')?.addEventListener('click',()=>{ renderItemChooser(); openDialog('itemDialog'); });
  $('#createAttacksFromWeapons')?.addEventListener('click',()=>{ const sheet=current(); if(sheet) createAttacksFromAllWeapons(sheet); });
  if($('#openAptitudeChooser')) $('#openAptitudeChooser').onclick=()=>{ renderAptitudeChooser(); openDialog('aptitudeDialog'); };
  if($('#aptitudeFilter')) $('#aptitudeFilter').oninput=renderAptitudeChooser;
  $('#exportSheet').onclick=()=>{ const sheet=current(); if(!sheet)return alert('Selecione uma ficha.'); const blob=new Blob([JSON.stringify(sheet,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(sheet.name||'ficha-fem')+'.json'; a.click(); URL.revokeObjectURL(a.href); };
  $('#importSheet').onchange=e=>{ const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{ const imported=normalize(JSON.parse(reader.result)); imported.id=imported.id||makeId(); sheets.push(imported); activeId=imported.id; save(); renderAll(); activateTab('fichas'); }catch{ alert('JSON inválido.'); } }; reader.readAsText(file); };
  $('#deleteSheet').onclick=()=>{ const sheet=current(); if(!sheet)return; if(confirm(`Excluir a ficha "${sheet.name || 'Sem nome'}"?`)){ sheets=sheets.filter(s=>s.id!==sheet.id); activeId=sheets[0]?.id||null; save(); renderAll(); } };
  $('#rollDice').onclick=()=>roll($('#diceExpression').value,'Manual');
  if($('#techSearch')) $('#techSearch').oninput=renderTechLibrary;
  if($('#spellTechniqueFilter')) $('#spellTechniqueFilter').onchange=renderTechLibrary;
  if($('#spellLevelFilter')) $('#spellLevelFilter').onchange=renderTechLibrary;
  if($('#openSpellChooser')) $('#openSpellChooser').onclick=()=>{ renderTechLibrary(); openDialog('spellDialog'); };
  if($('#applyInnateTechnique')) $('#applyInnateTechnique').onclick=()=>{ const sheet=current(); if(!sheet) return; const chosen=$('#innateTechniqueSelect')?.value; if(!chosen) return; const tech=TECHNIQUE_LIBRARY.find(t=>t.name===chosen); sheet.innateTechnique=chosen; if(tech && !sheet.innateTechniqueText) sheet.innateTechniqueText=tech.text; save(); renderAll(); };
  if($('#innateTechniqueSelect')) $('#innateTechniqueSelect').onchange=()=>{ const sheet=current(); if(!sheet) return; const chosen=$('#innateTechniqueSelect').value; const tech=TECHNIQUE_LIBRARY.find(t=>t.name===chosen); if(tech){ sheet.innateTechnique=chosen; if(!sheet.innateTechniqueText) sheet.innateTechniqueText=tech.text; save(); renderAll(); } };
  $('#talentFilter')?.addEventListener('input', renderTalentChooser);
  $('#talentCategory')?.addEventListener('input', renderTalentChooser);
  $('#talentSearch')?.addEventListener('input', renderTalentChooser);
  $('#domainSearch')?.addEventListener('input', renderDomainChooser);
  $('#itemSearch')?.addEventListener('input', renderItemChooser);
  $('#itemCategoryFilter')?.addEventListener('input', renderItemChooser);
  $('#itemCostFilter')?.addEventListener('input', renderItemChooser);
  $('#itemModSearch')?.addEventListener('input', renderItemModificationChooser);
  $('#itemModTypeFilter')?.addEventListener('input', renderItemModificationChooser);
  save(); renderAll();
}
function boot(){
  try { init(); }
  catch(err){
    console.error(err);
    const box=document.createElement('div');
    box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#2b0f14;color:#ffd8df;border:1px solid #ff6b8a;padding:12px;border-radius:12px;font-family:system-ui';
    box.innerHTML='<strong>Erro ao iniciar o site.</strong><br>Atualize usando a versão corrigida ou limpe os dados do navegador deste site. Detalhe: '+(err?.message||err);
    document.body.appendChild(box);
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
