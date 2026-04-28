import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/imageUtils';
import { useLanguage } from '../../../i18n/LanguageContext';

/* ─── helper ─────────────────────────────────────────────────────────────── */
function blobToFile(blob, filename) {
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

/* ─── Crop Modal ─────────────────────────────────────────────────────────── */
function CropModal({ imageSrc, filename, onDone, onCancel, t }) {
  const [crop,        setCrop]        = useState({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [loading,     setLoading]     = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  async function handleDone() {
    if (!croppedArea) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedArea);
      const ext  = (filename || 'photo').split('.').pop().replace(/[^a-zA-Z]/g, '') || 'jpg';
      const file = blobToFile(blob, `cropped_${Date.now()}.${ext}`);
      onDone(file);
    } catch (e) {
      console.error('Crop error:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[65] bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-white/10 text-white text-sm font-medium
                     hover:bg-white/20 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          {t('purchaseFms.imageUploader.retake')}
        </button>

        <span className="text-white font-bold text-sm">✂️ {t('purchaseFms.imageUploader.cropPhoto')}</span>

        <button
          onClick={handleDone}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-emerald-500 text-white text-sm font-bold
                     hover:bg-emerald-400 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              {t('purchaseFms.imageUploader.usePhoto')}
            </>
          )}
        </button>
      </div>

      {/* Cropper */}
      <div className="flex-1 relative min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#111' },
            cropAreaStyle: {
              border: '2px solid rgba(16,185,129,0.85)',
              borderRadius: 16,
            },
          }}
        />
      </div>

      {/* Zoom + hint */}
      <div className="px-6 py-4 bg-black/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="w-4 h-4 text-white/40 flex-shrink-0">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full cursor-pointer accent-emerald-400"
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="w-5 h-5 text-white/40 flex-shrink-0">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-white/35 text-[10px] text-center mt-1.5">
          {t('purchaseFms.imageUploader.cropHint')}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
/**
 * ImagePickerCrop — camera-only image capture with crop.
 */
export default function ImagePickerCrop({ previewUrl, file, preview, onChange, onClear }) {
  const { t } = useLanguage();
  const cameraInputRef = useRef(null);

  const [showCrop, setShowCrop] = useState(false);
  const [rawSrc,   setRawSrc]   = useState(null);   // blob URL fed into cropper
  const [rawName,  setRawName]  = useState('photo.jpg');

  /* open native camera */
  function openCamera() {
    cameraInputRef.current?.click();
  }

  /* called when the camera input fires (user took / picked a photo) */
  function handleCapture(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // Revoke old raw src if any
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    const url = URL.createObjectURL(f);
    setRawSrc(url);
    setRawName(f.name || 'photo.jpg');
    setShowCrop(true);
    // reset so the same photo can be re-selected
    e.target.value = '';
  }

  /* crop done — receive cropped File */
  function handleCropDone(croppedFile) {
    if (preview) URL.revokeObjectURL(preview);
    const newPreview = URL.createObjectURL(croppedFile);
    onChange(croppedFile, newPreview);
    cleanupRaw();
    setShowCrop(false);
  }

  /* cancel crop — go back to idle (retake) */
  function handleCropCancel() {
    cleanupRaw();
    setShowCrop(false);
  }

  function cleanupRaw() {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
  }

  /* ── current display image ─────────────────────────────────────────── */
  const displayUrl  = preview || previewUrl;
  const displayName = file?.name || (previewUrl ? t('purchaseFms.imageUploader.savedPhoto') : null);

  return (
    <>
      {/* Hidden camera input — capture="environment" opens rear camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleCapture}
      />

      {displayUrl ? (
        /* ── Preview state ─────────────────────────────────────────── */
        <div className="relative rounded-2xl overflow-hidden border border-gray-200">
          <img
            src={displayUrl}
            alt="Fabric"
            className="w-full h-48 object-cover"
          />

          {/* Overlay actions */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            {/* Retake */}
            <button
              type="button"
              onClick={openCamera}
              title={t('purchaseFms.imageUploader.retake')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                         bg-black/55 text-white text-[11px] font-bold
                         hover:bg-black/75 active:scale-95 transition-all backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {t('purchaseFms.imageUploader.retake')}
            </button>

            {/* Remove */}
            <button
              type="button"
              onClick={onClear}
              title={t('purchaseFms.imageUploader.removePhoto')}
              className="w-7 h-7 rounded-xl bg-red-500/75 text-white
                         flex items-center justify-center
                         hover:bg-red-600 active:scale-95 transition-all backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Bottom filename */}
          {displayName && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-[11px] font-medium truncate">{displayName}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty / Take Photo state ──────────────────────────────── */
        <button
          type="button"
          onClick={openCamera}
          className="w-full flex flex-col items-center justify-center gap-3 h-32
                     rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50
                     hover:border-blue-400 hover:bg-blue-50
                     active:scale-[0.98] transition-all duration-200 group"
        >
          {/* Camera icon ring */}
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center
                          group-hover:bg-blue-200 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="w-6 h-6 text-blue-600">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-blue-700 group-hover:text-blue-800">
              {t('purchaseFms.imageUploader.takePhoto')}
            </p>
            <p className="text-[11px] text-blue-400 mt-0.5">
              {t('purchaseFms.imageUploader.photoDesc')}
            </p>
          </div>
        </button>
      )}

      {/* ── Crop Modal ──────────────────────────────────────────────── */}
      {showCrop && rawSrc && (
        <CropModal
          imageSrc={rawSrc}
          filename={rawName}
          onDone={handleCropDone}
          onCancel={handleCropCancel}
          t={t}
        />
      )}
    </>
  );
}
