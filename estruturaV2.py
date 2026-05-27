import os

# =========================================================
# PASTAS IGNORADAS
# =========================================================
PASTAS_IGNORADAS = {
    "node_modules",
    "backups",
    ".git",
    "__pycache__"
}

# =========================================================
# FUNÇÃO PARA ESCREVER ESTRUTURA
# =========================================================
def escrever_estrutura(pasta_raiz, arquivo_saida):

    with open(arquivo_saida, "w", encoding="utf-8") as f:

        for raiz, dirs, arquivos in os.walk(pasta_raiz):

            # Remove pastas ignoradas
            dirs[:] = [d for d in dirs if d not in PASTAS_IGNORADAS]

            # Profundidade
            nivel = raiz.replace(pasta_raiz, "").count(os.sep)

            indentacao = "│   " * nivel
            nome_pasta = os.path.basename(raiz)

            # Pasta principal
            if nivel == 0:
                f.write(f"{nome_pasta}/\n")
            else:
                f.write(f"{indentacao}├── {nome_pasta}/\n")

            # Arquivos
            sub_indentacao = "│   " * (nivel + 1)

            for arquivo in arquivos:
                f.write(f"{sub_indentacao}├── {arquivo}\n")

    print(f"Arquivo gerado: {arquivo_saida}")


# =========================================================
# FUNÇÃO PRINCIPAL
# =========================================================
def gerar_relatorios(pasta_projeto):

    # ============================================
    # BACKEND
    # ============================================
    pasta_backend = os.path.join(pasta_projeto, "backend")

    if os.path.exists(pasta_backend):

        escrever_estrutura(
            pasta_backend,
            "estrutura_backend.txt"
        )

    else:
        print("Pasta backend não encontrada.")

    # ============================================
    # FRONTEND
    # ============================================
    pasta_frontend = os.path.join(pasta_projeto, "frontend")

    if os.path.exists(pasta_frontend):

        escrever_estrutura(
            pasta_frontend,
            "estrutura_frontend.txt"
        )

    else:
        print("Pasta frontend não encontrada.")


# =========================================================
# EXECUÇÃO
# =========================================================
if __name__ == "__main__":

    caminho = input("Digite o caminho do projeto: ").strip()

    if os.path.exists(caminho):
        gerar_relatorios(caminho)
    else:
        print("Caminho inválido!")