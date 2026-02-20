import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfileForm } from "@/components/auth/EditProfileForm";
import { TeamManagement } from "@/components/auth/TeamManagement";
import { TeamMembers } from "@/components/auth/TeamMembers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Não autenticado</h1>
          <p className="text-muted-foreground">
            Você precisa estar autenticado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Sucesso",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao desconectar.",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Configurações da Conta</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie seu perfil, times e preferências.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {signingOut ? "Desconectando..." : "Desconectar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="teams">Times</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Dados Pessoais</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Atualize suas informações de perfil.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <EditProfileForm />
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Gerenciar Times</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Crie e gerencie seus times de trabalho.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <TeamManagement />
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Membros do Time</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Gerenciar membros e convites do time selecionado.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <TeamMembers />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
