// ─── BCOE CHICAGO — SHARED LAYOUT ───────────────────────────────────────────
// This file injects the nav and footer into every page automatically.
// Member name display and login state are handled here too.

(function () {
  // ── NAV ──────────────────────────────────────────────────────────────────
  const nav = `
  <div class="topbar">
    <div class="topbar-contact">
      <a href="tel:+17735966499">📞 773-596-6499</a>
      <a href="mailto:admin@bcoechicago.org">✉ admin@bcoechicago.org</a>
      <span>Mon – Thurs &nbsp;9am – 5pm</span>
    </div>
    <div class="topbar-social">
      <a href="https://www.facebook.com/bcoechicago.org" target="_blank">Facebook</a>
      <a href="https://www.instagram.com/bcoe.chicago/" target="_blank">Instagram</a>
      <a href="https://www.linkedin.com/company/28142246/" target="_blank">LinkedIn</a>
    </div>
  </div>
  <nav>
    <a href="index.html" class="nav-logo">BCOE<span>.</span></a>
    <button class="nav-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')" aria-label="Menu">☰</button>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="leadership.html">Leadership</a></li>
      <li><a href="committees.html">Committees</a></li>
      <li><a href="blueprint.html">The Blueprint</a></li>
      <li><a href="news.html">News</a></li>
      <li><a href="events.html">Events</a></li>
      <li><a href="scholarship.html">Scholarships</a></li>
      <li><a href="directory.html">Directory</a></li>
      <li><a href="index.html#contact">Contact</a></li>
    </ul>    <div class="nav-actions">
      <span class="nav-member-name SF_li" style="display:none;">Welcome, <strong><span class="SFnam"></span></strong></span>
      <a href="my-account.html" class="nav-account SF_li" style="display:none;">My Account</a>
      <a href="my-account.html" class="nav-login SF_lo">Member Login</a>
      <a href="join.html" class="nav-cta">Join BCOE</a>
    </div>
  </nav>`;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footer = `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo" style="font-size:22px;margin-bottom:16px;">BCOE<span style="color:#C9A84C;">.</span></div>
        <p>Black Contractors Owners and Executives — founded in Chicago, serving Black contractors and business professionals across Illinois and growing nationwide.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/bcoechicago.org" target="_blank">f</a>
          <a href="https://www.instagram.com/bcoe.chicago/" target="_blank">ig</a>
          <a href="https://www.linkedin.com/company/28142246/" target="_blank">in</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="index.html">🏠 Home</a></li>
          <li><a href="leadership.html">Leadership</a></li>
          <li><a href="committees.html">Committees</a></li>
          <li><a href="blueprint.html">The Blueprint</a></li>
          <li><a href="news.html">News</a></li>
          <li><a href="events.html">Events</a></li>
          <li><a href="scholarship.html">Scholarships</a></li>
          <li><a href="directory.html">Member Directory</a></li>
        </ul>      </div>
      <div class="footer-col">
        <h4>Membership</h4>
        <ul>
          <li><a href="join.html">Join BCOE</a></li>
          <li><a href="my-account.html">Member Login</a></li>
          <li><a href="invoices.html">My Invoices</a></li>
          <li><a href="index.html#about">About BCOE</a></li>
          <li><a href="index.html#contact">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <p style="font-size:14px;margin-bottom:8px;">7744 S Stony Island Ave<br>Chicago, IL 60649</p>
        <p style="font-size:14px;margin-bottom:8px;"><a href="tel:+17735966499" style="color:rgba(255,255,255,.55);">773-596-6499</a></p>
        <p style="font-size:14px;margin-bottom:8px;"><a href="mailto:admin@bcoechicago.org" style="color:rgba(255,255,255,.55);">admin@bcoechicago.org</a></p>
        <p style="font-size:14px;">Mon – Thurs: 9am – 5pm</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 BCOE Chicago. All rights reserved.</span>
      <span>BCOE | Illinois &amp; Beyond</span>
      <span>Site by <a href="https://executioncreative.com" target="_blank" style="color:inherit;text-decoration:underline;opacity:.75;">Execution Creative</a></span>
    </div>
  </footer>
  <script>(function(){var i,a,x;try{x=localStorage.getItem("SF_nam");}catch(e){x="";}try{for(a=document.querySelectorAll(".SFnam"),i=a.length-1;i>=0;i--)a[i].innerHTML=x?x:"";}catch(e){}try{for(a=document.querySelectorAll(".SF_li"),i=a.length-1;i>=0;i--)a[i].style.display=x?"":"none";}catch(e){}try{for(a=document.querySelectorAll(".SF_lo"),i=a.length-1;i>=0;i--)a[i].style.display=x?"none":"";}catch(e){}})();</script>`;

  // ── INJECT ────────────────────────────────────────────────────────────────
  const navEl = document.getElementById('bcoe-nav');
  if (navEl) navEl.innerHTML = nav;
  const footEl = document.getElementById('bcoe-footer');
  if (footEl) footEl.innerHTML = footer;

  // ── MOBILE NAV CLOSE ON LINK CLICK ───────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-links a')) {
      document.querySelector('.nav-links') && document.querySelector('.nav-links').classList.remove('open');
    }
  });
})();
