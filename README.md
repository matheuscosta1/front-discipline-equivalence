Passos durante o projeto:

### Criacao do projeto:

``` sudo npx create-react-app front-discipline-equivalence --template typescript --registry https://registry.npmjs.org ```

### Instalação do React Router Dom

``` yarn add react-router-dom@6 --registry https://registry.npmjs.org ```

Essa lib é necessária para fazer o roteamento das páginas

### Por que usar o Material UI?

O material UI foi escolhido porque é uma biblioteca que oferece diversos componentes já prontos, sendo assim é fácil utilizar coisas que já foram implementadas por terceiros, não precisando por exemplo criar um botão do zero, mudar se a posição do mesmo é do lado esquerdo ou direito. Além disso com o Material UI os componentes são personalizáveis, podendo se adequar ao que é preciso fazer no sistema.

``` yarn add @mui/material @emotion/react @emotion/styled --registry https://registry.npmjs.org ```

``` yarn add @mui/icons-material --registry https://registry.npmjs.org ```

Atualizando react:

yarn add -d react react-dom --registry https://registry.npmjs.org

yarn add -d @types/react @types/react-dom --registry https://registry.npmjs.org


interface IAppThemeProviderProps {
    children: React.ReactNode
}

React.FC <IAppThemeProviderProps>


## Executar

```bash
    npm install --global yarn
    yarn install
    yarn mock
    yarn start
```