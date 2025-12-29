import React from 'react';
import { Tag, Star, Package, TrendingUp } from 'lucide-react';
import type { Product } from '../types';

interface ModernUserProfileProps {
    interests: Map<string, number>;
    recommendedProducts: Product[];
}

export const ModernUserProfile: React.FC<ModernUserProfileProps> = ({ interests, recommendedProducts }) => {
    // Pegamos os 3 principais interesses da Trie para servirem de "Categorias Favoritas"
    const topInterests = Array.from(interests.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" /> Seu Perfil de Consumo
                    </h2>
                    <p className="text-slate-500 text-sm">Baseado na sua navegação recente</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-2xl">
                    <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> VIP Insights
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topInterests.length > 0 ? (
                    topInterests.map(([term, weight]) => (
                        <div key={term} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 transition-all group">
                            {/* Etiqueta estilo Trello */}
                            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase mb-4 shadow-lg shadow-indigo-100 group-hover:-translate-y-1 transition-transform">
                                <Tag size={10} /> {term}
                            </div>

                            <h4 className="text-slate-700 font-bold text-sm mb-3 flex items-center gap-2">
                                <Package size={14} className="text-slate-400" /> Preferências:
                            </h4>

                            <ul className="space-y-2">
                                {/* Filtramos produtos que batem com esse termo da árvore */}
                                {recommendedProducts
                                    .filter(p =>
                                        p.keywords.includes(term) ||
                                        p.categoryPath.some(c => c.toLowerCase() === term)
                                    )
                                    .slice(0, 2)
                                    .map(p => (
                                        <li key={p.id} className="text-xs text-slate-600 flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            {p.name}
                                        </li>
                                    ))}
                                {/* Caso não tenha produto específico, mostra um placeholder amigável */}
                                {recommendedProducts.filter(p => p.keywords.includes(term)).length === 0 && (
                                    <li className="text-[10px] text-slate-400 italic">Analisando novos produtos...</li>
                                )}
                            </ul>

                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold">RELEVÂNCIA</span>
                                <span className="text-xs font-black text-indigo-600">{(weight * 10).toFixed(0)}%</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm italic">Navegue pela loja para mapearmos seus gostos!</p>
                    </div>
                )}
            </div>
        </div>
    );
};