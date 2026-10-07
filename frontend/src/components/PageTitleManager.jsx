import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  '/': 'CampusGig — Student Freelance Marketplace',
  '/explore': 'Browse Gigs — CampusGig',
  '/categories': 'All Categories — CampusGig',
  '/login': 'Sign In — CampusGig',
  '/register': 'Create Account — CampusGig',
  '/forgot-password': 'Forgot Password — CampusGig',
  '/dashboard': 'Dashboard — CampusGig',
  '/orders': 'My Orders — CampusGig',
  '/chat': 'Messages — CampusGig',
  '/admin': 'Admin Panel — CampusGig',
  '/services/new': 'Post a Gig — CampusGig'
};

const DEFAULT_TITLE = 'CampusGig — Student Freelance Marketplace';

export default function PageTitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const exact = ROUTE_TITLES[pathname];
    if (exact) {
      document.title = exact;
      return;
    }

    // Dynamic route matching
    if (pathname.startsWith('/services/') && pathname.endsWith('/edit')) {
      document.title = 'Edit Gig — CampusGig';
    } else if (pathname.startsWith('/services/')) {
      document.title = 'Gig Details — CampusGig';
    } else if (pathname.startsWith('/orders/checkout/')) {
      document.title = 'Checkout — CampusGig';
    } else if (pathname.startsWith('/orders/')) {
      document.title = 'Order Details — CampusGig';
    } else if (pathname.startsWith('/chat/')) {
      document.title = 'Chat — CampusGig';
    } else if (pathname.startsWith('/profile/')) {
      document.title = 'Student Profile — CampusGig';
    } else if (pathname.startsWith('/reset-password')) {
      document.title = 'Reset Password — CampusGig';
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [pathname]);

  return null;
}
