import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style-catalogo.css';

// Importando o serviço para buscar do banco
import { getAllFilms } from './Service/filmService.js';

// --- ÍCONES SVG ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const ChevronLeftIcon = ({ size = 40, color = "white" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
); 

const ChevronRightIcon = ({ size = 40, color = "white" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

// --- COMPONENTE DA FILEIRA (Carrossel) ---
const MovieRow = ({ title, items }) => {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });

      setTimeout(() => {
        if(rowRef.current) setIsMoved(rowRef.current.scrollLeft > 0);
      }, 300); 
    }
  };

  useEffect(() => {
    const currentRef = rowRef.current;
    const checkScrollPosition = () => {
        if (currentRef) setIsMoved(currentRef.scrollLeft > 0);
    };

    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); 
    }
    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  return (
    <div className="movie-row-container">
      <h2 className="row-title">{title}</h2>
      
      <div className="row-wrapper">
        <button 
          className={`scroll-arrow left ${!isMoved ? 'hidden' : ''}`} 
          onClick={() => handleScroll('left')}
        >
          <ChevronLeftIcon size={40} color="white" />
        </button>

        <div className="row-items" ref={rowRef}>
          {items.map((movie) => (
            <Link to={`/filme/${movie.id_film}`} key={movie.id_film} className="movie-card">
              <img 
                src={movie.link} 
                alt={movie.title} 
                draggable="false" 
                onError={(e) => e.target.src = "https://via.placeholder.com/160x240?text=Erro+Imagem"}
              />
            </Link>
          ))}
        </div>

        <button 
          className="scroll-arrow right" 
          onClick={() => handleScroll('right')}
        >
          <ChevronRightIcon size={40} color="white" />
        </button>
      </div>
    </div>
  );
};

function Catalogo() {
    const location = useLocation();
    const interessesUsuario = location.state?.interesses || []; 
    const [dbFilmes, setDbFilmes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilmes = async () => {
            try {
                const dados = await getAllFilms();
                if (dados && Array.isArray(dados)) {
                    setDbFilmes(dados);
                }
            } catch (error) {
                console.error("Erro ao buscar filmes do banco:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFilmes();
    }, []);

    const filtrarPorGenero = (lista, termo) => {
        if (!lista) return [];
        const termoNormalizado = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        return lista.filter(m => {
            if (!m.genre) return false;
            const generoFilme = Array.isArray(m.genre) ? m.genre : [m.genre];
            return generoFilme.some(g => {
                if (typeof g !== 'string') return false;
                return g.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(termoNormalizado);
            });
        });
    };

    const listaEmAlta = dbFilmes; 
    const listaAcao = filtrarPorGenero(dbFilmes, 'Ação');
    const listaComedia = filtrarPorGenero(dbFilmes, 'Comédia');
    const listaDrama = filtrarPorGenero(dbFilmes, 'Drama');
    const listaFiccao = [...new Set([...filtrarPorGenero(dbFilmes, 'Ficção'), ...filtrarPorGenero(dbFilmes, 'Sci-Fi')])];
    const listaSuspense = filtrarPorGenero(dbFilmes, 'Suspense');
    const listaTerror = filtrarPorGenero(dbFilmes, 'Terror');
    const listaFantasia = filtrarPorGenero(dbFilmes, 'Fantasia');
    const listaFamilia = filtrarPorGenero(dbFilmes, 'Família');
    const listaRomance = filtrarPorGenero(dbFilmes, 'Romance');
    const listaAnimacao = filtrarPorGenero(dbFilmes, 'Animação');

    if (loading) return <div style={{color:'white', padding:'50px', textAlign:'center'}}>Carregando catálogo...</div>;

    return (
        <div className="catalogo-container">
            <header className="header">
                <div className="logo-section">
                    <img
                        src='/horizontal.png'
                        alt="CUT!"
                        className="catalogo-logo"
                    />
                </div>
                
                <div className="header-right">
                    {/* BOTÃO SOCIAL AGORA VEM PRIMEIRO */}
                    <Link to="/feed" className="social-btn">
                        <UsersIcon />
                        <span>Social</span>
                    </Link>

                    <div className="search-bar">
                        <input type="text" placeholder="Pesquisar" />
                        <div className="search-icon-pos">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                {interessesUsuario.length > 0 && (
                    <div style={{marginBottom: '40px'}}>
                        <h2 style={{marginLeft: '5px', marginBottom: '10px', color: '#E1007A'}}>
                            Escolhidos para Você
                        </h2>
                        {interessesUsuario.map((genero) => {
                            const filmesDoGenero = filtrarPorGenero(dbFilmes, genero);
                            let filmesExibicao = filmesDoGenero;
                            if (genero === 'Sci-Fi' || genero === 'Ficção') filmesExibicao = listaFiccao;
                            if (filmesExibicao.length === 0) return null;
                            return <MovieRow key={genero} title={genero} items={filmesExibicao} />;
                        })}
                    </div>
                )}

                <MovieRow title="Em Alta Agora" items={listaEmAlta} />
                <MovieRow title="Ação e Aventura" items={listaAcao} /> 
                <MovieRow title="Comédia" items={listaComedia} />
                <MovieRow title="Drama" items={listaDrama} />
                <MovieRow title="Ficção Científica" items={listaFiccao} />
                <MovieRow title="Suspense" items={listaSuspense} />
                <MovieRow title="Terror" items={listaTerror} />
                <MovieRow title="Fantasia" items={listaFantasia} />
                <MovieRow title="Família" items={listaFamilia} />
                <MovieRow title="Romance" items={listaRomance} />
                <MovieRow title="Animação" items={listaAnimacao} />

                {dbFilmes.length === 0 && !loading && (
                    <div style={{color: '#888', textAlign: 'center', marginTop: '50px'}}>
                        <p>Nenhum filme encontrado no banco de dados.</p>
                        <small>Cadastre filmes na coleção 'videos' e 'films' do Firebase.</small>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Catalogo;