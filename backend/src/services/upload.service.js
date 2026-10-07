import ImageKit from 'imagekit';

const getImageKitInstance = () => {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint
  });
};

/**
 * Upload a single file buffer to ImageKit
 * @param {Buffer} fileBuffer
 * @param {String} fileName
 * @param {String} folder - e.g., 'avatars', 'services', 'deliveries'
 */
export const uploadToImageKit = async (fileBuffer, fileName, folder = 'general') => {
  const imagekit = getImageKitInstance();

  if (!imagekit) {
    // Graceful fallback for local offline testing if keys ever missing
    const base64 = fileBuffer.toString('base64');
    return {
      url: `data:image/jpeg;base64,${base64}`,
      fileId: `mock_${Date.now()}`
    };
  }

  const response = await imagekit.upload({
    file: fileBuffer,
    fileName: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
    folder: `/campusgig/${folder}`,
    useUniqueFileName: true
  });

  return {
    url: response.url,
    fileId: response.fileId,
    thumbnailUrl: response.thumbnailUrl || response.url,
    name: response.name
  };
};

/**
 * Upload multiple files to ImageKit concurrently
 */
export const uploadMultipleToImageKit = async (files, folder = 'services') => {
  const uploadPromises = files.map((file) =>
    uploadToImageKit(file.buffer, file.originalname, folder)
  );
  return await Promise.all(uploadPromises);
};
