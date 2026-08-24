export const IMAGE_FILE_FILTER = [
  { name: 'PNG', extensions: ['png'] },
  {
    name: 'JPEG',
    extensions: ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp'],
  },
  { name: 'WebP', extensions: ['webp'] },
  { name: 'BMP', extensions: ['bmp'] },
  { name: 'GIF', extensions: ['gif'] },
  { name: 'APNG', extensions: ['apng'] },
  { name: 'AVIF', extensions: ['avif'] },
];

export const SUPPORTED_AUDIO_FORMAT = (() => {
  const audio = document.createElement('audio');
  return [
    'audio/mp3',
    'audio/flac',
    'audio/aac',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
    'audio/mpeg',
    'audio/3gpp',
  ].filter((type) => audio.canPlayType(type));
})();

export const SUPPORTED_AUDIO_FILTER_MAP = (() => {
  const filterMap: Record<string, { name: string; extensions: string[] }> = {
    'audio/3gpp': { name: '3GP', extensions: ['3gp'] },
    'audio/aac': { name: 'ADTS', extensions: ['aac'] },
    'audio/flac': { name: 'FLAC', extensions: ['flac'] },
    'audio/mpeg': { name: 'MPEG', extensions: ['mpg', 'mpeg'] },
    'audio/mp3': { name: 'MP3', extensions: ['mp3'] },
    'audio/mp4': { name: 'MPEG-4', extensions: ['mp4', 'm4a'] },
    'audio/ogg': { name: 'Ogg', extensions: ['oga', 'ogg'] },
    'audio/wav': { name: 'WAV', extensions: ['wav'] },
    'audio/webm': { name: 'WebM', extensions: ['webm'] },
  };
  return SUPPORTED_AUDIO_FORMAT.map((item) => filterMap[item]);
})();

export const SILENCE_AUDIO: string = await (() => {
  const writeString = (
    view: DataView<ArrayBuffer>,
    offset: number,
    str: string,
  ) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  const buffer = new ArrayBuffer(44 + 80000);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + 80000, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, 80000, true);
  const dataOffset = 44;
  for (let i = 0; i < 80000; i++) {
    view.setUint8(dataOffset + i, 128);
  }
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
})();
