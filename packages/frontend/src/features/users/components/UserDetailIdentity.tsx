import React from "react";
import { User, Mail } from "lucide-react";
import { PixelCard } from "../../../components/ui/PixelCard";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import type { IUser, IDepartment } from "@ticket-registrator/shared";
import { BRAND, DARK } from "../constants";

interface UserDetailIdentityProps {
  user: IUser;
  roleName: string;
  userDepts: IDepartment[];
}

export const UserDetailIdentity: React.FC<UserDetailIdentityProps> = ({
  user,
  roleName,
  userDepts,
}) => {
  return (
    <section>
      <PixelCard className="overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl opacity-50" />
        <div className="relative p-6 px-7 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          {/* Avatar Box */}
          <div
            className="w-20 h-20 rounded-2xl border-4 bg-[var(--color-surface-card)] flex items-center justify-center shrink-0 shadow-lg relative"
            style={{ borderColor: "var(--color-surface-card)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}
          >
            <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND}10` }}>
              <User className="w-9 h-9" style={{ color: BRAND }} />
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2 className="text-xl font-space-bold text-dark">
                {user.name} {user.surname}
              </h2>
              <p className="text-[11px] font-space-bold text-dark/30 uppercase tracking-widest leading-none mt-1">
                @{user.username}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}40` }} />
                <span className="font-space-semibold text-[13px] text-dark/50 truncate max-w-[180px]">{user.email}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <RoleBadge roleName={roleName} />
                {userDepts.map(dept => (
                  <span key={dept.id} className="px-2 py-0.5 rounded border border-dark/10 bg-dark/5 text-[9px] font-space-bold text-dark/40 uppercase">
                    {dept.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PixelCard>
    </section>
  );
};
