const scripts = [
  './js/dbLoad.js',
  './js/deleteProject.js'
];

scripts.forEach(script => {
  const scriptTag = document.createElement('script');
  scriptTag.src = script;
  document.body.appendChild(scriptTag);
});