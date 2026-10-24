;(function () {
  try {
    var stored = window.localStorage.getItem('dgblitz-theme')
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
  } catch {
    document.documentElement.dataset.theme = 'dark'
  }
})()
