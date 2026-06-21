/* =====================================================
   SURE SHOT — main.js
   ナビ / モバイルメニュー / スクロール演出 / データ描画 / 応募フォーム
   データソース: data/events.json
   ===================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fadeObserver = null;

  /* ARTISTS 一覧で先頭に固定表示するアーティスト（この順）。
     ここに無いアーティストは以降に50音/アルファベット順で並ぶ。
     名前は data/events.json の lineup の name と完全一致させること。 */
  var ARTIST_PRIORITY = ['AKIRA', 'B-HOPE', 'TOY', 'Nosu'];

  /* アーティストのSNSリンク定義。
     lineup の各メンバーに対応キー(instagram/spotify/soundcloud)のURLがあれば
     アイコンを自動表示する。今後キーを足すだけで拡張可能。 */
  var SOCIALS = [
    { key: 'instagram',  svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
    { key: 'spotify',    svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.601.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z"/></svg>' },
    { key: 'soundcloud', svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .105-.061.121-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.121-.12m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.15l.24-2.532-.24-2.623c0-.075-.06-.135-.135-.135m1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.18 2.43.165 2.563c.005.09.075.157.164.157.084 0 .159-.075.159-.164l.21-2.563-.21-2.43m.824-.852c-.101 0-.18.09-.18.181l-.165 2.91.165 2.563c0 .09.075.181.18.181s.18-.09.18-.181l.21-2.563-.21-2.917c-.008-.098-.083-.18-.18-.18m.93.061c-.106 0-.196.09-.196.194l-.135 2.842.15 2.554c0 .105.09.196.196.196.104 0 .194-.09.194-.196l.165-2.554-.165-2.842c0-.104-.09-.194-.194-.194m.93-.18c-.045-.18-.135-.27-.225-.27-.119 0-.21.09-.21.21l-.135 3.022.135 2.529c0 .12.091.21.21.21.105 0 .195-.09.21-.21l.149-2.529-.149-3.022m.945-.345c-.121 0-.211.105-.211.225l-.105 3.196.12 2.52c0 .12.09.21.196.21.119 0 .209-.09.209-.225l.135-2.505-.135-3.18c0-.135-.09-.225-.209-.225m1.005-.405c-.135 0-.24.105-.24.24l-.09 3.6.105 2.49c0 .135.105.24.24.24s.24-.105.24-.24l.119-2.49-.119-3.6c0-.135-.105-.24-.24-.24m1.005-.039c-.135 0-.255.119-.255.255l-.09 3.629.105 2.475c0 .15.12.255.255.255.149 0 .254-.12.27-.255l.104-2.475-.119-3.629c-.016-.15-.121-.27-.27-.27m1.005-.06c-.075-.045-.165-.075-.255-.075s-.18.03-.255.075c-.105.06-.18.165-.18.285v.045l-.09 3.659.09 2.46c.015.075.045.135.105.18.06.061.149.105.239.105.075 0 .165-.045.225-.105.06-.045.105-.119.105-.18l.105-2.46-.105-3.659c-.015-.135-.075-.225-.18-.285m6.72 1.71c-.405 0-.794.075-1.155.225-.24-2.715-2.52-4.847-5.294-4.847-.69 0-1.351.135-1.95.36-.225.09-.285.18-.285.36v9.781c0 .195.149.345.329.36.015 0 9.36 0 9.405 0 1.875 0 3.39-1.515 3.39-3.39 0-1.875-1.515-3.39-3.39-3.39"/></svg>' }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    mountChrome();      // 共通のナビ／フッターを各ページに注入
    initNavScroll();
    initMobileMenu();
    initFadeIn();
    initEventsData();   // data/events.json を読み込んで各セクションを描画
    initApplyForm();
    initFooterYear();
  });

  /* ===================================================
     共通クロム（ナビ／フッター）を全ページへ注入
     各ページは <div data-nav></div> / <div data-footer></div> を置くだけ。
     現在ページは <body data-page="..."> で指定。
     =================================================== */
  var IG_URL = 'https://www.instagram.com/sure_shot_2024_/';
  var IG_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z';

  // ナビ項目（ページ横断リンク）
  var NAV_ITEMS = [
    { page: 'about',    label: 'ABOUT',    href: 'index.html#about' },
    { page: 'series',   label: 'SERIES',   href: 'series.html' },
    { page: 'schedule', label: 'SCHEDULE', href: 'schedule.html' },
    { page: 'archive',  label: 'ARCHIVE',  href: 'archive.html' },
    { page: 'artists',  label: 'ARTISTS',  href: 'artists.html' }
  ];

  function mountChrome() {
    var active = document.body.getAttribute('data-page') || '';

    var navHost = document.querySelector('[data-nav]');
    if (navHost) navHost.outerHTML = navHtml(active);

    var footHost = document.querySelector('[data-footer]');
    if (footHost) footHost.outerHTML = footerHtml();
  }

  function navHtml(active) {
    var items = NAV_ITEMS.map(function (it) {
      var cur = it.page === active;
      return '<li><a href="' + it.href + '"' +
        (cur ? ' class="is-current" aria-current="page"' : '') +
        '>' + it.label + '</a></li>';
    }).join('');

    return '' +
      '<nav class="nav" id="nav">' +
        '<div class="nav__inner">' +
          '<a href="index.html" class="nav__logo" aria-label="SURE SHOT ホーム">' +
            '<img src="images/logo.png" alt="SURE SHOT" class="nav__logo-img">' +
          '</a>' +
          '<button class="nav__toggle" id="navToggle" aria-label="メニューを開く" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
          '<ul class="nav__list" id="navList" role="list">' +
            items +
            '<li><a href="' + IG_URL + '" target="_blank" rel="noopener noreferrer" class="nav__ig" aria-label="Instagram @sure_shot_2024_">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + IG_PATH + '"/></svg>' +
            '</a></li>' +
            '<li><a href="contact.html"' + (active === 'contact' ? ' aria-current="page"' : '') + ' class="nav__cta">CONTACT</a></li>' +
          '</ul>' +
        '</div>' +
      '</nav>';
  }

  function footerHtml() {
    var menu = NAV_ITEMS.concat([{ label: 'CONTACT', href: 'contact.html' }]).map(function (it) {
      return '<li><a href="' + it.href + '">' + it.label + '</a></li>';
    }).join('');

    return '' +
      '<footer class="footer">' +
        '<div class="container">' +
          '<div class="footer__top">' +
            '<div class="footer__brand">' +
              '<p class="footer__logo"><a href="index.html"><img src="images/logo.png" alt="SURE SHOT" class="footer__logo-img"></a></p>' +
              '<p class="footer__tagline">終電で帰れて、ブラックミュージックを堪能できるライブイベント。</p>' +
              '<a href="' + IG_URL + '" target="_blank" rel="noopener noreferrer" class="footer__sns" aria-label="Instagram @sure_shot_2024_">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + IG_PATH + '"/></svg>' +
                '@sure_shot_2024_' +
              '</a>' +
            '</div>' +
            '<nav class="footer__nav" aria-label="フッターナビゲーション">' +
              '<div class="footer__col">' +
                '<h4 class="footer__col-title">MENU</h4>' +
                '<ul>' + menu + '</ul>' +
              '</div>' +
              '<div class="footer__col">' +
                '<h4 class="footer__col-title">CONTACT</h4>' +
                '<ul>' +
                  '<li><a href="contact.html">お問い合わせフォーム</a></li>' +
                  '<li><a href="' + IG_URL + '" target="_blank" rel="noopener noreferrer">Instagram DM</a></li>' +
                '</ul>' +
              '</div>' +
            '</nav>' +
          '</div>' +
          '<div class="footer__bottom"><p>&copy; 2024 SURE SHOT. All rights reserved.</p></div>' +
        '</div>' +
      '</footer>';
  }

  /* ===================================================
     ナビ: スクロールで背景を出す
     =================================================== */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===================================================
     モバイルメニューの開閉
     =================================================== */
  function initMobileMenu() {
    var toggle = document.getElementById('navToggle');
    var list = document.getElementById('navList');
    if (!toggle || !list) return;

    var setState = function (open) {
      toggle.classList.toggle('open', open);
      list.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };

    toggle.addEventListener('click', function () {
      setState(!list.classList.contains('open'));
    });

    list.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setState(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && list.classList.contains('open')) {
        setState(false);
        toggle.focus();
      }
    });
  }

  /* ===================================================
     スクロールでフェードイン
     （動的に追加した要素も observeFade() で監視できる）
     =================================================== */
  function initFadeIn() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  // 後から追加された要素をフェードイン対象にする
  function observeFade(scope) {
    var targets = scope ? scope.querySelectorAll('.fade-in') : [];
    if (!fadeObserver) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    targets.forEach(function (el) { fadeObserver.observe(el); });
  }

  /* ===================================================
     データ読み込み & 描画
     =================================================== */
  function initEventsData() {
    // [1] インラインで読み込んだデータ data/events.js を優先 → file:// でも動作
    if (window.SURE_SHOT_DATA) {
      renderAll(window.SURE_SHOT_DATA);
      return;
    }
    // [2] フォールバック: HTTP配信時は data/events.json を fetch
    fetch('data/events.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        renderAll(data);
      })
      .catch(function (err) {
        console.error('events データの読み込みに失敗しました:', err);
        showDataError();
      });
  }

  function renderAll(data) {
    try {
      renderConcept(data);
      renderNextEvent(data);
      renderUpcoming(data);
      renderArchive(data);
      renderArtists(data);
    } catch (err) {
      console.error('イベントの描画に失敗しました:', err);
      showDataError();
    }
  }

  /* ---- ABOUT: concept ---- */
  function renderConcept(data) {
    var el = document.getElementById('aboutConcept');
    if (el && data.concept) el.textContent = data.concept;
  }

  /* ---- 次回イベント ---- */
  function renderNextEvent(data) {
    var host = document.getElementById('nextEvent');
    if (!host) return;
    if (!data.next_event) { host.remove(); return; }
    host.innerHTML = eventCardHtml(data.next_event, true);
    observeFade(host);
  }

  /* ---- 今後の予定 ---- */
  function renderUpcoming(data) {
    var host = document.getElementById('upcomingEvents');
    if (!host) return;

    var list = data.upcoming_events || [];
    if (!list.length) {
      // 今後の予定が無ければセクションごと非表示
      var sec = document.getElementById('upcoming');
      if (sec) { sec.remove(); } else { host.remove(); }
      return;
    }
    host.innerHTML = list
      .slice()
      .sort(byDateAsc)
      .map(function (ev) { return eventCardHtml(ev, false); })
      .join('');
    observeFade(host);
  }

  /* ---- 過去イベントアーカイブ（新しい順） ---- */
  function renderArchive(data) {
    var host = document.getElementById('archiveList');
    if (!host) return;

    var list = (data.archive_events || []).slice().sort(byDateDesc);
    if (!list.length) {
      host.innerHTML = '<p class="schedule__note">アーカイブは準備中です。</p>';
      return;
    }
    host.innerHTML = list.map(archiveItemHtml).join('');
    observeFade(host);
  }

  /* ---- 出演アーティスト（全イベントの lineup を統合） ---- */
  function renderArtists(data) {
    var host = document.getElementById('artistsGrid');
    if (!host) return;

    // 各イベントが属するページ（出演回リンクの飛び先）も保持
    var all = [];
    if (data.next_event) all.push({ ev: data.next_event, page: 'schedule.html' });
    (data.upcoming_events || []).forEach(function (e) { all.push({ ev: e, page: 'schedule.html' }); });
    (data.archive_events || []).forEach(function (e) { all.push({ ev: e, page: 'archive.html' }); });

    var map = {};
    var order = [];

    all.forEach(function (entry) {
      var ev = entry.ev;
      (ev.lineup || []).forEach(function (m) {
        // Instagram URL一致 or 名前完全一致で同一人物として統合
        var key = m.instagram
          ? 'ig:' + m.instagram.toLowerCase().replace(/\/+$/, '')
          : 'nm:' + String(m.name).trim().toLowerCase();

        var artist = map[key];
        if (!artist) {
          artist = map[key] = { name: m.name, roles: [], socials: {}, events: [] };
          order.push(artist);
        }
        if (m.role && artist.roles.indexOf(m.role) === -1) artist.roles.push(m.role);

        // 各SNS: データにURLがあるものだけ拾う（最初に見つかった非空を採用）
        SOCIALS.forEach(function (s) {
          if (m[s.key] && !artist.socials[s.key]) artist.socials[s.key] = m[s.key];
        });

        if (!artist.events.some(function (x) { return x.id === ev.id; })) {
          artist.events.push({ id: ev.id, title: ev.title, date: ev.date, page: entry.page });
        }
      });
    });

    // 先頭固定（この順）→ 残りは50音/アルファベット順
    order.sort(function (a, b) {
      var fa = ARTIST_PRIORITY.indexOf(a.name);
      var fb = ARTIST_PRIORITY.indexOf(b.name);
      fa = fa === -1 ? 999 : fa;
      fb = fb === -1 ? 999 : fb;
      if (fa !== fb) return fa - fb;
      return a.name.localeCompare(b.name, 'ja');
    });

    host.innerHTML = order.map(artistCardHtml).join('');
    observeFade(host);
  }

  function artistCardHtml(a) {
    var roles = a.roles.length
      ? '<p class="artist-card__roles">' + esc(a.roles.join(' / ')) + '</p>'
      : '';

    var socials = SOCIALS
      .filter(function (s) { return a.socials[s.key]; })
      .map(function (s) {
        return '<a class="artist-card__social" href="' + attr(a.socials[s.key]) +
          '" target="_blank" rel="noopener noreferrer" aria-label="' + s.key + '">' + s.svg + '</a>';
      }).join('');
    socials = socials ? '<div class="artist-card__socials">' + socials + '</div>' : '';

    var events = a.events.slice().sort(byDateDesc).map(function (e) {
      var p = (e.date || '').split('-');
      var d = p.length === 3 ? (p[0] + '.' + p[1] + '.' + p[2]) : (e.date || '');
      return '<li><a class="artist-card__event" href="' + (e.page || '') + '#event-' + attr(e.id) + '">' +
        '<span class="artist-card__event-date">' + esc(d) + '</span>' +
        '<span class="artist-card__event-series">' + esc(seriesShort(e.title)) + '</span>' +
        '</a></li>';
    }).join('');

    return '' +
      '<article class="artist-card fade-in">' +
        '<h3 class="artist-card__name">' + esc(a.name) + '</h3>' +
        roles +
        socials +
        '<ul class="artist-card__events">' + events + '</ul>' +
      '</article>';
  }

  function seriesShort(title) {
    var t = String(title || '');
    if (/-\s*proof\s*-/i.test(t)) return '-Proof-';
    if (/-\s*extra\s*-/i.test(t)) return '-extra-';
    return 'SURE SHOT';
  }

  /* ===================================================
     HTML ビルダー
     =================================================== */
  function eventCardHtml(ev, featured) {
    var nextBadge = featured ? '<span class="event-card__badge">NEXT</span>' : '';
    var series = seriesInfo(ev.title);

    // チケット購入(LivePocket)のみ外部リンクとして残す
    var ticketBtn = ev.ticket_url
      ? '<a href="' + attr(ev.ticket_url) + '" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--full">チケットを購入 (LivePocket)</a>'
      : '';

    var flyer = ev.flyer
      ? '<div class="event-card__flyer"><img src="' + attr(ev.flyer) + '" alt="' + esc(ev.title) + ' フライヤー" loading="lazy"></div>'
      : '';

    var body = '' +
      '<div class="event-card__body">' +
        '<div class="event-card__tags">' + nextBadge +
          '<span class="event-card__series ' + series.cls + '">' + esc(series.label) + '</span>' +
        '</div>' +
        '<h3 class="event-card__title">' + esc(ev.title) + '</h3>' +
        '<p class="event-card__date">' + esc(ev.day_label || '') + '</p>' +
        '<p class="event-card__venue">' + esc(ev.venue || '') +
          (ev.open_start ? '<span class="event-card__time">' + esc(ev.open_start) + '</span>' : '') +
        '</p>' +
        (ev.price ? '<p class="event-card__price">' + esc(ev.price) + '</p>' : '') +
        '<div class="event-card__lineup">' + lineupRowsHtml(ev.lineup) + '</div>' +
        (ticketBtn ? '<div class="event-card__actions">' + ticketBtn + '</div>' : '') +
      '</div>';

    return '' +
      '<article class="event-card fade-in' + (featured ? ' event-card--featured' : '') + '" id="event-' + attr(ev.id) + '">' +
        flyer + body +
      '</article>';
  }

  // タイトルからシリーズ種別を判定（バッジ用）
  function seriesInfo(title) {
    var t = String(title || '');
    if (/-\s*proof\s*-/i.test(t)) return { label: 'SURE SHOT -Proof-', cls: 'event-card__series--proof' };
    if (/-\s*extra\s*-/i.test(t)) return { label: 'SURE SHOT -extra-', cls: 'event-card__series--extra' };
    return { label: 'SURE SHOT', cls: 'event-card__series--main' };
  }

  function lineupRowsHtml(lineup) {
    if (!lineup || !lineup.length) return '';
    var groups = [];
    var byRole = {};
    lineup.forEach(function (m) {
      if (!byRole[m.role]) { byRole[m.role] = { role: m.role, names: [] }; groups.push(byRole[m.role]); }
      byRole[m.role].names.push(artistLinkHtml(m, 'lineup-name'));
    });
    return groups.map(function (g) {
      return '<div class="lineup-row">' +
        '<span class="lineup-row__role">' + esc(g.role) + '</span>' +
        '<span class="lineup-row__names">' + g.names.join('<span class="lineup-row__sep">/</span>') + '</span>' +
        '</div>';
    }).join('');
  }

  function archiveItemHtml(ev) {
    var parts = (ev.date || '').split('-');
    var year = parts[0] || '';
    var day = parts.length === 3 ? (Number(parts[1]) + '.' + Number(parts[2])) : '';
    var dateLabel = (year && day) ? (year + ' · ' + day) : (ev.day_label || '');

    var series = seriesInfo(ev.title);

    var artists = (ev.lineup || []).map(function (m) {
      return '<li>' + artistLinkHtml(m, 'gallery-card__artist') + '</li>';
    }).join('');

    var flyer = ev.flyer
      ? '<img src="' + attr(ev.flyer) + '" alt="' + esc(ev.title) + ' フライヤー" loading="lazy">'
      : '<span class="gallery-card__noimg">' + esc(ev.title) + '</span>';

    return '' +
      '<article class="gallery-card fade-in" id="event-' + attr(ev.id) + '">' +
        '<div class="gallery-card__flyer">' +
          flyer +
          '<span class="event-card__series ' + series.cls + ' gallery-card__badge">' + esc(series.label) + '</span>' +
        '</div>' +
        '<div class="gallery-card__caption">' +
          '<p class="gallery-card__date">' + esc(dateLabel) + (ev.venue ? '<span class="gallery-card__venue">' + esc(ev.venue) + '</span>' : '') + '</p>' +
          '<h3 class="gallery-card__title">' + esc(ev.title) + '</h3>' +
          '<ul class="gallery-card__artists" aria-label="出演アーティスト">' + artists + '</ul>' +
        '</div>' +
      '</article>';
  }

  function artistLinkHtml(m, cls) {
    if (m.instagram) {
      return '<a class="ig-link ' + cls + '" href="' + attr(m.instagram) + '" target="_blank" rel="noopener noreferrer">' +
        esc(m.name) + '</a>';
    }
    return '<span class="' + cls + '">' + esc(m.name) + '</span>';
  }

  function showDataError() {
    var msg = 'イベント情報を読み込めませんでした。ページを再読み込みするか、しばらく経ってからお試しください。';
    ['nextEvent', 'archiveList', 'artistsGrid'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '<p class="schedule__note">' + msg + '</p>';
    });
  }

  /* ===================================================
     ユーティリティ
     =================================================== */
  function byDateDesc(a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); }
  function byDateAsc(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  // 属性値（URL等）用。基本は esc と同等で十分。
  function attr(s) { return esc(s); }

  /* ===================================================
     お問い合わせ / 出演応募フォーム
     =================================================== */
  function initApplyForm() {
    var form = document.getElementById('contactForm');
    var note = document.getElementById('formNote');
    var successEl = document.getElementById('formSuccess');
    var submitBtn = document.getElementById('formSubmit');
    if (!form) return;

    var showError = function (msg) {
      if (!note) return;
      note.textContent = msg;
      note.hidden = false;
    };

    var clearError = function () {
      if (!note) return;
      note.textContent = '';
      note.hidden = true;
    };

    var showSuccess = function () {
      form.hidden = true;
      if (successEl) successEl.hidden = false;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      if (!form.checkValidity()) {
        showError('必須項目（*）をご確認ください。');
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中…';
      }

      fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          showSuccess();
        })
        .catch(function () {
          showError('送信に失敗しました。時間をおいて再度お試しください。');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '送信する';
          }
        });
    });

    form.addEventListener('input', clearError);
  }

  /* ===================================================
     フッターの年号を自動更新
     =================================================== */
  function initFooterYear() {
    var bottom = document.querySelector('.footer__bottom p');
    if (!bottom) return;
    bottom.innerHTML = '&copy; ' + new Date().getFullYear() + ' SURE SHOT. All rights reserved.';
  }
})();
