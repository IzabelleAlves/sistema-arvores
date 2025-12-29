import React, { useState, useRef, useEffect } from 'react';
import { UserProfileTrie } from './lib/trees/UserProfileTrie';
import { ProductCategoryTree } from './lib/trees/ProductCategoryTree';
import { ProductSearchTrie } from './lib/trees/ProductSearchTrie';
import { INITIAL_PRODUCTS } from './lib/mockData';
import { TreeVisualizer } from './components/TreeVisualizer';
import { ModernUserProfile } from './components/ModernUserProfile';
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
  Info,
  Navigation,
  Hash,
  Layers
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
          <span className="font-bold block mb-1 text-[10px] uppercase">Tag:</span>
          <div className="flex flex-wrap gap-1">
            {reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                <Hash size={8} /> {r.split('(')[0]}
              </span>
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
          <Eye size={14} /> Detalhes
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
              <p className="text-sm text-slate-400">Imagem do Produto</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Info size={18} className="text-indigo-600" /> Sobre o Produto
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Tag size={18} className="text-indigo-600" /> Tags (Nós da Trie)
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
                <span className="text-sm text-slate-500">Valor</span>
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
  const userProfileTrie = useRef(new UserProfileTrie());
  const productCatalogTree = useRef(new ProductCategoryTree());
  const productSearchTrie = useRef(new ProductSearchTrie());

  const [products, setProducts] = useState<Product[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [recommendations, setRecommendations] = useState<ScoredProduct[]>([]);
  const [actionLog, setActionLog] = useState<UserAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'store' | 'debug'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [socialInput, setSocialInput] = useState('');
  const [streamingInput, setStreamingInput] = useState('');

  useEffect(() => {
    setProducts(INITIAL_PRODUCTS);
    INITIAL_PRODUCTS.forEach(p => {
      productCatalogTree.current.insertProduct(p);
      productSearchTrie.current.insertProduct(p);
    });
    setLastUpdate(Date.now());
  }, []);

  const createDynamicProduct = async (term: string, source: string): Promise<Product> => {
    const cleanTerm = term.trim();
    const description = await enrichProductQuery(cleanTerm);

    const newProduct: Product = {
      id: `dyn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1) + (source === 'social' ? ' (Trending)' : ''),
      brand: "Geração Dinâmica",
      categoryPath: ["Novidades", source === 'store' ? "Busca" : source === 'social' ? "Social Trends" : "Streaming", cleanTerm],
      description: description,
      keywords: [cleanTerm.toLowerCase(), source, "novidade"],
      price: Math.floor(Math.random() * 500) + 50
    };

    productCatalogTree.current.insertProduct(newProduct);
    productSearchTrie.current.insertProduct(newProduct);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const generateRecommendations = () => {
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

  useEffect(() => {
    generateRecommendations();
  }, [products, lastUpdate]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    setIsSearching(true);
    const term = searchInput.trim();
    const action: UserAction = { type: 'SEARCH', content: term, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);
    const tokens = await extractTokensFromText(term);
    tokens.forEach(t => userProfileTrie.current.insert(t, 2.0));
    userProfileTrie.current.insert(term.toLowerCase(), 2.0);
    let foundIds = productSearchTrie.current.search(term);
    if (foundIds.size === 0) {
      const newProd = await createDynamicProduct(term, 'store');
      foundIds = new Set([newProd.id]);
    }
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
    const action: UserAction = { type: 'SOCIAL_POST', content: text, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);
    const tokens = await extractTokensFromText(text);
    tokens.forEach(t => userProfileTrie.current.insert(t, 1.0));
    for (const token of tokens) {
      const found = productSearchTrie.current.search(token);
      if (found.size === 0) await createDynamicProduct(token, 'social');
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
    for (const token of tokens) {
      const found = productSearchTrie.current.search(token);
      if (found.size === 0) await createDynamicProduct(token, 'streaming');
    }
    setLastUpdate(Date.now());
    generateRecommendations();
    setStreamingInput('');
    setIsLoading(false);
  };

  const handleProductView = (product: Product) => {
    setSelectedProduct(product);
    const action: UserAction = { type: 'VIEW', content: `Visualizou ${product.name}`, timestamp: Date.now() };
    setActionLog(prev => [action, ...prev]);
    product.keywords.forEach(k => userProfileTrie.current.insert(k, 0.5));
    userProfileTrie.current.insert(product.brand.toLowerCase(), 0.5);
    if (product.categoryPath.length > 0) {
      userProfileTrie.current.insert(product.categoryPath[product.categoryPath.length - 1].toLowerCase(), 0.5);
    }
    setLastUpdate(Date.now());
    generateRecommendations();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 min-w-fit cursor-pointer" onClick={() => { setActiveTab('store'); clearSearch(); }}>
            <div className="bg-indigo-600 p-1.5 rounded text-white">
              <GitBranch size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TreeRec<span className="text-indigo-600">.Shop</span></span>
          </div>

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
                <button onClick={clearSearch} className="absolute right-20 top-2 text-slate-400 hover:text-slate-600 p-1">
                  <X size={14} />
                </button>
              )}
              <button onClick={handleSearch} disabled={isLoading} className="absolute right-1.5 top-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors">
                Buscar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab('store')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'store' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <ShoppingBag size={14} /> Loja
              </button>
              <button onClick={() => setActiveTab('debug')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'debug' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <BarChart3 size={14} /> Debug
              </button>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              <User size={18} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'store' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Search className="text-slate-700" size={24} />
                  <h2 className="text-2xl font-bold text-slate-900">Resultados para "{searchInput}"</h2>
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map(product => <ProductCard key={product.id} product={product} onView={handleProductView} />)}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-500">Nenhum produto fixo encontrado. A árvore está gerando novos nós...</p>
                  </div>
                )}
              </section>
            )}

            {!isSearching && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="text-yellow-500 fill-yellow-500" size={24} /> Recomendado para Você
                    </h2>
                  </div>
                </div>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.slice(0, 4).map(product => <ProductCard key={product.id} product={product} isRecommendation={true} onView={handleProductView} />)}
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
                    Utilize os simuladores no Debug para alimentar as árvores.
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-6 pt-8 border-t border-slate-200">
                <ShoppingBag className="text-slate-700" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Catálogo Global</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => <ProductCard key={product.id} product={product} onView={handleProductView} />)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-right-10 duration-300">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Share2 className="text-pink-500" size={20} /> Simulador Social
                </h3>
                <textarea
                  value={socialInput}
                  onChange={e => setSocialInput(e.target.value)}
                  placeholder="Ex: 'Queria muito comprar uma guitarra elétrica nova!'"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm h-20 focus:ring-2 focus:ring-pink-500 outline-none resize-none mb-3"
                />
                <button onClick={handleSimulateSocial} disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  Postar
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Play className="text-red-600" size={20} /> Simulador de Streaming
                </h3>
                <input
                  type="text"
                  value={streamingInput}
                  onChange={e => setStreamingInput(e.target.value)}
                  placeholder="Ex: 'Review de Drone 4k'"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-3 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <button onClick={handleSimulateStreaming} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  Assistir
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" /> Log Comportamental
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {actionLog.map((log, i) => (
                    <div key={i} className="text-xs p-3 bg-slate-50 rounded border border-slate-100">
                      <div className="flex justify-between mb-1 font-bold">
                        <span className={log.type === 'SEARCH' ? 'text-blue-600' : 'text-pink-600'}>{log.type}</span>
                        <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-700">"{log.content}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-8">

              {/* --- VISUALIZAÇÃO AMIGÁVEL (AQUI NA ABA DEBUG AGORA) --- */}
              <ModernUserProfile
                interests={userProfileTrie.current.getAllInterests()}
                recommendedProducts={recommendations}
              />

              <div className="flex items-center gap-2 mb-2 pt-6 border-t border-slate-200">
                <Cpu className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800">Inspeção de Estruturas de Memória</h2>
              </div>

              {/* Árvore 1: Trie de Perfil */}
              <div className="space-y-4">
                <div className="bg-white p-1 rounded-xl shadow-md border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs font-mono flex justify-between items-center">
                    <span>TRIE :: PERFIL_USUARIO</span>
                    <span className="flex items-center gap-1 text-emerald-400"><Activity size={12} /> LIVE</span>
                  </div>
                  <div className="overflow-auto max-h-[350px] p-4">
                    <div className="min-w-[800px]">
                      <TreeVisualizer data={userProfileTrie.current.toTreeData()} type="TRIE" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 bg-indigo-900 p-4 gap-4 border-t border-indigo-800">
                    <div className="space-y-2">
                      <h4 className="text-indigo-300 text-[10px] uppercase font-black flex items-center gap-2">
                        <Navigation size={12} /> Navegação de Prefixos
                      </h4>
                      <div className="bg-indigo-950/50 rounded p-3 border border-indigo-700/50">
                        <p className="text-indigo-100 text-xs leading-relaxed italic">
                          "Como um dicionário inteligente, o sistema agrupa o início de palavras parecidas. Isso economiza memória e acelera a identificação do que você gosta."
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-indigo-300 text-[10px] uppercase font-black flex items-center gap-2">
                        <Zap size={12} /> Estado dos Pesos
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(userProfileTrie.current.getAllInterests().entries()).slice(0, 5).map(([tag, score]) => (
                          <div key={tag} className="bg-indigo-800 px-2 py-1 rounded border border-indigo-600 text-[10px] text-white flex items-center gap-2">
                            <span className="text-indigo-300 font-mono">#{tag}</span>
                            <span className="font-bold text-emerald-400">+{score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Árvore 2: Árvore N-ária */}
              <div className="space-y-4">
                <div className="bg-white p-1 rounded-xl shadow-md border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs font-mono flex justify-between items-center">
                    <span>N-ARY_TREE :: CATALOGO_HIERARQUICO</span>
                    <span className="flex items-center gap-1 text-blue-400"><Layers size={12} /> VIRTUAL_FS</span>
                  </div>
                  <div className="overflow-auto max-h-[450px] p-4">
                    <div className="min-w-[1000px]">
                      <TreeVisualizer data={productCatalogTree.current.toTreeData()} type="CATEGORY" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 border-t border-slate-200">
                    <div className="flex items-start gap-6">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Percurso de Injeção Dinâmica</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <span className="bg-slate-100 px-2 py-1 rounded border">Raiz</span>
                            <span className="text-slate-300">→</span>
                            <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100 text-blue-700">Novidades</span>
                            <span className="text-slate-300">→</span>
                            <span className="bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-emerald-700">Setor Dinâmico</span>
                            <span className="text-slate-300">→</span>
                            <span className="bg-indigo-50 px-2 py-1 rounded border border-indigo-100 text-indigo-700 italic">Produto Injetado (Fim do Ramo)</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/3 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Análise de Topologia</span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Organizado como pastas de computador: cada categoria pode ter várias subcategorias.
                          A velocidade de busca depende apenas de quão "fundo" o produto está na hierarquia, e não do tamanho total da loja.
                        </p>
                      </div>
                    </div>
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