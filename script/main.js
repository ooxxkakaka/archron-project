(() => {
  'use strict';

  const canPreview = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');

  const allWorks = (data) => (Array.isArray(data.works) ? data.works : []);
  const allPeople = (data) => (Array.isArray(data.people) ? data.people : []);
  const allEvents = (data) => (Array.isArray(data.events) ? data.events : []);
  const findPerson = (data, slug) => allPeople(data).find((person) => person.slug === slug);
  const siteName = (data) => (data.site && data.site.name) || 'archron project';

  /* 编号写进 works 的 no 后就不跟着数组位置漂移；不写则按当前顺序排号 */
  const workNo = (work, index) => pad(work && work.no ? work.no : index + 1);

  function localizedText(value, lang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const key = lang === 'zh-Hans' ? 'zh' : lang;
    return value[key] || value[lang] || value.en || Object.values(value).find(Boolean) || '';
  }

  function paragraphs(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value])
      .filter((text) => typeof text === 'string' && text.trim())
      .map((text) => text.trim());
  }

  /* 长文可为 { en, zh } 分段，也可写成纯字符串数组（按英文处理） */
  function textParts(value) {
    if (Array.isArray(value)) return [['en', paragraphs(value)]];
    if (typeof value === 'string') return [['en', paragraphs(value)]];
    if (!value) return [];
    return [
      ['en', paragraphs(value.en)],
      ['zh-Hans', paragraphs(value.zh)]
    ].filter(([, list]) => list.length);
  }

  function makeParagraph(lang, text) {
    const p = document.createElement('p');
    p.lang = lang;
    p.textContent = text;
    return p;
  }

  /* 双语各成一栏（配合 .bilingual 左右分栏），单语保持原来的连续段落；返回语言种数 */
  function renderLongText(mount, value) {
    const parts = textParts(value);
    parts.forEach(([lang, list]) => {
      if (parts.length === 1) {
        list.forEach((text) => mount.appendChild(makeParagraph(lang, text)));
        return;
      }
      const column = document.createElement('div');
      column.className = 'bilingual__col';
      list.forEach((text) => column.appendChild(makeParagraph(lang, text)));
      mount.appendChild(column);
    });
    if (parts.length > 1) mount.classList.add('bilingual');
    return parts.length;
  }

  document.querySelectorAll('[data-site="year"]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  function applySite(data) {
    const site = data.site || {};
    if (site.name) {
      document.querySelectorAll('[data-site="name"]').forEach((el) => {
        el.textContent = site.name;
      });
    }
    if (site.tagline) {
      document.querySelectorAll('[data-site="tagline"]').forEach((el) => {
        el.textContent = site.tagline;
      });
    }
    if (site.copyright) {
      document.querySelectorAll('[data-site="copyright"]').forEach((el) => {
        el.textContent = site.copyright;
      });
    }
    if (site.email) {
      document.querySelectorAll('[data-site="email"]').forEach((el) => {
        el.hidden = false;
        el.href = `mailto:${site.email}`;
        el.textContent = site.email;
      });
    }
  }

  function showNotice(message, link) {
    const el = document.getElementById('notice');
    if (!el) return;
    el.textContent = message;
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      el.append(' ', a);
    }
    el.hidden = false;
  }

  async function loadData() {
    if (location.protocol === 'file:') throw new Error('file-protocol');
    const res = await fetch('works.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('fetch-failed');
    return res.json();
  }

  function personNames(data, slugs) {
    if (!Array.isArray(slugs)) return [];
    return slugs
      .map((slug) => findPerson(data, slug))
      .filter(Boolean)
      .map((person) => person.name);
  }

  /* ---------- index ---------- */

  /* 每排几本跟着栏数走：三列排 3 本、两列排 2 本、单列排 1 本 */
  const shelfSlots = () => {
    if (window.matchMedia('(max-width: 620px)').matches) return 1;
    if (window.matchMedia('(max-width: 980px)').matches) return 2;
    return 3;
  };

  function indexTile(data, work, index) {
    const li = document.createElement('li');
    li.className = 'tile';
    li.style.setProperty('--j', index % shelfSlots());

    if (!work) {
      /* 空书位只占住格子，不画框、不画板线、不写编号 */
      li.classList.add('tile--empty');
      const empty = document.createElement('div');
      empty.className = 'tile__frame';
      li.append(empty);
      return li;
    }

    const meta = document.createElement('div');
    meta.className = 'tile__meta';
    const no = document.createElement('span');
    no.className = 'tile__no';
    no.textContent = workNo(work, index);
    const caption = document.createElement('div');
    caption.className = 'tile__caption';

    const names = personNames(data, work.people);
    const link = document.createElement('a');
    link.className = 'tile__link';
    link.href = `work.html?id=${encodeURIComponent(work.slug)}`;
    link.setAttribute('aria-label', [work.title, ...names].filter(Boolean).join(', '));
    if (canPreview && work.preview) link.dataset.preview = work.preview;

    const frame = document.createElement('figure');
    frame.className = 'tile__frame';
    if (work.cover) {
      const img = document.createElement('img');
      img.className = 'tile__img';
      img.src = work.cover;
      img.alt = `Cover of ${work.title}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      if (work.coverFit === 'cover') img.style.objectFit = 'cover';
      frame.appendChild(img);
    } else {
      /* 封面未上传时保留版面占位，空 src 会让浏览器回请求页面本身 */
      frame.classList.add('tile__frame--pending');
      const pending = document.createElement('span');
      pending.className = 'tile__empty-label';
      pending.textContent = 'Cover to follow';
      frame.appendChild(pending);
    }

    const title = document.createElement('h2');
    title.className = 'tile__title';
    title.textContent = work.title;
    const by = document.createElement('span');
    by.className = 'tile__by';
    by.textContent = [names.join(', '), work.year].filter(Boolean).join(', ');
    caption.appendChild(title);
    if (by.textContent) caption.appendChild(by);
    meta.append(no, caption);

    link.append(frame, meta);
    li.appendChild(link);
    return li;
  }

  /* 板线和编号先到，书从左到右依次站上架子；每一排只触发一次 */
  function revealShelves(grid) {
    const shelves = grid.querySelectorAll('.shelf');
    if (!('IntersectionObserver' in window)) {
      shelves.forEach((shelf) => shelf.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    shelves.forEach((shelf) => observer.observe(shelf));
  }

  function initIndex(data) {
    const grid = document.getElementById('index-grid');
    if (!grid) return;

    const works = allWorks(data);

    const render = () => {
      grid.textContent = '';
      /* 只把最后一排补满，架子永远收在整排上；不为将来预留空书架 */
      const slots = shelfSlots();
      const total = works.length ? Math.ceil(works.length / slots) * slots : slots;

      for (let start = 0; start < total; start += slots) {
        const shelf = document.createElement('li');
        shelf.className = 'shelf';
        const row = document.createElement('ul');
        row.className = 'shelf__row';
        for (let i = start; i < start + slots; i += 1) {
          row.appendChild(indexTile(data, works[i], i));
        }
        shelf.appendChild(row);
        grid.appendChild(shelf);
      }

      revealShelves(grid);
      setupHoverPreview();
    };

    render();

    [620, 980].forEach((px) => {
      const media = window.matchMedia(`(max-width: ${px}px)`);
      const onChange = () => render();
      if (media.addEventListener) media.addEventListener('change', onChange);
      else media.addListener(onChange);
    });
  }

  function setupHoverPreview() {
    if (!canPreview) return;

    const box = document.getElementById('cursor-preview');
    if (!box) return;
    const image = box.querySelector('img');
    const links = document.querySelectorAll('.tile__link[data-preview]');
    if (!links.length) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let visible = false;
    let lastEvent = null;

    function place(event) {
      const offset = 26;
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      tx = event.clientX + offset;
      ty = event.clientY + offset;
      if (tx + w > window.innerWidth - 12) tx = event.clientX - w - offset;
      if (ty + h > window.innerHeight - 12) ty = event.clientY - h - offset;
      tx = Math.max(12, tx);
      ty = Math.max(12, ty);
    }

    function applyRatio() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      box.style.setProperty('--ratio', `${image.naturalWidth} / ${image.naturalHeight}`);
      if (visible && lastEvent) place(lastEvent);
    }

    image.addEventListener('load', applyRatio);

    function animate() {
      const ease = reduceMotion ? 1 : 0.18;
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      if (Math.abs(tx - x) < 0.2 && Math.abs(ty - y) < 0.2) {
        x = tx;
        y = ty;
      }
      box.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = x === tx && y === ty ? 0 : requestAnimationFrame(animate);
    }

    function show(event, link) {
      lastEvent = event;
      image.src = link.dataset.preview;
      visible = true;
      if (image.complete) applyRatio();
      place(event);
      x = tx;
      y = ty;
      box.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      box.classList.add('is-visible');
    }

    function hide() {
      if (!visible) return;
      visible = false;
      box.classList.remove('is-visible');
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    links.forEach((link) => {
      link.addEventListener('mouseenter', (event) => show(event, link));
      link.addEventListener('mouseleave', hide);
      link.addEventListener('click', hide);
      link.addEventListener('focus', hide);
    });

    document.addEventListener('mousemove', (event) => {
      if (!visible) return;
      lastEvent = event;
      place(event);
      if (!raf) raf = requestAnimationFrame(animate);
    });

    document.addEventListener('mouseleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('blur', hide);
  }

  /* ---------- publication ---------- */

  function initWork(data) {
    const root = document.querySelector('.work');
    if (!root) return;

    const works = allWorks(data);
    const slug = new URLSearchParams(location.search).get('id');
    const index = works.findIndex((work) => work.slug === slug);

    if (index === -1) {
      document.getElementById('work-title').textContent = 'Not found';
      showNotice('This publication does not exist.', { href: 'index.html', text: 'Back to publications' });
      return;
    }

    const work = works[index];
    const images = Array.isArray(work.images) ? work.images : [];

    document.title = `${work.title} — ${siteName(data)}`;
    document.getElementById('work-title').textContent = work.title;

    const peopleMount = document.getElementById('work-people');
    const people = (Array.isArray(work.people) ? work.people : [])
      .map((personSlug) => findPerson(data, personSlug))
      .filter(Boolean);
    if (people.length) {
      people.forEach((person, i) => {
        if (i) peopleMount.append(', ');
        const link = document.createElement('a');
        link.href = `person.html?id=${encodeURIComponent(person.slug)}`;
        link.textContent = person.name;
        peopleMount.appendChild(link);
      });
    } else {
      peopleMount.hidden = true;
    }

    const meta = document.getElementById('work-meta');
    [
      ['Year', work.year],
      ['Format', work.format],
      ['Pages', work.pages],
      ['Place', work.place],
      ['Publisher', work.publisher]
    ]
      .filter(([, value]) => value)
      .forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        meta.append(dt, dd);
      });

    renderWorkIntro(work);
    renderWorkColophon(work);

    const prevLink = document.getElementById('work-prev');
    const nextLink = document.getElementById('work-next');
    if (works[index - 1]) {
      prevLink.hidden = false;
      prevLink.href = `work.html?id=${encodeURIComponent(works[index - 1].slug)}`;
      prevLink.textContent = `← ${works[index - 1].title}`;
    }
    if (works[index + 1]) {
      nextLink.hidden = false;
      nextLink.href = `work.html?id=${encodeURIComponent(works[index + 1].slug)}`;
      nextLink.textContent = `${works[index + 1].title} →`;
    }
    if (prevLink.hidden && nextLink.hidden) {
      document.querySelector('.work__nav').hidden = true;
    }

    if (!images.length) {
      showNotice('No plates have been added yet.');
      return;
    }

    renderPlates(images, document.getElementById('work-plates'));
  }

  function renderWorkIntro(work) {
    const section = document.getElementById('work-intro');
    const body = document.getElementById('work-intro-body');
    if (!section || !body) return;

    if (renderLongText(body, work.description || {}) > 1) {
      section.classList.add('work__intro--bilingual');
    }

    if (body.childElementCount) section.hidden = false;
  }

  function renderWorkColophon(work) {
    const section = document.getElementById('work-colophon');
    const body = document.getElementById('work-colophon-body');
    if (!section || !body) return;

    const colophon = work.colophon || {};
    if (colophon.title) {
      const title = document.createElement('p');
      title.className = 'work__colophon-title';
      title.textContent = colophon.title;
      body.appendChild(title);
    }

    (Array.isArray(colophon.groups) ? colophon.groups : []).forEach((group) => {
      const lines = (Array.isArray(group) ? group : []).filter(Boolean);
      if (!lines.length) return;
      const block = document.createElement('div');
      block.className = 'work__colophon-group';
      lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        block.appendChild(p);
      });
      body.appendChild(block);
    });

    if (body.childElementCount) section.hidden = false;
  }

  /* 详情页与活动页共用同一组 #lightbox 元素；label 只影响没有图注时的读屏文本 */
  function setupLightbox(images, label) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return null;

    const name = label || 'Plate';
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-cap');
    const lightboxCount = document.getElementById('lightbox-count');
    const prevButton = lightbox.querySelector('[data-lightbox-prev]');
    const nextButton = lightbox.querySelector('[data-lightbox-next]');
    let current = 0;

    function update() {
      const item = images[current];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.caption || `${item.label || name} ${current + 1}`;
      lightboxCap.textContent = item.caption || '';
      lightboxCount.textContent = `${pad(current + 1)} / ${pad(images.length)}`;
      prevButton.disabled = current === 0;
      nextButton.disabled = current === images.length - 1;
    }

    function step(delta) {
      const next = current + delta;
      if (next < 0 || next >= images.length) return;
      current = next;
      update();
    }

    function open(position) {
      current = position;
      update();
      if (!lightbox.open) lightbox.showModal();
    }

    prevButton.addEventListener('click', () => step(-1));
    nextButton.addEventListener('click', () => step(1));
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
    });

    return open;
  }

  /* 图组标题给人看复数（Posters），读屏文本给灯箱用单数（Poster 1） */
  const singularLabel = (label) => (label || 'Plate').replace(/s$/, '');

  /* 灯箱按整页建一次，活动页的多个图组共用一套序号；未上传的图位不进灯箱。
     positions 记下每张真实图片在灯箱里的位置，labels 让读屏文本跟着所属图组走。 */
  function plateController(groups) {
    const openable = [];
    const positions = new Map();
    groups.forEach((group) => {
      const name = singularLabel(group.label);
      (Array.isArray(group.images) ? group.images : []).forEach((image) => {
        if (!image.src || image.pending) return;
        positions.set(image, openable.length);
        openable.push({ ...image, label: name });
      });
    });
    return { positions, open: openable.length ? setupLightbox(openable, 'Plate') : null };
  }

  /* 图版三档：frame 是 420px 方框（海报、封面这类竖幅单图），half 两栏并排，
     full 满幅（只给横向大图和跨页）。连续同档的图归到同一个容器里，
     末尾落单的 half 仍然只占半栏。 */
  function renderPlates(images, mount, label, shared) {
    if (!mount) return;

    /* 读屏文本用单数：Posters → Poster、Photographs → Photograph */
    const name = singularLabel(label);
    const controller = shared || plateController([{ images, label: name }]);

    const plate = (image) => createPlate(image, controller.positions, controller.open, name);
    const flush = (layout, group) => {
      if (!group.length) return;
      if (layout === 'frame') {
        const row = document.createElement('div');
        row.className = 'plates__frames';
        group.forEach((image) => row.appendChild(plate(image)));
        mount.appendChild(row);
        return;
      }
      if (layout === 'half') {
        for (let i = 0; i < group.length; i += 2) {
          const pair = document.createElement('div');
          pair.className = 'plates__pair';
          group.slice(i, i + 2).forEach((image) => pair.appendChild(plate(image)));
          mount.appendChild(pair);
        }
        return;
      }
      group.forEach((image) => mount.appendChild(plate(image)));
    };

    let layout = null;
    let group = [];
    images.forEach((image) => {
      const current = image.layout || 'full';
      if (current !== layout) {
        flush(layout, group);
        layout = current;
        group = [];
      }
      group.push(image);
    });
    flush(layout, group);
  }

  function createPlate(image, positions, open, label) {
    const name = label || 'Plate';
    const layout = image.layout || 'full';
    const framed = layout === 'frame';
    const figure = document.createElement('figure');
    figure.className = 'plate';
    if (image.rule) figure.classList.add('plate--rule');
    if (framed) figure.style.setProperty('--ratio', image.ratio || '148 / 210');

    if (!image.src || image.pending) {
      figure.classList.add('plate--pending');
      const frame = document.createElement('div');
      frame.className = 'plate__empty';
      const note = document.createElement('span');
      note.className = 'plate__empty-label';
      note.textContent = 'Image to follow';
      frame.appendChild(note);
      figure.appendChild(frame);
      return figure;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'plate__btn';
    if (framed) button.classList.add('img-frame');
    button.setAttribute('aria-label', `View ${name.toLowerCase()} ${positions.get(image) + 1}`);

    const img = document.createElement('img');
    img.className = 'plate__img';
    img.src = image.src;
    img.alt = image.caption || `${name} ${positions.get(image) + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    button.appendChild(img);
    button.addEventListener('click', () => open(positions.get(image)));

    figure.appendChild(button);

    if (image.caption) {
      const caption = document.createElement('figcaption');
      caption.className = 'plate__cap';
      caption.textContent = image.caption;
      figure.appendChild(caption);
    }

    return figure;
  }

  /* ---------- people ---------- */

  function initPeople(data) {
    const mount = document.getElementById('people-groups');
    if (!mount) return;

    const people = allPeople(data).filter((person) => person && person.slug && person.name);
    if (!people.length) {
      showNotice('No people have been added yet.');
      return;
    }

    const groups = new Map();
    people
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
      .forEach((person) => {
        const initial = person.name
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .charAt(0)
          .toUpperCase();
        const key = /[A-Z]/.test(initial) ? initial : '#';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(person);
      });

    const keys = [...groups.keys()].sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    const alpha = document.getElementById('people-alpha');
    if (keys.length >= 3) {
      keys.forEach((letter) => {
        const a = document.createElement('a');
        a.href = `#letter-${letter === '#' ? 'other' : letter}`;
        a.textContent = letter;
        alpha.appendChild(a);
      });
    }

    const table = document.createElement('table');
    table.className = 'people-table';

    const caption = document.createElement('caption');
    caption.className = 'sr-only';
    caption.textContent = 'People';
    table.appendChild(caption);

    const colgroup = document.createElement('colgroup');
    [
      ['people-table__letter', '30px'],
      ['people-table__name', '']
    ].forEach(([className, width]) => {
      const col = document.createElement('col');
      col.className = className;
      if (width) col.style.width = width;
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const letterHead = document.createElement('th');
    letterHead.scope = 'col';
    letterHead.className = 'people-table__letter';
    headRow.appendChild(letterHead);
    const nameHead = document.createElement('th');
    nameHead.scope = 'col';
    nameHead.textContent = 'Name';
    headRow.appendChild(nameHead);
    thead.appendChild(headRow);
    table.appendChild(thead);

    keys.forEach((letter, index) => {
      const body = document.createElement('tbody');
      body.id = `letter-${letter === '#' ? 'other' : letter}`;

      groups.get(letter).forEach((person, row) => {
        const tr = document.createElement('tr');

        const letterCell = document.createElement('th');
        letterCell.scope = 'rowgroup';
        letterCell.className = 'people-table__letter';
        letterCell.textContent = row === 0 ? letter : '';
        if (row !== 0) letterCell.setAttribute('aria-hidden', 'true');
        tr.appendChild(letterCell);

        const nameCell = document.createElement('td');
        const link = document.createElement('a');
        link.className = 'people-table__name';
        link.href = `person.html?id=${encodeURIComponent(person.slug)}`;
        link.textContent = person.name;
        nameCell.appendChild(link);
        tr.appendChild(nameCell);

        body.appendChild(tr);
      });

      table.appendChild(body);
    });

    mount.appendChild(table);
  }

  function initPerson(data) {
    const root = document.querySelector('.person');
    if (!root) return;

    const slug = new URLSearchParams(location.search).get('id');
    const person = findPerson(data, slug);
    const name = document.getElementById('person-name');
    const role = document.getElementById('person-role');
    const body = root.querySelector('.person__body');
    const worksSection = document.getElementById('person-works');

    if (!person) {
      name.textContent = 'Not found';
      role.hidden = true;
      body.hidden = true;
      worksSection.hidden = true;
      showNotice('This person does not exist.', { href: 'people.html', text: 'Back to people' });
      return;
    }

    document.title = `${person.name} — ${siteName(data)}`;
    name.textContent = person.name;
    /* 只显角色，与姓名同栏左对齐；所在城市写在简介正文里，不再拼进这一行 */
    if (person.role) role.textContent = person.role;
    else role.hidden = true;

    const bioMount = document.getElementById('person-bio');
    renderLongText(bioMount, person.bio);
    if (!bioMount.childElementCount) {
      const p = document.createElement('p');
      p.className = 'is-muted';
      p.textContent = 'Biography forthcoming.';
      bioMount.appendChild(p);
    }

    const linksMount = document.getElementById('person-links');
    const links = Array.isArray(person.links)
      ? person.links.filter((link) => link && link.href)
      : [];
    if (links.length) {
      linksMount.hidden = false;
      links.forEach((entry) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = entry.href;
        a.textContent = entry.label || entry.href;
        if (/^https?:/i.test(entry.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        li.appendChild(a);
        linksMount.appendChild(li);
      });
    } else {
      linksMount.hidden = true;
    }

    const related = allWorks(data)
      .filter((work) => Array.isArray(work.people) && work.people.includes(person.slug));

    if (!related.length) {
      worksSection.hidden = true;
      return;
    }

    const list = document.getElementById('work-list');
    related.forEach((work) => {
      const item = document.createElement('li');
      item.className = 'work-list__item';

      const link = document.createElement('a');
      link.href = `work.html?id=${encodeURIComponent(work.slug)}`;

      const title = document.createElement('span');
      title.className = 'work-list__title';
      title.textContent = work.title;

      const meta = document.createElement('span');
      meta.className = 'work-list__meta';
      meta.textContent = work.year || '';

      link.append(title, meta);
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  /* ---------- about ---------- */

  function initAbout(data) {
    const root = document.querySelector('.about');
    if (!root) return;

    const about = (data.site && data.site.about) || {};
    const mount = document.getElementById('about-body');
    const linksMount = document.getElementById('about-links');
    const languages =
      Array.isArray(about.languages) && about.languages.length ? about.languages : ['en'];

    languages.forEach((lang) => {
      const key = lang === 'zh-Hans' ? 'zh' : lang;
      const part = about[key];
      if (!part) return;
      const list = Array.isArray(part.paragraphs) ? part.paragraphs.filter(Boolean) : [];
      if (!part.lead && !list.length) return;

      const block = document.createElement('section');
      block.className = 'about__block';
      block.lang = key === 'zh' ? 'zh-Hans' : key;

      if (part.lead) {
        const lead = document.createElement('p');
        lead.className = 'about__lead';
        lead.textContent = part.lead;
        block.appendChild(lead);
      }

      if (list.length) {
        const body = document.createElement('div');
        body.className = 'about__text';
        list.forEach((text) => {
          const p = document.createElement('p');
          p.textContent = text;
          body.appendChild(p);
        });
        block.appendChild(body);
      }

      mount.appendChild(block);
    });

    const siteLinks = Array.isArray(data.site && data.site.links) ? data.site.links : [];
    siteLinks
      .filter((entry) => entry && entry.label && entry.href)
      .forEach((entry) => {
        const dt = document.createElement('dt');
        dt.textContent = entry.label;
        const dd = document.createElement('dd');
        const a = document.createElement('a');
        a.href = entry.href;
        a.textContent = entry.text || entry.href;
        if (!/^mailto:/i.test(entry.href)) {
          a.target = '_blank';
          a.rel = 'noreferrer noopener';
        }
        dd.appendChild(a);
        linksMount.append(dt, dd);
      });
    if (linksMount.childElementCount) linksMount.hidden = false;

    if (!mount.childElementCount && !linksMount.childElementCount) {
      showNotice('About text has not been added yet.');
    }
  }

  /* ---------- events ---------- */

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  function parseDate(value) {
    if (!value) return null;
    const parts = String(value).split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /* 目录行要把年份单独拆出来对齐成一条可扫读的轴，所以日期分成「区间」和「年份」两段 */
  function eventDateParts(startValue, endValue) {
    const start = parseDate(startValue);
    if (!start) return { label: startValue || '', year: '' };
    const end = parseDate(endValue);
    const day = (date) => String(date.getDate()).padStart(2, '0');
    const month = MONTHS[start.getMonth()];
    const year = String(start.getFullYear());

    if (!end || end <= start) return { label: `${day(start)} ${month}`, year };
    if (end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear()) {
      return { label: `${day(start)}–${day(end)} ${month}`, year };
    }
    if (end.getFullYear() === start.getFullYear()) {
      return { label: `${day(start)} ${month} – ${day(end)} ${MONTHS[end.getMonth()]}`, year };
    }
    return {
      label: `${day(start)} ${month} – ${day(end)} ${MONTHS[end.getMonth()]}`,
      year: `${start.getFullYear()}–${end.getFullYear()}`
    };
  }

  function formatEventDate(startValue, endValue) {
    const { label, year } = eventDateParts(startValue, endValue);
    return [label, year].filter(Boolean).join(' ');
  }

  /* 列表与详情页同一套排序：未结束的在前，按开始日期升序；已结束的反向 */
  function eventEntries(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents(data)
      .filter((event) => event && event.title)
      .map((event) => {
        const start = parseDate(event.start);
        const end = parseDate(event.end) || start;
        return { event, start, end, upcoming: end ? end >= today : true };
      })
      .sort((a, b) => {
        if (a.upcoming !== b.upcoming) return a.upcoming ? -1 : 1;
        if (!a.start || !b.start) return a.start ? -1 : b.start ? 1 : 0;
        return a.upcoming ? a.start - b.start : b.start - a.start;
      });
  }

  /* 目录只读城市与国家；展馆或展位号只在详情页出现 */
  const eventCity = (event) =>
    [localizedText(event.city, 'en'), localizedText(event.country, 'en')].filter(Boolean).join(', ');
  const eventPlace = (event) => [eventCity(event), event.venue].filter(Boolean).join(' · ');

  /* 活动的图片一律按组填：galleries 里每组一个 label 加一组 images。
     只有一组时也可以直接写 imageLabel + images，渲染时归成一组，两种写法版式相同。 */
  function eventGalleries(event) {
    const groups = Array.isArray(event.galleries) && event.galleries.length
      ? event.galleries
      : [{ label: event.imageLabel, images: event.images }];

    return groups
      .map((group) => ({
        label: localizedText(group && group.label, 'en') || 'Photographs',
        images: (Array.isArray(group && group.images) ? group.images : [])
          .filter((image) => image && (image.src || image.pending))
      }))
      .filter((group) => group.images.length);
  }

  /* 活动目录与 People 同一张档案表：日期 / 名称 / 地点三列，行线铺满整栏 */
  function initEvents(data) {
    const mount = document.getElementById('events-list');
    if (!mount) return;

    const entries = eventEntries(data);
    if (!entries.length) {
      showNotice('No events have been announced yet.');
      return;
    }

    const table = document.createElement('table');
    table.className = 'events-table';

    const caption = document.createElement('caption');
    caption.className = 'sr-only';
    caption.textContent = 'Events';
    table.appendChild(caption);

    const colgroup = document.createElement('colgroup');
    ['events-table__date', 'events-table__event', 'events-table__place'].forEach((className) => {
      const col = document.createElement('col');
      if (className) col.className = className;
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Dates', 'Event', 'Place'].forEach((text) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const body = document.createElement('tbody');
    entries.forEach(({ event, upcoming }) => {
      const row = document.createElement('tr');
      if (!upcoming) row.className = 'event--past';

      const dateCell = document.createElement('td');
      dateCell.className = 'events-table__date';
      const { label, year } = eventDateParts(event.start, event.end);
      const date = document.createElement('time');
      if (event.start) date.dateTime = event.start;
      date.textContent = label;
      dateCell.appendChild(date);
      if (year) {
        const yearCell = document.createElement('span');
        yearCell.className = 'events-table__year';
        yearCell.textContent = year;
        dateCell.appendChild(yearCell);
      }

      const titleCell = document.createElement('td');
      const link = document.createElement('a');
      link.className = 'events-table__title';
      link.lang = 'en';
      link.textContent = localizedText(event.title, 'en');
      /* 有 slug 就进站内详情页；没有才用 link 指向外部官网 */
      const href = event.slug ? `event.html?id=${encodeURIComponent(event.slug)}` : event.link;
      if (href) {
        link.href = href;
        if (/^https?:/i.test(href)) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
      }
      titleCell.appendChild(link);

      const placeCell = document.createElement('td');
      placeCell.className = 'events-table__place';
      placeCell.lang = 'en';
      placeCell.textContent = eventCity(event);

      row.append(dateCell, titleCell, placeCell);
      body.appendChild(row);
    });

    table.appendChild(body);
    mount.appendChild(table);
  }

  /* ---------- event detail ---------- */

  function initEventPage(data) {
    const root = document.querySelector('.event-page');
    if (!root) return;

    const entries = eventEntries(data);
    const slug = new URLSearchParams(location.search).get('id');
    const index = entries.findIndex((entry) => entry.event.slug === slug);

    if (index === -1) {
      document.getElementById('event-title').textContent = 'Not found';
      showNotice('This event does not exist.', { href: 'events.html', text: 'Back to events' });
      return;
    }

    const { event, upcoming } = entries[index];
    const title = localizedText(event.title, 'en');

    document.title = `${title} — ${siteName(data)}`;
    document.getElementById('event-title').textContent = title;

    const meta = document.getElementById('event-meta');
    [
      ['Dates', formatEventDate(event.start, event.end)],
      ['Place', eventPlace(event)],
      ['Status', upcoming ? 'Upcoming' : 'Past']
    ]
      .filter(([, value]) => value)
      .forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        meta.append(dt, dd);
      });

    const intro = document.getElementById('event-intro');
    const languages = renderLongText(document.getElementById('event-intro-body'), event.description);
    if (languages) {
      /* 两种语言都填时简介铺满整幅左右分栏 */
      if (languages > 1) intro.classList.add('work__intro--bilingual');
      intro.hidden = false;
    }

    const galleries = eventGalleries(event);

    const mount = document.getElementById('event-galleries');
    if (galleries.length) {
      /* 灯箱按整页建一次，各组图片共用同一串序号；读屏文本用单数 */
      const controller = plateController(galleries.map((group) => ({ ...group, label: singularLabel(group.label) })));
      galleries.forEach((group) => {
        const section = document.createElement('section');
        section.className = 'gallery';
        const label = document.createElement('p');
        label.className = 'work__label gallery__label';
        label.textContent = group.label;
        const plates = document.createElement('div');
        plates.className = 'work__plates';
        renderPlates(group.images, plates, group.label, controller);
        section.append(label, plates);
        mount.appendChild(section);
      });
    } else {
      showNotice('Images from this event have not been added yet.');
    }

    const prev = entries[index - 1];
    const next = entries[index + 1];
    const prevLink = document.getElementById('event-prev');
    const nextLink = document.getElementById('event-next');
    if (prev && prev.event.slug) {
      prevLink.hidden = false;
      prevLink.href = `event.html?id=${encodeURIComponent(prev.event.slug)}`;
      prevLink.textContent = `← ${localizedText(prev.event.title, 'en')}`;
    }
    if (next && next.event.slug) {
      nextLink.hidden = false;
      nextLink.href = `event.html?id=${encodeURIComponent(next.event.slug)}`;
      nextLink.textContent = `${localizedText(next.event.title, 'en')} →`;
    }
    if (prevLink.hidden && nextLink.hidden) document.getElementById('event-nav').hidden = true;
  }

  (async () => {
    try {
      const data = await loadData();
      applySite(data);
      initIndex(data);
      initWork(data);
      initPeople(data);
      initPerson(data);
      initAbout(data);
      initEvents(data);
      initEventPage(data);
    } catch (error) {
      showNotice(
        'Site data could not be loaded. Preview through a local server — python3 -m http.server 8000 — or open the published GitHub Pages URL.'
      );
    }
  })();
})();