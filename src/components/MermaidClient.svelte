<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type MermaidModule = {
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, code: string) => Promise<{ svg: string }>;
  };

  import i18nit from '$i18n';

  let mermaidModule: MermaidModule | null = null;
  let currentTheme: string | null = null;
  let currentScale: number = 1;
  let t: (key: string, params?: Record<string, string | number>) => string = (k) => k;
  let svgCache = new Map<string, string>();
  let nextIdCounter = 0;

  /**
   * Адаптивная палитра цветов для выделения в Mermaid диаграммах
   * Автоматически подстраиваются под текущую тему (светлая/тёмная)
   * 
   * Доступные цвета:
   * - red, orange, yellow, lime, green
   * - cyan, blue, purple, pink, gray
   * 
   * НОВЫЙ СПОСОБ: Используй символические имена в диаграммах, компонент их заменит на правильные hex-коды!
   * Использование в диаграммах Mermaid:
   * ```
   * style NODE fill:green    # Автоматически заменится на #22c55e (light) или #0d3b0d (dark)
   * style NODE fill:cyan     # Автоматически заменится на #06b6d4 (light) или #003d4d (dark)
   * style NODE fill:yellow   # Автоматически заменится на #eab308 (light) или #4a3600 (dark)
   * ```
   * 
   * Компонент MermaidClient будет перехватывать эти обозначения и заменять на реальные hex-коды
   * перед отправкой в Mermaid.render(), что обеспечит корректное отображение в обеих темах!
   */
  export const adaptiveColors = {
    light: {
      red: '#e14646',
      orange: '#f97316',
      yellow: '#eab308',
      lime: '#65a30d',
      green: '#22c55e',
      cyan: '#06b6d4',
      blue: '#3b82f6',
      purple: '#a855f7',
      pink: '#ec4899',
      gray: '#6b7280',
      wrapper_bg: '#ffffff'
    },
    dark: {
      red: '#500000',
      orange: '#5a3000',
      yellow: '#4a3600',
      lime: '#1a3a0a',
      green: '#0d3b0d',
      cyan: '#003d4d',
      blue: '#001a4d',
      purple: '#2d0052',
      pink: '#4d0033',
      gray: '#2a2a2a',
      wrapper_bg: '#0a0a0a'
    }
  };

  // Получить цвет в зависимости от текущей темы
  export function getAdaptiveColor(colorName: keyof typeof adaptiveColors.light, theme?: 'light' | 'dark'): string {
    const currentThemeMode = theme ?? (resolveTheme() === 'dark' ? 'dark' : 'light');
    return adaptiveColors[currentThemeMode][colorName] ?? '#999999';
  }

  function resolveTheme(): 'default' | 'dark' {
    const themeAttr = document.documentElement.dataset.theme;
    if (themeAttr === 'dark') return 'dark';
    if (themeAttr === 'light') return 'default';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';
  }

  function getThemeConfig(theme: 'default' | 'dark'): Record<string, unknown> {
    const isDark = theme === 'dark';
    return {
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      darkMode: isDark,
      themeVariables: {
        primaryColor: isDark ? '#2a2a2a' : '#f0f0f0',
        primaryTextColor: isDark ? '#ffffff' : '#000000',
        primaryBorderColor: isDark ? '#444444' : '#cccccc',
        secondBkgColor: isDark ? '#1a1a1a' : '#ffffff',
        secondTextColor: isDark ? '#ffffff' : '#000000',
        tertiaryColor: isDark ? '#333333' : '#e8e8e8',
        tertiaryTextColor: isDark ? '#ffffff' : '#000000',
        tertiaryBorderColor: isDark ? '#555555' : '#bbbbbb',
        noteBkgColor: isDark ? '#2a2a2a' : '#fff9e6',
        noteTextColor: isDark ? '#ffffff' : '#000000',
        noteBorderColor: isDark ? '#555555' : '#ffcc00',
        lineColor: isDark ? '#bdbdbd' : '#dddddd',
        textColor: isDark ? '#ffffff' : '#000000',
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        red: isDark ? '#500000' : '#e14646',
        orange: isDark ? '#5a3000' : '#f97316',
        yellow: isDark ? '#4a3600' : '#eab308',
        lime: isDark ? '#1a3a0a' : '#65a30d',
        green: isDark ? '#0d3b0d' : '#22c55e',
        cyan: isDark ? '#003d4d' : '#06b6d4',
        blue: isDark ? '#001a4d' : '#3b82f6',
        purple: isDark ? '#2d0052' : '#a855f7',
        pink: isDark ? '#4d0033' : '#ec4899',
        gray: isDark ? '#2a2a2a' : '#6b7280',
        wrapper_bg: isDark ? '#0a0a0a' : '#ffffff'
      }
    };
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
      mermaidModule!.initialize(getThemeConfig(theme));
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

    // remove existing svg wrapper if any
    const existingWrapper = el.querySelector(':scope > .mermaid-svg-wrapper');
    if (existingWrapper) existingWrapper.remove();

    const controls = document.createElement('div');
    controls.className = 'mermaid-controls';

    // Кнопка копирования
    const copyBtn = document.createElement('button');
    copyBtn.className = 'mermaid-copy-btn';
    copyBtn.title = t('mermaid.controls.copy');
    copyBtn.type = 'button';
    copyBtn.textContent = `📋 ${t('mermaid.controls.copy')}`;

    // Кнопка регенерации
    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'mermaid-regenerate-btn';
    regenerateBtn.title = t('mermaid.controls.regenerate');
    regenerateBtn.type = 'button';
    regenerateBtn.textContent = `🔄 ${t('mermaid.controls.regenerate')}`;

    // Контейнер для контролов масштабирования
    const zoomContainer = document.createElement('div');
    zoomContainer.className = 'mermaid-zoom-controls';

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'mermaid-zoom-btn';
    zoomOutBtn.title = 'Zoom out';
    zoomOutBtn.type = 'button';
    zoomOutBtn.textContent = '➖';

    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.className = 'mermaid-zoom-btn';
    zoomResetBtn.title = 'Reset zoom';
    zoomResetBtn.type = 'button';
    zoomResetBtn.textContent = '⏹️';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'mermaid-zoom-btn';
    zoomInBtn.title = 'Zoom in';
    zoomInBtn.type = 'button';
    zoomInBtn.textContent = '➕';

    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'mermaid-zoom-label';
    zoomLabel.textContent = '100%';

    zoomContainer.appendChild(zoomOutBtn);
    zoomContainer.appendChild(zoomResetBtn);
    zoomContainer.appendChild(zoomLabel);
    zoomContainer.appendChild(zoomInBtn);

    controls.appendChild(copyBtn);
    controls.appendChild(regenerateBtn);
    controls.appendChild(zoomContainer);

    // Создаём обёртку для SVG с прокруткой
    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'mermaid-svg-wrapper';
    svgWrapper.innerHTML = svg;

    // Вставляем обёртку в начало
    el.insertBefore(svgWrapper, el.firstChild);
    // Вставляем контролы в конец
    el.appendChild(controls);

    // Получаем SVG элемент для масштабирования
    const svgElement = svgWrapper.querySelector('svg') as SVGSVGElement | null;

    function updateZoom(scale: number) {
      if (svgElement) {
        svgElement.style.transform = `scale(${scale})`;
        svgElement.style.transformOrigin = 'top left';
        zoomLabel.textContent = `${Math.round(scale * 100)}%`;
        
        // Обновляем размер контейнера на основе масштаба
        const bbox = svgElement.getBBox();
        const scaledWidth = bbox.width * scale;
        const scaledHeight = bbox.height * scale;
        
        // Устанавливаем минимальную высоту для обёртки
        svgWrapper.style.minHeight = `${Math.min(scaledHeight + 20, 600)}px`;
      }
    }

    zoomOutBtn.addEventListener('click', () => {
      currentScale = Math.max(0.5, currentScale - 0.1);
      updateZoom(currentScale);
    });

    zoomResetBtn.addEventListener('click', () => {
      currentScale = 1;
      updateZoom(currentScale);
    });

    zoomInBtn.addEventListener('click', () => {
      currentScale = Math.min(2, currentScale + 0.1);
      updateZoom(currentScale);
    });

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
      currentScale = 1; // Reset zoom on regenerate
      // re-render this element with force
      renderMermaidForElement(el, { force: true });
    });
  }

  /**
   * Заменяет пользовательские обозначения цветов на реальные hex-коды в зависимости от темы.
   * Использование в диаграммах: %%{init: {'flowchart': {}}}%%
   * style NODE fill:{color_name}
   * 
   * Доступные обозначения: red, orange, yellow, lime, green, cyan, blue, purple, pink, gray
   */
  function replaceColorNotations(code: string, theme: 'default' | 'dark'): string {
    const isDark = theme === 'dark';
    const colorMap: Record<string, string> = {
      red: isDark ? '#500000' : '#e14646',
      orange: isDark ? '#5a3000' : '#f97316',
      yellow: isDark ? '#4a3600' : '#eab308',
      lime: isDark ? '#1a3a0a' : '#65a30d',
      green: isDark ? '#0d3b0d' : '#22c55e',
      cyan: isDark ? '#003d4d' : '#06b6d4',
      blue: isDark ? '#001a4d' : '#3b82f6',
      purple: isDark ? '#2d0052' : '#a855f7',
      pink: isDark ? '#4d0033' : '#ec4899',
      gray: isDark ? '#2a2a2a' : '#6b7280'
    };

    let result = code;
    // Заменяем fill:{colorname} на fill:#{hex} (без кавычек, как требует Mermaid)
    for (const [colorName, hexCode] of Object.entries(colorMap)) {
      const regex = new RegExp(`fill:${colorName}(?!\\w)`, 'gi');
      result = result.replace(regex, `fill:${hexCode}`);
    }
    return result;
  }

  async function renderMermaidForElement(el: HTMLElement, options: { force?: boolean } = {}) {
    let code = (el.dataset.mermaid || '').trim();
    if (!code) {
      setError(el, 'Missing source code.');
      return;
    }

    const theme = resolveTheme();
    code = replaceColorNotations(code, theme);
    const cacheKey = `${code}|${theme}`;
    const cachedSvg = svgCache.get(cacheKey);
    if (cachedSvg && !options.force) {
      el.classList.add('mermaid');
      el.dataset.mermaidState = 'rendered';
      el.innerHTML = '';
      const svgWrapper = document.createElement('div');
      svgWrapper.className = 'mermaid-svg-wrapper';
      svgWrapper.innerHTML = cachedSvg;
      el.appendChild(svgWrapper);
      addControls(el, cachedSvg, code);
      return;
    }
    setLoading(el);
    let mermaid: MermaidModule | null = null;
    try {
      mermaid = await ensureMermaid();
    } catch (err: any) {
      console.warn('Mermaid client failed to load', err);
      setError(el, err?.message ?? 'FAILED TO IMPORT MAIN MERMAID LIB.');
      return;
    }
    const id = safeId();
    try {
      const result = await mermaid.render(id, code);
      const svg = result.svg;
      el.classList.add('mermaid');
      el.dataset.mermaidState = 'rendered';
      el.innerHTML = '';
      const svgWrapper = document.createElement('div');
      svgWrapper.className = 'mermaid-svg-wrapper';
      svgWrapper.innerHTML = svg;
      el.appendChild(svgWrapper);
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
          // Высокое качество: масштабируем в 3.5x раза ТОЛЬКО для PNG
          const qualityScale = 3.5;
          
          // Получаем РЕАЛЬНЫЙ размер SVG (без масштабирования)
          const baseWidth = img.naturalWidth || img.width || 800;
          const baseHeight = img.naturalHeight || img.height || 600;
          
          // Canvas размер = реальный размер * качество
          canvas.width = baseWidth * qualityScale;
          canvas.height = baseHeight * qualityScale;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
          
          // Масштабируем контекст для качества
          ctx.scale(qualityScale, qualityScale);
          
          // Заполняем фон
          ctx.fillStyle = getAdaptiveColor('wrapper_bg');
          ctx.fillRect(0, 0, baseWidth, baseHeight);
          
          // Рисуем изображение
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
          
          // Экспортируем PNG
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to create PNG blob'));
            resolve(blob);
          }, 'image/png', 1.0);
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
        
        // Clear existing content
        el.innerHTML = '';
        
        // Create wrapper
        const svgWrapper = document.createElement('div');
        svgWrapper.className = 'mermaid-svg-wrapper';
        svgWrapper.innerHTML = cachedSvg;
        el.appendChild(svgWrapper);
        
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
  :global(.mermaid) {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  :global(.mermaid-svg-wrapper) {
    flex: 1;
    overflow: auto;
    border: 1px solid var(--control-border-color);
    border-radius: 0.375rem;
    background: var(--mermaid-wrapper-bg);
    min-height: 200px;
    max-height: 600px;
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    position: relative;
    /* Smooth scrolling */
    scroll-behavior: smooth;
  }

  :global(.mermaid-svg-wrapper svg) {
    max-width: 100%;
    height: auto;
    flex-shrink: 0;
    transition: transform 0.2s ease-out;
  }

  :global(.mermaid svg) {
    max-width: 100%;
    overflow: visible;
    transition: transform 0.2s ease-out;
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
    margin-top: 0.75rem;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.5rem;
    border-top: 1px solid var(--control-border-color);
    background: var(--mermaid-controls-bg);
    border-radius: 0 0 0.375rem 0.375rem;
  }

  :global(.mermaid-controls button) {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid var(--mermaid-btn-border);
    border-radius: 0.375rem;
    background: var(--mermaid-btn-bg);
    color: var(--mermaid-btn-fg);
    cursor: pointer;
    transition: all 0.12s ease;
    font-weight: 500;
    white-space: nowrap;
  }

  :global(.mermaid-controls button:hover:not(:disabled)) {
    background: var(--mermaid-btn-bg-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :global(.mermaid-controls button:active:not(:disabled)) {
    transform: translateY(0px);
  }

  :global(.mermaid-controls button:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  :global(.mermaid-zoom-controls) {
    display: flex;
    gap: 0.375rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--mermaid-btn-border);
    border-radius: 0.375rem;
    background: var(--mermaid-btn-bg);
  }

  :global(.mermaid-zoom-btn) {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    border: none !important;
    background: transparent !important;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.12s ease;
  }

  :global(.mermaid-zoom-btn:hover) {
    background: var(--mermaid-btn-bg-hover) !important;
  }

  :global(.mermaid-zoom-btn:active) {
    transform: scale(0.95);
  }

  :global(.mermaid-zoom-label) {
    min-width: 2.5rem;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--mermaid-btn-fg);
    user-select: none;
  }

  /* Light theme */
  :global(:root) {
    --mermaid-btn-bg: #f0f0f0;
    --mermaid-btn-bg-hover: #e0e0e0;
    --mermaid-btn-border: #cccccc;
    --mermaid-btn-fg: #000000;
    --control-border-color: #cccccc;
    --mermaid-wrapper-bg: #ffffff;
    --mermaid-controls-bg: #f8f8f8;
  }

  /* Dark theme */
  :global(html[data-theme="dark"]) {
    --mermaid-btn-bg: #2a2a2a;
    --mermaid-btn-bg-hover: #3a3a3a;
    --mermaid-btn-border: #444444;
    --mermaid-btn-fg: #ffffff;
    --control-border-color: #444444;
    --mermaid-wrapper-bg: #0a0a0a;
    --mermaid-controls-bg: #151515;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme="light"])) {
      --mermaid-btn-bg: #2a2a2a;
      --mermaid-btn-bg-hover: #3a3a3a;
      --mermaid-btn-border: #444444;
      --mermaid-btn-fg: #ffffff;
      --control-border-color: #444444;
      --mermaid-wrapper-bg: #0a0a0a;
      --mermaid-controls-bg: #151515;
    }
  }

  :global(.mermaid-svg-wrapper::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(.mermaid-svg-wrapper::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.mermaid-svg-wrapper::-webkit-scrollbar-thumb) {
    background: var(--mermaid-btn-border);
    border-radius: 4px;
  }

  :global(.mermaid-svg-wrapper::-webkit-scrollbar-thumb:hover) {
    background: var(--mermaid-btn-bg-hover);
  }
</style>

<div></div>