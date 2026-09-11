import { toJpeg } from 'html-to-image';

export async function captureAppScreen(element: HTMLElement): Promise<string> {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  return toJpeg(element, {
    quality: 0.76,
    pixelRatio,
    cacheBust: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--app-background').trim() || '#f3f5f1',
    filter: (node) => {
      if (!(node instanceof HTMLElement)) {
        return true;
      }
      return node.dataset.noCapture !== 'true';
    }
  });
}
