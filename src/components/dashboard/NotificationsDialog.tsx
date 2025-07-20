import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, Info, AlertTriangle, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Program Deployed Successfully',
      message: 'Your token program has been deployed to devnet. Program ID: 5K2Jw...X9mR',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      action: {
        label: 'View on Solscan',
        href: 'https://solscan.io/account/5K2Jw...X9mR?cluster=devnet'
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Available',
      message: 'AI Assistant now supports custom module generation! Try it out in the editor.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Network Congestion',
      message: 'Devnet is experiencing high traffic. Deployments may take longer than usual.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
    },
    {
      id: '4',
      type: 'error',
      title: 'Build Failed',
      message: 'Compilation error in governance module. Check the connection types between modules.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
    },
    {
      id: '5',
      type: 'success',
      title: 'Test Suite Passed',
      message: 'All 12 tests passed successfully for your NFT marketplace project.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    }
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
      default:
        return 'outline';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-ui-base border-ui-accent max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Stay updated with your project activity and system notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-text-secondary opacity-50 mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No notifications</h3>
              <p className="text-text-secondary">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-ui-base border-ui-accent opacity-75' 
                    : 'bg-ui-accent border-ui-accent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-text-primary mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-text-secondary">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                          </div>
                          <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        {notification.action && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (notification.action?.onClick) {
                                  notification.action.onClick();
                                } else if (notification.action?.href) {
                                  window.open(notification.action.href, '_blank');
                                }
                                markAsRead(notification.id);
                              }}
                              className="border-ui-accent text-text-primary hover:bg-ui-accent"
                            >
                              {notification.action.label}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-text-secondary hover:text-text-primary p-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-text-secondary hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
