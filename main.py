from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import requests

app = FastAPI()

# Allow local frontend access if served separately (e.g., file:// or a dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

class CharacterRequest(BaseModel):
    personagem: str

@app.exception_handler(HTTPException)
def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

RICK_AND_MORTY_BASE = "https://rickandmortyapi.com/api"
REQUEST_TIMEOUT = 10

@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html")

@app.get("/main.js")
def main_js():
    return FileResponse(BASE_DIR / "main.js")

@app.get("/main.css")
def main_css():
    return FileResponse(BASE_DIR / "main.css")

@app.post("/api/character")
def get_character(req: CharacterRequest):
    # Busca pelo nome do personagem
    url = f"{RICK_AND_MORTY_BASE}/character/"
    response = requests.get(url, params={"name": req.personagem}, timeout=REQUEST_TIMEOUT)

    # Se a API retornar erro (ex: personagem não existe)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Personagem não encontrado")

    data = response.json()

    # Verifica se a lista de resultados não está vazia
    if not data.get("results"):
        raise HTTPException(status_code=404, detail="Personagem não encontrado")

    # Retorna o primeiro personagem da lista de resultados com o formato esperado
    char = data["results"][0]
    return {
        "id": char.get("id"),
        "name": char.get("name"),
        "status": char.get("status"),
        "species": char.get("species"),
        "type": char.get("type", ""),
        "gender": char.get("gender"),
        "origin": char.get("origin"),
        "location": char.get("location"),
        "image": char.get("image"),
        "episode": char.get("episode", []),
        "url": char.get("url"),
        "created": char.get("created"),
    }

@app.get("/api/characters")
def list_characters(page: int = Query(1, ge=1)):
    url = f"{RICK_AND_MORTY_BASE}/character/"
    response = requests.get(url, params={"page": page}, timeout=REQUEST_TIMEOUT)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Falha ao listar personagens")
    return response.json()

@app.get("/api/episodes")
def list_episodes(page: int = Query(1, ge=1)):
    url = f"{RICK_AND_MORTY_BASE}/episode/"
    response = requests.get(url, params={"page": page}, timeout=REQUEST_TIMEOUT)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Falha ao listar episódios")
    return response.json()
