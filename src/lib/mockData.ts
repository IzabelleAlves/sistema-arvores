// import { Product } from '../types';

import type { Product } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Tênis Air Zoom Pegasus',
    brand: 'Nike',
    categoryPath: ['Esportes', 'Corrida', 'Calçados'],
    description: 'Tênis de corrida versátil com espuma responsiva para o dia a dia.',
    keywords: ['nike', 'corrida', 'tênis', 'maratona', 'conforto'],
    price: 699.90
  },
  {
    id: 'p2',
    name: 'Ultraboost Light',
    brand: 'Adidas',
    categoryPath: ['Esportes', 'Corrida', 'Calçados'],
    description: 'Retorno de energia leve para corredores que buscam performance.',
    keywords: ['adidas', 'corrida', 'boost', 'amortecimento', 'cooper'],
    price: 899.90
  },
  {
    id: 'p3',
    name: 'Galaxy Watch 6',
    brand: 'Samsung',
    categoryPath: ['Eletrônicos', 'Wearables', 'Smartwatches'],
    description: 'Monitoramento avançado de sono e frequência cardíaca.',
    keywords: ['samsung', 'smartwatch', 'fitness', 'monitor', 'saúde', 'relógio'],
    price: 1499.00
  },
  {
    id: 'p4',
    name: 'Fone WH-1000XM5',
    brand: 'Sony',
    categoryPath: ['Eletrônicos', 'Áudio', 'Headphones'],
    description: 'Cancelamento de ruído líder da indústria com som premium.',
    keywords: ['sony', 'áudio', 'música', 'cancelamento de ruído', 'viagem', 'fone'],
    price: 2199.00
  },
  {
    id: 'p5',
    name: 'Tapete de Yoga Pro',
    brand: 'Lululemon',
    categoryPath: ['Esportes', 'Yoga', 'Acessórios'],
    description: 'Tapete antiderrapante para sessões intensas de yoga e pilates.',
    keywords: ['yoga', 'tapete', 'pilates', 'alongamento', 'lululemon', 'treino'],
    price: 450.00
  },
   {
    id: 'p6',
    name: 'MacBook Air M2',
    brand: 'Apple',
    categoryPath: ['Eletrônicos', 'Computadores', 'Laptops'],
    description: 'Chip M2 ultra rápido, design fino e bateria para o dia todo.',
    keywords: ['apple', 'macbook', 'laptop', 'tecnologia', 'trabalho', 'computador'],
    price: 7599.00
  },
  {
    id: 'p7',
    name: 'Camisa Brasil Seleção',
    brand: 'Nike',
    categoryPath: ['Esportes', 'Futebol', 'Roupas'],
    description: 'Camisa oficial da seleção brasileira, tecido respirável.',
    keywords: ['nike', 'futebol', 'brasil', 'camisa', 'esporte', 'copa'],
    price: 349.90
  },
  {
    id: 'p8',
    name: 'Cafeteira Expresso',
    brand: 'Oster',
    categoryPath: ['Casa', 'Cozinha', 'Eletroportáteis'],
    description: 'Prepare cafés expressos e cappuccinos cremosos em casa.',
    keywords: ['café', 'expresso', 'cozinha', 'eletro', 'casa', 'bebida'],
    price: 599.00
  }
];
