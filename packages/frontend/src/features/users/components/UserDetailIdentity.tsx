import React from "react";
import { User, Mail } from "lucide-react";
import type { IUser, IDepartment } from "@ticket-registrator/shared";

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
    <section className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="w-16 h-16 rounded-lg bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center shrink-0 text-dark/40">
          <User className="w-7 h-7" aria-hidden={true} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div>
            <h2 className="text-[20px] font-sans-bold text-dark leading-tight">
              {user.name} {user.surname}
            </h2>
            <p className="text-[12px] font-sans-medium text-dark/50 mt-0.5">
              @{user.username}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Mail className="w-3.5 h-3.5 shrink-0 text-dark/40" aria-hidden={true} />
              <span className="font-sans-medium text-[13px] text-dark/60 truncate">
                {user.email}
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold whitespace-nowrap">
              {roleName}
            </span>
            {userDepts.map((dept) => (
              <span
                key={dept.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-[var(--color-border-main)] bg-[var(--color-surface-card)] text-dark/60 text-[11px] font-sans-medium whitespace-nowrap"
              >
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
