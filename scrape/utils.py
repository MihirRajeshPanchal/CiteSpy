import requests
from bs4 import BeautifulSoup
import re

def get_tags(soup):
    paper_tags = soup.select('[data-lid]')
    cite_tags = soup.select('div.gs_fl')
    link_tags = soup.select('h3.gs_rt')
    author_tags = soup.select('div.gs_a')

    return paper_tags, cite_tags, link_tags, author_tags

def get_papertitle(paper_tags):
    paper_names = []
    for tag in paper_tags:
        title_tag = tag.select_one('h3')
        if title_tag:
            paper_names.append(title_tag.text)
        else:
            paper_names.append(None)
    return paper_names

def get_citecount(cite_tags):
    cite_count = []
    for tag in cite_tags:
        cite_text = tag.text
        tmp = re.findall('Cited by[ ]\d+', cite_text)
        if tmp:
            cite_count.append(tmp[0])
        else:
            cite_count.append("0")
    return cite_count

def get_link(link_tags):
    links = []
    for tag in link_tags:
        a_tag = tag.find('a')
        if a_tag:
            href = a_tag['href']
            if href.startswith('http'):
                links.append(href)
            else:
                links.append(None)
        else:
            links.append(None)
    return links

def get_author_year_publi_info(author_tags):
    years = []
    publication = []
    authors = []
    for tag in author_tags:
        authortag_text = tag.text.split()
        input_text_year = " ".join(authortag_text[-3:])
        datesearch = re.findall("(19\d{2}|20\d{2})", input_text_year)
        if len(datesearch) > 0:
            year = int(datesearch[-1])
        else:
            year = 0
        years.append(year)
        publication.append(authortag_text[-1])
        author = authortag_text[0] + ' ' + re.sub(',', '', authortag_text[1])
        authors.append(author)
    return years, publication, authors

def scrape_google_scholar(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36"
    }

    url_begin = 'https://scholar.google.com/scholar?start={}&q='
    url_end = '&hl=en&as_sdt=0,5='

    text_formatted = "+".join(query.split())
    input_url = url_begin + text_formatted + url_end
    # print(f"Constructed URL: {input_url}")
    total_papers = 10
    papers_list = []

    for start in range(0, total_papers, 10):
        url = input_url.format(start)
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            paper_tags, cite_tags, link_tags, author_tags = get_tags(soup)
            # print(f"Fetched tags: {paper_tags}, {cite_tags}, {link_tags}, {author_tags}")
            papername = get_papertitle(paper_tags)
            year, publication, author = get_author_year_publi_info(author_tags)
            cite = get_citecount(cite_tags)
            link = get_link(link_tags)

            paper_data = {
                'Paper Title': papername,
                'Year': year,
                'Author': author,
                'Citation': cite,
                'Publication site': publication,
                'Url of paper': link
            }

            papers_list.append(paper_data)
        else:
            print(f"Failed to retrieve URL {url}, status code: {response.status_code}")

    transformed_data = []

    for entry in papers_list:
        num_papers = len(entry['Paper Title'])

        for i in range(num_papers):
            paper_data = {
                'paper_title': entry['Paper Title'][i],
                'author': entry['Author'][i],
                'citation': entry['Citation'][i],
                'publication site': entry['Publication site'][i],
                'url of paper': entry['Url of paper'][i],
                'year': entry['Year'][i]
            }
            transformed_data.append(paper_data)

    return transformed_data

def format_url(url):
    if url.startswith('/'):
        return f"https://scholar.google.com{url}"
    return url