'use client';

import { Button } from '@/components/ui/button';
import { Pickaxe, GraduationCap, Building2, LayoutGrid } from 'lucide-react';
import { KATEGORI_LABELS } from '@/lib/constants';

const KATEGORI_ICONS: Record<string, React.ReactNode> = {
  KAZIDAN_HABERLER: <Pickaxe className="h-4 w-4" />,
  OKULDAN_HABERLER: <GraduationCap className="h-4 w-4" />,
  MUZEDEN_HABERLER: <Building2 className="h-4 w-4" />,
};

interface KategoriFilterProps {
  selected: string | null;
  onSelect: (kategori: string | null) => void;
}

export function KategoriFiltre({ selected, onSelect }: KategoriFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect?.(null)}
        className={selected === null ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
      >
        <LayoutGrid className="mr-1.5 h-4 w-4" />
        Tümü
      </Button>
      {Object.entries(KATEGORI_LABELS).map(([key, label]: [string, string]) => (
        <Button
          key={key}
          variant={selected === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect?.(key)}
          className={selected === key ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
        >
          {KATEGORI_ICONS[key]}
          <span className="ml-1.5">{label}</span>
        </Button>
      ))}
    </div>
  );
}
