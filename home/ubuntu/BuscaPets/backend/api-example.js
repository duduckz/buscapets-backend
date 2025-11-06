/**
 * API BuscaPet - Cliente JavaScript
 * 
 * Como usar:
 * 1. Copie este arquivo para seu projeto frontend
 * 2. Importe: import { login, listarPets, cadastrarPet } from './api-example';
 * 3. Use as funções conforme os exemplos abaixo
 */

const API_BASE_URL = 'http://localhost:3000';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obter token do localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Fazer requisição HTTP genérica
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Se body for objeto, converter para JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE USUÁRIO
// ============================================

/**
 * Cadastrar novo usuário
 * @param {Object} dados - { nome, email, senha, telefone?, cidade?, estado? }
 * @returns {Promise} { message, token, user }
 */
export const cadastrarUsuario = async (dados) => {
  const response = await request('/api/usuarios/cadastro', {
    method: 'POST',
    body: dados,
  });
  
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

/**
 * Fazer login
 * @param {string} email 
 * @param {string} senha 
 * @returns {Promise} { message, token, user }
 */
export const login = async (email, senha) => {
  const response = await request('/api/usuarios/login', {
    method: 'POST',
    body: { email, senha },
  });
  
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

/**
 * Obter perfil do usuário logado
 * @returns {Promise} { id_usuario, nome, email, telefone, cidade, estado, foto_perfil }
 */
export const obterPerfil = async () => {
  return request('/api/usuarios/perfil');
};

/**
 * Atualizar perfil do usuário
 * @param {Object} dados - { nome?, telefone?, cidade?, estado?, nova_senha? }
 * @returns {Promise} { message }
 */
export const atualizarPerfil = async (dados) => {
  return request('/api/usuarios/perfil', {
    method: 'PUT',
    body: dados,
  });
};

/**
 * Excluir conta do usuário
 * @returns {Promise} { message }
 */
export const excluirConta = async () => {
  const response = await request('/api/usuarios/perfil', {
    method: 'DELETE',
  });
  
  // Limpar dados do localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  return response;
};

/**
 * Fazer logout (limpar dados locais)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============================================
// FUNÇÕES DE PETS
// ============================================

/**
 * Listar todos os pets (com filtros opcionais)
 * @param {Object} filtros - { status?, especie?, cidade?, estado? }
 * @returns {Promise} Array de pets
 */
export const listarPets = async (filtros = {}) => {
  const queryParams = new URLSearchParams(filtros).toString();
  return request(`/api/pets?${queryParams}`);
};

/**
 * Obter detalhes de um pet específico
 * @param {number} idPet 
 * @returns {Promise} { id_pet, nome, especie, raca, ... }
 */
export const obterPetPorId = async (idPet) => {
  return request(`/api/pets/${idPet}`);
};

/**
 * Cadastrar novo pet (com upload de imagem)
 * @param {Object} dadosPet - { nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude?, longitude? }
 * @param {File} foto - Arquivo de imagem
 * @returns {Promise} { message, id_pet, foto_pet }
 */
export const cadastrarPet = async (dadosPet, foto = null) => {
  const formData = new FormData();
  
  // Adicionar campos do pet
  Object.keys(dadosPet).forEach(key => {
    if (dadosPet[key] !== null && dadosPet[key] !== undefined) {
      formData.append(key, dadosPet[key]);
    }
  });
  
  // Adicionar foto se fornecida
  if (foto) {
    formData.append('foto_pet', foto);
  }
  
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/pets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // NÃO incluir Content-Type - o browser define automaticamente para FormData
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao cadastrar pet');
  }
  
  return data;
};

/**
 * Atualizar pet
 * @param {number} idPet 
 * @param {Object} dadosPet - Dados a atualizar
 * @param {File} novaFoto - Nova foto (opcional)
 * @returns {Promise} { message, foto_pet }
 */
export const atualizarPet = async (idPet, dadosPet, novaFoto = null) => {
  const formData = new FormData();
  
  Object.keys(dadosPet).forEach(key => {
    if (dadosPet[key] !== null && dadosPet[key] !== undefined) {
      formData.append(key, dadosPet[key]);
    }
  });
  
  if (novaFoto) {
    formData.append('foto_pet', novaFoto);
  }
  
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/pets/${idPet}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao atualizar pet');
  }
  
  return data;
};

