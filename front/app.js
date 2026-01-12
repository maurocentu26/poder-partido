function initProposalsCards() {
  const list = document.querySelector('.propuestas__list');
  if (!list) return;

  const buttons = Array.from(list.querySelectorAll('button.acord__btn'));
  if (buttons.length === 0) return;

  const cards = document.createElement('div');
  cards.className = 'propuestas__cards';
  cards.setAttribute('data-view', 'list');

  function openCard(card) {
    cards.setAttribute('data-view', 'single');
    for (const el of Array.from(cards.children)) {
      if (!(el instanceof HTMLElement)) continue;
      const isActive = el === card;
      el.setAttribute('data-active', String(isActive));
      const contentEl = el.querySelector('.proposalCard__content');
      if (contentEl instanceof HTMLElement) contentEl.hidden = !isActive;
      const closeBtn = el.querySelector('.proposalCard__close');
      if (closeBtn instanceof HTMLElement) closeBtn.hidden = !isActive;
    }

    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeAll() {
    cards.setAttribute('data-view', 'list');
    for (const el of Array.from(cards.children)) {
      if (!(el instanceof HTMLElement)) continue;
      el.setAttribute('data-active', 'false');
      const contentEl = el.querySelector('.proposalCard__content');
      if (contentEl instanceof HTMLElement) contentEl.hidden = true;
      const closeBtn = el.querySelector('.proposalCard__close');
      if (closeBtn instanceof HTMLElement) closeBtn.hidden = true;
    }
  }

  for (const btn of buttons) {
    const panel = btn.nextElementSibling;
    if (!(panel instanceof HTMLElement)) continue;

    const title = (btn.textContent || '').trim();
    const firstP = panel.querySelector('.propuesta__paragraph');
    const summaryRaw = firstP ? (firstP.textContent || '').trim() : '';
    const summary = summaryRaw.length > 220 ? summaryRaw.slice(0, 220).trimEnd() + '…' : summaryRaw;

    const card = document.createElement('article');
    card.className = 'proposalCard';
    card.setAttribute('data-expanded', 'false');

    const header = document.createElement('div');
    header.className = 'proposalCard__header';
    header.innerHTML = `
      <h3 class="proposalCard__title">${escapeHtml(title)}</h3>
      <p class="proposalCard__summary">${escapeHtml(summary)}</p>
      <div class="proposalCard__actions">
        <button type="button" class="proposalCard__btn">Mostrar más</button>
        <button type="button" class="proposalCard__close" hidden>Cerrar</button>
      </div>
    `;

    const content = document.createElement('div');
    content.className = 'proposalCard__content';
    content.hidden = true;

    // Mover el contenido completo adentro de la card (así no duplicamos HTML).
    while (panel.firstChild) {
      content.appendChild(panel.firstChild);
    }

    const openBtn = header.querySelector('.proposalCard__btn');
    const closeBtn = header.querySelector('.proposalCard__close');

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCard(card);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
      });
    }

    // Click en la card abre también.
    header.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.closest('.proposalCard__close') || t.closest('.proposalCard__btn'))) {
        return;
      }
      openCard(card);
    });

    card.appendChild(header);
    card.appendChild(content);
    cards.appendChild(card);
  }

  // Limpiar el acordeón original y dejar solo cards.
  list.innerHTML = '';
  list.appendChild(cards);

  // Estado inicial
  closeAll();
}

