import { Clock, Phone, Shield, Wallet } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { PollProps } from "@/stores/props";
import { useEffect, useState } from "react";
import { ethers, Event } from "ethers";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import { useContractReady } from "@/hooks/useWalletReady";

type PollListItemProps = {
  poll: PollProps;
  onClick?: () => void;
};

const PollListItem = ({ poll, onClick }: PollListItemProps) => {
  const [totalVotes, setTotalVotes] = useState(0);
  const contract = useContractReady(poll.address, PollContract.abi);
  const isExpired = new Date(poll.expiredAt) < new Date();

  const refreshVotes = async () => {
    const totalVotes = await contract?.getTotalVotes();
    setTotalVotes(totalVotes?.toNumber());
  };

  useEffect(() => {
    if (contract) {
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
    <Card className="mb-4 cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <CardContent className="p-4">
        <div className={`flex ${poll.cover ? "gap-4" : ""}`}>
          {poll.cover && (
            <img
              src={poll.cover}
              alt={poll.title}
              className="w-32 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold mb-1">{poll.title}</h3>
              {isExpired ? (
                <div className="flex items-center gap-1 text-xs text-red-500 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Poll ended</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  {poll.isIdVerification && (
                    <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      <Shield className="w-3 h-3" /> ID
                    </div>
                  )}
                  {poll.isSmsVerification && (
                    <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                      <Phone className="w-3 h-3" /> SMS
                    </div>
                  )}
                  {poll.isEnabledDonations && (
                    <div className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                      <Wallet className="w-3 h-3" /> ETH
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">{poll.description}</p>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>{totalVotes} votes</span>
              {poll.isEnabledDonations && (
                <>
                  <span>•</span>
                  <span>
                    {/* {poll.options.reduce((sum, opt) => sum + opt.donations, 0)}{" "} */}
                    0 ETH donated
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default PollListItem;
