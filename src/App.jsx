import React from 'react';
import './style-login.css'; 

function App() {
  return (
    <>
      {/* SEÇÃO 1: O CONTAINER DA IMAGEM (Tela de Login) */}
      <div className="login-container">
        
        <div className="login-box">
          <img 
            src='quadrada.png' 
            alt="Cut! Logo" 
            className="login-logo"
            style={{ height: '130px'}} 
          />
          <form className="login-form">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="email@exemplo.com" 
            />
            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>
          <p className="login-link">
            Não tem uma conta? <a href="#">Cadastre-se</a>
          </p>
        </div>
      </div> {/* Fim do .login-container */}


      {/* SEÇÃO 2: O CONTEÚDO EXTRA (Página principal com o feed) */}
      <div className="extra-content">

        {/* 1. O Banner "Seus filmes favoritos..." */}
        <div className="feature-banner">
          {/* O ícone da pipoca */}
          <img src="pipoca.png" alt="Ícone de Pipoca" className="popcorn-icon" />
          
          {/* CORREÇÃO: Os textos agora estão agrupados */}
          <div className="feature-banner-text">
            <h3>Seus filmes favoritos estão aqui</h3>
            <p>Seus melhores amigos também!</p>
          </div>
        </div>

        {/* O CONTAINER PRINCIPAL (O painel roxo com pôster e comentários) */}
        <div className="feed-container">
          
          <div className="feed-layout">

            {/* Coluna da Esquerda: Pôster e Sinopse */}
            <div className="poster-info">
              <img 
                src="https://acdn-us.mitiendanube.com/stores/004/687/740/products/pos-03108-52a5e8dafb5729f0b917181204830490-480-0.jpg" 
                alt="Poster do filme Pearl" 
                className="feed-poster"
              />
              <h3>Pearl</h3>
              <span className="movie-year">2022</span> 
              <p>
                Pearl sonha em se tornar uma estrela de cinema. Com uma mãe cruel e um
                pai doente, ela se vê responsável por cuidar da fazenda em meio a um turbilhão
                de loucura e violência. Um pesadelo sombrio de frustração e desejos
                assassinos.
              </p>
            </div>

            {/* Coluna da Direita: Lista de Comentários */}
            <div className="feed-comments">
              <div className="comments-list">
                
                {/* Comentário 1 */}
                <div className="comment-card">
                  <div className="comment-header">
                    <img src="https://placehold.co/40x40/7c5cff/FFFFFF?text=A" alt="Avatar" className="avatar" />
                    <div className="comment-user-details">
                      <div className="user-info">
                        <span className="username">@annewelch</span>
                        <span className="comment-date">03/07/2025</span>
                      </div>
                      <span className="stars">★★★★★</span>
                    </div>
                  </div>
                  <p className="comment-body">Mia goth naquele último quadro... cadê o Oscar dela?</p>
                </div>

                {/* Comentário 2 */}
                <div className="comment-card">
                  <div className="comment-header">
                    <img src="https://placehold.co/40x40/7c5cff/FFFFFF?text=U" alt="Avatar" className="avatar" />
                    <div className="comment-user-details">
                      <div className="user-info">
                        <span className="username">@user270907</span>
                        <span className="comment-date">02/10/2025</span>
                      </div>
                      <span className="stars">★★★★★</span>
                    </div>
                  </div>
                  <p className="comment-body">Tudo o que Pearl precisava era de uma pessoa em uma sala com 100 pessoas para realmente acreditar nela</p>
                </div>

                {/* Comentário 3 */}
                <div className="comment-card">
                  <div className="comment-header">
                    <img src="https://placehold.co/40x40/7c5cff/FFFFFF?text=M" alt="Avatar" className="avatar" />
                    <div className="comment-user-details">
                      <div className="user-info">
                        <span className="username">@miafisher01</span>
                        <span className="comment-date">30/01/2024</span>
                      </div>
                      <span className="stars">★★★★★</span>
                    </div>
                  </div>
                  <p className="comment-body">O diretor gritou "take five" mas Mia Goth ouviu "change lives" e então ela fez</p>
                </div>

                {/* Comentário 4 */}
                <div className="comment-card">
                  <div className="comment-header">
                    <img src="https://placehold.co/40x40/7c5cff/FFFFFF?text=Y" alt="Avatar" className="avatar" />
                    <div className="comment-user-details">
                      <div className="user-info">
                        <span className="username">@youassistir</span>
                        <span className="comment-date">30/01/2024</span>
                      </div>
                      <span className="stars">★★★★★</span>
                    </div>
                  </div>
                  <p className="comment-body">Ela é muito eu! (abaixando a máscara por um segundo no teatro para poder tomar um gole da bebida)</p>
                </div>

              </div>
            </div> {/* Fim .feed-comments */}
          </div> {/* Fim .feed-layout */}

        </div> {/* Fim do .feed-container */}

        {/* A Chamada para Ação (CTA) */}
        <div className="cta-section">
          <h2>Assista filmes e saiba o que seus amigos estão achando!</h2>
          
          <button type="submit" className="start-button">
            Começar
          </button>
        </div>

      </div> {/* Fim do .extra-content */}

    </> // Fim do Fragment
  );
}

export default App;