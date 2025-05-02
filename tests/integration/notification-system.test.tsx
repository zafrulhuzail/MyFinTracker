import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import React from 'react';

// Mock notification types
interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Mock notifications dropdown component
function NotificationsDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className="relative" data-testid="notifications-dropdown">
      <button 
        onClick={toggleDropdown}
        data-testid="notifications-button"
        className="relative"
      >
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10"
          data-testid="dropdown-menu"
        >
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600"
                data-testid="mark-all-read"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto" data-testid="notifications-list">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  {!notification.isRead && (
                    <span
                      className="inline-block w-2 h-2 bg-blue-600 rounded-full"
                      data-testid={`unread-indicator-${notification.id}`}
                    ></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

describe('Notifications System', () => {
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Claim Approved',
      message: 'Your recent claim for Books has been approved.',
      isRead: false,
      createdAt: new Date('2023-10-15')
    },
    {
      id: 2,
      title: 'New Announcement',
      message: 'Important information about upcoming deadlines.',
      isRead: true,
      createdAt: new Date('2023-10-10')
    },
    {
      id: 3,
      title: 'Claim Rejected',
      message: 'Your claim for Travel expenses requires additional documentation.',
      isRead: false,
      createdAt: new Date('2023-10-12')
    }
  ];
  
  let handleMarkAsRead: ReturnType<typeof vi.fn>;
  let handleMarkAllAsRead: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    handleMarkAsRead = vi.fn();
    handleMarkAllAsRead = vi.fn();
    user = userEvent.setup();
    
    render(
      <NotificationsDropdown
        notifications={mockNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    );
  });
  
  test('shows unread notification count badge', () => {
    // There should be 2 unread notifications
    const badge = screen.getByTestId('unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('2');
  });
  
  test('opens dropdown when notification button is clicked', async () => {
    // Dropdown should be closed initially
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    
    // Click the notification button
    const button = screen.getByTestId('notifications-button');
    await user.click(button);
    
    // Dropdown should be open now
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });
  
  test('displays all notifications in the dropdown', async () => {
    // Open the dropdown
    const button = screen.getByTestId('notifications-button');
    await user.click(button);
    
    // All notifications should be displayed
    expect(screen.getByText('Claim Approved')).toBeInTheDocument();
    expect(screen.getByText('New Announcement')).toBeInTheDocument();
    expect(screen.getByText('Claim Rejected')).toBeInTheDocument();
  });
  
  test('marks a notification as read when clicked', async () => {
    // Open the dropdown
    const button = screen.getByTestId('notifications-button');
    await user.click(button);
    
    // Click on an unread notification
    const notification = screen.getByTestId('notification-1');
    await user.click(notification);
    
    // The handler should be called with the correct notification ID
    expect(handleMarkAsRead).toHaveBeenCalledWith(1);
  });
  
  test('marks all notifications as read when "Mark all as read" button is clicked', async () => {
    // Open the dropdown
    const button = screen.getByTestId('notifications-button');
    await user.click(button);
    
    // Click the "Mark all as read" button
    const markAllButton = screen.getByTestId('mark-all-read');
    await user.click(markAllButton);
    
    // The handler should be called
    expect(handleMarkAllAsRead).toHaveBeenCalled();
  });
  
  test('distinguishes between read and unread notifications visually', async () => {
    // Open the dropdown
    const button = screen.getByTestId('notifications-button');
    await user.click(button);
    
    // Unread notifications should have an indicator
    expect(screen.getByTestId('unread-indicator-1')).toBeInTheDocument();
    expect(screen.getByTestId('unread-indicator-3')).toBeInTheDocument();
    
    // Read notifications should not have an indicator
    expect(screen.queryByTestId('unread-indicator-2')).not.toBeInTheDocument();
  });
});