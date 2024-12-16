import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Wallet } from "lucide-react";
import usePollStore, { PollOptionProps } from "@/stores/PollStore";
import { useEffect, useState } from "react";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import {
  EthersErrorType,
  getNonce,
  TransactionError,
  TransactionStatus,
  useContractReady,
  useWalletReady,
} from "@/hooks/useWalletReady";
import DonateModal from "./donate_modal";
import { useToast } from "@/hooks/use-toast";
import { usePub } from "@/hooks/use-pubsub";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PollOptionItemProps = {
  option: PollOptionProps;
  order: number;
  onVote: () => void;
};

const PollOptionItem = ({ option, onVote, order }: PollOptionItemProps) => {
  const pollStore = usePollStore();
  const poll = pollStore.poll;
  const isVoted = pollStore.stats?.isVoted;
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState(0);
  const contract = useContractReady(poll.address, PollContract.abi);
  const wallet = useWalletReady();
  const { toast } = useToast();
  const publish = usePub();
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");

  // NOTE since the option.id is auto increment, we need to change it to order of the poll
  const votes = pollStore.stats?.optionVotes[order]?.toNumber();
  const percent =
    pollStore.stats?.totalVotes.toNumber() == 0
      ? 0
      : (votes / pollStore.stats?.totalVotes.toNumber()) * 100;

  const handleConnectError = () => {
    setErrorTitle("Connect Wallet");
    setError("Please connect your wallet first");
  };

  const handleVote = async () => {
    if (!wallet.isConnected) {
      handleConnectError();
      return;
    }

    try {
      publish(TransactionStatus.START);
      await contract?.vote(order, {
        nonce: getNonce(wallet?.account),
      });
      publish(TransactionStatus.PROCESSING);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        const txError = error as TransactionError;
        if (txError.code == EthersErrorType.ACTION_REJECTED) {
          toast({
            description: "User Rejected Transaction",
          });
          // NOTE: this error means many case
        } else if (txError.code == EthersErrorType.UNPREDICTABLE_GAS_LIMIT) {
          if (txError.reason.includes("reverted with reason string '")) {
            const reason: string = txError.reason
              .split("reverted with reason string '")[1]
              .split("'")[0];
            toast({
              description: reason,
            });
          } else {
            toast({
              description: txError.reason,
            });
          }
        }
      }

      publish(TransactionStatus.END);
    }
  };

  const handleDonate = async () => {
    if (!wallet.isConnected) {
      handleConnectError();
      return;
    }

    setShowDonateModal(true);
  };

  const handleConfirmDonate = async () => {
    if (!wallet.isConnected) {
      handleConnectError();
      return;
    }
  };

  useEffect(() => {
    const run = async () => {
      contract?.on("PollClosed", (e: Event) => {
        console.log("PollClosed");
      });
    };
    run();
    return () => {
      contract?.off("PollClosed", () => {}, []).off("Voted", () => {}, []);
    };
  }, [contract]);

  return (
    <>
      <Card key={option.id} className="overflow-hidden">
        {option.cover && (
          <img
            src={option.cover}
            alt={option.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardContent className={`p-4 ${!option.cover ? "pt-6" : ""}`}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </div>
            <div className="flex flex-col gap-1 ml-4">
              <div className="bg-blue-50 px-2 py-1 rounded text-sm text-center">
                {votes} votes
              </div>
              {true && (
                <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-sm text-center">
                  {donateAmount} ETH
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 gap-2"
              disabled={isVoted}
              onClick={handleVote}
            >
              <ThumbsUp className="w-4 h-4" />
              {isVoted ? "Voted" : "Vote"}
            </Button>
            {poll.isEnableDonations && (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDonate}
              >
                <Wallet className="w-4 h-4" /> Donate
              </Button>
            )}
          </div>

          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
      {showDonateModal && (
        <DonateModal
          option={option}
          onClose={() => {
            setShowDonateModal(false);
            // setSelectedOption(null);
            // setDonationAmount("");
          }}
          onConfirm={(tmp) => {
            setShowDonateModal(false);
            console.log(donateAmount, tmp);
            setDonateAmount(donateAmount + parseInt(tmp));
          }}
        />
      )}
      <AlertDialog open={!!error}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setError("");
              }}
            >
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PollOptionItem;
