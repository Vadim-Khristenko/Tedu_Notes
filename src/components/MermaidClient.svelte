<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type MermaidModule = {
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, code: string) => Promise<{ svg: string }>;
  };

  import i18nit from '$i18n';

  let mermaidModule: MermaidModule | null = null;
  let currentTheme: string | null = null;
  let t: (key: string, params?: Record<string, string | number>) => string = (k) => k;
  let svgCache = new Map<string, string>();
  let nextIdCounter = 0;

  function resolveTheme(): 'default' | 'dark' {
    const themeAttr = document.documentElement.dataset.theme;
    if (themeAttr === 'dark') return 'dark';
    if (themeAttr === 'light') return 'default';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';
  }

  async function importMermaid() {
    // separate small helper to make import errors explicit
    try {
      const mod = await import('mermaid');
      const instance = (mod as any).default ?? mod;
      return instance as MermaidModule;
    } catch (err) {
      // bubble up a clear message for the caller
      const e = new Error('FAILED TO IMPORT MAIN MERMAID LIB.');
      // attach original cause for debugging
      (e as any).cause = err;
      throw e;
    }
  }

  async function ensureMermaid(themeOverride?: 'default' | 'dark') {
    if (!mermaidModule) {
      mermaidModule = await importMermaid();
    }

    const theme = themeOverride ?? resolveTheme();
    if (currentTheme !== theme) {
      mermaidModule!.initialize({
        startOnLoad: false,
        theme,
        securityLevel: 'loose'
      });
      currentTheme = theme;
    }

    return mermaidModule!;
  }

  function setLoading(el: HTMLElement) {
    el.classList.add('mermaid');
    el.dataset.mermaidState = 'rendering';
    el.innerHTML = `<div class="mermaid-loading">${t('mermaid.rendering')}</div>`;
  }

  function setError(el: HTMLElement, message: string) {
    el.classList.add('mermaid');
    el.dataset.mermaidState = 'error';
    el.innerHTML = `<pre class="mermaid-error">${t('mermaid.failed_to_render')}: ${message}</pre>`;
  }

  function safeId() {
    // produce an id that's safe for selectors: only letters, numbers, hyphens
    return `mermaid-${Date.now()}-${nextIdCounter++}`;
  }

  function addControls(el: HTMLElement, svg: string, code: string) {
    // remove existing controls if any
    const existing = el.querySelector(':scope > .mermaid-controls');
    if (existing) existing.remove();

  const controls = document.createElement('div');
    controls.className = 'mermaid-controls';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'mermaid-copy-btn';
  copyBtn.title = t('mermaid.controls.copy');
    copyBtn.type = 'button';
  copyBtn.textContent = `📋 ${t('mermaid.controls.copy')}`;

  const regenerateBtn = document.createElement('button');
  regenerateBtn.className = 'mermaid-regenerate-btn';
  regenerateBtn.title = t('mermaid.controls.regenerate');
  regenerateBtn.type = 'button';
  regenerateBtn.textContent = `🔄 ${t('mermaid.controls.regenerate')}`;

    controls.appendChild(copyBtn);
    controls.appendChild(regenerateBtn);

    copyBtn.addEventListener('click', async () => {
  const original = copyBtn.textContent;
  copyBtn.disabled = true;
  copyBtn.textContent = t('mermaid.controls.copying');
      try {
        // Try to convert SVG to PNG blob and copy as image
        const pngBlob = await svgToPngBlob(svg);
        if (navigator.clipboard && (window as any).ClipboardItem) {
          try {
            await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': pngBlob })]);
            copyBtn.textContent = t('mermaid.controls.copied');
          } catch (err) {
            // Fallback to copying SVG text
            console.warn('Image copy failed, falling back to SVG text', err);
            await navigator.clipboard.writeText(svg);
            copyBtn.textContent = t('mermaid.controls.copied_svg');
          }
        } else {
          // Older browsers: fallback to copying SVG text
          await navigator.clipboard.writeText(svg);
          copyBtn.textContent = t('mermaid.controls.copied_svg');
        }
      } catch (err) {
        console.error('Failed to copy image, fallback to SVG text', err);
        try {
          await navigator.clipboard.writeText(svg);
          copyBtn.textContent = t('mermaid.controls.copied_svg');
        } catch (err2) {
          console.error('Failed to copy SVG as text', err2);
          copyBtn.textContent = t('mermaid.controls.copy_failed');
        }
      } finally {
        setTimeout(() => {
          copyBtn.disabled = false;
          copyBtn.textContent = original;
        }, 1400);
      }
    });

    regenerateBtn.addEventListener('click', () => {
      const theme = resolveTheme();
      const cacheKey = `${code}|${theme}`;
      svgCache.delete(cacheKey);
      // re-render this element with force
      renderMermaidForElement(el, { force: true });
    });

    el.appendChild(controls);
  }

  async function renderMermaidForElement(el: HTMLElement, options: { force?: boolean } = {}) {
    const code = (el.dataset.mermaid || '').trim();
    if (!code) {
      setError(el, 'Missing source code.');
      return;
    }

    const theme = resolveTheme();
    const cacheKey = `${code}|${theme}`;
    const cachedSvg = svgCache.get(cacheKey);

    // If we have cached SVG and content didn't change, show it immediately without any loading placeholder.
    if (cachedSvg && !options.force) {
      el.classList.add('mermaid');
      el.dataset.mermaidState = 'rendered';
      el.innerHTML = cachedSvg;
      addControls(el, cachedSvg, code);
      return;
    }

    // Show loading immediately (synchronously) before any awaits/imports to avoid flicker/order issues
    setLoading(el);

    // Ensure mermaid library is available and initialized
    let mermaid: MermaidModule | null = null;
    try {
      mermaid = await ensureMermaid();
    } catch (err: any) {
      // Import/init failed — show a clear red message
      console.warn('Mermaid client failed to load', err);
      setError(el, err?.message ?? 'FAILED TO IMPORT MAIN MERMAID LIB.');
      return;
    }

    // Render using a safe id (no dots from Math.random)
    const id = safeId();

    try {
      // call render without passing the container to avoid mermaid's internal selector issues
      const result = await mermaid.render(id, code);
      const svg = result.svg;
      el.classList.add('mermaid');
      el.dataset.mermaidState = 'rendered';
      el.innerHTML = svg;
      svgCache.set(cacheKey, svg);
      addControls(el, svg, code);
    } catch (error: any) {
      console.error('MermaidClient: render failed', error);
      const message = error instanceof Error ? error.message : String(error);
      setError(el, `Failed to render diagram.\n${message}`);
    }
  }

  // Convert inline SVG string to PNG Blob. Uses an offscreen canvas.
  async function svgToPngBlob(svgText: string): Promise<Blob> {
    // ensure SVG has proper XML namespace
    const svg = svgText.includes('xmlns') ? svgText : svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const svg64 = btoa(unescape(encodeURIComponent(svg)));
    const b64Start = 'data:image/svg+xml;base64,';
    const imgSrc = b64Start + svg64;

    return await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
          // draw white background to avoid transparent PNGs that look odd on dark backgrounds
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to create PNG blob'));
            resolve(blob);
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (e) => reject(new Error('Failed to load SVG into image'));
      img.crossOrigin = 'anonymous';
      img.src = imgSrc;
    });
  }

  async function renderMermaid(options: { force?: boolean } = {}) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.mermaid-block'));
    if (nodes.length === 0) return;

    // First pass: synchronously decide which nodes can be displayed from cache immediately,
    // and place loading placeholders for those that need rendering.
    const toRender: HTMLElement[] = [];
    for (const el of nodes) {
      const code = (el.dataset.mermaid || '').trim();
      if (!code) {
        setError(el, 'Missing source code.');
        continue;
      }
      const theme = resolveTheme();
      const cacheKey = `${code}|${theme}`;
      const cachedSvg = svgCache.get(cacheKey);
      if (cachedSvg && !options.force) {
        // show cached immediately without loading
        el.classList.add('mermaid');
        el.dataset.mermaidState = 'rendered';
        el.innerHTML = cachedSvg;
        addControls(el, cachedSvg, code);
      } else {
        // mark as loading and enqueue for render
        setLoading(el);
        toRender.push(el);
      }
    }

    if (toRender.length === 0) return;

    // Try to import/initialize mermaid once. If it fails, show import error on remaining elements.
    try {
      await ensureMermaid();
    } catch (err: any) {
      console.warn('Mermaid client failed to load', err);
      for (const el of toRender) {
        setError(el, err?.message ?? 'FAILED TO IMPORT MAIN MERMAID LIB.');
      }
      return;
    }

    // Render each element sequentially (could be parallelized if desired)
    for (const el of toRender) {
      // If element was removed from DOM meanwhile, skip
      if (!document.body.contains(el)) continue;
      // render with force option passed through
      await renderMermaidForElement(el, options);
    }
  }

  function rerenderWithTheme() {
    svgCache.clear(); // Clear cache on theme change since SVG depends on theme
    const theme = resolveTheme();
    ensureMermaid(theme)
      .then(() => renderMermaid({ force: true }))
      .catch((error) => console.warn('Mermaid theme update failed', error));
  }

  let blockObserver: MutationObserver | null = null;
  let themeObserver: MutationObserver | null = null;

  onMount(() => {
    try {
      // prefer document language; fallback to astro client default if available
      const lang = document.documentElement.lang || ((window as any).__astro_locale ?? undefined) || 'en';
      t = i18nit(lang);
    } catch (err) {
      // keep fallback noop
    }
    // Initial render attempt
    renderMermaid();

    // Re-render when the page is (re)loaded by astro navigation
    window.addEventListener('astro:page-load', () => renderMermaid({ force: true }));

    // Watch for new blocks added dynamically
    blockObserver = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        for (const node of Array.from(mut.addedNodes)) {
          if (node instanceof HTMLElement && node.matches('.mermaid-block')) {
            // render the newly added element only
            renderMermaidForElement(node as HTMLElement, { force: true });
            return;
          }
        }
      }
    });
    blockObserver.observe(document.body, { childList: true, subtree: true });

    // Watch for theme changes
    themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          rerenderWithTheme();
          break;
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });

  onDestroy(() => {
    blockObserver?.disconnect();
    themeObserver?.disconnect();
  });
