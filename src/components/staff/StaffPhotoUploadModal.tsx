import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  User as UserIcon, 
  Camera, 
  Link as LinkIcon 
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { User } from '../../types';
import { uploadImageToImageKit } from '../../services/imageKitService';

interface StaffPhotoUploadModalProps {
  userToUpdate?: User;
  onClose: () => void;
}

export const StaffPhotoUploadModal: React.FC<StaffPhotoUploadModalProps> = ({
  userToUpdate,
  onClose
}) => {
  const { currentUser, updateUserProfile, triggerConfetti } = useElimu();
  const targetUser = userToUpdate || currentUser;

  const [activeTab, setActiveTab] = useState<'FILE' | 'URL'>('FILE');
  const [previewUrl, setPreviewUrl] = useState<string>(targetUser.avatar_url || '');
  const [customUrl, setCustomUrl] = useState<string>(targetUser.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle local file selection with temporary object URL preview for instant UI feedback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setPreviewUrl(customUrl.trim());
    setSelectedFile(null); // URL submit clears selected file
    setErrorMessage(null);
  };

  const handleSavePhoto = async () => {
    if (!previewUrl) {
      setErrorMessage('Please upload a photo or enter a valid photo URL first.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      let finalUrl = previewUrl;

      // If a local file was picked, upload it to ImageKit CDN
      if (selectedFile) {
        const result = await uploadImageToImageKit(selectedFile, {
          folder: '/elimu360/staff',
          fileName: `staff_${targetUser.id}_${Date.now()}.png`,
          tags: ['staff', 'passport'],
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.9
        });
        finalUrl = result.url;
      }

      updateUserProfile(targetUser.id, {
        avatar_url: finalUrl,
        updated_at: new Date().toISOString()
      });

      setSuccessMessage('Profile photo updated successfully!');
      triggerConfetti();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload and save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Update Profile Photo</h3>
              <p className="text-[11px] text-slate-400">
                {targetUser.name} · {targetUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Photo Preview Canvas */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl border-4 border-slate-100 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-300" />
                )}
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Passport Photo Preview
            </span>
          </div>

          {/* Upload Method Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('FILE')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'FILE' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('URL')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'URL' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Tab 1: Local File Picker */}
          {activeTab === 'FILE' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer text-center">
                <div className="p-3 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Click to browse or drag & drop photo
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Supports PNG, JPG, JPEG or WEBP (Max 10MB)
                  </span>
                </div>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'URL' && (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Direct Photo / ImageKit URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ik.imagekit.io/.../staff_photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={isSaving || !previewUrl}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isSaving ? 'Uploading & Saving...' : 'Save Profile Photo'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
