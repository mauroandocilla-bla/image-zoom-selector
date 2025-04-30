import React from 'react';
import { Search, Move, Square, RotateCcw, Info } from 'lucide-react';

interface IconProps {
  className?: string;
}

export const ZoomIcon: React.FC<IconProps> = ({ className }) => (
  <Search className={className} size={20} />
);

export const DragIcon: React.FC<IconProps> = ({ className }) => (
  <Move className={className} size={20} />
);

export const SelectIcon: React.FC<IconProps> = ({ className }) => (
  <Square className={className} size={20} />
);

export const ResetIcon: React.FC<IconProps> = ({ className }) => (
  <RotateCcw className={className} size={20} />
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <Info className={className} size={14} />
); 