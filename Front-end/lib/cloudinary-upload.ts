const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export function getCloudinaryConfig() {
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  };
}

export function openCloudinaryWidget(options: {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
}): void {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    options.onError?.('Cloudinary is not configured.');
    return;
  }

  if (!(window as any).cloudinary) {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).cloudinary) {
        createWidget(cloudName, uploadPreset, options);
      } else {
        options.onError?.('Cloudinary widget script loaded but widget API is not available.');
      }
    };
    script.onerror = () => {
      options.onError?.('Failed to load Cloudinary widget script. Check your internet connection.');
    };
    document.body.appendChild(script);
    return;
  }

  createWidget(cloudName, uploadPreset, options);
}

function createWidget(
  cloudName: string,
  uploadPreset: string,
  options: {
    onUpload: (url: string) => void;
    onError?: (error: string) => void;
    maxFiles?: number;
  },
) {
  const widget = (window as any).cloudinary.createUploadWidget(
    {
      cloudName,
      uploadPreset,
      multiple: (options.maxFiles ?? 1) > 1,
      maxFiles: options.maxFiles ?? 1,
      cropping: false,
      sources: ['local', 'camera'],
      showAdvancedOptions: false,
      singleUploadAutoClose: false,
    },
    (error: any, result: any) => {
      if (error) {
        options.onError?.(error.status || 'Upload failed.');
        return;
      }
      if (result.event === 'success') {
        options.onUpload(result.info.secure_url);
      }
    },
  );

  widget.open();
}
