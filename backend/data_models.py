from pydantic import BaseModel

class GSPapersQuery(BaseModel):
    query: str
    
class GSCitationsQuery(BaseModel):
    paper_id: str
    
class GSAuthorsQuery(BaseModel):
    author_name: str
    
class SSPapersQuery(BaseModel):
    query: str
    no_of_papers : int
    
class SSAuthorsQuery(BaseModel):
    query: str