import requests
from bs4 import BeautifulSoup
import re
from fp.fp import FreeProxy

def get_tags(soup):
    return (
        soup.select('[data-lid]'),
        soup.select('div.gs_fl'),
        soup.select('h3.gs_rt'),
        soup.select('div.gs_a')
    )

def get_paper_info(paper_tags):
    paper_names, paper_ids = [], []
    for tag in paper_tags:
        title_tag = tag.select_one('h3')
        paper_id = tag.get('data-aid')
        if title_tag:
            title_text = title_tag.text
            cleaned_title = re.sub(r'\[.*?\]', '', title_text).strip()
            paper_names.append(cleaned_title)
        else:
            paper_names.append(None)
        paper_ids.append(paper_id)
    return paper_names, paper_ids

def get_citecount(cite_tags):
    cite_count = []
    for tag in cite_tags:
        cite_text = tag.text
        cite_match = re.findall(r'Cited by\s(\d+)', cite_text)
        cite_count.append(cite_match[0] if cite_match else "0")
    return cite_count

def get_link(link_tags):
    links = []
    for tag in link_tags:
        a_tag = tag.find('a')
        href = a_tag['href'] if a_tag and a_tag['href'].startswith('http') else None
        links.append(href)
    return links

def get_author_year_publi_info(author_tags):
    years, publications, authors = [], [], []
    for tag in author_tags:
        tag_text = tag.text.split('-')
        author_list = tag_text[0].split(',')
        clean_authors = [author.strip() for author in author_list]
        year_match = re.search(r'(19\d{2}|20\d{2})', tag_text[-1])
        year = int(year_match.group()) if year_match else 0
        years.append(year)
        publications.append(tag_text[-1].strip())
        authors.append(clean_authors)
    return years, publications, authors

def gs_scrape_citations(paper_id):
    base_url = f"https://scholar.google.de/scholar?q=info:{paper_id}:scholar.google.com/&output=cite&scirp=0&hl=de"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36"
    }
    try:
        response = requests.get(base_url, headers=headers,proxies={'https': FreeProxy().get()})
        response.raise_for_status()

        soup = BeautifulSoup(response.content.decode('utf-8'), 'html.parser')
        citation_links = {a.text.strip(): a.get('href') for a in soup.select('a.gs_citi')}
        return citation_links

    except requests.exceptions.RequestException as e:
        print(f"Failed to retrieve citation info. Error: {e}")

def gs_scrape_authors(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36"
    }
    base_url = 'https://scholar.google.com/scholar?start={}&q={}&hl=en&as_sdt=0,5'
    query_formatted = "+".join(query.split())
    total_papers = 10
    query_words = [word.lower() for word in query.split()]
    
    for start in range(0, total_papers, 10):
        url = base_url.format(start, query_formatted)
        try:
            response = requests.get(url, headers=headers, proxies={'https': FreeProxy().get()})
            response.raise_for_status()
            print(f"Query: {query}")
            soup = BeautifulSoup(response.content.decode('utf-8'), 'html.parser')
            profile_links = {}
            for tag in soup.select('a[href*="/citations?user="]'):
                author_name = tag.text.strip().lower()
                link = tag.get('href')
                full_link = f"https://scholar.google.com{link}" if link else None

                if any(word in author_name for word in query_words):
                    profile_links[author_name] = full_link
            return profile_links
        except requests.exceptions.RequestException as e:
            print(f"Failed to retrieve authors info. Error: {e}")

def gs_scrape_papers(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36"
    }
    base_url = 'https://scholar.google.com/scholar?start={}&q={}&hl=en&as_sdt=0,5'
    query_formatted = "+".join(query.split())
    total_papers = 10
    papers_list = []

    for start in range(0, total_papers, 10):
        url = base_url.format(start, query_formatted)
        try:
            response = requests.get(url, headers=headers,proxies={'https': FreeProxy().get()})
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            paper_tags, cite_tags, link_tags, author_tags = get_tags(soup)
            paper_names, paper_ids = get_paper_info(paper_tags)
            years, publications, authors = get_author_year_publi_info(author_tags)
            citations = get_citecount(cite_tags)
            links = get_link(link_tags)

            papers_list.append({
                'Paper Title': paper_names,
                'Paper ID': paper_ids,
                'Year': years,
                'Author': authors,
                'Citation': citations,
                'Publication site': publications,
                'Url of paper': links
            })
        
        except requests.exceptions.RequestException as e:
            print(f"Failed to retrieve URL {url}, error: {e}")

    transformed_data = []
    for entry in papers_list:
        num_papers = len(entry['Paper Title'])
        for i in range(num_papers):
            transformed_data.append({
                'paper_title': entry['Paper Title'][i],
                'paper_id': entry['Paper ID'][i],
                'author': entry['Author'][i],
                'citation': entry['Citation'][i],
                'publication_site': entry['Publication site'][i],
                'url_of_paper': entry['Url of paper'][i],
                'year': entry['Year'][i],
            })

    return transformed_data

def format_url(url):
    return f"https://scholar.google.com{url}" if url.startswith('/') else url
