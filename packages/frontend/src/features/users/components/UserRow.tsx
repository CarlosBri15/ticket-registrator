import { memo } from "react";
import { User, Mail, AtSign, ChevronRight } from "lucide-react";
import { type IUser } from "@ticket-registrator/shared";
import { PixelCard } from "../../../components/ui/PixelCard";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import { DARK } from "../constants";

interface UserRowProps {
  user: IUser;
  roleName?: string;
  onClick: () => void;
}

export const UserRow = memo(({ user, roleName, onClick }: UserRowProps) => (
  <PixelCard onClick={onClick} className="w-full">
    <div className="flex items-center gap-4 px-4 py-3.5">
      {/* Avatar / Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl border-2 select-none"
        style={{
          backgroundColor: `${DARK}05`,
          borderColor: `${DARK}10`,
          color: DARK
        }}
      >
        <User className="w-6 h-6 opacity-40" />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="font-space-bold text-dark truncate" style={{ fontSize: 15 }}>
          {user.name} {user.surname}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="w-3 h-3 shrink-0" style={{ color: `${DARK}40` }} />
            <span className="font-space-semibold truncate" style={{ fontSize: 11, color: `${DARK}50` }}>
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <AtSign className="w-3 h-3 shrink-0" style={{ color: `${DARK}40` }} />
            <span className="font-space-semibold truncate" style={{ fontSize: 11, color: `${DARK}50` }}>
              {user.username}
            </span>
          </div>
        </div>
      </div>

      {/* Role & Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:block">
          <RoleBadge roleName={roleName} />
        </div>
        <div className="shrink-0 flex items-center justify-center">
          <ChevronRight className="w-5 h-5" style={{ color: `${DARK}25` }} />
        </div>
      </div>
    </div>
  </PixelCard>
));
