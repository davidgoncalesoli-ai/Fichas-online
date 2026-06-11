# Como publicar o site para os amigos

Esta versão é um site estático: basta hospedar os arquivos `index.html`, `styles.css` e `app.js`.

## Opção recomendada: Vercel

1. Crie uma conta em https://vercel.com.
2. Crie um repositório no GitHub, por exemplo `fem-ficha-online`.
3. Envie todos os arquivos desta pasta para o repositório.
4. Na Vercel, clique em **Add New Project**.
5. Selecione o repositório.
6. Framework: **Other** ou **Static**.
7. Clique em **Deploy**.

O link ficará parecido com:

```text
https://fem-ficha-online.vercel.app/
```

## Opção simples: GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos desta pasta.
3. Vá em **Settings > Pages**.
4. Em **Source**, selecione a branch principal e a pasta raiz.
5. Salve.

O link ficará parecido com:

```text
https://seuusuario.github.io/fem-ficha-online/
```

## Limitação importante

Nesta fase, as fichas ficam salvas no navegador de cada jogador. Para compartilhar uma ficha específica, use **Exportar JSON** e **Importar JSON**.

Mais tarde, para fichas compartilhadas online, será necessário adicionar login e banco de dados, como Supabase ou Firebase.
