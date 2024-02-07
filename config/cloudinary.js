const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'ddy07zvko', 
    api_key: '883112828989144', 
    api_secret: 'cpXSBlg_BpEGaBfnw5o2wDN3ThA' 
  });

module.exports=cloudinary