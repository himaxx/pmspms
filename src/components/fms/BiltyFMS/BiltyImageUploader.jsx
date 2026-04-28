import { useLanguage } from '../../../i18n/LanguageContext';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/imageUtils';
import { supabase } from '../../../utils/supabase';

export default function BiltyImageUploader({ onUploadComplete, currentUrl }) {
  const { t } = useLanguage();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowCropper(true);
    }
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const fileName = `bilty_${Date.now()}.jpg`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('Bilty Images')
        .upload(filePath, croppedImageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Bilty Images')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      setShowCropper(false);
      setImageSrc(null);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(t('biltyFms.imageUploader.failed') + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('biltyFms.imageUploader.biltyPhoto')}</label>
        {currentUrl && (
          <a 
            href={currentUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-bold text-indigo-600 hover:underline"
          >
            {t('biltyFms.imageUploader.viewCurrent')}
          </a>
        )}
      </div>

      {!showCropper ? (
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full px-4 py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-white shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-4.413-4.413a1.5 1.5 0 00-2.122 0L1.5 11.06zm15-2.062V5.25a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v3.238l4.859-4.859a3 3 0 014.242 0L16.5 9zM14.25 9a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">
              {currentUrl ? t('biltyFms.imageUploader.changePhoto') : t('biltyFms.imageUploader.uploadPhoto')}
            </p>
            <p className="text-[10px] text-gray-400">{t('biltyFms.imageUploader.formatInfo')}</p>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-[60] bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="w-full max-w-2xl mt-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t('biltyFms.imageUploader.zoom')}</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setShowCropper(false); setImageSrc(null); }}
                className="px-8 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-12 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isUploading ? t('biltyFms.imageUploader.uploading') : t('biltyFms.imageUploader.cropAndUpload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
