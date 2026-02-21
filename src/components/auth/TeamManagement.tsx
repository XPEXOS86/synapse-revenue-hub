import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTeams } from "@/hooks/use-teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TeamManagement() {
  const { teams, currentTeam, setCurrentTeam } = useAuth();
  const { createTeam, isLoading } = useTeams();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast({
        title: "Erro",
        description: "Nome e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTeam(formData);
      toast({
        title: "Sucesso",
        description: "Time criado com sucesso.",
      });
      setFormData({ name: "", slug: "", description: "" });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar o time.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Times</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Time</DialogTitle>
              <DialogDescription>
                Crie um novo time para colaborar com sua equipe.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="team-name">Nome do Time</Label>
                <Input
                  id="team-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Meu Time Incrível"
                />
              </div>

              <div>
                <Label htmlFor="team-slug">Slug (URL)</Label>
                <Input
                  id="team-slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="meu-time"
                />
              </div>

              <div>
                <Label htmlFor="team-description">Descrição</Label>
                <textarea
                  id="team-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição do time (opcional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Time"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhum time criado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie seu primeiro time para começar a colaborar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                currentTeam?.id === team.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setCurrentTeam(team)}
            >
              {team.logo_url && (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="h-10 w-10 rounded mb-3 object-cover"
                />
              )}
              <h3 className="font-semibold">{team.name}</h3>
              <p className="text-xs text-muted-foreground">{team.slug}</p>
              {team.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {team.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
