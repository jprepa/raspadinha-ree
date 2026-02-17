import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro
  const navigate = useNavigate();

  // Estados dos campos
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
        // --- MODO CADASTRO ---
        
        // 1. Cria o usuário na autenticação
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // 2. Salva Nome e Área na tabela de perfis
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('perfis')
            .insert([
              { 
                id: authData.user.id, 
                nome: name, 
                area: area 
              }
            ]);

          if (profileError) {
            console.error('Erro ao salvar perfil:', profileError);
            // Não bloqueia o fluxo, mas avisa no console
          }
        }

        alert('Cadastro realizado com sucesso! Você já pode entrar.');
        setIsSignUp(false); // Volta para a tela de login

      } else {
        // --- MODO LOGIN ---
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Se deu certo, vai para o dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMsg(error.message === "Invalid login credentials" 
        ? "E-mail ou senha incorretos." 
        : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo Gradiente idêntico ao do Café (Indigo 900 -> Blue 800)
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Cabeçalho com Logo */}
        <div style={styles.header}>
          <img 
            src="https://i.postimg.cc/qMcJsMgT/logo.png" 
            alt="Prevision Logo" 
            style={styles.logo} 
          />
          <p style={styles.subtitle}>
            {isSignUp ? 'Crie sua conta para participar' : 'Digite suas credenciais para continuar'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleAuth} style={styles.form}>
          
          {/* Campos EXTRAS (Só aparecem no cadastro) */}
          {isSignUp && (
            <>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Seu Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Sua Área (Ex: Marketing, Vendas)"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}

          {/* Campos PADRÃO */}
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="E-mail corporativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        {/* Rodapé Alternador */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isSignUp ? 'Já tem uma conta?' : 'Não tem acesso?'}
          </p>
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }} 
            style={styles.linkButton}
          >
            {isSignUp ? 'Fazer Login' : 'Cadastre-se aqui'}
          </button>
        </div>
        
        <div style={styles.watermark}>
          Ambiente Seguro • Prevision
        </div>
      </div>
    </div>
  );
}

// Estilos baseados no visual do Café Prevision
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #312e81, #1e40af)', // Indigo-900 to Blue-800
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logo: {
    height: '60px',
    width: 'auto',
    marginBottom: '20px',
  },
  subtitle: {
    color: '#6b7280', // Gray-500
    textAlign: 'center',
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db', // Gray-300
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box', // Garante que o padding não estoure a largura
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb', // Blue-600
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '20px',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '5px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
    margin: 0,
  },
  watermark: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#9ca3af',
  }
};