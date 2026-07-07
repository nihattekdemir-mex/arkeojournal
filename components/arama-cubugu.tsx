'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AramaCubuguProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function AramaCubugu({ onSearch, initialValue = '' }: AramaCubuguProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e?.preventDefault?.();
    onSearch?.(query);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e?.target?.value ?? '')}
          placeholder="Haberlerde ara..."
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
        Ara
      </Button>
    </form>
  );
}
