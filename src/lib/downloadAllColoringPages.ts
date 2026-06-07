import { RESOURCES } from '../data/resources';

/** Same zip download behavior as Brave Mind Club Resources page coloring section. */
export async function downloadAllColoringPages(): Promise<void> {
  const coloringResources = RESOURCES.filter((r) => r.type === 'coloring');
  if (coloringResources.length === 0) return;

  try {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const resource of coloringResources) {
      const filename =
        resource.fileUrl.split('/').pop() ||
        `${resource.title.replace(/\s+/g, '-')}.jpg`;
      const res = await fetch(resource.fileUrl);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(filename, blob);
      }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'Caiden-Courage-Coloring-Pages.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    coloringResources.forEach((resource, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = resource.fileUrl.split('/').pop() || resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 400);
    });
  }
}
