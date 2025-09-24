import {
  IconBarrierBlock,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconArticle,
  IconCalendar,
  IconLayoutKanban,
  IconQuestionMark,
  IconChartBar,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

const adminSidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/admin/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Kanban Board',
          url: '/admin/kanban',
          icon: IconLayoutKanban,
          badge: 'New',
        },
        {
          title: 'Apps',
          url: '/admin/apps',
          icon: IconPackages,
        },
        {
          title: 'Chats',
          url: '/admin/chats',
          badge: '3',
          icon: IconMessages,
        },
        {
          title: 'Users',
          url: '/admin/users',
          icon: IconUsers,
        },
        {
          title: 'Blog Posts',
          url: '/admin/blogs',
          icon: IconArticle,
        },
        {
          title: 'Calendar',
          url: '/admin/calendar',
          icon: IconCalendar,
          badge: 'New',
        },
        {
          title: 'Quiz Management',
          url: '/admin/quiz-management',
          icon: IconQuestionMark,
        },
        {
          title: 'Quiz Analytics',
          url: '/admin/quiz-analytics',
          icon: IconChartBar,
        },
      ],
    },
    {
      title: 'Demos',
      items: [
        {
          title: 'Three Pane Navigator',
          url: '/admin/demos/three-pane-navigator',
          icon: IconLayoutDashboard,
          badge: 'Demo',
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Errors',
          icon: IconBug,
          items: [
            {
              title: 'Unauthorized',
              url: '/401',
              icon: IconLock,
            },
            {
              title: 'Forbidden',
              url: '/403',
              icon: IconUserOff,
            },
            {
              title: 'Not Found',
              url: '/404',
              icon: IconError404,
            },
            {
              title: 'Internal Server Error',
              url: '/500',
              icon: IconServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/503',
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'My Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/me/profile',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/me/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/me/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/me/notifications',
              icon: IconNotification,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/admin/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}

const userSidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn User Portal',
      logo: Command,
      plan: 'User Dashboard',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/user',
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: 'Demos',
      items: [
        {
          title: 'Three Pane Navigator',
          url: '/admin/demos/three-pane-navigator',
          icon: IconLayoutDashboard,
          badge: 'Demo',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Profile',
          url: '/me/profile',
          icon: IconUserCog,
        },
        {
          title: 'Account',
          url: '/me/account',
          icon: IconTool,
        },
        {
          title: 'Appearance',
          url: '/me/appearance',
          icon: IconPalette,
        },
        {
          title: 'Notifications',
          url: '/me/notifications',
          icon: IconNotification,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          url: '/admin/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}

export const sidebarData = adminSidebarData

export function getSidebarDataForRole(role: string): SidebarData {
  const adminRoles = ['admin', 'superadmin']
  return adminRoles.includes(role) ? adminSidebarData : userSidebarData
}
