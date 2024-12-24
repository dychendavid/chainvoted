import {
  ChevronLeft,
  ExternalLink,
  Lock,
  Phone,
  Shield,
  Wallet,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { usePub, useSub } from "@/hooks/use-pubsub";
import {
  BlockchainTransactionStatus,
  useContractReady,
  useWalletReady,
} from "@/hooks/useWalletReady";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import usePollController from "@/controllers/poll_controller";
import { ApiCallStatus } from "@/lib/api";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PollOptionItem from "@/components/poll_option_item";
import { useRouter } from "next/router";
import PageHeader from "@/components/page_header";
import Link from "next/link";
import ResponsiveImage from "@/components/responsive_image";

type PollDetailProps = {
  onBack?: () => void;
  onLoading?: () => void;
};

const PollPage = ({ onBack, onLoading }: PollDetailProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(0);
  const intervalRef = useRef(null);

  const pollId = router.query.id as string;
  const { useGetPoll } = usePollController();
  const { data: poll, refetch: refetchPoll } = useGetPoll(parseInt(pollId));

  // TODO: Implement authentication and verification checks
  const needsVerification = false;
  const isAuthenticated = !!session?.user.id;

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
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader />

      <div className="space-y-4">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Polls
          </Button>
        </Link>

        {poll?.cover && (
          <ResponsiveImage
            src={poll?.cover}
            alt={poll?.title}
            className="w-full h-48 object-cover rounded-xl"
          />
        )}

        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 md:gap-0 mb-2">
            <h3 className="text-2xl font-bold">{poll?.title}</h3>
            <div className="flex gap-2">
              {poll?.isIdVerification && (
                <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  <Shield className="w-3 h-3" /> ID
                </div>
              )}
              {poll?.isSmsVerification && (
                <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                  <Phone className="w-3 h-3" /> SMS
                </div>
              )}
              {poll?.isEnableDonations && (
                <div className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                  <Wallet className="w-3 h-3" /> ETH
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600">{poll?.description}</p>
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
    </div>
  );
};

export default PollPage;
