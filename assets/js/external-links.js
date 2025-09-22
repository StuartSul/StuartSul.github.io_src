// Hack to avoid using <a> tags in markdown files
document.addEventListener('DOMContentLoaded', function() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(function(link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('itemprop', 'sameAs');
        link.setAttribute('rel', 'noopener');
    });
});
