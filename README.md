# 4D Eventos — landing page

Reconstrução da página https://4dimensoes.com/4d-eventos/ fora do Elementor (HTML + CSS + JS, servido com Vite).

## Rodar
Requer Node 18+. Dentro desta pasta:

    npm install        # só na primeira vez
    npm run dev        # abre http://localhost:5173 com recarga automática
    npm run build      # gera a versão final em dist/
    npm run preview    # testa a versão de dist/

## Estrutura
    index.html            página (sequência de seções = mesma da página atual)
    assets/css/style.css  estilos (cores e fontes nos tokens do :root)
    assets/js/main.js     menu, animações, cases/vídeo, formulário
    assets/img/           ícone 4D, logo, favicon

Sequência das seções (não alterar): Hero + dores → Solução → Sobre → Cases → Contato/Diagnóstico → FAQ → CTA final.

## Pendências antes de publicar
- **Vídeos dos cases** — `CASES` em `assets/js/main.js` (+ `data-video` no HTML): trocar pelos aftermovies das convenções CREDFRANCO e X3.
- **WhatsApp** — link `wa.me/5500000000000` em `index.html` (seção contato).
- **Envio do formulário** — `FORM_ENDPOINT` em `assets/js/main.js`. Os campos usam os mesmos `name` do Contact Form 7 atual (`your-name`, `your-company`, …).
