'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { ReactNode } from 'react';

export interface ActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'ghost';
  showSeparatorAfter?: boolean; // Optional divider after this item
}

interface ActionMenuProps {
  actions: ActionItem[];
  triggerSize?: 'icon' | 'sm' | 'default';
  align?: 'start' | 'center' | 'end';
  className?: string;
  disabled?: boolean;
}

export default function ActionMenu({
  actions,
  triggerSize = 'icon',
  align = 'end',
  className = '',
  disabled = false,
}: ActionMenuProps) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          className={`h-8 w-8 hover:bg-gray-100 ${className}`}
          disabled={disabled}
        >
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[160px]">
        {actions.map((action, index) => (
          <div key={index}>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                if (!action.disabled) action.onClick();
              }}
              disabled={action.disabled}
              className={`
                cursor-pointer flex items-center gap-2 py-2 px-3
                ${action.variant === 'destructive' 
                  ? 'text-red-600 focus:text-red-700 focus:bg-red-50' 
                  : 'text-gray-700 hover:bg-gray-100'}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
            {action.showSeparatorAfter && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}