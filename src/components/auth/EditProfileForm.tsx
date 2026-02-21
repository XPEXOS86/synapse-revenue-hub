import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export function EditProfileForm() {
  const { profile, isLoading, uploadAvatar, updateProfile } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
  });
  const [uploading, setUploading] = useState(false);

  if (!profile) {
    return <div>Carregando perfil...</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAvatar(file);
      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Avatar</Label>
          <div className="mt-2 flex items-center gap-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Avatar"}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-primary transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  ) : (
                    <Upload className="h-5 w-5 mx-auto mb-2" />
                  )}
                  <p className="text-sm">Clique para fazer upload</p>
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Nome de Usuário</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="seu_usuario"
          />
        </div>

        <div>
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Seu Nome Completo"
          />
        </div>

        <div>
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Conte um pouco sobre você..."
            rows={4}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </form>
    </div>
  );
}
