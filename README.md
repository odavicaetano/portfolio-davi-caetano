# Davi Caetano Portfólio Digital

Portfólio digital de Davi Caetano com projetos de design gráfico, comunicação institucional, desenvolvimento web, experiências interativas e modelagem 3D.

Endereço previsto no GitHub Pages: https://odavicaetano.github.io/portfolio-davi-caetano/

## O que tem aqui

- Site estático, sem etapa de build obrigatória: `index.html`, `src/styles/main.css` e módulos JavaScript em `src/scripts/`.
- Projetos editáveis em [`src/data/projects.js`](src/data/projects.js) (título, categoria, status, textos do case, galeria, ferramentas, créditos, links e fontes).
- Visualizadores 3D com three.js (pacote mínimo em `src/vendor/three-bundle.min.js`), carregados só quando a seção aparece na tela:
  - óculos do autor na primeira dobra (`assets/models/oculos/oculos.glb`);
  - estátua de Helena Antipoff com modos Sólido, Malha e Pontos (`assets/models/helena-antipoff/helena-antipoff.glb`).
- Galeria com miniaturas 4:3 (WebP com JPEG de reserva) e visualização ampliada da imagem inteira, com teclado, deslizar e legenda.
- Inventário de fontes, pendências e origem das mídias: [docs/inventario-de-projetos.md](docs/inventario-de-projetos.md).

## Rodar localmente

Requer Node 18 ou mais novo.

```bash
npm install          # só para as ferramentas de geração de imagens e modelos
npm run serve        # http://localhost:4321/
```

Qualquer servidor estático serve (o site usa módulos JavaScript, então abrir o `index.html` com dois cliques não funciona).

## Acrescentar um projeto

1. Coloque as imagens originais em uma pasta e acrescente as linhas correspondentes em `tools/build-images.mjs` (`[projeto, id, arquivo, recorte]`, onde recorte é `center`, `top`, `left`, `right` ou `contain` para peças com texto nas bordas).
2. Rode `node tools/build-images.mjs "<pasta-dos-anexos>"`. Ele gera `assets/images/<projeto>/` e atualiza `src/data/media.js`.
3. Copie um objeto em `src/data/projects.js` e ajuste os campos. A capa (`cover`) é escolhida pelo id da imagem, não pela ordem.
4. O case abre em `#/projeto/<id>`, um link que pode ser compartilhado.

## Ferramentas de geração

| Comando | O que faz |
|---|---|
| `node tools/build-models.mjs "<pasta-dos-anexos>"` | Converte os OBJ originais em GLB otimizados. |
| `node tools/build-images.mjs "<pasta-dos-anexos>"` | Gera miniaturas e versões ampliadas. |
| `node tools/build-brand.mjs` | Gera `favicon.ico`, ícones PNG e a imagem de reserva dos óculos. A capa de compartilhamento (`assets/og-image.jpg`) é mantida à mão e não é alterada. |
| `npm run build:vendor` | Recria o pacote mínimo do three.js. |

As fontes (`media-src/`, OBJ originais) ficam fora do repositório.

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Davi Caetano Portfólio Digital"
gh repo create odavicaetano/portfolio-davi-caetano --public --source . --push \
  --description "Portfólio digital de Davi Caetano com projetos de design gráfico, comunicação institucional, desenvolvimento web, experiências interativas e modelagem 3D."
gh api -X POST repos/odavicaetano/portfolio-davi-caetano/pages -f "source[branch]=main" -f "source[path]=/"
gh repo edit odavicaetano/portfolio-davi-caetano --homepage https://odavicaetano.github.io/portfolio-davi-caetano/ \
  --add-topic portfolio --add-topic design-grafico --add-topic design --add-topic desenvolvimento-web \
  --add-topic frontend --add-topic threejs --add-topic github-pages --add-topic davi-caetano
```

O arquivo `.nojekyll` evita que o GitHub Pages ignore pastas. Todos os caminhos são relativos, então o site funciona dentro de `/portfolio-davi-caetano/`.

## Acessibilidade e desempenho

- HTML semântico em pt-BR, link para pular ao conteúdo, foco visível, diálogos nativos (`<dialog>`) com Esc, navegação por teclado nos filtros, na galeria e nos visualizadores.
- Respeita `prefers-reduced-motion` (sem rotação automática nem animações).
- 3D sob demanda, pixel ratio limitado a 2, renderização pausada fora da tela e na aba oculta. Sem WebGL, os óculos aparecem como imagem.
- Imagens com `loading="lazy"`, dimensões declaradas e texto alternativo.

## Créditos e licença

- Código: MIT (veja [LICENSE](LICENSE)).
- Textos, imagens, peças gráficas e modelos 3D: todos os direitos reservados a Davi Caetano e aos respectivos titulares (Cohab Minas, Fundação Helena Antipoff e parceiros indicados em cada case). Não reutilize sem autorização.
- three.js: MIT, © three.js authors (`src/vendor/THREE-LICENSE.txt`).
- Fontes Syne, Inter e JetBrains Mono: Google Fonts, SIL Open Font License.
