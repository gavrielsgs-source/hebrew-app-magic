
/**
 * Hebrew translations for car field values
 */

export function translateTransmission(value: string | null | undefined): string {
  if (!value) return 'לא צוין';
  const map: Record<string, string> = {
    'manual': 'ידנית',
    'automatic': 'אוטומטית',
    'robotics': 'רובוטית',
    'רובוטית': 'רובוטית',
    'אוטומטית': 'אוטומטית',
    'ידנית': 'ידנית',
    'tiptronic': 'טיפטרוניק',
  };
  return map[value.toLowerCase()] || value;
}

export function translateFuelType(value: string | null | undefined): string {
  if (!value) return 'לא צוין';
  const map: Record<string, string> = {
    'gasoline': 'בנזין',
    'petrol': 'בנזין',
    'diesel': 'דיזל',
    'hybrid': 'היברידי',
    'electric': 'חשמלי',
    'plugin_hybrid': 'היברידי נטען',
    'plug-in hybrid': 'היברידי נטען',
    'lpg': 'גז',
    'gas': 'גז',
    'בנזין': 'בנזין',
    'דיזל': 'דיזל',
    'היברידי': 'היברידי',
    'חשמלי': 'חשמלי',
  };
  return map[value.toLowerCase()] || value;
}

export function translateColor(value: string | null | undefined): string {
  if (!value) return 'לא צוין';
  const map: Record<string, string> = {
    'white': 'לבן',
    'black': 'שחור',
    'silver': 'כסוף',
    'gray': 'אפור',
    'grey': 'אפור',
    'red': 'אדום',
    'blue': 'כחול',
    'green': 'ירוק',
    'brown': 'חום',
    'beige': 'בז\'',
    'gold': 'זהב',
    'orange': 'כתום',
    'yellow': 'צהוב',
    'purple': 'סגול',
    'burgundy': 'בורדו',
  };
  return map[value.toLowerCase()] || value;
}
