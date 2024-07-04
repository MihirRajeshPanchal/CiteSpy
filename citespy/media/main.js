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
        authorsElement.textContent = paper.authors.join(', ');
        paperElement.appendChild(authorsElement);

        const linksElement = document.createElement('div');
        linksElement.className = 'links';
        paper.links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.title || 'Link';
            linkElement.target = '_blank';
            linksElement.appendChild(linkElement);
        });
        paperElement.appendChild(linksElement);

        const summaryElement = document.createElement('p');
        summaryElement.className = 'summary';
        const words = paper.summary.split(' ');
        const shortSummary = words.slice(0, 20).join(' ');
        const restSummary = words.slice(20).join(' ');
        summaryElement.innerHTML = `${shortSummary} <span class="ellipsis">...</span><span class="rest-summary" style="display:none;"> ${restSummary}</span>`;
        
        const readMoreLink = document.createElement('a');
        readMoreLink.textContent = 'Read more';
        readMoreLink.href = '#';
        readMoreLink.className = 'read-more';
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            const ellipsis = summaryElement.querySelector('.ellipsis');
            const restSummary = summaryElement.querySelector('.rest-summary');
            if (restSummary.style.display === 'none') {
                restSummary.style.display = 'inline';
                ellipsis.style.display = 'none';
                readMoreLink.textContent = 'Read less';
            } else {
                restSummary.style.display = 'none';
                ellipsis.style.display = 'inline';
                readMoreLink.textContent = 'Read more';
            }
            setTimeout(() => {
                paperElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 0);
        });
        
        paperElement.appendChild(summaryElement);
        paperElement.appendChild(readMoreLink);

        return paperElement;
    }
})();