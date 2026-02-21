import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface CreateTeamProps {
  onSuccess?: () => void;
}

export function CreateTeam({ onSuccess }: CreateTeamProps) {
  const { createTeam } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError("Team name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError("Team slug is required");
      setIsLoading(false);
      return;
    }

    try {
      await createTeam(formData.name, formData.slug, formData.description || undefined);
      setSuccess(true);
      setFormData({
        name: "",
        slug: "",
        description: "",
      });
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Team</CardTitle>
        <CardDescription>
          Create a new team to collaborate with your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Team created successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Team Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="My Awesome Team"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The name of your team or organization
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="text-sm font-medium">
                Team Slug <span className="text-red-500">*</span>
              </label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                placeholder="my-awesome-team"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier for your team (auto-generated from name)
              </p>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what your team does..."
                rows={4}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional description of your team
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !formData.name}
                className="min-w-24"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
