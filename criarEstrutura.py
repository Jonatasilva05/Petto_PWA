import os

# pastas que serão ignoradas
PASTAS_IGNORADAS = {"node_modules", ".git", "__pycache__"}

def gerar_estrutura(pasta_raiz, arquivo_saida="estrutura.txt"):
    with open(arquivo_saida, "w", encoding="utf-8") as f:
        for raiz, dirs, arquivos in os.walk(pasta_raiz):

            # remove pastas ignoradas
            dirs[:] = [d for d in dirs if d not in PASTAS_IGNORADAS]

            # nível de profundidade
            nivel = raiz.replace(pasta_raiz, "").count(os.sep)
            indentacao = "│   " * nivel
            nome_pasta = os.path.basename(raiz)

            # escreve a pasta atual
            if nivel == 0:
                f.write(f"{pasta_raiz}\n")
            else:
                f.write(f"{indentacao}├── {nome_pasta}/\n")

            # subnível para arquivos
            sub_indentacao = "│   " * (nivel + 1)

            for arquivo in arquivos:
                f.write(f"{sub_indentacao}├── {arquivo}\n")

    print(f"Estrutura salva em: {arquivo_saida}")


# ===== USO =====
if __name__ == "__main__":
    caminho = input("Digite o caminho da pasta: ").strip()

    if os.path.exists(caminho):
        gerar_estrutura(caminho)
    else:
        print("Caminho inválido!")