
import { useEffect, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/SectionHeading';
import StarRating from '@/components/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// Create a timestamp-based unique ID
const createUniqueId = () => {
  return `rating_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// localStorage throws (SecurityError) when storage is disabled or in some
// private-browsing modes; a failed read/write must never crash the section,
// so storage access goes through these best-effort wrappers.
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Persistence is best-effort; the rating flow already succeeded.
  }
}

// A hand-edited or corrupt stored value must not render as "NaN stars":
// only a finite integer in the 1-5 star range counts as a saved rating.
function parseStoredRating(raw: string | null): number | null {
  if (raw === null) return null;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
}

const RatingSection = () => {
  const [hasRated, setHasRated] = useState(false);
  const [savedRating, setSavedRating] = useState(0);
  const [userId, setUserId] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already rated
    const saved = parseStoredRating(safeGetItem('portfolioRating'));
    if (saved !== null) {
      setHasRated(true);
      setSavedRating(saved);
    }

    // Generate or retrieve a unique user ID
    const existingId = safeGetItem('portfolioUserId');
    if (existingId) {
      setUserId(existingId);
    } else {
      const newId = createUniqueId();
      setUserId(newId);
      safeSetItem('portfolioUserId', newId);
    }

    // Check if feedback was already sent
    const feedback = safeGetItem('portfolioFeedbackSent');
    if (feedback) {
      setFeedbackSent(true);
    }
  }, []);

  // Function to save the rating to a backend service
  const saveRating = async (rating: number) => {
    try {
      setSubmitError(null);
      
      // Get some basic anonymous analytics data
      const formData = {
        ratingId: createUniqueId(),
        userId: userId,
        rating: rating,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        referrer: document.referrer || 'direct',
        path: window.location.pathname,
        message: `Portfolio Rating: ${rating} stars`, // Add explicit message for email
        _subject: `New Portfolio Rating: ${rating} stars`, // Add subject line for email
      };

      // Send to Formspree endpoint - using proper form submission format
      const response = await fetch('https://formspree.io/f/maneawkk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Network response was not ok');
      }

      // Store the result in localStorage for persistence on client
      safeSetItem('portfolioRatingId', formData.ratingId);
      safeSetItem('portfolioFeedbackSent', 'true');
      
      // Set the state to display the rated view
      setHasRated(true);
      setSavedRating(rating);
      setFeedbackSent(true);

      // Show confirmation toast
      toast.success('Thank you for your rating!', {
        description: `You rated my portfolio ${rating} stars. I appreciate your feedback!`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(errorMessage);
      
      toast.error('Could not submit your rating', {
        description: 'Please try again later',
        duration: 3000,
      });
      throw error; // Re-throw to let the StarRating component handle it
    }
  };

  return (
    <section id="rating" className="py-12 bg-secondary/50">
      <div className="container max-w-4xl">
        <ScrollReveal>
          <SectionHeading 
            title="Rate My Portfolio"
            subtitle={hasRated 
              ? "Thank you for your feedback! 🙏" 
              : "Did you enjoy my portfolio? Let me know with a quick rating! ⭐"
            }
          />
        </ScrollReveal>
        
        <ScrollReveal direction="up" className="max-w-md mx-auto">
          <Card className="glass-border overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center">
              {hasRated ? (
                <>
                  <p className="text-lg mb-4 text-center">
                    You've rated my portfolio <span className="font-bold text-primary">{savedRating} stars</span>.
                  </p>
                  <StarRating initialRating={savedRating} />
                  <p className="mt-4 text-muted-foreground text-center text-sm">
                    Thank you for your feedback! I appreciate you taking the time to rate my work.
                  </p>
                  {feedbackSent && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-md text-sm text-center">
                      <p className="font-medium text-primary">Feedback sent successfully! ✓</p>
                      <p className="text-muted-foreground mt-1">Your rating has been recorded and will help me improve.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg mb-6 text-center">
                    How would you rate my portfolio?
                  </p>
                  <StarRating onSave={saveRating} />
                  <p className="mt-4 text-muted-foreground text-center text-sm">
                    Your feedback helps me improve and create better experiences!
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70 text-center">
                    Ratings are collected anonymously to help improve this portfolio
                  </p>
                  
                  {submitError && (
                    <Alert variant="destructive" className="mt-4">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Error submitting rating</AlertTitle>
                      <AlertDescription>
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RatingSection;
