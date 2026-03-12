import { QUESTAO_FACETA_MAP, QUESTOES_INVERTIDAS } from './ipip';

  export interface Questao {
    id: number;
    texto: string;
    invertida: boolean;
    faceta: string;
  }

  // 120 questões do IPIP-NEO-120 (versão portuguesa adaptada)
  export const QUESTOES: Questao[] = [
    // NEUROTICISMO (N1-N6)
    { id: 1, texto: 'Raramente me sinto ansioso(a)', invertida: true, faceta: 'N1' },
    { id: 2, texto: 'Fico irritado(a) facilmente', invertida: false, faceta: 'N2' },
    { id: 3, texto: 'Raramente me sinto triste', invertida: true, faceta: 'N3' },
    { id: 4, texto: 'Fico constrangido(a) facilmente', invertida: false, faceta: 'N4' },
    { id: 5, texto: 'Como demais', invertida: false, faceta: 'N5' },
    { id: 6, texto: 'Entro em pânico facilmente', invertida: false, faceta: 'N6' },
    
    // EXTROVERSÃO (E1-E6)
    { id: 7, texto: 'Não gosto de chamar atenção para mim', invertida: true, faceta: 'E1' },
    { id: 8, texto: 'Gosto de estar em grandes grupos', invertida: false, faceta: 'E2' },
    { id: 9, texto: 'Não gosto de assumir o controle', invertida: true, faceta: 'E3' },
    { id: 10, texto: 'Sou uma pessoa muito ativa', invertida: false, faceta: 'E4' },
    { id: 11, texto: 'Adoro emoção e aventura', invertida: false, faceta: 'E5' },
    { id: 12, texto: 'Irradio alegria', invertida: false, faceta: 'E6' },
    
    // ABERTURA (O1-O6)
    { id: 13, texto: 'Não tenho uma imaginação vívida', invertida: true, faceta: 'O1' },
    { id: 14, texto: 'Acredito na importância da arte', invertida: false, faceta: 'O2' },
    { id: 15, texto: 'Experimento minhas emoções intensamente', invertida: false, faceta: 'O3' },
    { id: 16, texto: 'Prefiro rotina a novidade', invertida: true, faceta: 'O4' },
    { id: 17, texto: 'Tendem a votar em candidatos liberais/progressistas', invertida: false, faceta: 'O5' },
    { id: 18, texto: 'Acredito que não existe certo ou errado absoluto', invertida: false, faceta: 'O6' },
    
    // AMABILIDADE (A1-A6)
    { id: 19, texto: 'Suspeito de intenções ocultas nas pessoas', invertida: true, faceta: 'A1' },
    { id: 20, texto: 'Faço as coisas de acordo com um plano', invertida: false, faceta: 'A2' },
    { id: 21, texto: 'Preocupo-me com os outros', invertida: false, faceta: 'A3' },
    { id: 22, texto: 'Fico irritado(a) facilmente', invertida: true, faceta: 'A4' },
    { id: 23, texto: 'Gosto de falar sobre mim', invertida: true, faceta: 'A5' },
    { id: 24, texto: 'Simpatizo com os sentimentos dos outros', invertida: false, faceta: 'A6' },
    
    // CONSCIENCIOSIDADE (C1-C6)
    { id: 25, texto: 'Não me preparo adequadamente', invertida: true, faceta: 'C1' },
    { id: 26, texto: 'Gosto de ordem', invertida: false, faceta: 'C2' },
    { id: 27, texto: 'Cumpro minhas promessas', invertida: false, faceta: 'C3' },
    { id: 28, texto: 'Trabalho duro', invertida: false, faceta: 'C4' },
    { id: 29, texto: 'Sou facilmente distraído(a)', invertida: true, faceta: 'C5' },
    { id: 30, texto: 'Tomo decisões precipitadas', invertida: true, faceta: 'C6' },
    
    // Repetição para completar 120 (4 questões por faceta)
    // Segunda rodada (31-60)
    { id: 31, texto: 'Fico calmo(a) em situações tensas', invertida: true, faceta: 'N1' },
    { id: 32, texto: 'Perco a paciência facilmente', invertida: false, faceta: 'N2' },
    { id: 33, texto: 'Sinto-me confortável comigo mesmo(a)', invertida: true, faceta: 'N3' },
    { id: 34, texto: 'Preocupo-me com o que os outros pensam de mim', invertida: false, faceta: 'N4' },
    { id: 35, texto: 'Tenho dificuldade em controlar meus impulsos', invertida: false, faceta: 'N5' },
    { id: 36, texto: 'Perco o controle facilmente', invertida: false, faceta: 'N6' },
    
    { id: 37, texto: 'Sou difícil de conhecer', invertida: true, faceta: 'E1' },
    { id: 38, texto: 'Prefiro ficar sozinho(a)', invertida: true, faceta: 'E2' },
    { id: 39, texto: 'Deixo os outros tomarem decisões', invertida: true, faceta: 'E3' },
    { id: 40, texto: 'Faço muitas coisas no meu tempo livre', invertida: false, faceta: 'E4' },
    { id: 41, texto: 'Procuro aventura', invertida: false, faceta: 'E5' },
    { id: 42, texto: 'Amo a vida', invertida: false, faceta: 'E6' },
    
    { id: 43, texto: 'Tenho dificuldade em imaginar coisas', invertida: true, faceta: 'O1' },
    { id: 44, texto: 'Vejo beleza em coisas que os outros não notam', invertida: false, faceta: 'O2' },
    { id: 45, texto: 'Experimento uma ampla variedade de emoções', invertida: false, faceta: 'O3' },
    { id: 46, texto: 'Gosto de variedade', invertida: false, faceta: 'O4' },
    { id: 47, texto: 'Gosto de resolver problemas complexos', invertida: false, faceta: 'O5' },
    { id: 48, texto: 'Acredito que as leis devem ser aplicadas rigidamente', invertida: true, faceta: 'O6' },
    
    { id: 49, texto: 'Confio nos outros', invertida: false, faceta: 'A1' },
    { id: 50, texto: 'Digo a verdade', invertida: false, faceta: 'A2' },
    { id: 51, texto: 'Tenho um coração mole', invertida: false, faceta: 'A3' },
    { id: 52, texto: 'Aceito as pessoas como elas são', invertida: false, faceta: 'A4' },
    { id: 53, texto: 'Penso muito bem de mim', invertida: true, faceta: 'A5' },
    { id: 54, texto: 'Tento entender os outros', invertida: false, faceta: 'A6' },
    
    { id: 55, texto: 'Deixo minhas coisas desorganizadas', invertida: true, faceta: 'C1' },
    { id: 56, texto: 'Mantenho meu ambiente organizado', invertida: false, faceta: 'C2' },
    { id: 57, texto: 'Faço o que deve ser feito imediatamente', invertida: false, faceta: 'C3' },
    { id: 58, texto: 'Busco a excelência', invertida: false, faceta: 'C4' },
    { id: 59, texto: 'Continuo até tudo estar perfeito', invertida: false, faceta: 'C5' },
    { id: 60, texto: 'Penso antes de agir', invertida: false, faceta: 'C6' },
    
    // Terceira rodada (61-90)
    { id: 61, texto: 'Não me preocupo muito', invertida: true, faceta: 'N1' },
    { id: 62, texto: 'Fico com raiva facilmente', invertida: false, faceta: 'N2' },
    { id: 63, texto: 'Raramente me sinto deprimido(a)', invertida: true, faceta: 'N3' },
    { id: 64, texto: 'Sou muito autoconsciente', invertida: false, faceta: 'N4' },
    { id: 65, texto: 'Ajo sem pensar', invertida: false, faceta: 'N5' },
    { id: 66, texto: 'Fico estressado(a) facilmente', invertida: false, faceta: 'N6' },
    
    { id: 67, texto: 'Evito multidões', invertida: true, faceta: 'E1' },
    { id: 68, texto: 'Gosto de me misturar em multidões', invertida: false, faceta: 'E2' },
    { id: 69, texto: 'Deixo os outros fazerem o trabalho', invertida: true, faceta: 'E3' },
    { id: 70, texto: 'Estou sempre ocupado(a)', invertida: false, faceta: 'E4' },
    { id: 71, texto: 'Prefiro variedade à rotina', invertida: false, faceta: 'E5' },
    { id: 72, texto: 'Tenho um bom humor contagiante', invertida: false, faceta: 'E6' },
    
    { id: 73, texto: 'Não gosto de sonhar acordado(a)', invertida: true, faceta: 'O1' },
    { id: 74, texto: 'Adoro flores', invertida: false, faceta: 'O2' },
    { id: 75, texto: 'Sinto as emoções dos outros', invertida: false, faceta: 'O3' },
    { id: 76, texto: 'Não gosto de mudanças', invertida: true, faceta: 'O4' },
    { id: 77, texto: 'Tenho uma mente investigativa', invertida: false, faceta: 'O5' },
    { id: 78, texto: 'Acredito que existe exceções para tudo', invertida: false, faceta: 'O6' },
    
    { id: 79, texto: 'Desconfio dos outros', invertida: true, faceta: 'A1' },
    { id: 80, texto: 'Sou honesto(a) na maioria das vezes', invertida: false, faceta: 'A2' },
    { id: 81, texto: 'Sou indiferente ao sofrimento alheio', invertida: true, faceta: 'A3' },
    { id: 82, texto: 'Sou paciente com os outros', invertida: false, faceta: 'A4' },
    { id: 83, texto: 'Acho que sou melhor que os outros', invertida: true, faceta: 'A5' },
    { id: 84, texto: 'Tento fazer os outros se sentirem bem', invertida: false, faceta: 'A6' },
    
    { id: 85, texto: 'Frequentemente esqueço de colocar as coisas de volta', invertida: true, faceta: 'C1' },
    { id: 86, texto: 'Gosto de ter tudo no seu lugar', invertida: false, faceta: 'C2' },
    { id: 87, texto: 'Levo minhas responsabilidades a sério', invertida: false, faceta: 'C3' },
    { id: 88, texto: 'Me esforço ao máximo', invertida: false, faceta: 'C4' },
    { id: 89, texto: 'Perco o foco facilmente', invertida: true, faceta: 'C5' },
    { id: 90, texto: 'Tomo decisões racionais', invertida: false, faceta: 'C6' },
    
    // Quarta rodada (91-120)
    { id: 91, texto: 'Sou relaxado(a) a maior parte do tempo', invertida: true, faceta: 'N1' },
    { id: 92, texto: 'Me irrito com facilidade', invertida: false, faceta: 'N2' },
    { id: 93, texto: 'Me sinto confortável com minha vida', invertida: true, faceta: 'N3' },
    { id: 94, texto: 'Me preocupo com a opinião dos outros', invertida: false, faceta: 'N4' },
    { id: 95, texto: 'Cedo aos meus impulsos', invertida: false, faceta: 'N5' },
    { id: 96, texto: 'Sou sensível ao estresse', invertida: false, faceta: 'N6' },
    
    { id: 97, texto: 'Não sou muito sociável', invertida: true, faceta: 'E1' },
    { id: 98, texto: 'Gosto de festas', invertida: false, faceta: 'E2' },
    { id: 99, texto: 'Espero que os outros liderem', invertida: true, faceta: 'E3' },
    { id: 100, texto: 'Sempre tenho algo para fazer', invertida: false, faceta: 'E4' },
    { id: 101, texto: 'Gosto de correr riscos', invertida: false, faceta: 'E5' },
    { id: 102, texto: 'Estou sempre alegre', invertida: false, faceta: 'E6' },
    
    { id: 103, texto: 'Não sou muito imaginativo(a)', invertida: true, faceta: 'O1' },
    { id: 104, texto: 'Me emociono com arte e música', invertida: false, faceta: 'O2' },
    { id: 105, texto: 'Sou sensível às minhas próprias emoções', invertida: false, faceta: 'O3' },
    { id: 106, texto: 'Gosto de tentar coisas novas', invertida: false, faceta: 'O4' },
    { id: 107, texto: 'Tenho curiosidade intelectual', invertida: false, faceta: 'O5' },
    { id: 108, texto: 'Questiono a autoridade', invertida: false, faceta: 'O6' },
    
    { id: 109, texto: 'Acredito que as pessoas têm boas intenções', invertida: false, faceta: 'A1' },
    { id: 110, texto: 'Às vezes minto', invertida: true, faceta: 'A2' },
    { id: 111, texto: 'Me importo com os outros', invertida: false, faceta: 'A3' },
    { id: 112, texto: 'Raramente fico irritado(a)', invertida: false, faceta: 'A4' },
    { id: 113, texto: 'Sou superior aos outros', invertida: true, faceta: 'A5' },
    { id: 114, texto: 'Sinto compaixão pelos outros', invertida: false, faceta: 'A6' },
    
    { id: 115, texto: 'Deixo minhas coisas pela casa', invertida: true, faceta: 'C1' },
    { id: 116, texto: 'Sigo um cronograma', invertida: false, faceta: 'C2' },
    { id: 117, texto: 'Cumpro com meus deveres', invertida: false, faceta: 'C3' },
    { id: 118, texto: 'Estabeleço altos padrões para mim e para os outros', invertida: false, faceta: 'C4' },
    { id: 119, texto: 'Mantenho o foco nas minhas tarefas', invertida: false, faceta: 'C5' },
    { id: 120, texto: 'Considero as consequências antes de agir', invertida: false, faceta: 'C6' },
  ];
  