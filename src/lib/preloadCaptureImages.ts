/** Preload img elements inside a capture root so html-to-image includes them in PNG export. */
export async function preloadCaptureImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  const urls = images
    .map((img) => img.getAttribute('src'))
    .filter((src): src is string => Boolean(src?.trim()));

  const uniqueUrls = Array.from(new Set(urls));

  await Promise.all(
    uniqueUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
}
