from fastapi import FastAPI, HTTPException
from scrape.utils import scrape_google_scholar
from scrape.data_models import SearchQuery
from scrape.constants import APP_NAME
app = FastAPI()

@app.get("/")
async def app_init():
    return {"response": f"{APP_NAME} Backend Running"}

@app.post("/scrape")
async def scrape(data: SearchQuery):
    query = data.query
    papers = scrape_google_scholar(query)
    if not papers:
        raise HTTPException(status_code=404, detail="No Research Paper Found")
    return papers

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, debug=True)