function initIntroSlider() {
  const textEl = document.querySelector('.main__intro .main__text');
  if (!textEl) return;

  const paragraphs = Array.from(textEl.querySelectorAll('p.main__paragraph'));
  if (paragraphs.length < 2) return;

  const slideTitles = [
    'Diagnóstico',
    'Construcción',
    'Compromiso',
  ];

  const slider = document.createElement('section');
  slider.className = 'introSlider';
  slider.setAttribute('aria-label', 'Introducción');

  const track = document.createElement('div');
  track.className = 'introSlider__track';

  const slides = paragraphs.map((p, idx) => {
    const slide = document.createElement('article');
    slide.className = 'introSlider__slide';
    slide.setAttribute('data-index', String(idx));

    const title = slideTitles[idx] ?? `Slide ${idx + 1}`;
    const h = document.createElement('h3');
    h.className = 'introSlider__title';
    h.textContent = title;

    const body = document.createElement('div');
    body.className = 'introSlider__body';
    body.appendChild(p);

    slide.appendChild(h);
    slide.appendChild(body);
    track.appendChild(slide);
    return slide;
  });

  const controls = document.createElement('div');
  controls.className = 'introSlider__controls';
  controls.innerHTML = `
    <button type="button" class="introSlider__btn" data-dir="prev" aria-label="Anterior">◀</button>
    <div class="introSlider__dots" role="tablist" aria-label="Slides"></div>
    <button type="button" class="introSlider__btn" data-dir="next" aria-label="Siguiente">▶</button>
  `;

  const dotsEl = controls.querySelector('.introSlider__dots');
  const dots = slides.map((_, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'introSlider__dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir al slide ${idx + 1}`);
    b.setAttribute('data-index', String(idx));
    dotsEl.appendChild(b);
    return b;
  });

  // Reemplaza el contenido original por el slider
  textEl.innerHTML = '';
  slider.appendChild(track);
  slider.appendChild(controls);
  textEl.appendChild(slider);

  let active = 0;
  let timer = null;
  const AUTOPLAY_MS = 7000;

  function setActive(next) {
    const total = slides.length;
    active = ((next % total) + total) % total;
    track.style.transform = `translateX(${-active * 100}%)`;

    slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== active)));
    dots.forEach((d, i) => d.setAttribute('aria-current', i === active ? 'true' : 'false'));
  }

  function start() {
    stop();
    timer = setInterval(() => setActive(active + 1), AUTOPLAY_MS);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  controls.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    const dirBtn = t.closest('button[data-dir]');
    if (dirBtn) {
      const dir = dirBtn.getAttribute('data-dir');
      setActive(dir === 'prev' ? active - 1 : active + 1);
      start();
      return;
    }

    const dotBtn = t.closest('button.introSlider__dot');
    if (dotBtn) {
      const idx = Number(dotBtn.getAttribute('data-index'));
      if (Number.isFinite(idx)) {
        setActive(idx);
        start();
      }
    }
  });

  // Pausa si el usuario interactúa
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Swipe en mobile (pointer events)
  let pointerDown = false;
  let startX = 0;
  let startY = 0;
  let activePointerId = null;

  slider.addEventListener('pointerdown', (e) => {
    if (!(e instanceof PointerEvent)) return;
    // No interferir con clicks en los controles
    if (e.target instanceof HTMLElement && e.target.closest('.introSlider__controls')) return;

    // Swipe solo para touch/pen (en desktop mouse rompía los clicks de botones)
    if (e.pointerType === 'mouse') return;
    pointerDown = true;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    try {
      slider.setPointerCapture(e.pointerId);
    } catch {
      // no-op
    }
    stop();
  });

  function endPointer(e) {
    if (!pointerDown) return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    pointerDown = false;
    activePointerId = null;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Solo consideramos swipe horizontal
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      setActive(dx > 0 ? active - 1 : active + 1);
    }
    start();
  }

  slider.addEventListener('pointerup', endPointer);
  slider.addEventListener('pointercancel', (e) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    pointerDown = false;
    activePointerId = null;
    start();
  });

  // Init
  setActive(0);
  start();
}

function getApiBaseUrl() {
  const meta = document.querySelector('meta[name="api-base-url"]');
  const value = meta && meta.getAttribute('content') ? meta.getAttribute('content').trim() : '';
  return value ? value.replace(/\/+$/, '') : '';
}

class BlogApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async listPosts({ page = 1, pageSize = 6 } = {}) {
    const res = await fetch(`${this.baseUrl}/api/posts?page=${page}&pageSize=${pageSize}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getPost(slug) {
    const res = await fetch(`${this.baseUrl}/api/posts/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async listComments(slug) {
    const res = await fetch(`${this.baseUrl}/api/posts/${encodeURIComponent(slug)}/comments`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async createComment(slug, { authorName, body }) {
    const res = await fetch(`${this.baseUrl}/api/posts/${encodeURIComponent(slug)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ authorName, body }),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) msg = String(data.error);
      } catch {
        // no-op
      }
      throw new Error(msg);
    }

    return res.json();
  }
}

class BlogApp {
  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.api = new BlogApi(this.baseUrl);
    this.statusEl = document.getElementById('blog-status');
    this.postsEl = document.getElementById('blog-posts');
    this.articleEl = document.getElementById('blog-article');

    this.defaultTitle = document.title;
  }

  start() {
    if (!this.statusEl || !this.postsEl || !this.articleEl) return;

    this.postsEl.addEventListener('click', (e) => {
      const t = e.target;
      const el = t && t.closest ? t.closest('[data-slug]') : null;
      if (!el) return;

      // Si el click fue en el link, evitamos el salto y navegamos por state.
      if (el.tagName && el.tagName.toLowerCase() === 'a') {
        e.preventDefault();
      }

      const slug = el.getAttribute('data-slug');
      if (!slug) return;

      this.navigateToPost(slug);
    });

    // Accesibilidad: Enter/Espacio sobre la card.
    this.postsEl.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key !== 'Enter' && key !== ' ') return;
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const card = target.closest && target.closest('article[data-slug]');
      if (!card) return;
      const slug = card.getAttribute('data-slug');
      if (!slug) return;
      e.preventDefault();
      this.navigateToPost(slug);
    });

    window.addEventListener('popstate', () => {
      this.renderFromUrl();
    });

    this.renderFromUrl();
  }

  getSlugFromUrl() {
    const url = new URL(window.location.href);
    return url.searchParams.get('post');
  }

  navigateToPost(slug) {
    const url = new URL(window.location.href);
    url.searchParams.set('post', slug);
    url.hash = 'blog';
    window.history.pushState({}, '', url);
    this.renderFromUrl();
  }

  navigateToList() {
    const url = new URL(window.location.href);
    url.searchParams.delete('post');
    url.hash = 'blog';
    window.history.pushState({}, '', url);
    this.renderFromUrl();
  }

  setStatus(text) {
    this.statusEl.textContent = text;
  }

  showList() {
    this.postsEl.hidden = false;
    this.articleEl.hidden = true;

    document.body.dataset.blogView = 'list';
    document.title = this.defaultTitle;
  }

  showArticle() {
    this.postsEl.hidden = true;
    this.articleEl.hidden = false;

    document.body.dataset.blogView = 'article';
  }

  formatDateTime(value) {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '';
    }
  }

  async renderComments(slug) {
    const root = this.articleEl.querySelector('#blog-comments');
    const status = this.articleEl.querySelector('#blog-comments-status');
    const list = this.articleEl.querySelector('#blog-comments-list');
    const form = this.articleEl.querySelector('#blog-comments-form');
    if (!(root instanceof HTMLElement) || !(status instanceof HTMLElement) || !(list instanceof HTMLElement) || !(form instanceof HTMLFormElement)) {
      return;
    }

    async function refresh() {
      status.textContent = 'Cargando comentarios…';
      list.innerHTML = '';
      try {
        const data = await this.api.listComments(slug);
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length === 0) {
          status.textContent = 'Todavía no hay comentarios.';
          return;
        }
        status.textContent = '';
        list.innerHTML = items
          .map((c) => {
            const dt = c.createdAt ? this.formatDateTime(c.createdAt) : '';
            return `
              <article class="blogComment">
                <div class="blogComment__head">
                  <div class="blogComment__author">${escapeHtml(c.authorName ?? '')}</div>
                  <div class="blogComment__date">${escapeHtml(dt)}</div>
                </div>
                <div class="blogComment__body">${escapeHtml(c.body ?? '').replaceAll('\n', '<br />')}</div>
              </article>
            `;
          })
          .join('');
      } catch (e) {
        status.textContent = 'No se pudieron cargar los comentarios.';
        console.error(e);
      }
    }

    // bind `this` for inner refresh()
    const refreshBound = refresh.bind(this);
    await refreshBound();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const authorName = String(fd.get('authorName') ?? '').trim();
      const body = String(fd.get('body') ?? '').trim();

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      status.textContent = 'Enviando…';

      try {
        await this.api.createComment(slug, { authorName, body });
        form.reset();
        await refreshBound();
        // Scroll suave al listado de comentarios
        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        status.textContent = err instanceof Error ? err.message : 'No se pudo enviar el comentario.';
        console.error(err);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  resolveAssetUrl(url) {
    if (!url) return '';
    // Si el backend devuelve /uploads/..., lo transformamos en absoluto usando baseUrl.
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${this.baseUrl}${url}`;
    return url;
  }

  async renderFromUrl() {
    const slug = this.getSlugFromUrl();
    if (slug) {
      await this.renderPost(slug);
    } else {
      await this.renderList();
    }
  }

  async renderList() {
    this.showList();
    this.setStatus('Cargando posts…');

    try {
      const data = await this.api.listPosts({ page: 1, pageSize: 6 });
      const items = Array.isArray(data.items) ? data.items : [];

      if (items.length === 0) {
        this.postsEl.innerHTML = '';
        this.setStatus('Todavía no hay posts publicados.');
        return;
      }

      this.setStatus('');
      this.postsEl.innerHTML = items
        .map((p) => {
          const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
          const thumb = Array.isArray(p.images) && p.images.length > 0 ? this.resolveAssetUrl(p.images[0].url) : '';

          return `
            <article class="blog__card blog__postCard" data-slug="${escapeHtml(p.slug)}" tabindex="0" role="link" aria-label="Abrir artículo: ${escapeHtml(p.title)}">
              ${thumb ? `<img class="blog__thumb" src="${thumb}" alt="" loading="lazy" />` : ''}
              <a href="#blog" data-slug="${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              <div class="blog__meta">${escapeHtml(date)}</div>
            </article>
          `;
        })
        .join('');
    } catch (e) {
      this.postsEl.innerHTML = '';
      this.setStatus('No se pudieron cargar los posts.');
      console.error(e);
    }
  }

  async renderPost(slug) {
    this.showArticle();
    this.setStatus('');
    this.articleEl.innerHTML = '<div class="blog__status">Cargando artículo…</div>';

    try {
      const post = await this.api.getPost(slug);
      const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';

      const images = Array.isArray(post.images) ? post.images : [];
      const imagesHtml = images.length
        ? `
          <div class="blog__images">
            ${images
              .map((img) => {
                const src = this.resolveAssetUrl(img.url);
                const alt = img.alt ? escapeHtml(img.alt) : '';
                return `<img class="blog__image" src="${src}" alt="${alt}" loading="lazy" />`;
              })
              .join('')}
          </div>
        `
        : '';

      const content = typeof post.content === 'string' ? post.content : '';
      const paragraphs = content
        .split(/\n{2,}/g)
        .map((p) => p.trim())
        .filter(Boolean);

      const contentHtml = paragraphs.length
        ? paragraphs
            .map((p) => `<p class="blog__p">${escapeHtml(p).replaceAll('\n', '<br />')}</p>`)
            .join('')
        : '<p class="blog__p">(Sin contenido)</p>';

      this.articleEl.innerHTML = `
        <a href="#blog" class="blog__back" id="blog-back">← Volver al listado</a>
        <h2 class="blog__title">${escapeHtml(post.title ?? '')}</h2>
        <div class="blog__meta">${escapeHtml(date)}</div>
        ${imagesHtml}
        <div class="blog__content">${contentHtml}</div>

        <section class="blogComments" id="blog-comments" aria-label="Comentarios">
          <h3 class="blogComments__title">Comentarios</h3>

          <form class="blogComments__form" id="blog-comments-form">
            <label class="blogComments__label">
              <span>Nombre</span>
              <input name="authorName" required minlength="2" maxlength="50" class="blogComments__input" placeholder="Tu nombre" />
            </label>
            <label class="blogComments__label">
              <span>Comentario</span>
              <textarea name="body" required minlength="2" maxlength="1000" rows="4" class="blogComments__textarea" placeholder="Escribí tu comentario…"></textarea>
            </label>
            <button type="submit" class="blogComments__submit">Enviar comentario</button>
          </form>

          <div class="blogComments__status" id="blog-comments-status"></div>
          <div class="blogComments__list" id="blog-comments-list"></div>
        </section>
      `;

      document.title = post && post.title ? `${post.title} — Blog` : this.defaultTitle;

      const backBtn = document.getElementById('blog-back');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToList();
        });
      }

      await this.renderComments(slug);
    } catch (e) {
      this.articleEl.innerHTML = `
        <a href="#blog" class="blog__back" id="blog-back">← Volver al listado</a>
        <div class="blog__status">No se pudo cargar el artículo.</div>
      `;

      document.title = this.defaultTitle;
      const backBtn = document.getElementById('blog-back');
      if (backBtn) {
        backBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.navigateToList();
        });
      }
      console.error(e);
    }
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initIntroSlider();
  initProposalsCards();
  new BlogApp().start();
});