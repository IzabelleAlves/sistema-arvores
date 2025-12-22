import React from 'react';
import { Tag, User, History, Search, Play, MessageSquare, MousePointer2 } from 'lucide-react';

interface UserProfileBoardProps {
  interests: Map<string, number>;
  history: { type: string; content: string; timestamp: number }[];
  onSimulate: (type: 'social' | 'stream', content: string) => void;
}

export const UserProfileBoard: React.FC<UserProfileBoardProps> = ({ interests, history, onSimulate }) => {
  // Converte o Map da Trie para uma lista ordenada de interesses para as etiquetas
  const sortedInterests = Array.from(interests.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: INTERESSES (ETIQUETAS ESTILO TRELLO) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">Meu Perfil de Consumo</h3>
            <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider font-semibold italic">Interesses Identificados</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedInterests.length > 0 ? (
            sortedInterests.map(([term, weight]) => (
              <div key={term} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg transition-all hover:scale-105">
                <Tag size={12} className="text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 capitalize">{term}</span>
                <span className="text-[10px] bg-white text-indigo-400 px-1 rounded border border-indigo-100 font-black">
                  {(weight * 10).toFixed(0)}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-4">Navegue para gerar seu perfil...</p>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: HISTÓRICO DE CAPTURA (LISTAGEM PARA LEIGOS) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-800 p-2 rounded-lg text-white">
            <History size={18} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase">Rastro de Navegação</h3>
        </div>

        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((log, i) => (
            <div key={i} className="flex gap-3 border-l-2 border-slate-100 pl-4 relative">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {log.type === 'SEARCH' && <Search size={10} className="text-blue-500" />}
                  {log.type === 'STREAMING' && <Play size={10} className="text-red-500" />}
                  {log.type === 'SOCIAL_POST' && <MessageSquare size={10} className="text-pink-500" />}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {log.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">"{log.content}"</p>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma atividade recente.</p>}
        </div>
      </div>

      {/* SEÇÃO 3: ENTRADA DE DADOS (SIMULADOR DE CAPTURA) */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
        <h4 className="text-[10px] font-black mb-4 flex items-center gap-2 text-indigo-400 tracking-widest uppercase">
          <MousePointer2 size={14} /> Simular Comportamento
        </h4>
        <div className="space-y-2">
          <button 
            onClick={() => onSimulate('stream', 'Review de Tênis de Corrida Nike')}
            className="w-full text-left text-[11px] bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all active:scale-95"
          >
            🏃 Assistiu vídeo de "Esportes"
          </button>
          <button 
            onClick={() => onSimulate('social', 'Quero comprar uma guitarra nova')}
            className="w-full text-left text-[11px] bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all active:scale-95"
          >
            🎸 Postou sobre "Música"
          </button>
        </div>
      </div>
    </div>
  );
};