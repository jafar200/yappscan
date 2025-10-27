import React from 'react';
import { Branch } from '../types';
import { getPublicMenuUrl } from '../services/utils';
import { Icons } from './Icons';

interface ViewMenuButtonProps {
  branch: Branch;
}

/**
 * A dedicated component for viewing a branch's public menu.
 * Renders as a link that opens the menu in a new tab.
 */
export const ViewMenuButton: React.FC<ViewMenuButtonProps> = ({ branch }) => {
  const url = getPublicMenuUrl(branch);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 text-sm flex items-center justify-center bg-teal-500 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-600 transition"
      aria-label={`عرض قائمة طعام ${branch.name}`}
      title={`عرض قائمة طعام ${branch.name}`}
    >
      <Icons.ExternalLink className="w-4 h-4 mr-1" />
      عرض القائمة
    </a>
  );
};
