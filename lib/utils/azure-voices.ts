/** Shared Azure neural voice list — used by the API route and NarrationPlayer UI */
export const AZURE_VOICES = [
  { id: 'en-US-AriaNeural',       label: 'Aria',     gender: 'F', accent: 'American' },
  { id: 'en-US-JennyNeural',      label: 'Jenny',    gender: 'F', accent: 'American' },
  { id: 'en-US-CoraNeural',       label: 'Cora',     gender: 'F', accent: 'American' },
  { id: 'en-US-MichelleNeural',   label: 'Michelle', gender: 'F', accent: 'American' },
  { id: 'en-US-GuyNeural',        label: 'Guy',      gender: 'M', accent: 'American' },
  { id: 'en-US-DavisNeural',      label: 'Davis',    gender: 'M', accent: 'American' },
  { id: 'en-US-TonyNeural',       label: 'Tony',     gender: 'M', accent: 'American' },
  { id: 'en-GB-SoniaNeural',      label: 'Sonia',    gender: 'F', accent: 'British' },
  { id: 'en-GB-RyanNeural',       label: 'Ryan',     gender: 'M', accent: 'British' },
  { id: 'en-AU-NatashaNeural',    label: 'Natasha',  gender: 'F', accent: 'Australian' },
  { id: 'en-AU-WilliamNeural',    label: 'William',  gender: 'M', accent: 'Australian' },
] as const;

export type AzureVoiceId = typeof AZURE_VOICES[number]['id'];
