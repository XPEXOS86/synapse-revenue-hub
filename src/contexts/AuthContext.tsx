import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getPlanByProductId, getPlanByPriceId, type PlanTier } from "@/config/plans";
import * as authService from "@/services/authService";
import * as profileService from "@/services/profileService";
import * as teamService from "@/services/teamService";
import * as invitationService from "@/services/invitationService";
import { AuditActions, logAuditAction } from "@/services/auditService";
import * as permissionService from "@/services/permissionService";
import * as roleService from "@/services/roleService";
import type { UserRole, PermissionName } from "@/types/permissions";

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "guest";
  permissions: Record<string, boolean>;
  joined_at: string;
  updated_at: string;
}

interface SubscriptionState {
  subscribed: boolean;
  status: string | null;
  tier: PlanTier | null;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  currentTeam: Team | null;
  teams: Team[];
  teamMember: TeamMember | null;
  subscription: SubscriptionState;
  refreshSubscription: () => Promise<void>;
  loadProfile: () => Promise<void>;
  loadTeams: () => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // New Phase 2 methods
  createTeam: (name: string, slug: string, description?: string) => Promise<Team>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  inviteTeamMember: (email: string, role: "owner" | "admin" | "member" | "guest") => Promise<void>;
  updateTeamMemberRole: (memberId: string, role: "owner" | "admin" | "member" | "guest") => Promise<void>;
  removeTeamMember: (memberId: string) => Promise<void>;
  getTeamMembers: () => Promise<TeamMember[]>;
  acceptTeamInvitation: (invitationId: string) => Promise<void>;
  getPendingInvitations: () => Promise<invitationService.TeamInvitation[]>;
  // Phase 3: Permission Management methods
  checkPermission: (permission: PermissionName) => boolean;
  userHasPermissionInTeam: (permission: PermissionName) => Promise<boolean>;
  updateMemberRole: (memberId: string, newRole: UserRole) => Promise<void>;
  getRolePermissions: (role: UserRole) => Promise<PermissionName[]>;
  getUserRoleInTeam: (userId: string, teamId: string) => Promise<UserRole | null>;
  getTeamMembersWithRoles: () => Promise<any[]>;
  getRoleStats: () => Promise<Record<UserRole, number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultSubscription: SubscriptionState = {
  subscribed: false,
  status: null,
  tier: null,
  productId: null,
  priceId: null,
  subscriptionEnd: null,
  cancelAtPeriodEnd: false,
  loading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTeam, setCurrentTeamState] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("[Auth] Error loading profile:", error);
        setProfile(null);
        return;
      }

      setProfile(data as UserProfile);
    } catch (err) {
      console.error("[Auth] Profile load exception:", err);
      setProfile(null);
    }
  }, [user]);

  const loadTeams = useCallback(async () => {
    if (!user || !profile) {
      setTeams([]);
      setCurrentTeamState(null);
      setTeamMember(null);
      return;
    }

    try {
      // Get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", profile.id);

      if (memberError) throw memberError;

      if (!memberTeams || memberTeams.length === 0) {
        setTeams([]);
        setCurrentTeamState(null);
        setTeamMember(null);
        return;
      }

      const teamIds = memberTeams.map((m) => m.team_id);

      // Get team details
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds);

      if (teamError) throw teamError;

      setTeams(teamData as Team[]);

      // Set first team as current
      if (teamData && teamData.length > 0) {
        setCurrentTeamState(teamData[0] as Team);

        // Load current team member info
        const { data: memberData } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", teamData[0].id)
          .eq("user_id", profile.id)
          .single();

        if (memberData) {
          setTeamMember(memberData as TeamMember);
        }
      }
    } catch (err) {
      console.error("[Auth] Error loading teams:", err);
      setTeams([]);
      setCurrentTeamState(null);
    }
  }, [user, profile]);

  const setCurrentTeam = useCallback(async (team: Team | null) => {
    setCurrentTeamState(team);

    if (team && profile) {
      try {
        const { data: memberData } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", team.id)
          .eq("user_id", profile.id)
          .single();

        if (memberData) {
          setTeamMember(memberData as TeamMember);
        }
      } catch (err) {
        console.error("[Auth] Error loading team member:", err);
        setTeamMember(null);
      }
    } else {
      setTeamMember(null);
    }
  }, [profile]);

  const refreshSubscription = useCallback(async () => {
    const currentSession = session;
    if (!currentSession?.access_token) {
      setSubscription({ ...defaultSubscription, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });

      if (error) {
        console.error("[Auth] check-subscription error:", error);
        setSubscription({ ...defaultSubscription, loading: false });
        return;
      }

      const tier = data.product_id ? getPlanByProductId(data.product_id) : 
                   data.price_id ? getPlanByPriceId(data.price_id) : null;

      setSubscription({
        subscribed: data.subscribed || false,
        status: data.status || null,
        tier,
        productId: data.product_id || null,
        priceId: data.price_id || null,
        subscriptionEnd: data.subscription_end || null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        loading: false,
      });
    } catch {
      setSubscription({ ...defaultSubscription, loading: false });
    }
  }, [session]);

  // Initialize auth session
  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [user, loadProfile]);

  // Load teams when profile changes
  useEffect(() => {
    if (profile) {
      loadTeams();
    }
  }, [profile, loadTeams]);

  // Check subscription when session changes
  useEffect(() => {
    if (session) {
      refreshSubscription();
    } else {
      setSubscription({ ...defaultSubscription, loading: false });
    }
  }, [session, refreshSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await authService.signOut();
  };

  // Phase 2: Create team
  const createTeam = useCallback(
    async (name: string, slug: string, description?: string) => {
      if (!user || !profile) throw new Error("User not authenticated");

      try {
        const newTeam = await teamService.createTeam(profile.id, {
          name,
          slug,
          description,
        });

        // Log audit action
        await logAuditAction(
          newTeam.id,
          user.id,
          AuditActions.TEAM_CREATED,
          "team",
          newTeam.id,
          { name, slug }
        );

        await loadTeams();
        return newTeam;
      } catch (error) {
        console.error("Error creating team:", error);
        throw error;
      }
    },
    [user, profile, loadTeams]
  );

  // Phase 2: Update profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error("User not authenticated");

      try {
        await profileService.updateUserProfile(user.id, updates);
        await loadProfile();
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    [user, loadProfile]
  );

  // Phase 2: Invite team member
  const inviteTeamMember = useCallback(
    async (email: string, role: "owner" | "admin" | "member" | "guest") => {
      if (!user || !currentTeam) throw new Error("Team or user not available");

      try {
        await invitationService.inviteUserToTeam(currentTeam.id, email, role, user.id);

        // Log audit action
        await logAuditAction(
          currentTeam.id,
          user.id,
          AuditActions.INVITATION_SENT,
          "invitation",
          email,
          { email, role }
        );
      } catch (error) {
        console.error("Error inviting team member:", error);
        throw error;
      }
    },
    [user, currentTeam]
  );

  // Phase 2: Update team member role
  const updateTeamMemberRole = useCallback(
    async (memberId: string, role: "owner" | "admin" | "member" | "guest") => {
      if (!user || !currentTeam) throw new Error("Team or user not available");

      try {
        await teamService.updateTeamMemberRole(memberId, role);

        // Log audit action
        await logAuditAction(
          currentTeam.id,
          user.id,
          AuditActions.MEMBER_ROLE_CHANGED,
          "team_member",
          memberId,
          { new_role: role }
        );

        await loadTeams();
      } catch (error) {
        console.error("Error updating team member role:", error);
        throw error;
      }
    },
    [user, currentTeam, loadTeams]
  );

  // Phase 2: Remove team member
  const removeTeamMember = useCallback(
    async (memberId: string) => {
      if (!user || !currentTeam) throw new Error("Team or user not available");

      try {
        await teamService.removeTeamMember(memberId);

        // Log audit action
        await logAuditAction(
          currentTeam.id,
          user.id,
          AuditActions.MEMBER_REMOVED,
          "team_member",
          memberId
        );

        await loadTeams();
      } catch (error) {
        console.error("Error removing team member:", error);
        throw error;
      }
    },
    [user, currentTeam, loadTeams]
  );

  // Phase 2: Get team members
  const getTeamMembers = useCallback(async () => {
    if (!currentTeam) throw new Error("Team not available");

    try {
      return await teamService.getTeamMembers(currentTeam.id);
    } catch (error) {
      console.error("Error getting team members:", error);
      throw error;
    }
  }, [currentTeam]);

  // Phase 2: Accept team invitation
  const acceptTeamInvitation = useCallback(
    async (invitationId: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        await invitationService.acceptInvitation(invitationId, user.id);

        // Log audit action
        await logAuditAction(
          user.id,
          user.id,
          AuditActions.INVITATION_ACCEPTED,
          "invitation",
          invitationId
        );

        await loadTeams();
      } catch (error) {
        console.error("Error accepting invitation:", error);
        throw error;
      }
    },
    [user, loadTeams]
  );

  // Phase 2: Get pending invitations
  const getPendingInvitations = useCallback(async () => {
    if (!profile?.email) throw new Error("User email not available");

    try {
      return await invitationService.getUserPendingInvitations(profile.email);
    } catch (error) {
      console.error("Error getting pending invitations:", error);
      throw error;
    }
  }, [profile?.email]);

  // Phase 3: Check if user has a permission
  const checkPermission = useCallback((permission: PermissionName): boolean => {
    if (!teamMember) return false;
    const role = teamMember.role as UserRole;
    const { roleHasPermission } = require("@/lib/permissions");
    return roleHasPermission(role, permission);
  }, [teamMember]);

  // Phase 3: Check user permission in team (database lookup)
  const userHasPermissionInTeam = useCallback(async (permission: PermissionName): Promise<boolean> => {
    if (!user || !currentTeam) return false;

    try {
      return await permissionService.userHasPermissionInTeam(user.id, currentTeam.id, permission);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }, [user, currentTeam]);

  // Phase 3: Update member role
  const updateMemberRole = useCallback(async (memberId: string, newRole: UserRole) => {
    if (!user || !currentTeam) throw new Error("User or team not available");

    try {
      await roleService.updateUserRoleInTeam(memberId, currentTeam.id, newRole, user.id);
      await loadTeams();
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  }, [user, currentTeam, loadTeams]);

  // Phase 3: Get role permissions
  const getRolePermissions = useCallback(async (role: UserRole): Promise<PermissionName[]> => {
    try {
      const permissions = await permissionService.getRolePermissions(role);
      return permissions.map((p) => p.name as PermissionName);
    } catch (error) {
      console.error("Error getting role permissions:", error);
      return [];
    }
  }, []);

  // Phase 3: Get user role in team
  const getUserRoleInTeam = useCallback(async (userId: string, teamId: string): Promise<UserRole | null> => {
    try {
      return await roleService.getUserRoleInTeam(userId, teamId);
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }, []);

  // Phase 3: Get team members with roles
  const getTeamMembersWithRoles = useCallback(async () => {
    if (!currentTeam) throw new Error("Team not available");

    try {
      return await roleService.getTeamMembersWithRoles(currentTeam.id);
    } catch (error) {
      console.error("Error getting team members with roles:", error);
      throw error;
    }
  }, [currentTeam]);

  // Phase 3: Get role statistics
  const getRoleStats = useCallback(async (): Promise<Record<UserRole, number>> => {
    if (!currentTeam) throw new Error("Team not available");

    try {
      return await roleService.getRoleStatistics(currentTeam.id);
    } catch (error) {
      console.error("Error getting role statistics:", error);
      throw error;
    }
  }, [currentTeam]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        currentTeam,
        teams,
        teamMember,
        subscription,
        refreshSubscription,
        loadProfile,
        loadTeams,
        setCurrentTeam,
        signUp,
        signIn,
        signOut,
        // Phase 2 methods
        createTeam,
        updateProfile,
        inviteTeamMember,
        updateTeamMemberRole,
        removeTeamMember,
        getTeamMembers,
        acceptTeamInvitation,
        getPendingInvitations,
        // Phase 3 methods
        checkPermission,
        userHasPermissionInTeam,
        updateMemberRole,
        getRolePermissions,
        getUserRoleInTeam,
        getTeamMembersWithRoles,
        getRoleStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
