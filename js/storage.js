// ============================================================
// ACADEX — Supabase Storage (avatares, fotos)
// ============================================================

const Storage = {
  bucket: 'avatars',

  async upload(path, file) {
    const { data, error } = await supabase.storage.from(this.bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return this.getUrl(data?.path || path);
  },

  async delete(path) {
    await supabase.storage.from(this.bucket).remove([path]);
  },

  getUrl(path) {
    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadStudentPhoto(estudianteId, file) {
    const ext = file.name.split('.').pop();
    const path = `estudiantes/${estudianteId}.${ext}`;
    return this.upload(path, file);
  },

  async uploadUserAvatar(userId, file) {
    const ext = file.name.split('.').pop();
    const path = `usuarios/${userId}.${ext}`;
    return this.upload(path, file);
  }
};

window.Storage = Storage;