/**
 * Excluir pet
 * @param {number} idPet 
 * @returns {Promise} { message }
 */
export const excluirPet = async (idPet) => {
  return request(`/api/pets/${idPet}`, {
    method: 'DELETE',
  });
};

// ============================================
// FUNÇÕES DE MENSAGENS
// ============================================

/**
 * Enviar mensagem
 * @param {number} idDestinatario 
 * @param {string} conteudo 
 * @param {number} idPet - ID do pet (opcional)
 * @returns {Promise} { message, id_mensagem }
 */
export const enviarMensagem = async (idDestinatario, conteudo, idPet = null) => {
  return request('/api/mensagens', {
    method: 'POST',
    body: {
      id_destinatario: idDestinatario,
      conteudo,
      id_pet: idPet,
    },
  });
};

/**
 * Listar conversas do usuário logado
 * @returns {Promise} Array de usuários com quem há conversas
 */
export const listarConversas = async () => {
  return request('/api/mensagens/conversas');
};

/**
 * Obter mensagens de uma conversa específica
 * @param {number} idUsuario - ID do outro usuário na conversa
 * @returns {Promise} Array de mensagens
 */
export const obterMensagensConversa = async (idUsuario) => {
  return request(`/api/mensagens/${idUsuario}`);
};

// ============================================
// FUNÇÕES DE ADOÇÃO
// ============================================

/**
 * Solicitar adoção de um pet
 * @param {number} idPet 
 * @returns {Promise} { message, id_adocao }
 */
export const solicitarAdocao = async (idPet) => {
  return request(`/api/adocoes/${idPet}`, {
    method: 'POST',
  });
};

/**
 * Listar solicitações de adoção feitas pelo usuário
 * @returns {Promise} Array de solicitações
 */
export const listarMinhasSolicitacoes = async () => {
  return request('/api/adocoes/minhas-solicitacoes');
};

/**
 * Listar solicitações recebidas para os pets do usuário
 * @returns {Promise} Array de solicitações
 */
export const listarSolicitacoesRecebidas = async () => {
  return request('/api/adocoes/solicitacoes-recebidas');
};

/**
 * Atualizar status de uma solicitação de adoção
 * @param {number} idAdocao 
 * @param {string} status - 'Aceita' ou 'Recusada'
 * @returns {Promise} { message }
 */
export const atualizarStatusAdocao = async (idAdocao, status) => {
  if (!['Aceita', 'Recusada'].includes(status)) {
    throw new Error('Status deve ser "Aceita" ou "Recusada"');
  }
  
  return request(`/api/adocoes/${idAdocao}/status`, {
    method: 'PUT',
    body: { status },
  });
};

// ============================================
// EXEMPLOS DE USO
// ============================================

/*
// Exemplo 1: Login
try {
  const response = await login('joao@email.com', 'senha123');
  console.log('Login realizado:', response);
} catch (error) {
  console.error('Erro no login:', error.message);
}

// Exemplo 2: Listar pets
try {
  const pets = await listarPets({ status: 'Adoção', especie: 'Cachorro' });
  console.log('Pets encontrados:', pets);
} catch (error) {
  console.error('Erro ao listar pets:', error.message);
}

// Exemplo 3: Cadastrar pet com imagem
const inputFile = document.querySelector('input[type="file"]');
const file = inputFile.files[0];

const dadosPet = {
  nome: 'Rex',
  especie: 'Cachorro',
  raca: 'Labrador',
  idade: 3,
  sexo: 'Macho',
  porte: 'Grande',
  cor: 'Amarelo',
  descricao: 'Cachorro muito brincalhão',
  status: 'Adoção',
  latitude: '-23.5505',
  longitude: '-46.6333',
};

try {
  const response = await cadastrarPet(dadosPet, file);
  console.log('Pet cadastrado:', response);
} catch (error) {
  console.error('Erro ao cadastrar pet:', error.message);
}

// Exemplo 4: Verificar se usuário está logado
const token = getToken();
if (token) {
  console.log('Usuário logado');
  // Obter perfil
  const perfil = await obterPerfil();
  console.log('Perfil:', perfil);
} else {
  console.log('Usuário não está logado');
}
*/

