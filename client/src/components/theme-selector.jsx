import { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { applyTheme, savedTheme, themes } from '@/lib/workspace-appearance';

const labels = { brand: 'Signature', ocean: 'Ocean', forest: 'Forest', rose: 'Rose' };
export function ThemeSelector() {
  const [theme, setTheme] = useState('brand');
  const [container, setContainer] = useState();
  useEffect(() => {const value = savedTheme();setTheme(value);applyTheme(value);}, []);
  return <Popover><PopoverTrigger asChild><Button ref={(node) => {if (node) setContainer(node.ownerDocument.body);}} variant="outline" size="icon" aria-label="Theme colors" title="Theme colors"><Palette /></Button></PopoverTrigger><PopoverContent container={container} align="end" className="enterprise-theme-menu w-64"><h3 className="mb-3 text-sm font-semibold">Theme colors</h3><div className="grid grid-cols-2 gap-2">{themes.map((value) => <Button key={value} variant="outline" className="theme-choice h-auto flex-col gap-2 py-3" aria-pressed={theme === value} onClick={() => {setTheme(value);try {localStorage.setItem('namdev-theme', value);} catch {/* session fallback */}applyTheme(value);}}><span className={'theme-swatch swatch-' + value} /><span className="flex items-center gap-2 text-xs">{labels[value]}{theme === value && <Check size={12} />}</span></Button>)}</div></PopoverContent></Popover>;
}