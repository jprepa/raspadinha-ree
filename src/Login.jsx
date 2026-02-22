import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // MUDANÇA AQUI: Enviamos os dados DENTRO do signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome_completo: name, // Usando o nome que o gatilho espera
              area: area
            }
          }
        });

        if (authError) throw authError;
        alert('Cadastro realizado com sucesso!');
        setIsSignUp(false);

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMsg(error.message.includes("Invalid") ? "E-mail ou senha incorretos." : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          {/* Use a logo oficial se tiver o link dela, por enquanto usando a do exemplo */}
          <img src="https://i.postimg.cc/qMcJsMgT/logo.png" alt="Prevision Logo" style={styles.logo} />
          <h2 style={styles.title}>{isSignUp ? 'Crie sua Conta' : 'Raspadinha R&E'}</h2>
          <p style={styles.subtitle}>
            {isSignUp ? 'Preencha os dados para criar sua conta' : 'Indique e ganhe Raspadinhas 😁'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={styles.form}>
          {isSignUp && (
            <>
              <input type="text" placeholder="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
              <input type="text" placeholder="Área (Ex: Marketing)" value={area} onChange={(e) => setArea(e.target.value)} style={styles.input} required />
            </>
          )}
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        <div style={styles.footer}>
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }} style={styles.linkButton}>
            {isSignUp ? 'Já tenho conta. Fazer Login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
        
        <div style={styles.watermark}>Ambiente Seguro • Prevision</div>
      </div>
    </div>
  );
}

// --- ESTILOS CORRIGIDOS ---
const styles = {
  container: {
    // O segredo da centralização em tela cheia:
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #312e81 0%, #1e40af 100%)', // Gradiente idêntico ao do Café
    display: 'flex',
    justifyContent: 'center', // Centraliza Horizontalmente
    alignItems: 'center',     // Centraliza Verticalmente
    padding: '20px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    // Sombra mais suave e elegante como na referência
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px', // Largura máxima ideal para desktop
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Centraliza o conteúdo dentro do card
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    width: '100%',
  },
  logo: {
    height: '50px', // Um pouco menor para ficar mais elegante
    width: 'auto',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#1f2937', // Cinza quase preto
    fontSize: '24px',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6b7280', // Cinza médio
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%', // Garante que o form ocupe a largura do card
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db', // Borda cinza claro
    backgroundColor: '#ffffff', // FORÇA FUNDO BRANCO (Corrige o modo escuro)
    color: '#374151',           // FORÇA TEXTO ESCURO
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb', // Azul Prevision
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
    width: '100%',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: '#fee2e2',
    padding: '10px',
    borderRadius: '6px',
    margin: 0,
  },
  watermark: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
  }
};
