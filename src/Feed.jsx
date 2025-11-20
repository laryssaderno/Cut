import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style-feed.css';
import EmojiPicker from 'emoji-picker-react';

import { auth, db } from './DataBase/database.js'; 
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getFollowingList } from './Service/followersService.js';
import { getFeedComments, addComment, deleteComment, likeComment } from './Service/commentService.js';
import { getFilmById } from './Service/filmService.js';

// Ícones SVG
const HomeIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const SearchIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const BellIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const UserIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const HeartIcon = ({ filled }) => <svg width="20" height="20" fill={filled ? "#E1007A" : "none"} stroke={filled ? "#E1007A" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const CameraIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const SmileIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;

// Componente de Estrelas
const StarRating = ({ rating, setRating, readOnly = false }) => (
    <div className="star-rating" style={{display:'flex', gap:'2px'}}>
        {[1, 2, 3, 4, 5].map((star) => (
            <svg 
                key={star}
                onClick={() => !readOnly && setRating && setRating(star)}
                width={readOnly ? "16" : "24"} 
                height={readOnly ? "16" : "24"} 
                viewBox="0 0 24 24"
                fill={star <= rating ? "#FFD700" : "none"} 
                stroke={star <= rating ? "#FFD700" : (readOnly ? "#FFD700" : "currentColor")} 
                strokeWidth="2"
                style={{ cursor: readOnly ? 'default' : 'pointer' }}
            >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        ))}
    </div>
);

// Avatar com Inicial
const AvatarInicial = ({ nome, tamanho = 40, corFundo = "#7c5cff", fontSize = null }) => {
    const inicial = (nome && typeof nome === 'string') ? nome.charAt(0).toUpperCase() : "U";
    const fs = fontSize || (tamanho * 0.5);
    return (
        <div 
            className="avatar-inicial" 
            style={{
                width: tamanho, height: tamanho, backgroundColor: corFundo,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', color: 'white', fontWeight: 'bold', fontSize: fs,
                flexShrink: 0
            }}
        >
            {inicial}
        </div>
    );
};

function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: "Usuário" });
  
  const [filmesDisponiveis, setFilmesDisponiveis] = useState([]);
  const [filmeSelecionado, setFilmeSelecionado] = useState("");
  const [termoBuscaFilme, setTermoBuscaFilme] = useState(""); 
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  
  const [textoReview, setTextoReview] = useState("");
  const [imagemUpload, setImagemUpload] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [rating, setRating] = useState(0); 
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [termoPesquisaFeed, setTermoPesquisaFeed] = useState("");
  const [mostrarBuscaFeed, setMostrarBuscaFeed] = useState(false);
  
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/'); 
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());
      } catch (e) {}

      try {
          const { getAllFilms } = await import('./Service/filmService.js'); 
          const todosFilmes = await getAllFilms();
          setFilmesDisponiveis(todosFilmes || []);
      } catch (e) {}

      try {
        const seguindo = await getFollowingList(user.uid);
        const listaIds = [...seguindo, user.uid]; 

        const rawPosts = await getFeedComments(listaIds);

        if (rawPosts && rawPosts.length > 0) {
            const postsCompletos = await Promise.all(rawPosts.map(async (post) => {
                let autor = { name: "Anônimo", picture_link: null };
                try {
                    const uDoc = await getDoc(doc(db, "users", post.id_user));
                    if (uDoc.exists()) autor = uDoc.data();
                } catch(e){}

                let filme = { title: "Filme", link: "", date: "" };
                if (post.id_video) {
                    const f = await getFilmById(post.id_video);
                    if (f) filme = f;
                }

                return {
                    ...post,
                    autorNome: autor.name || "Anônimo",
                    autorFoto: autor.picture_link,
                    filmeTitulo: filme.title,
                    filmeImagem: filme.scene || filme.link,
                    filmeAno: filme.date ? filme.date.split('-')[0] : "",
                    nota: post.rating || 0 
                };
            }));
            setPosts(postsCompletos);
        }
      } catch (error) {
        console.error("Erro feed:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [navigate]);

  const handlePostar = async () => {
    if (!filmeSelecionado) return alert("Selecione um filme da lista!");
    if (!textoReview) return alert("Escreva o que você achou!");

    const user = auth.currentUser;
    if (user) {
        const novoId = await addComment(user.uid, filmeSelecionado, textoReview, rating);
        
        const filmeObj = filmesDisponiveis.find(f => f.id_film === filmeSelecionado);
        
        const novoPost = {
            id: novoId || Date.now(),
            id_user: user.uid,
            text: textoReview,
            created_at: { seconds: Date.now() / 1000 },
            autorNome: userData.name,
            autorFoto: userData.picture_link,
            filmeTitulo: filmeObj ? filmeObj.title : "Filme",
            filmeImagem: previewImagem || (filmeObj ? (filmeObj.scene || filmeObj.link) : ""), 
            filmeAno: "2024",
            likes: [],
            nota: rating
        };

        setPosts([novoPost, ...posts]);
        
        setTextoReview("");
        setFilmeSelecionado("");
        setTermoBuscaFilme("");
        setImagemUpload(null);
        setPreviewImagem(null);
        setRating(0);
    }
  };

  const handleLike = async (idPost) => {
    const user = auth.currentUser;
    if (!user) return;

    const postIndex = posts.findIndex(p => p.id === idPost);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const jaCurtiu = post.likes.includes(user.uid);

    let novosLikes;
    if (jaCurtiu) {
        novosLikes = post.likes.filter(uid => uid !== user.uid); 
    } else {
        novosLikes = [...post.likes, user.uid]; 
    }

    const postsAtualizados = [...posts];
    postsAtualizados[postIndex] = { ...post, likes: novosLikes };
    setPosts(postsAtualizados);

    await likeComment(idPost, user.uid); 
  };

  const handleDeletePost = async (idPost) => {
    if (window.confirm("Excluir post?")) {
        await deleteComment(idPost);
        setPosts(posts.filter(p => p.id !== idPost)); 
    }
    setMenuAbertoId(null);
  };

  const handleCameraClick = () => fileInputRef.current.click();
  
  const handleFileChange = (e) => { 
    const file = e.target.files[0];
    if (file) {
        setImagemUpload(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewImagem(previewUrl);
    }
  };

  const onEmojiClick = (emojiObject) => setTextoReview(prev => prev + emojiObject.emoji);

  const sugestoesFiltradas = filmesDisponiveis.filter(filme => 
    filme.title.toLowerCase().includes(termoBuscaFilme.toLowerCase())
  );
  const selecionarFilme = (filme) => {
      setFilmeSelecionado(filme.id_film);
      setTermoBuscaFilme(filme.title);
      setMostrarSugestoes(false);
  };

  const toggleSearch = () => {
      setMostrarBuscaFeed(!mostrarBuscaFeed);
      if (!mostrarBuscaFeed) setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Função para pegar apenas o primeiro nome (CORREÇÃO CÍRCULO 3)
  const getFirstName = (fullName) => {
    if (!fullName) return "Usuário";
    return fullName.split(' ')[0];
  };

  // Link para perfil
  const irParaPerfil = (idAutor) => {
      if (auth.currentUser && idAutor === auth.currentUser.uid) {
          navigate('/perfil');
      } else {
          navigate(`/perfil/${idAutor}`);
      }
  };

  const postsFiltrados = posts.filter(post => {
      if (!termoPesquisaFeed) return true;
      const termo = termoPesquisaFeed.toLowerCase();
      return (
          post.filmeTitulo.toLowerCase().includes(termo) ||
          post.text.toLowerCase().includes(termo) ||
          post.autorNome.toLowerCase().includes(termo)
      );
  });

  return (
    <div className="feed-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
            <img src='/horizontal.png' alt="CUT!" className="logo-small" />
        </div>
        <nav className="sidebar-nav">
            <Link to="/catalogo" className="nav-item"><HomeIcon /> Página Inicial</Link>
            <div className="nav-item" onClick={toggleSearch} style={{cursor: 'pointer'}}>
                <SearchIcon /> Pesquisar
            </div>
            <div className="nav-item"><BellIcon /> Notificações</div>
            <div className="nav-item active"><UserIcon /> Perfil</div>
        </nav>
        
        <div className="user-mini-profile">
            <AvatarInicial nome={userData.name} tamanho={45} corFundo="#7c5cff" />
            <div className="profile-info-text">
                {/* CORREÇÃO CÍRCULO 3: Apenas o primeiro nome */}
                <span className="profile-name-small">{getFirstName(userData.name)}</span>
            </div>
        </div>
      </aside>

      <main className="feed-main">
        
        {mostrarBuscaFeed && (
            <div className="feed-search-bar">
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Buscar no feed..." 
                    value={termoPesquisaFeed}
                    onChange={(e) => setTermoPesquisaFeed(e.target.value)}
                />
                <button onClick={() => { setTermoPesquisaFeed(""); setMostrarBuscaFeed(false); }}>✕</button>
            </div>
        )}

        <div className="create-post-card">
            <div className="post-header">
                <AvatarInicial nome={userData.name} tamanho={45} corFundo="#7c5cff" />
                
                <div className="input-group autocomplete-container">
                    <input
                        type="text"
                        className="movie-input"
                        placeholder="O que você assistiu hoje?"
                        value={termoBuscaFilme}
                        onChange={(e) => {
                            setTermoBuscaFilme(e.target.value);
                            setMostrarSugestoes(true);
                            if (e.target.value === '') setFilmeSelecionado('');
                        }}
                        onFocus={() => setMostrarSugestoes(true)}
                    />
                    {mostrarSugestoes && termoBuscaFilme && (
                        <ul className="suggestions-list">
                            {sugestoesFiltradas.length > 0 ? (
                                sugestoesFiltradas.map(filme => (
                                    <li key={filme.id_film} onClick={() => selecionarFilme(filme)}>
                                        {filme.title}
                                    </li>
                                ))
                            ) : (
                                <li className="no-results">Nenhum filme encontrado</li>
                            )}
                        </ul>
                    )}
                    {mostrarSugestoes && (
                        <div className="click-outside" onClick={() => setMostrarSugestoes(false)}></div>
                    )}
                </div>
            </div>
            
            <textarea 
                placeholder="O que você achou?" 
                className="post-input"
                value={textoReview}
                onChange={(e) => setTextoReview(e.target.value)}
            />

            <div className="rating-area" style={{display:'flex', alignItems:'center', marginBottom:'15px'}}>
                <span style={{fontSize:'0.9rem', color:'#aaa', marginRight:'10px'}}>Sua nota:</span>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            
            {previewImagem && (
                <div className="image-preview-box">
                    <img src={previewImagem} alt="Preview" />
                    <button onClick={() => { setPreviewImagem(null); setImagemUpload(null); }}>✕</button>
                </div>
            )}
            
            <div className="post-actions">
                <div className="icons" style={{position: 'relative'}}>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileChange} />
                    <button className="icon-btn" onClick={handleCameraClick} title="Foto"><CameraIcon /></button>
                    <button className="icon-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji"><SmileIcon /></button>
                    {showEmojiPicker && (
                        <div className="emoji-popover">
                            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                        </div>
                    )}
                </div>
                <button className="btn-postar" onClick={handlePostar}>Postar</button>
            </div>
        </div>

        <div className="posts-list">
            {!loading && postsFiltrados.length === 0 && <p style={{textAlign:'center', color:'#ccc'}}>Nenhum post encontrado.</p>}

            {postsFiltrados.map((post) => {
                const isMyPost = auth.currentUser && post.id_user === auth.currentUser.uid;

                return (
                    <div key={post.id} className="review-card">
                        <div className="review-header">
                            <div className="user-info">
                                {/* Avatar Clicável */}
                                <div onClick={() => irParaPerfil(post.id_user)} style={{cursor: 'pointer'}}>
                                    <AvatarInicial nome={post.autorNome} tamanho={45} corFundo="#7c5cff" />
                                </div>
                                
                                {/* CORREÇÃO CÍRCULO 1: Layout compacto */}
                                <div className="header-text-col">
                                    <div className="user-name-row">
                                        <span 
                                            className="user-name" 
                                            onClick={() => irParaPerfil(post.id_user)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {post.autorNome}
                                        </span>
                                        <span className="post-date"> • {new Date(post.created_at.seconds * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <div className="watched-row">
                                        <span className="watched-tag">Assistiu <strong>{post.filmeTitulo}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="header-right-col" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {/* CORREÇÃO CÍRCULO 2: Nota real */}
                                <StarRating rating={post.nota || 0} readOnly={true} />
                                
                                {isMyPost && (
                                    <div style={{position: 'relative'}}>
                                        <button 
                                            className="icon-btn" 
                                            onClick={() => setMenuAbertoId(menuAbertoId === post.id ? null : post.id)}
                                        >
                                            <span style={{fontSize:'1.2rem', fontWeight:'bold', color:'white'}}>⋮</span>
                                        </button>
                                        {menuAbertoId === post.id && (
                                            <div className="post-menu">
                                                <button onClick={() => handleDeletePost(post.id)} className="menu-item delete">
                                                    Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="review-text">"{post.text}"</p>

                        {post.filmeImagem && (
                            <div className="review-image-container">
                                <img src={post.filmeImagem} alt="Filme" className="review-image" />
                                <div className="review-overlay">
                                    <span>{post.filmeTitulo}</span>
                                </div>
                            </div>
                        )}

                        <div className="review-footer">
                            <button 
                                className={`btn-like ${post.likes.includes(auth.currentUser?.uid) ? 'liked' : ''}`} 
                                onClick={() => handleLike(post.id)}
                            >
                                <HeartIcon filled={post.likes.includes(auth.currentUser?.uid)} /> 
                                {post.likes.length}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
}

export default Feed;