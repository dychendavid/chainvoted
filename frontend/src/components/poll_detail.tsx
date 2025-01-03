import { Button } from "./ui/button";
import { ChevronLeft, ExternalLink, Lock, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import PollOptionItem from "./poll_option_item";
import usePollStore from "@/stores/PollStore";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { usePub, useSub } from "@/hooks/use-pubsub";
import {
  BlockchainTransactionStatus,
  useContractReady,
  useWalletReady,
} from "@/hooks/useWalletReady";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import usePollController from "@/controllers/poll_controller";
import useUserStore from "@/stores/userStore";
import { ApiCallStatus } from "@/lib/api";
import { useSession } from "next-auth/react";

type PollDetailProps = {
  onBack?: () => void;
  onLoading?: () => void;
};

const PollDetail = ({ onBack, onLoading }: PollDetailProps) => {
  const { data: session, status } = useSession();
  const pollStore = usePollStore();
  // const userStore = useUserStore();
  const { useGetPoll } = usePollController();
  const { data: poll, refetch: refetchPoll } = useGetPoll(pollStore.poll.id);

  // TODO: Implement authentication and verification checks
  const needsVerification = false;
  const isAuthenticated = !!session?.user.id;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(0);
  const intervalRef = useRef(null);

  const contract = useContractReady(poll?.address, PollContract.abi);
  const wallet = useWalletReady();

  const [loadingStatus, setLoadingStatus] = useState("");

  useSub(BlockchainTransactionStatus.START, () => {
    setLoadingStatus("Waiting for your acceptance");
    setIsLoading(true);
    const id = setInterval(() => {
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 1000);
    intervalRef.current = id;
  });

  useSub(ApiCallStatus.PROCESSING, () => {
    setLoadingStatus("Processing your vote");
    setIsLoading(true);
    const id = setInterval(() => {
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 1000);
    intervalRef.current = id;
  });

  useSub(ApiCallStatus.SUCCESS, () => {
    refetchPoll();
    setIsLoading(false);
    clearInterval(intervalRef.current);
  });

  useSub(ApiCallStatus.ERROR, () => {
    console.log("in api call error");
    setIsLoading(false);
    clearInterval(intervalRef.current);
  });

  useEffect(() => {
    // TODO: change to Donated event
    contract?.on("Voted", (totalVotes, optionVotes) => {
      // pollStore.updateStats({ totalVotes, optionVotes, isVoted: true });
      // publish(TransactionStatus.END);
    });
  }, [contract]);

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Polls
      </Button>

      {poll?.cover && (
        <img
          src={poll?.cover}
          alt={poll?.title}
          className="w-full h-48 object-cover rounded-xl"
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{poll?.title}</h2>
          <p className="text-gray-600">{poll?.description}</p>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 shrink-0 ml-2 text-xs">
          {poll?.isIdVerification && (
            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
              <Shield className="w-3 h-3" />
            </div>
          )}
          {poll?.isSmsVerification && (
            <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
              <Phone className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> Please sign in to vote
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
                onClick={() => {}}
              >
                Complete Verification <ExternalLink className="w-3 h-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {poll?.options.map((option, index) => (
          <PollOptionItem key={index} index={index} poll={poll} />
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
