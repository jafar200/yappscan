import { Branch } from '../types';

/**
 * Generates the public menu URL for a given branch.
 * @param branch The branch object.
 * @returns A full URL string with a hash for routing to the public menu.
 */
export const getPublicMenuUrl = (branch: Branch): string => {
    // The hosting environment can be complex, sometimes causing `window.location.origin`
    // or `window.location.pathname` to be unreliable. This led to malformed URLs and
    // DNS errors (DNS_PROBE_FINISHED_NXDOMAIN).
    //
    // This definitive fix takes a simpler and more robust approach. It uses the full
    // current URL (`window.location.href`) and removes any existing hash fragment.
    // This guarantees that the base URL (protocol, host, and dynamic path) is
    // perfectly preserved. A new, correct hash for the public menu is then appended.
    // This method is immune to issues with how `origin` or `pathname` are constructed.

    const currentUrl = window.location.href;
    
    // Find the hash symbol and take everything before it.
    const baseUrl = currentUrl.split('#')[0];

    // Append the new hash for client-side routing to the specific menu.
    return `${baseUrl}#/menu/${branch.id}`;
};
