import {
  biggerSearchbar,
  markerLinks,
  routeProfiles,
  smallerFont,
} from './settings';

const SETTINGS = {
  markerLinks,
  routeProfiles,
  smallerFont,
  biggerSearchbar,
} as const;

/** Load stored values into the switches. */
async function load(): Promise<void> {
  await Promise.all(
    Object.entries(SETTINGS).map(async ([id, item]) => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) input.checked = await item.getValue();
    }),
  );
}

/** Persist a single switch's state, then flash the "saved" feedback. */
async function save(
  id: keyof typeof SETTINGS,
  checked: boolean,
): Promise<void> {
  await SETTINGS[id].setValue(checked);
  showSaved();
}

/** Blink the "Settings saved" message even on back-to-back saves. */
function showSaved(): void {
  const feedback = document.getElementById('refresh');
  if (!feedback) return;

  if (!feedback.classList.contains('hidden')) {
    feedback.classList.add('hidden');
    setTimeout(() => feedback.classList.remove('hidden'), 300);
    return;
  }
  feedback.classList.remove('hidden');
}

document
  .querySelectorAll<HTMLInputElement>('.saveOnChange')
  .forEach((input) => {
    input.addEventListener('change', () => {
      if (input.id in SETTINGS) {
        void save(input.id as keyof typeof SETTINGS, input.checked);
      }
    });
  });

void load();
