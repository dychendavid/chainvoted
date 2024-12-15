import { Button } from "./ui/button";
import { ChevronLeft, ExternalLink, Lock, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import PollOptionItem from "./poll_option_item";
import usePollStore, { PollStatUpdateDtoProps } from "@/stores/PollStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { usePub, useSub } from "@/hooks/use-pubsub";
import {
  TransactionStatus,
  useContractReady,
  useWalletReady,
} from "@/hooks/useWalletReady";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";

type PollDetailProps = {
  onBack?: () => void;
  onLoading?: () => void;
};

const PollDetail = ({ onBack, onLoading }: PollDetailProps) => {
  const pollStore = usePollStore();
  const poll = pollStore.poll;

  // TODO: Implement authentication and verification checks
  const canVote = true;
  const needsVerification = false;
  const isAuthenticated = true;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(0);
  const intervalRef = useRef(null);

  const contract = useContractReady(poll.address, PollContract.abi);
  const wallet = useWalletReady();

  const [loadingStatus, setLoadingStatus] = useState("");
  const publish = usePub();

  useSub(TransactionStatus.START, () => {
    setLoadingStatus("Waiting for your acceptance");
    setIsLoading(true);
    const id = setInterval(() => {
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 1000);
    intervalRef.current = id;
  });

  useSub(TransactionStatus.PROCESSING, () => {
    setLoadingStatus("Processing your transaction");
    setIsLoading(true);
    const id = setInterval(() => {
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 1000);
    intervalRef.current = id;
  });

  useSub(TransactionStatus.END, () => {
    setIsLoading(false);
    clearInterval(intervalRef.current);
  });

  useEffect(() => {
    contract?.on("Voted", (totalVotes, optionVotes) => {
      pollStore.updateStats({ totalVotes, optionVotes, isVoted: true });
      publish(TransactionStatus.END);
    });
  }, [wallet?.account]);

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
        <div className="sm:flex gap-2">
          {poll.isIdVerification && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:block">ID Required</span>
            </div>
          )}
          {poll.isSmsVerification && (
            <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:block">SMS Verify</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {poll.options.map((option, index) => (
          <PollOptionItem
            key={index}
            order={index}
            option={option}
            onVote={() => {
              /* handle vote */
            }}
          />
        ))}
      </div>
      <AlertDialog open={isLoading}>
        {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription>
              {loadingStatus}
              {Array.from({ length: loadingDots }).map((_, i) => ".")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PollDetail;
