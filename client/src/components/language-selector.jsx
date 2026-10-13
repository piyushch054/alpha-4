import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { broadcastLanguage, savedLanguage } from '@/lib/localization';

const languages = [
{ code: 'en', name: 'English', native: 'English' },
{ code: 'hi', name: 'Hindi', native: 'हिन्दी' },
{ code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
{ code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
{ code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
{ code: 'mr', name: 'Marathi', native: 'मराठी' }];


export function LanguageSelector() {
  const [language, setLanguage] = useState('en');
  const [container, setContainer] = useState();
  useEffect(() => {
    setLanguage(savedLanguage());
    const listener = (event) => setLanguage(event.detail.language);
    window.addEventListener('namdev-language-change', listener);
    return () => window.removeEventListener('namdev-language-change', listener);
  }, []);
  function choose(value) {
    setLanguage(value);
    try {localStorage.setItem('namdev-language', value);} catch {/* Keep session selection. */}
    broadcastLanguage(value);
  }
  return <Select value={language} onValueChange={choose}>
    <SelectTrigger ref={(node) => {if (node) setContainer(node.ownerDocument.body);}} data-no-translate aria-label="Choose language" className="h-9 w-36 shrink-0 gap-2 border-border bg-card text-foreground hover:bg-accent focus:ring-primary">
      <Languages size={16} className="shrink-0 text-primary" />
      <SelectValue>{languages.find((item) => item.code === language)?.native}</SelectValue>
    </SelectTrigger>
    <SelectContent container={container} data-no-translate align="end" className="enterprise-language-menu min-w-48">
      {languages.map((item) => <SelectItem key={item.code} value={item.code} className="py-2.5">
        <span className="flex items-center gap-3"><span className="min-w-16 font-medium">{item.native}</span>{item.code !== 'en' && <span className="text-xs text-muted-foreground">{item.name}</span>}</span>
      </SelectItem>)}
    </SelectContent>
  </Select>;
}