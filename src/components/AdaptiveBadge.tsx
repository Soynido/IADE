/**
 * Badge "Adapté pour vous" pour les questions recommandées
 * Affiche pourquoi la question est recommandée (tooltip)
 */

import React from 'react';
import { Target } from 'lucide-react';

interface AdaptiveBadgeProps {
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AdaptiveBadge({ reason, size = 'md' }: AdaptiveBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-medium shadow-md ${sizeClasses[size]}`}
      title={reason || 'Question adaptée à votre niveau'}
    >
      <Target className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
      <span>Adapté pour vous</span>
      {reason && (
        <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs p-2 rounded shadow-lg -bottom-10 left-0 w-max max-w-xs">
          {reason}
        </div>
      )}
    </div>
  );
}

/**
 * Tooltip séparé pour afficher le raisonnement détaillé
 */
export function AdaptiveBadgeWithTooltip({ reason }: { reason: string }) {
  return (
    <div className="group relative inline-block">
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full px-3 py-1.5 text-sm font-medium shadow-md cursor-help">
        <Target className="h-4 w-4" />
        <span>🎯 Adapté</span>
      </div>
      
      {/* Tooltip */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl w-64 pointer-events-none">
        <div className="font-semibold mb-1">Pourquoi cette question ?</div>
        <p className="text-gray-200">{reason}</p>
        {/* Flèche */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

