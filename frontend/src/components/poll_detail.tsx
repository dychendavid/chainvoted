import { Button } from "./ui/button";
import { ChevronLeft, ExternalLink, Lock, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import PollOptionItem from "./poll_option_item";
import usePollStore from "@/stores/PollStore";

type PollDetailProps = {
  onBack?: () => void;
};

const PollDetail = ({ onBack }: PollDetailProps) => {
  const pollStore = usePollStore();
  const poll = pollStore.poll;

  // TODO: Implement authentication and verification checks
  const canVote = true;
  const needsVerification = false;
  const isAuthenticated = true;

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Polls
      </Button>

      {poll.cover && (
        <img
          src={poll.cover}
          alt={poll.title}
          className="w-full h-48 object-cover rounded-xl"
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{poll.title}</h2>
          <p className="text-gray-600">{poll.description}</p>
        </div>
        <div className="flex gap-2">
          {poll.isIdVerification && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded">
              <Shield className="w-4 h-4" /> ID Required
            </div>
          )}
          {poll.isSmsVerification && (
            <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded">
              <Phone className="w-4 h-4" /> SMS Verify
            </div>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> Please authenticate to vote
          </AlertDescription>
        </Alert>
      ) : (
        needsVerification && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Verification required to vote
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  /* Navigate to profile */
                }}
              >
                Complete Verification <ExternalLink className="w-3 h-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )
      )}

      <div className="grid grid-cols-2 gap-6">
        {poll.options.map((option) => (
          <PollOptionItem key={option.id} option={option} onClick={null} />
        ))}
      </div>
    </div>
  );
};

export default PollDetail;
