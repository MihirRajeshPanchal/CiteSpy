(function() {
    const vscode = acquireVsCodeApi();
    const loader = document.getElementById('loader');

    document.getElementById('searchButton').addEventListener('click', () => {
        const searchQuery = document.getElementById('searchInput').value;
        showLoader();
        vscode.postMessage({
            command: 'search',
            text: searchQuery
        });
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'results':
                hideLoader();
                const resultsContainer = document.getElementById('results');
                resultsContainer.innerHTML = '';
                message.data.forEach(paper => {
                    resultsContainer.appendChild(createPaperComponent(paper));
                });
                break;
            case 'error':
                hideLoader();
                break;
        }
    });

    function showLoader() {
        loader.style.display = 'flex';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function createPaperComponent(paper) {
        const paperElement = document.createElement('div');
        paperElement.className = 'paper';

        const titleElement = document.createElement('h3');
        titleElement.textContent = paper.title;
        paperElement.appendChild(titleElement);

        const authorsElement = document.createElement('p');
        authorsElement.className = 'authors';
        authorsElement.textContent = paper.authors.map(author => author.name).join(', ');
        paperElement.appendChild(authorsElement);

        const yearCitationElement = document.createElement('p');
        yearCitationElement.className = 'year-citation';
        yearCitationElement.textContent = `Year: ${paper.year || 'N/A'} | Citations: ${paper.citationCount || 0}`;
        paperElement.appendChild(yearCitationElement);

        const abstractElement = document.createElement('p');
        abstractElement.className = 'abstract';
        const shortAbstract = paper.abstract ? paper.abstract.split(' ').slice(0, 30).join(' ') : 'No abstract available';
        const restAbstract = paper.abstract ? paper.abstract.split(' ').slice(30).join(' ') : '';
        abstractElement.innerHTML = `${shortAbstract} <span class="ellipsis">...</span><span class="rest-abstract" style="display:none;"> ${restAbstract}</span>`;
        paperElement.appendChild(abstractElement);

        const readMoreLink = document.createElement('a');
        readMoreLink.textContent = 'Read more';
        readMoreLink.href = '#';
        readMoreLink.className = 'read-more';
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            const ellipsis = abstractElement.querySelector('.ellipsis');
            const restAbstract = abstractElement.querySelector('.rest-abstract');
            if (restAbstract.style.display === 'none') {
                restAbstract.style.display = 'inline';
                ellipsis.style.display = 'none';
                readMoreLink.textContent = 'Read less';
            } else {
                restAbstract.style.display = 'none';
                ellipsis.style.display = 'inline';
                readMoreLink.textContent = 'Read more';
            }
        });
        paperElement.appendChild(readMoreLink);

        const linksElement = document.createElement('div');
        linksElement.className = 'links';

        if (paper.url) {
            const paperLink = document.createElement('a');
            paperLink.href = paper.url;
            paperLink.innerHTML = '<span class="icon">📄</span> View Paper';
            paperLink.target = '_blank';
            paperLink.className = 'paper-link';
            linksElement.appendChild(paperLink);
        }

        if (paper.externalIds && paper.externalIds.DOI) {
            const doiLink = document.createElement('a');
            doiLink.href = `https://doi.org/${paper.externalIds.DOI}`;
            doiLink.innerHTML = '<span class="icon">🔗</span> DOI';
            doiLink.target = '_blank';
            doiLink.className = 'doi-link';
            linksElement.appendChild(doiLink);
        }

        paperElement.appendChild(linksElement);

        const citationStylesElement = document.createElement('div');
        citationStylesElement.className = 'citation-styles';
        if (paper.citationStyles && paper.citationStyles.bibtex) {
            const bibtexButton = document.createElement('button');
            bibtexButton.innerHTML = '<span class="icon">📋</span> Copy BibTeX';
            bibtexButton.className = 'copy-button';
            bibtexButton.addEventListener('click', () => {
                navigator.clipboard.writeText(paper.citationStyles.bibtex).then(() => {
                    bibtexButton.textContent = 'Copied!';
                    setTimeout(() => {
                        bibtexButton.innerHTML = '<span class="icon">📋</span> Copy BibTeX';
                    }, 2000);
                });
            });
            citationStylesElement.appendChild(bibtexButton);
        }
        paperElement.appendChild(citationStylesElement);

        return paperElement;
    }
})();