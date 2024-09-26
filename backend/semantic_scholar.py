from backend.constants import S2_API_KEY
import requests

def ss_search_papers(query,result_limit):
    rsp = requests.get('https://api.semanticscholar.org/graph/v1/paper/search',
                        headers={'X-API-KEY': S2_API_KEY},
                        params={'query': query, 'limit': result_limit, 'fields': 'title,url,title,venue,publicationVenue,year,authors,abstract,citationCount,publicationTypes,citationStyles'})
    rsp.raise_for_status()
    results = rsp.json()
    total = results["total"]
    if not total:
        return {"reponse": "No Research Paper Found"}
    print(f'Found {total} results. Showing up to {result_limit}.')
    return results["data"]

def ss_search_authors(query):
    rsp = requests.get('https://api.semanticscholar.org/graph/v1/author/search',
                        headers={'X-API-KEY': S2_API_KEY},
                        params={'query': query, 'fields': 'name,url,paperCount,citationCount,hIndex,affiliations,papers.paperId,papers.title,papers.year,papers.citationCount,papers.abstract'})
    rsp.raise_for_status()
    results = rsp.json()
    total = results["total"]
    if not total:
        return {"reponse": "No Authors Found"}
    print(f'Found {total} results.')
    return results["data"]
