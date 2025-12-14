// Logic to replace external AI services with local heuristics

const PORTUGUESE_STOP_WORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'pra', 'p/',
  'com', 'sem', 'e', 'ou', 'mas', 'se', 'que', 'como',
  'eu', 'voce', 'você', 'me', 'mim', 'meu', 'minha', 'seu', 'sua', 'teu', 'tua',
  'queria', 'quero', 'gostaria', 'preciso', 'busco', 'prouro', 'desejo',
  'comprar', 'achar', 'encontrar', 'ver', 'olhar', 'adquirir',
  'muito', 'bastante', 'pouco', 'mais', 'menos', 'tão',
  'ser', 'estar', 'ter', 'tem', 'fazer', 'ir', 'são', 'era', 'foi',
  'adorei', 'amei', 'curti', 'legal', 'top', 'show', 'ruim', 'bom',
  'sobre', 'review', 'analise', 'video', 'assistir', 'assistiu', 'vi',
  'post', 'foto', 'imagem', 'hoje', 'ontem', 'agora', 'aqui', 'ali'
]);

/**
 * Extracts relevant keywords from a text string using local heuristics.
 * Simulates an "AI" extraction by filtering stop words and normalizing text.
 */
export const extractTokensFromText = async (text: string): Promise<string[]> => {
  // Simulate small processing delay for realism
  await new Promise(resolve => setTimeout(resolve, 400));

  const normalized = text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, ''); // Remove punctuation but keep hyphens

  const words = normalized.split(/\s+/);

  // Filter words: must be > 2 chars, not a number, and not a stop word
  const tokens = words.filter(w => 
    w.length > 2 && 
    isNaN(Number(w)) &&
    !PORTUGUESE_STOP_WORDS.has(w)
  );

  // Return unique tokens
  return Array.from(new Set(tokens));
};

/**
 * Generates a marketing description for a product based on its name using templates.
 */
export const enrichProductQuery = async (query: string): Promise<string> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const templates = [
        "Incrível [TERM] com design moderno e alta durabilidade, ideal para o dia a dia.",
        "A melhor opção de [TERM] do mercado, unindo custo-benefício e performance premium.",
        "[TERM] exclusivo, fabricado com materiais de primeira linha para satisfazer os mais exigentes.",
        "Descubra a qualidade deste [TERM], perfeito para quem busca inovação e estilo.",
        "[TERM] versátil e prático, recomendado por especialistas da área.",
        "Solução completa em [TERM], com tecnologia de ponta e garantia de satisfação.",
        "Aproveite a oferta deste [TERM] que está transformando a experiência dos usuários."
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Format term: Capitalize first letter
    const formattedTerm = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
    
    return randomTemplate.replace("[TERM]", formattedTerm).replace("[TERM]", formattedTerm); // Replace all occurrences if any
}