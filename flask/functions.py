from constants import *

def search(query):
    search = arxiv.Search(
        query=query,
        max_results=10,
        sort_by=arxiv.SortCriterion.SubmittedDate
    )
    results = client.results(search)
    all_results = list(results)
    
    formatted_results = []
    for result in all_results:
        formatted_result = {
            'entry_id': result.entry_id,
            'updated': result.updated,
            'published': result.published,
            'title': result.title,
            'authors': [author.name for author in result.authors],
            'summary': result.summary,
            'comment': result.comment,
            'journal_ref': result.journal_ref,
            'doi': result.doi,
            'primary_category': result.primary_category,
            'categories': result.categories,
            'links': [{'url': link.href, 'title': link.title} for link in result.links]
        }
        formatted_results.append(formatted_result)
    return formatted_results