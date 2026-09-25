
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyEmailButtonProps {
  email: string;
}

/**
 * Icon button that copies the given email address to the clipboard.
 *
 * On success it swaps the copy icon for a check mark, shows a toast, and
 * reverts the icon after 2 seconds; on failure it only shows an error toast.
 * The surrounding tooltip also reflects the current copied state.
 *
 * @param props.email - Email address written to the clipboard on click.
 */
const CopyEmailButton = ({ email }: CopyEmailButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopied(true);
        toast.success('Email copied to clipboard!');
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        toast.error('Failed to copy email');
      });
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={copyToClipboard}
            aria-label="Copy email to clipboard"
            className="ml-2 h-8 w-8"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy email to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyEmailButton;
