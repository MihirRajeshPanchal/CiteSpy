from fastapi import FastAPI, HTTPException
from backend.scrape import gs_scrape_papers, gs_scrape_citations, gs_scrape_authors
from backend.semantic_scholar import ss_search_papers, ss_search_authors
from backend.data_models import GSPapersQuery, GSCitationsQuery, GSAuthorsQuery, SSPapersQuery, SSAuthorsQuery
from backend.constants import APP_NAME
app = FastAPI()

@app.get("/")
async def app_init():
    return {"response": f"{APP_NAME} Backend Running"}

@app.post("/gs_papers")
async def gs_papers(data: GSPapersQuery):
    query = data.query
    papers = gs_scrape_papers(query)
    if not papers:
        raise HTTPException(status_code=404, detail="No Research Paper Found")
    return papers

@app.post("/gs_citations")
async def gs_citations(data: GSCitationsQuery):
    query = data.paper_id
    citations = gs_scrape_citations(query)
    if not citations:
        raise HTTPException(status_code=404, detail="No Citations Found")
    return citations

@app.post("/gs_authors")
async def gs_authors(data: GSAuthorsQuery):
    query = data.author_name
    authors = gs_scrape_authors(query)
    if not authors:
        raise HTTPException(status_code=404, detail="No Authors Found")
    return authors

@app.post("/ss_papers")
async def ss_papers(data: SSPapersQuery):
    query = data.query
    no_of_papers = data.no_of_papers
    papers = ss_search_papers(query,no_of_papers)
    if not papers:
        raise HTTPException(status_code=404, detail="No Research Paper Found")
    return papers

@app.post("/ss_authors")
async def ss_authors(data: SSAuthorsQuery):
    query = data.query
    authors = ss_search_authors(query)
    if not authors:
        raise HTTPException(status_code=404, detail="No Authors Found")
    return authors

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, debug=True)