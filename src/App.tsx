import React, { useState, useRef, useEffect } from 'react';
import { UserProfileTrie } from './lib/trees/UserProfileTrie';
import { ProductCategoryTree } from './lib/trees/ProductCategoryTree';
import { ProductSearchTrie } from './lib/trees/ProductSearchTrie';
import { INITIAL_PRODUCTS } from './lib/mockData';
// import { Product, ScoredProduct, UserAction } from './types';
import { TreeVisualizer } from './components/TreeVisualizer';
import { extractTokensFromText, enrichProductQuery } from './services/localAnalysis';
import { 
  Search, 
  Activity, 
  Share2, 
  Zap,
  Cpu,
  User,
  GitBranch,
  ShoppingBag,
  Eye,
  BarChart3,
  Play,
  X,
  Tag,
  Info
} from 'lucide-react';
import type { Product, ScoredProduct, UserAction } from './types';

// --- Componentes Auxiliares ---

interface ProductCardProps {
  product: ScoredProduct | Product;
  isRecommendation?: boolean;
  onView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isRecommendation = false, onView }) => {
  const score = (product as ScoredProduct).score;
  const reasons = (product as ScoredProduct).matchReasons;

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm border ${isRecommendation ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-200'} p-4 flex flex-col transition-all hover:shadow-md h-full`}>
      {isRecommendation && (
        <div className="absolute -top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <Zap size={10} fill="currentColor" /> {(score * 10).toFixed(0)}% MATCH
        </div>
      )}
      
      <div className="mb-3 mt-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{product.brand}</p>
        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{product.name}</h3>
      </div>
      
      <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">{product.description}</p>

      {isRecommendation && reasons && (
        <div className="mb-4 bg-indigo-50 p-2 rounded text-xs text-indigo-800">
          <span className="font-bold block mb-1">Motivo da Sugestão:</span>
          <div className="flex flex-wrap gap-1">
            {reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-indigo-100">{r.split('(')[0]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <span className="text-lg font-bold text-slate-900">R$ {product.price.toFixed(2)}</span>
        <button 
          onClick={() => onView(product)}
          className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-md font-medium flex items-center gap-1 transition-colors"
        >
          <Eye size={14} /> Ver Detalhes
        </button>
      </div>
    </div>
  );
};

const ProductDetailsModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
              {product.categoryPath.join(' > ')}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{product.name}</h2>
            <p className="text-slate-500 font-medium">{product.brand}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-full flex flex-col justify-center items-center text-center">
               <ShoppingBag size={64} className="text-slate-200 mb-4" />
               <p className="text-sm text-slate-400">Imagem Ilustrativa do Produto</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Info size={18} className="text-indigo-600"/> Sobre o Produto
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Tag size={18} className="text-indigo-600"/> Palavras-chave (Tags)
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.keywords.map((k, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    #{k}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-sm text-slate-500">Preço à vista</span>
                 <span className="text-3xl font-bold text-slate-900">R$ {product.price.toFixed(2)}</span>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95">
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Aplicação Principal ---

export default function App() {
  // Estruturas de Dados (Refs para persistência)
  const userProfileTrie = useRef(new UserProfileTrie());       
  const productCatalogTree = useRef(new ProductCategoryTree()); 
  const productSearchTrie = useRef(new ProductSearchTrie());    

  // Estados Globais
  const [products, setProducts] = useState<Product[]>([]); // Estado central de produtos
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [recommendations, setRecommendations] = useState<ScoredProduct[]>([]);
  const [actionLog, setActionLog] = useState<UserAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'store' | 'debug'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estado de Visualização da Loja
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  // Inputs
  const [searchInput, setSearchInput] = useState('');
  const [socialInput, setSocialInput] = useState('');
  const [streamingInput, setStreamingInput] = useState('');

  // Inicialização
  useEffect(() => {
    // Carrega produtos iniciais
    setProducts(INITIAL_PRODUCTS);
    INITIAL_PRODUCTS.forEach(p => {
      productCatalogTree.current.insertProduct(p);
      productSearchTrie.current.insertProduct(p);
    });
    setLastUpdate(Date.now());
  }, []);

  // --- Função Auxiliar: Criação Dinâmica de Produtos ---
  const createDynamicProduct = async (term: string, source: string): Promise<Product> => {
    const cleanTerm = term.trim();
    // Gera uma descrição simples (agora local, sem API externa)
    const description = await enrichProductQuery(cleanTerm);
    
    const newProduct: Product = {
      id: `dyn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1) + (source === 'social' ? ' (Trending)' : ''),
      brand: "Genérica / Importada",
      categoryPath: ["Novidades", source === 'store' ? "Busca" : source === 'social' ? "Social Trends" : "Streaming", cleanTerm],
      description: description,
      keywords: [cleanTerm.toLowerCase(), source, "novidade"],
      price: Math.floor(Math.random() * 500) + 50
    };

    // Atualiza estruturas
    productCatalogTree.current.insertProduct(newProduct);
    productSearchTrie.current.insertProduct(newProduct);
    
    // Atualiza estado local
    setProducts(prev => [...prev, newProduct]);
    
    return newProduct;
  };

  // --- Lógica: Motor de Recomendação ---
  const generateRecommendations = () => {
    // Re-busca todos os produtos da árvore (incluindo os novos dinâmicos)
    const allProducts = productCatalogTree.current.getAllProducts();
    const interestsMap = userProfileTrie.current.getAllInterests();
    
    const scoredProducts: ScoredProduct[] = [];

    allProducts.forEach(product => {
      let score = 0;
      const matchReasons: string[] = [];
      const productTokens = [
        ...product.keywords, 
        product.brand.toLowerCase(), 
        ...product.categoryPath.map(c => c.toLowerCase())
      ];

      productTokens.forEach(token => {
        if (interestsMap.has(token)) {
          const weight = interestsMap.get(token)!;
          score += weight;
          matchReasons.push(`${token} (${weight.toFixed(1)})`);
        }
      });

      if (score > 0) {
        scoredProducts.push({ ...product, score, matchReasons });
      }
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    setRecommendations(scoredProducts);
  };

  // Atualiza recomendações sempre que a lista de produtos muda
  useEffect(() => {
    generateRecommendations();
  }, [products]);

  // --- Ações do Usuário ---

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    setIsSearching(true);

    const term = searchInput.trim();

    // 1. Atualiza Perfil (Behavior)
    const action: UserAction = { type: 'SEARCH', content: term, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);
    
    // Extração local de tokens
    const tokens = await extractTokensFromText(term);
    tokens.forEach(t => userProfileTrie.current.insert(t, 2.0)); 
    // Garante que o termo exato também está na Trie
    userProfileTrie.current.insert(term.toLowerCase(), 2.0);

    // 2. Busca na Trie
    let foundIds = productSearchTrie.current.search(term);
    
    // 3. SE NÃO ENCONTRAR: Cria produto dinâmico!
    if (foundIds.size === 0) {
       const newProd = await createDynamicProduct(term, 'store');
       foundIds = new Set([newProd.id]); // Agora encontramos o novo
    }

    // 4. Filtra e Exibe
    const allCurrentProducts = productCatalogTree.current.getAllProducts();
    const filtered = allCurrentProducts.filter(p => foundIds.has(p.id));
    
    setSearchResults(filtered);
    setLastUpdate(Date.now());
    generateRecommendations(); 
    setIsLoading(false);
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchInput('');
    setSearchResults([]);
  };

  const handleSimulateSocial = async () => {
    if (!socialInput.trim()) return;
    setIsLoading(true);

    const text = socialInput;
    
    // 1. Log Action
    const action: UserAction = { type: 'SOCIAL_POST', content: text, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);

    // 2. Extrai tokens (interesses) localmente
    const tokens = await extractTokensFromText(text);
    
    // 3. Atualiza Trie de Perfil
    tokens.forEach(t => userProfileTrie.current.insert(t, 1.0));

    // 4. GARANTE PRODUTOS: Se o usuário falou de algo que não temos, criamos!
    // Para cada token relevante, verificamos se existe produto.
    for (const token of tokens) {
        const found = productSearchTrie.current.search(token);
        if (found.size === 0) {
            // Cria produto dinâmico baseado no interesse social
            await createDynamicProduct(token, 'social');
        }
    }

    setLastUpdate(Date.now());
    generateRecommendations();
    setSocialInput('');
    setIsLoading(false);
  };

  const handleSimulateStreaming = async () => {
    if (!streamingInput.trim()) return;
    setIsLoading(true);

    const text = streamingInput;
    const action: UserAction = { type: 'STREAMING', content: `Assistiu: ${text}`, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);

    const tokens = await extractTokensFromText(text);
    tokens.forEach(t => userProfileTrie.current.insert(t, 1.5));

    // Lógica dinâmica para Streaming também
    for (const token of tokens) {
      const found = productSearchTrie.current.search(token);
      if (found.size === 0) {
          await createDynamicProduct(token, 'streaming');
      }
  }

    setLastUpdate(Date.now());
    generateRecommendations();
    setStreamingInput('');
    setIsLoading(false);
  };

  const handleProductView = (product: Product) => {
    setSelectedProduct(product); // Abre Modal

    const action: UserAction = { type: 'VIEW', content: `Visualizou ${product.name}`, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);

    product.keywords.forEach(k => userProfileTrie.current.insert(k, 0.5));
    userProfileTrie.current.insert(product.brand.toLowerCase(), 0.5);
    // categoryPath pode ser array vazio se criado dinamicamente de forma simples, proteção:
    if(product.categoryPath.length > 0) {
      userProfileTrie.current.insert(product.categoryPath[product.categoryPath.length-1].toLowerCase(), 0.5);
    }

    setLastUpdate(Date.now());
    generateRecommendations();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* MODAL DE DETALHES */}
      {selectedProduct && (
        <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Navbar estilo E-commerce */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-fit cursor-pointer" onClick={() => {setActiveTab('store'); clearSearch();}}>
            <div className="bg-indigo-600 p-1.5 rounded text-white">
              <GitBranch size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TreeRec<span className="text-indigo-600">.Shop</span></span>
          </div>

          {/* Barra de Busca Central */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative">
              <input 
                type="text" 
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Busque por produtos (ex: Guitarra, Drone, Livro)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full text-sm outline-none transition-all"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
              {isSearching && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-20 top-2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-1.5 top-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Menu de Usuário & Debug Switch */}
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'store' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ShoppingBag size={14}/> Loja
              </button>
              <button 
                onClick={() => setActiveTab('debug')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'debug' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 size={14}/> Debug
              </button>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              <User size={18} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* VISÃO DA LOJA (STORE VIEW) */}
        {activeTab === 'store' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            
            {/* Se estiver Buscando, mostra RESULTADOS DA BUSCA */}
            {isSearching ? (
              <section>
                 <div className="flex items-center gap-2 mb-6">
                  <Search className="text-slate-700" size={24} />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Resultados para "{searchInput}"
                  </h2>
                  <span className="text-sm text-slate-500 ml-2">
                    ({searchResults.length} produtos encontrados)
                  </span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map(product => (
                      <ProductCard key={product.id} product={product} onView={handleProductView} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-500">Criando produtos personalizados para sua busca...</p>
                  </div>
                )}
              </section>
            ) : (
              <>
                {/* Seção de Recomendações (Destaque) */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="text-yellow-500 fill-yellow-500" size={24} /> Recomendado para Você
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Produtos selecionados baseados no seu perfil comportamental.</p>
                    </div>
                  </div>

                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendations.slice(0, 4).map(product => (
                        <ProductCard key={product.id} product={product} isRecommendation={true} onView={handleProductView} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-slate-400" size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Seu perfil está vazio</h3>
                      <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
                        Utilize o <strong>Simulador Social</strong> na aba Debug ou faça uma busca acima. O sistema criará produtos baseados nos seus interesses automaticamente!
                      </p>
                    </div>
                  )}
                </section>

                {/* Vitrine Geral (Catálogo) */}
                <section>
                  <div className="flex items-center gap-2 mb-6 pt-8 border-t border-slate-200">
                    <ShoppingBag className="text-slate-700" size={24} />
                    <h2 className="text-2xl font-bold text-slate-900">Catálogo Completo</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Mostra os produtos iniciais + os gerados dinamicamente */}
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} onView={handleProductView} />
                    ))}
                  </div>
                </section>
              </>
            )}

          </div>
        )}

        {/* VISÃO DE DEBUG / TÉCNICA (DEBUG VIEW) */}
        {activeTab === 'debug' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-right-10 duration-300">
            
            {/* Coluna Esquerda: Controles */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Simulador de Redes Sociais */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Share2 className="text-pink-500" size={20}/> Simulador Social
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Simule um post. Se o produto mencionado não existir, <span className="text-pink-600 font-bold">ele será criado e recomendado na Loja!</span>
                </p>
                <textarea 
                  value={socialInput}
                  onChange={e => setSocialInput(e.target.value)}
                  placeholder="Ex: 'Queria muito comprar uma guitarra elétrica nova!'"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm h-20 focus:ring-2 focus:ring-pink-500 outline-none resize-none mb-3"
                />
                <button 
                  onClick={handleSimulateSocial}
                  disabled={isLoading}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Analisando e Gerando...' : 'Postar'}
                </button>
              </div>

              {/* Simulador de Streaming */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Play className="text-red-600" size={20}/> Simulador de Streaming
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                   Assista algo. Produtos relacionados aparecerão nas recomendações.
                </p>
                <input 
                  type="text"
                  value={streamingInput}
                  onChange={e => setStreamingInput(e.target.value)}
                  placeholder="Ex: 'Review de Drone 4k'"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-3 focus:ring-2 focus:ring-red-500 outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleSimulateStreaming()}
                />
                <button 
                  onClick={handleSimulateStreaming}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processando...' : 'Assistir'}
                </button>
              </div>

              {/* Log de Atividades */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600"/> Log de Atividades
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {actionLog.map((log, i) => (
                    <div key={i} className="text-xs p-3 bg-slate-50 rounded border border-slate-100">
                      <div className="flex justify-between mb-1">
                        <span className={`font-bold px-1.5 rounded text-[10px] ${
                          log.type === 'SEARCH' ? 'bg-blue-100 text-blue-700' :
                          log.type === 'VIEW' ? 'bg-green-100 text-green-700' :
                          log.type === 'STREAMING' ? 'bg-red-100 text-red-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-700">"{log.content}"</p>
                    </div>
                  ))}
                  {actionLog.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-10">Nenhuma atividade registrada.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Visualização das Árvores */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-lg text-slate-800">Visualização da Estrutura de Dados</h3>
                </div>
                
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                   <TreeVisualizer data={userProfileTrie.current.toTreeData()} type="TRIE" />
                   <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                      <strong className="text-indigo-700">Trie de Perfil do Usuário:</strong> Estrutura dinâmica que cresce com seus posts e buscas.
                   </div>
                </div>

                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 mt-6">
                   <TreeVisualizer data={productCatalogTree.current.toTreeData()} type="CATEGORY" />
                   <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                      <strong className="text-emerald-700">Árvore N-ária de Catálogo:</strong> Note como novos ramos (Categorias) são criados automaticamente quando você menciona produtos novos no simulador.
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}