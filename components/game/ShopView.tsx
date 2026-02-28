// ============================================================
// SHOP VIEW — Merchant interface with inventory grid
// ============================================================
'use client';

import React, { useState } from 'react';
import type { MerchantItem } from '@/lib/types/economy';
import type { Item } from '@/lib/types/items';
import Badge from '@/components/ui/Badge';

interface ShopViewProps {
  shopName: string;
  merchantName: string;
  stock: MerchantItem[];
  playerGold: number;
  playerItems: Item[];
  onBuy: (item: MerchantItem) => void;
  onSell: (item: Item) => void;
  onHaggle: (item: MerchantItem) => void;
  onClose: () => void;
  sellMultiplier: number;
}

type TabId = 'buy' | 'sell';

const RARITY_COLORS: Record<string, string> = {
  junk: 'text-slate-400 border-slate-600',
  common: 'text-white border-slate-600',
  uncommon: 'text-green-400 border-green-700',
  rare: 'text-blue-400 border-blue-700',
  'very-rare': 'text-purple-400 border-purple-700',
  legendary: 'text-amber-400 border-amber-600',
  artifact: 'text-red-400 border-red-600',
};

export default function ShopView({
  shopName,
  merchantName,
  stock,
  playerGold,
  playerItems,
  onBuy,
  onSell,
  onHaggle,
  onClose,
  sellMultiplier,
}: ShopViewProps) {
  const [tab, setTab] = useState<TabId>('buy');
  const [selectedBuy, setSelectedBuy] = useState<MerchantItem | null>(null);
  const [selectedSell, setSelectedSell] = useState<Item | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-lg text-primary-400">{shopName}</h2>
          <p className="text-xs text-slate-500">Proprietor: {merchantName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-sm font-medium">💰 {playerGold}g</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-400 text-xl transition-colors"
            aria-label="Close shop"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setTab('buy')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === 'buy'
              ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Buy ({stock.length})
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            tab === 'sell'
              ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Sell ({playerItems.length})
        </button>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Buy tab */}
        {tab === 'buy' && (
          <div className="space-y-2">
            {stock.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">
                The merchant has nothing to sell right now.
              </p>
            )}
            {stock.map((mi, i) => {
              const colors = RARITY_COLORS[mi.item.rarity] || RARITY_COLORS.common;
              const canAfford = playerGold >= mi.price;
              return (
                <div
                  key={mi.item.id}
                  onClick={() => setSelectedBuy(mi)}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedBuy === mi
                      ? 'border-primary-500 bg-primary-900/20'
                      : `${colors.split(' ')[1]} bg-slate-800 hover:bg-slate-700`
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${colors.split(' ')[0]}`}>
                      {mi.item.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      <Badge variant={(mi.item.rarity === 'uncommon' || mi.item.rarity === 'rare' || mi.item.rarity === 'epic' || mi.item.rarity === 'legendary' || mi.item.rarity === 'artifact' || mi.item.rarity === 'common') ? mi.item.rarity as any : 'default'}>{mi.item.rarity}</Badge>{' '}
                      &middot; {mi.item.type}
                      {mi.quantity > 1 && ` (×${mi.quantity})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                      {mi.price}g
                    </span>
                    {mi.priceNegotiable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onHaggle(mi);
                        }}
                        className="text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      >
                        Haggle
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sell tab */}
        {tab === 'sell' && (
          <div className="space-y-2">
            {playerItems.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">
                You have nothing to sell.
              </p>
            )}
            {playerItems.map((item, i) => {
              const sellPrice = Math.max(1, Math.round((item.sellValue || item.baseValue || 10) * sellMultiplier));
              const colors = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSell(item)}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedSell === item
                      ? 'border-primary-500 bg-primary-900/20'
                      : `${colors.split(' ')[1]} bg-slate-800 hover:bg-slate-700`
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${colors.split(' ')[0]}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.rarity} &middot; {item.type}
                    </p>
                  </div>
                  <span className="text-sm text-green-400 font-medium">{sellPrice}g</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 py-3 border-t border-slate-700 flex gap-2">
        {tab === 'buy' && selectedBuy && (
          <button
            onClick={() => {
              onBuy(selectedBuy);
              setSelectedBuy(null);
            }}
            disabled={playerGold < selectedBuy.price}
            className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            Buy {selectedBuy.item.name} ({selectedBuy.price}g)
          </button>
        )}
        {tab === 'sell' && selectedSell && (
          <button
            onClick={() => {
              onSell(selectedSell);
              setSelectedSell(null);
            }}
            className="flex-1 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-medium transition-colors"
          >
            Sell {selectedSell.name}
          </button>
        )}
      </div>
    </div>
  );
}