</script>

<style>
  :global(.mermaid svg) {
    max-width: 100%;
  }

  :global(.mermaid-loading) {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--block-color) 85%, transparent);
    font-size: 0.875rem;
    color: color-mix(in srgb, currentColor 60%, #888);
  }

  :global(.mermaid-error) {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, #f87171 20%, transparent);
    color: #b91c1c;
    white-space: pre-wrap;
    font-size: 0.875rem;
  }

  :global(.mermaid-controls) {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }
  :global(.mermaid-controls button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border: 1px solid var(--mermaid-btn-border, #ccc);
    border-radius: 0.25rem;
    background: var(--mermaid-btn-bg, #f9f9f9);
    color: var(--mermaid-btn-fg, inherit);
    cursor: pointer;
    transition: background .12s ease, transform .06s ease;
  }

  :global(.mermaid-controls button:hover) {
    background: var(--mermaid-btn-bg-hover, #e9e9e9);
    transform: translateY(-1px);
  }

  /* Light theme defaults */
  :global(:root) {
    --mermaid-btn-bg: #f9f9f9;
    --mermaid-btn-bg-hover: #e9e9e9;
    --mermaid-btn-border: #ccc;
  }

  /* Dark theme overrides when site toggles data-theme="dark" */
  :global(html[data-theme="dark"]) {
    --mermaid-btn-bg: #1f2937; /* slate-800 */
    --mermaid-btn-bg-hover: #111827; /* slate-900 */
    --mermaid-btn-border: #374151; /* slate-700 */
    --mermaid-btn-fg: #e5e7eb; /* gray-200 */
  }
</style>

<div></div>