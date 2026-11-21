(() => {
  'use strict';

  const canPreview = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');

  const allWorks = (data) => (Array.isArray(data.works) ? data.works : []);
  const publishedWorks = (data) => allWorks(data).filter((work) => !work.placeholder);
  const allPeople = (data) => (Array.isArray(data.people) ? data.people : []);
  const allEvents = (data) => (Array.isArray(data.events) ? data.events : []);
  const findPerson = (data, slug) => allPeople(data).find((person) => person.slug === slug);
  const siteName = (data) => (data.site && data.site.name) || 'ARCHRON PROJECT';

  function localizedText(value, lang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const key = lang === 'zh-Hans' ? 'zh' : lang;
    return value[key] || value[lang] || value.en || Object.values(value).find(Boolean) || '';
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

  function initIndex(data) {
    const grid = document.getElementById('index-grid');
    if (!grid) return;

    allWorks(data).forEach((work, index) => {
      const li = document.createElement('li');
      li.className = 'tile';
      li.style.setProperty('--i', index);

      if (work.placeholder) {
        li.classList.add('tile--empty');

        const frame = document.createElement('div');
        frame.className = 'tile__frame';
        const label = document.createElement('span');
        label.className = 'tile__empty-label';
        label.textContent = 'Forthcoming';
        frame.appendChild(label);

        const meta = document.createElement('div');
        meta.className = 'tile__meta';
        const no = document.createElement('span');
        no.className = 'tile__no';
        no.textContent = pad(index + 1);
        const caption = document.createElement('div');
        caption.className = 'tile__caption';
        const note = document.createElement('span');
        note.className = 'tile__empty-note';
        note.textContent = '—';
        caption.appendChild(note);
        meta.append(no, caption);

        li.append(frame, meta);
        grid.appendChild(li);
        return;
      }

      const names = personNames(data, work.people);
      const link = document.createElement('a');
      link.className = 'tile__link';
      link.href = `work.html?id=${encodeURIComponent(work.slug)}`;
      link.setAttribute('aria-label', [work.title, ...names].filter(Boolean).join(', '));
      if (canPreview && work.preview) link.dataset.preview = work.preview;

      const frame = document.createElement('figure');
      frame.className = 'tile__frame';
      const manualRatio =
        typeof work.coverRatio === 'string' || typeof work.coverRatio === 'number'
          ? String(work.coverRatio)
          : '';
      if (manualRatio) {
        frame.style.setProperty('--ratio', manualRatio);
      } else if (work.coverWidth > 0 && work.coverHeight > 0) {
        frame.style.setProperty('--ratio', `${work.coverWidth} / ${work.coverHeight}`);
      }
      const img = document.createElement('img');
      img.className = 'tile__img';
      img.src = work.cover;
      img.alt = `Cover of ${work.title}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      if (work.coverFit === 'cover') img.style.objectFit = 'cover';
      if (work.coverWidth > 0 && work.coverHeight > 0) {
        img.width = work.coverWidth;
        img.height = work.coverHeight;
      }
      if (!manualRatio) {
        img.addEventListener(
          'load',
          () => {
            if (!img.naturalWidth || !img.naturalHeight) return;
            frame.style.setProperty('--ratio', `${img.naturalWidth} / ${img.naturalHeight}`);
          },
          { once: true }
        );
      }
      frame.appendChild(img);

      const meta = document.createElement('div');
      meta.className = 'tile__meta';
      const no = document.createElement('span');
      no.className = 'tile__no';
      no.textContent = pad(index + 1);
      const caption = document.createElement('div');
      caption.className = 'tile__caption';
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
      grid.appendChild(li);
    });

    setupHoverPreview();
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

    const works = publishedWorks(data);
    const slug = new URLSearchParams(location.search).get('id');
    const index = works.findIndex((work) => work.slug === slug);

    if (index === -1) {
      document.getElementById('work-title').textContent = 'Not found';
      showNotice('This publication does not exist.', { href: 'index.html', text: 'Back to publications' });
      return;
    }

    const work = works[index];
    const number = allWorks(data).findIndex((item) => item.slug === work.slug) + 1;
    const images = Array.isArray(work.images) ? work.images : [];

    document.title = `${work.title} — ${siteName(data)}`;
    document.getElementById('work-no').textContent = pad(number);
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

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-cap');
    const lightboxCount = document.getElementById('lightbox-count');
    const prevButton = lightbox.querySelector('[data-lightbox-prev]');
    const nextButton = lightbox.querySelector('[data-lightbox-next]');
    let current = 0;

    function updateLightbox() {
      const item = images[current];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.caption || `Plate ${current + 1}`;
      lightboxCap.textContent = item.caption || '';
      lightboxCount.textContent = `${pad(current + 1)} / ${pad(images.length)}`;
      prevButton.disabled = current === 0;
      nextButton.disabled = current === images.length - 1;
    }

    function step(delta) {
      const next = current + delta;
      if (next < 0 || next >= images.length) return;
      current = next;
      updateLightbox();
    }

    function openLightbox(position) {
      current = position;
      updateLightbox();
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

    renderPlates(images, document.getElementById('work-plates'), openLightbox);
  }

  function renderWorkIntro(work) {
    const section = document.getElementById('work-intro');
    const body = document.getElementById('work-intro-body');
    if (!section || !body) return;

    const description = work.description || {};
    [
      ['en', description.en],
      ['zh-Hans', description.zh]
    ].forEach(([lang, text]) => {
      if (!text) return;
      const p = document.createElement('p');
      p.lang = lang;
      p.textContent = text;
      body.appendChild(p);
    });

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

  function renderPlates(images, mount, onOpen) {
    if (!mount) return;

    const groups = [];
    for (let i = 0; i < images.length; i += 1) {
      const current = images[i];
      const next = images[i + 1];
      if (current.layout === 'half' && next && next.layout === 'half') {
        groups.push([
          { image: current, index: i },
          { image: next, index: i + 1 }
        ]);
        i += 1;
      } else {
        groups.push([{ image: current, index: i }]);
      }
    }

    groups.forEach((group) => {
      if (group.length === 2) {
        const pair = document.createElement('div');
        pair.className = 'plates__pair';
        group.forEach((entry) => pair.appendChild(createPlate(entry.image, entry.index, onOpen)));
        mount.appendChild(pair);
      } else {
        mount.appendChild(createPlate(group[0].image, group[0].index, onOpen));
      }
    });
  }

  function createPlate(image, index, onOpen) {
    const figure = document.createElement('figure');
    figure.className = 'plate';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'plate__btn';
    button.setAttribute('aria-label', `View plate ${index + 1}`);

    const img = document.createElement('img');
    img.className = 'plate__img';
    img.src = image.src;
    img.alt = image.caption || `Plate ${index + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    button.appendChild(img);
    button.addEventListener('click', () => onOpen(index));

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

    const workCount = new Map();
    allWorks(data)
      .filter((work) => work && !work.placeholder)
      .forEach((work) => {
        if (!Array.isArray(work.people)) return;
        work.people.forEach((slug) => {
          workCount.set(slug, (workCount.get(slug) || 0) + 1);
        });
      });

    const table = document.createElement('table');
    table.className = 'people-table';

    const caption = document.createElement('caption');
    caption.className = 'sr-only';
    caption.textContent = 'People';
    table.appendChild(caption);

    const colgroup = document.createElement('colgroup');
    [
      ['people-table__letter', '30px'],
      ['people-table__name', '126px'],
      ['people-table__role', '134px'],
      ['people-table__based', '96px'],
      ['people-table__count', '']
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
    ['Name', 'Role', 'Based in', 'Works'].forEach((label) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    keys.forEach((letter, index) => {
      const body = document.createElement('tbody');
      body.id = `letter-${letter === '#' ? 'other' : letter}`;

      groups.get(letter).forEach((person, row) => {
        const total = workCount.get(person.slug) || 0;
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

        [['people-table__role', person.role], ['people-table__based', person.based]].forEach(
          ([className, value]) => {
            const td = document.createElement('td');
            td.className = className;
            td.textContent = value || '';
            tr.appendChild(td);
          }
        );

        const countCell = document.createElement('td');
        countCell.className = 'people-table__count';
        countCell.dataset.word = total === 1 ? 'publication' : 'publications';
        countCell.textContent = total ? String(total) : '—';
        tr.appendChild(countCell);

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
    const personMeta = [person.role, person.based, person.nationality].filter(Boolean).join(' · ');
    if (personMeta) role.textContent = personMeta;
    else role.hidden = true;

    const bioMount = document.getElementById('person-bio');
    const bio = Array.isArray(person.bio) ? person.bio.filter(Boolean) : [];
    if (bio.length) {
      bio.forEach((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        bioMount.appendChild(p);
      });
    } else {
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
      body.classList.add('person__body--solo');
    }

    const related = allWorks(data)
      .filter((work) => !work.placeholder && Array.isArray(work.people) && work.people.includes(person.slug));

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
      meta.textContent = [work.year, work.format].filter(Boolean).join(', ');

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
    const contact = document.getElementById('about-contact');
    const languages =
      Array.isArray(about.languages) && about.languages.length ? about.languages : ['en'];

    languages.forEach((lang) => {
      const key = lang === 'zh-Hans' ? 'zh' : lang;
      const part = about[key];
      if (!part) return;
      const paragraphs = Array.isArray(part.paragraphs) ? part.paragraphs.filter(Boolean) : [];
      if (!part.lead && !paragraphs.length) return;

      const block = document.createElement('section');
      block.className = 'about__block';
      block.lang = key === 'zh' ? 'zh-Hans' : key;

      if (part.lead) {
        const lead = document.createElement('p');
        lead.className = 'about__lead';
        lead.textContent = part.lead;
        block.appendChild(lead);
      }

      if (paragraphs.length) {
        const body = document.createElement('div');
        body.className = 'about__text';
        paragraphs.forEach((text) => {
          const p = document.createElement('p');
          p.textContent = text;
          body.appendChild(p);
        });
        block.appendChild(body);
      }

      mount.appendChild(block);
    });

    const email = data.site && data.site.email;
    if (email) {
      contact.hidden = false;
      contact.append('For enquiries: ');
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      contact.appendChild(link);
    }

    if (!mount.childElementCount && !email) {
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

  function formatEventDate(startValue, endValue) {
    const start = parseDate(startValue);
    if (!start) return startValue || '';
    const end = parseDate(endValue);
    const day = (date) => String(date.getDate()).padStart(2, '0');
    const month = MONTHS[start.getMonth()];

    if (!end || end <= start) return `${day(start)} ${month} ${start.getFullYear()}`;
    if (end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear()) {
      return `${day(start)}–${day(end)} ${month} ${start.getFullYear()}`;
    }
    if (end.getFullYear() === start.getFullYear()) {
      return `${day(start)} ${month} – ${day(end)} ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
    }
    return `${day(start)} ${month} ${start.getFullYear()} – ${day(end)} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  }

  function initEvents(data) {
    const mount = document.getElementById('events-list');
    if (!mount) return;

    const events = allEvents(data).filter((event) => event && event.title);
    if (!events.length) {
      showNotice('No events have been announced yet.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = events
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

    entries.forEach(({ event, upcoming }) => {
      const item = document.createElement('li');
      item.className = upcoming ? 'event' : 'event event--past';

      const date = document.createElement('time');
      date.className = 'event__date';
      if (event.start) date.dateTime = event.start;
      date.textContent = formatEventDate(event.start, event.end);

      const body = document.createElement('div');
      body.className = 'event__body';

      const title = document.createElement('h2');
      title.className = 'event__title';
      title.lang = 'en';
      const titleText = localizedText(event.title, 'en');
      if (event.link) {
        const link = document.createElement('a');
        link.href = event.link;
        if (/^https?:/i.test(event.link)) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        link.textContent = titleText;
        title.appendChild(link);
      } else {
        title.textContent = titleText;
      }
      body.appendChild(title);

      const titleZh = localizedText(event.title, 'zh-Hans');
      if (titleZh && titleZh !== titleText) {
        const zh = document.createElement('span');
        zh.className = 'event__title-zh';
        zh.lang = 'zh-Hans';
        zh.textContent = titleZh;
        body.appendChild(zh);
      }

      const place = [localizedText(event.city, 'en'), event.venue].filter(Boolean).join(' · ');
      if (place) {
        const line = document.createElement('p');
        line.className = 'event__place';
        line.lang = 'en';
        line.textContent = place;
        body.appendChild(line);
      }

      [
        ['en', localizedText(event.note, 'en')],
        ['zh-Hans', localizedText(event.note, 'zh-Hans')]
      ].forEach(([lang, text]) => {
        if (!text) return;
        const note = document.createElement('p');
        note.className = 'event__note';
        note.lang = lang;
        note.textContent = text;
        body.appendChild(note);
      });

      const status = document.createElement('span');
      status.className = 'event__status';
      status.textContent = upcoming ? 'Upcoming' : 'Past';

      item.append(date, body, status);
      mount.appendChild(item);
    });
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
    } catch (error) {
      showNotice(
        'Site data could not be loaded. Preview through a local server — python3 -m http.server 8000 — or open the published GitHub Pages URL.'
      );
    }
  })();
})();