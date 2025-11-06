/**
 * Upload Middleware com Cloudinary
 * 
 * Para usar em produção, substitua o uploadMiddleware.js por este arquivo
 * ou instale as dependências e ajuste o código.
 * 
 * Instalação:
 * npm install cloudinary multer-storage-cloudinary
 * 
 * Variáveis de ambiente necessárias:
 * CLOUDINARY_CLOUD_NAME=seu_cloud_name
 * CLOUDINARY_API_KEY=sua_api_key
 * CLOUDINARY_API_SECRET=sua_api_secret
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage do Multer com Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buscapet', // Pasta no Cloudinary onde as imagens serão salvas
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Redimensionar mantendo proporção
      { quality: 'auto' } // Otimizar qualidade automaticamente
    ]
  }
});

// Filtro de arquivos (apenas imagens)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

// Inicializa o Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite de 5MB
  }
});

module.exports = upload;

/**
 * NOTA: Quando usar Cloudinary, o req.file terá a seguinte estrutura:
 * 
 * req.file = {
 *   fieldname: 'foto_pet',
 *   originalname: 'imagem.jpg',
 *   encoding: '7bit',
 *   mimetype: 'image/jpeg',
 *   path: 'https://res.cloudinary.com/.../buscapet/abc123.jpg', // URL completa
 *   filename: 'buscapet/abc123', // Nome do arquivo no Cloudinary
 *   size: 12345
 * }
 * 
 * Para salvar no banco, use: req.file.path (URL completa)
 */

