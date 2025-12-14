import React, { useEffect, useRef } from 'react';
import type { CategoryNodeRenderData, TrieNodeRenderData } from '../types';
import * as d3 from 'd3';
// import { TrieNodeRenderData, CategoryNodeRenderData } from '../types';

interface TreeVisualizerProps {
  data: TrieNodeRenderData | CategoryNodeRenderData;
  type: 'TRIE' | 'CATEGORY';
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data, type }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || !data) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = wrapperRef.current.clientWidth;
    const height = 400;
    
    // Create hierarchy
    // const root = d3.hierarchy(data);
    const root = d3.hierarchy<TrieNodeRenderData | CategoryNodeRenderData>(data);

    
    // Define tree layout
    // const treeLayout = d3.tree().size([width - 100, height - 100]);
    const treeLayout = d3
  .tree<TrieNodeRenderData | CategoryNodeRenderData>()
  .size([width - 100, height - 100]);

    treeLayout(root);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(50, 50)");

    // Links
    svg.selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any
      )
      .attr('fill', 'none')
      .attr('stroke', type === 'TRIE' ? '#6366f1' : '#10b981')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5);

    // Nodes
    const nodes = svg.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodes.append('circle')
      .attr('r', (d: any) => {
        // Larger nodes for higher weight in Trie
        if (type === 'TRIE' && d.data.value) return 5 + Math.min(d.data.value, 10);
        return 6;
      })
      .attr('fill', type === 'TRIE' ? '#4338ca' : '#047857')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', (d: any) => d.children ? -15 : 20)
      .attr('text-anchor', 'middle')
      .text((d: any) => {
          if (type === 'CATEGORY') {
              return `${d.data.name} (${d.data.productCount || 0})`;
          }
          return d.data.name;
      })
      .attr('font-size', '10px')
      .attr('fill', '#334155')
      .style('font-weight', '600')
      .style("text-shadow", "1px 1px 0px white");

  }, [data, type]);

  return (
    <div ref={wrapperRef} className="w-full h-[420px] border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-4 py-2 border-b text-xs font-bold uppercase tracking-wider text-slate-500">
        {type === 'TRIE' ? 'Estrutura do Perfil (Trie Ponderada)' : 'Estrutura do Catálogo (Árvore N-ária)'}
      </div>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};
