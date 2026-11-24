
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyEmailButtonProps {
  email: string;
}

// How long the "copied" check mark stays before reverting to the copy icon.
const COPIED_RESET_DELAY_MS = 2000;

/**
 * Icon button that copies the given email address to the clipboard.
 *
 * On success it swaps the copy icon for a check mark, shows a toast, and
 * reverts the icon after 2 seconds; on failure it only shows an error toast.
 * The surrounding tooltip also reflects the current copied state. When the
 * async Clipboard API is unavailable (non-secure contexts, older browsers)
 * it falls back to the hidden-textarea + execCommand('copy') path instead
 * of throwing, so the button still works there.
 *
 * @param props.email - Email address written to the clipboard on click.
 */
const CopyEmailButton = ({ email }: CopyEmailButtonProps) => {
  const [copied, setCopied] = useState(false);
  // Timer id for reverting the copied icon; cleared on unmount so a late
  // timeout never calls setState after the button is gone.
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Legacy copy path for contexts without navigator.clipboard (HTTP pages,
  // older browsers): a hidden textarea + execCommand('copy'). Throws when
  // the command reports failure so the caller shows the error toast.
  const copyWithFallback = () => {
    const textarea = document.createElement('textarea');
    textarea.value = email;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (!document.execCommand('copy')) {
        throw new Error('execCommand copy failed');
      }
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        copyWithFallback();
      }
      setCopied(true);
      toast.success('Email copied to clipboard!');

      // Reset the copied state after the reset delay. Clear any pending
      // reset first so rapid re-clicks restart the delay instead of
      // stacking timeouts.
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, COPIED_RESET_DELAY_MS);
    } catch {
      toast.error('Failed to copy email');
    }
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
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
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
