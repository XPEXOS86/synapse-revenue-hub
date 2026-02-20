import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTeams } from "@/hooks/use-teams";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } = from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Shield, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMemberWithProfile {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "guest";
  joined_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export function TeamMembers() {
  const { currentTeam, teamMember } = useAuth();
  const { inviteTeamMember, updateTeamMemberRole, removeTeamMember, isLoading } =
    useTeams();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "member" as const,
  });

  useEffect(() => {
    loadMembers();
  }, [currentTeam]);

  const loadMembers = async () => {
    if (!currentTeam) return;

    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(
          `
          id,
          user_id,
          role,
          joined_at,
          profiles:profiles (
            full_name,
            avatar_url,
            email
          )
        `
        )
        .eq("team_id", currentTeam.id)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      // Transform the data to flatten profile
      const transformedData = data?.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile: member.profiles || {},
      })) || [];

      setMembers(transformedData);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar membros do time.",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Selecione um time para gerenciar membros.</p>
      </div>
    );
  }

  const canManageMembers = teamMember?.role === "owner" || teamMember?.role === "admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast({
        title: "Erro",
        description: "Email é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteTeamMember(formData);
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso.",
      });
      setFormData({ email: "", role: "member" });
      setIsOpen(false);
      await loadMembers();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar convite.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateTeamMemberRole(
        memberId,
        newRole as "owner" | "admin" | "member" | "guest"
      );
      await loadMembers();
      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar função.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (
      !confirm("Tem certeza que deseja remover este membro do time?")
    ) {
      return;
    }

    try {
      await removeTeamMember(memberId);
      await loadMembers();
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover membro.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Membros do Time</h2>
        {canManageMembers && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
                <DialogDescription>
                  Convide uma pessoa para se juntar ao seu time.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="usuario@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={formData.role} onValueChange={(value) =>
                    setFormData({ ...formData, role: value as any })
                  }>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="guest">Convidado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Convite"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loadingMembers ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhum membro no time</h3>
          <p className="text-sm text-muted-foreground">
            Você é o único membro deste time no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                {member.profile.avatar_url && (
                  <img
                    src={member.profile.avatar_url}
                    alt={member.profile.full_name || "Membro"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {member.profile.full_name || "Usuário Anônimo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {canManageMembers ? (
                  <>
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleUpdateRole(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="guest">Convidado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-sm">
                    <Shield className="h-3 w-3" />
                    {member.role === "admin"
                      ? "Administrador"
                      : member.role === "owner"
                      ? "Proprietário"
                      : member.role === "member"
                      ? "Membro"
                      : "Convidado"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
