import json
import sys
import unicodedata
from http.server import BaseHTTPRequestHandler, HTTPServer

ETIQUETAS = [["calma"], ["terror", "intenso"], ["feliz"]]


def sin_tildes(texto):
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")


def error(codigo, mensaje, estado, razon=None):
    cuerpo = {"code": codigo, "message": mensaje, "status": estado}
    if razon:
        cuerpo["details"] = [{"@type": "type.googleapis.com/google.rpc.ErrorInfo", "reason": razon}]
    return codigo, {"error": cuerpo}


def responder_escenas(cuerpo):
    instruccion = cuerpo["systemInstruction"]["parts"][0]["text"]
    texto = cuerpo["contents"][0]["parts"][0]["text"]
    esquema = cuerpo["generationConfig"]["responseSchema"]
    permitidas = esquema["properties"]["escenas"]["items"]["properties"]["etiquetas"]["items"]["enum"]

    if "- calma:" not in instruccion or "calma" not in permitidas or cuerpo["generationConfig"]["responseMimeType"] != "application/json":
        return error(400, "Solicitud con formato inesperado.", "INVALID_ARGUMENT")
    if not texto.startswith("<capitulo>\n") or not texto.endswith("\n</capitulo>"):
        return error(400, "El capítulo no viene delimitado.", "INVALID_ARGUMENT")

    capitulo = texto[len("<capitulo>\n"):-len("\n</capitulo>")]
    parrafos = [parrafo.strip() for parrafo in capitulo.split("\n\n") if parrafo.strip()]
    escenas = []
    for indice, parrafo in enumerate(parrafos):
        fragmento = " ".join(parrafo.split()[:10])
        if indice == 1:
            fragmento = "«" + sin_tildes(fragmento).upper() + "..."
        escenas.append({"fragmento_inicio": fragmento, "etiquetas": ETIQUETAS[indice % len(ETIQUETAS)]})
    escenas.append({"fragmento_inicio": "Este texto no aparece en el capítulo", "etiquetas": ["calma"]})
    escenas.append({"fragmento_inicio": parrafos[-1], "etiquetas": ["intenso"]})

    partes = [
        {"text": "Pensando en las escenas...", "thought": True},
        {"text": json.dumps({"escenas": escenas}, ensure_ascii=False)},
    ]
    return 200, {"candidates": [{"content": {"role": "model", "parts": partes}, "finishReason": "STOP"}]}


class Manejador(BaseHTTPRequestHandler):
    def do_POST(self):
        clave = self.headers.get("x-goog-api-key", "")
        longitud = int(self.headers.get("content-length", "0"))
        cuerpo = json.loads(self.rfile.read(longitud) or b"{}")

        if not self.path.startswith("/v1beta/models/") or not self.path.endswith(":generateContent"):
            codigo, respuesta = error(404, "Modelo no encontrado.", "NOT_FOUND")
        elif clave == "clave-invalida":
            codigo, respuesta = error(400, "API key not valid. Please pass a valid API key.", "INVALID_ARGUMENT", "API_KEY_INVALID")
        elif clave == "clave-sin-cuota":
            codigo, respuesta = error(429, "Resource has been exhausted.", "RESOURCE_EXHAUSTED")
        elif clave == "clave-bloqueada":
            codigo, respuesta = 200, {"promptFeedback": {"blockReason": "SAFETY"}}
        elif clave == "clave-valida":
            codigo, respuesta = responder_escenas(cuerpo)
        else:
            codigo, respuesta = error(403, "Permission denied.", "PERMISSION_DENIED")

        datos = json.dumps(respuesta, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def log_message(self, formato, *argumentos):
        sys.stderr.write("gemini-simulado: " + (formato % argumentos) + "\n")


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", int(sys.argv[1])), Manejador).serve_forever()
