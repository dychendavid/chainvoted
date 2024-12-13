import { PollOptionProps } from "@/stores/props";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, Wallet } from "lucide-react";
import usePollStore from "@/stores/PollStore";
import { useEffect, useState } from "react";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import { useContractReady } from "@/hooks/useWalletReady";
import DonateModal from "./donate_modal";

type PollOptionItemProps = {
  option: PollOptionProps;
  onVote: () => void;
};

const PollOptionItem = ({ option, onVote }: PollOptionItemProps) => {
  const isAuthenticated = true;
  const canVote = true;
  const pollStore = usePollStore();
  const poll = pollStore.poll;
  const [votes, setVotes] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState(0);

  const totalVotes = pollStore.totalVotes;

  const percent = totalVotes == 0 ? 0 : (votes / totalVotes) * 100;
  const contract = useContractReady(poll.address, PollContract.abi);

  const handleVote = async () => {
    try {
      await contract?.vote(option.id);
      console.log(await contract.getCandidateVotes(option.id));
      setVotes(votes + 1);
      pollStore.setTotalVotes(pollStore.totalVotes + 1);
      // setTotalVotes(totalVotes + 1);
      console.log(votes, totalVotes);
    } catch (e) {
      console.info(e);
    }
    // refreshVotes();
  };

  const refreshVotes = async () => {
    // const votes = await contract?.getCandidateVotes(option.id);
    // const totalVotes = await contract?.getTotalVotes();
    // setVotes(votes.toNumber());
    // setTotalVotes(totalVotes.toNumber());
    // setVotes(votes + 1);
    // setTotalVotes(totalVotes + 1);
  };

  useEffect(() => {
    if (contract) {
      console.log("contract", contract);
      refreshVotes();
    }

    contract?.on("Voted", (e: Event) => {
      console.log("Voted");
      refreshVotes();
    });

    contract?.on("PollClosed", (e: Event) => {
      console.log("PollClosed");
    });

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

          {isAuthenticated && (
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 gap-2"
                disabled={!canVote}
                onClick={handleVote}
              >
                <ThumbsUp className="w-4 h-4" /> Vote
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDonateModal(true);
                }}
              >
                <Wallet className="w-4 h-4" /> Donate
              </Button>
            </div>
          )}

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
    </>
  );
};

export default PollOptionItem;