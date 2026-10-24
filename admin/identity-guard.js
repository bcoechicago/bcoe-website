// identity-guard.js
// Runs before Netlify CMS loads. If the URL contains a recovery_token or
// invite_token, redirect to recover.html so the CMS doesn't wipe the hash.
(function () {
  var hash = window.location.hash;
  if (hash.indexOf('recovery_token=') !== -1) {
    window.location.replace('/admin/recover.html' + hash);
  }
  if (hash.indexOf('invite_token=') !== -1) {
    window.location.replace('/admin/recover.html' + hash);
  }
})();
