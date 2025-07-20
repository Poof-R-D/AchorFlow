
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User, Settings, Bell, ArrowLeft, ExternalLink, Wallet, ChevronDown } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingsDialog from '@/components/dashboard/SettingsDialog';
import NotificationsDialog from '@/components/dashboard/NotificationsDialog';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ user, onLogin, onLogout, showBackButton, onBack }: HeaderProps) => {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !connected) {
        setBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
    
    // Set up interval to refresh balance periodically
    const interval = setInterval(fetchBalance, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  const handleNetworkSwitch = (newNetwork: 'devnet' | 'mainnet') => {
    setNetwork(newNetwork);
    // In a real app, you'd need to update the connection endpoint
    console.log(`Switching to ${newNetwork}`);
  };

  const formatBalance = (bal: number) => {
    return bal.toFixed(4);
  };

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <header className="bg-dark-bg border-b border-ui-accent px-8 py-6">
      <div className="flex items-center justify-between container-custom">
        <div className="flex items-center space-x-6">
          {showBackButton && onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-text-secondary hover:text-text-primary hover:bg-ui-accent transition-colors duration-150"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Poof Labs Logo and AnchorFlow Branding */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://pooflabs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/6c5b65dc-07c7-45d4-b3e2-2c71ffbf96b4.png" 
                alt="Poof Labs" 
                className="h-8 w-auto"
              />
            </a>
            <div className="h-6 w-px bg-ui-accent"></div>
            <div>
              <div className="text-3xl font-semibold text-text-primary">
                AnchorFlow
              </div>
              <div className="text-xs text-text-secondary hidden md:block">
                by Poof Labs
              </div>
            </div>
          </div>
          
          <div className="text-base text-text-secondary hidden lg:block">
            Visual Solana Program Builder
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Wallet Section */}
          <div className="flex items-center space-x-3">
            {/* Network Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-text-primary border-ui-accent hover:bg-ui-accent"
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    network === 'devnet' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  {network === 'devnet' ? 'Devnet' : 'Mainnet'}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-ui-base border-ui-accent">
                <DropdownMenuItem 
                  onClick={() => handleNetworkSwitch('devnet')}
                  className="text-text-primary hover:bg-ui-accent"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                  Devnet
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNetworkSwitch('mainnet')}
                  className="text-text-primary hover:bg-ui-accent"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Mainnet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Balance Display */}
            {connected && publicKey && (
              <div className="flex items-center space-x-2 bg-ui-accent rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-text-primary" />
                <div className="text-sm">
                  <div className="text-text-primary font-medium">
                    {formatPublicKey(publicKey.toString())}
                  </div>
                  <div className="text-text-secondary text-xs">
                    {isLoadingBalance ? (
                      'Loading...'
                    ) : balance !== null ? (
                      `${formatBalance(balance)} SOL`
                    ) : (
                      'Error'
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Connect Button */}
            <div className="wallet-adapter-button-container">
              <WalletMultiButton 
                className="!bg-text-primary !text-ui-base hover:!bg-text-secondary !rounded-lg !px-4 !py-2 !font-medium !transition-colors !duration-150"
              />
            </div>
          </div>

          {/* User Section */}
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNotifications(true)}
                className="text-text-secondary hover:text-text-primary hover:bg-ui-accent transition-colors duration-150 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(true)}
                className="text-text-secondary hover:text-text-primary hover:bg-ui-accent transition-colors duration-150"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ui-accent rounded-full flex items-center justify-center border border-ui-accent">
                  <User className="h-5 w-5 text-text-primary" />
                </div>
                <span className="text-text-primary text-base hidden md:block font-medium">{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="btn-secondary"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              onClick={onLogin} 
              className="btn-primary"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
      
      {/* Settings Dialog */}
      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      
      {/* Notifications Dialog */}
      <NotificationsDialog 
        open={showNotifications} 
        onOpenChange={setShowNotifications} 
      />
    </header>
  );
};

export default Header;
