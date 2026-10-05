import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Shield,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Mail,
  UserCheck,
} from 'lucide-react';
import { UserRoleItem, MetrologicalRole } from '../types';

interface UsersRolesTabProps {
  users: UserRoleItem[];
  onSelectUser: (user: UserRoleItem) => void;
  onAddUser?: () => void;
  canEdit?: boolean;
}

export const UsersRolesTab: React.FC<UsersRolesTabProps> = ({
  users,
  onSelectUser,
  onAddUser,
  canEdit = true,
}) => {
  const getRoleBadge = (role: MetrologicalRole) => {
    switch (role) {
      case 'METROLOGIST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'REVIEWER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'DIRECTOR':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 font-bold';
      case 'AUDITOR':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'ADMIN':
        return 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Users &amp; Metrological Role Assignments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Governed by the statutory Four-Eyes Principle (Testing Officer cannot approve their own verification certificates).
            </p>
          </div>

          {canEdit && onAddUser && (
            <button
              onClick={onAddUser}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Officer</span>
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3 px-6">Official Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Metrological Role</th>
                <th className="py-3 px-4">Laboratory Node</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {u.designation}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {u.laboratory}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
