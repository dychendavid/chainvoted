import { Clock, Phone, Shield, Wallet } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import PollContract from "@shared/artifacts/contracts/Poll.sol/Poll.json";
import { useContractReady, useWalletReady } from "@/hooks/useWalletReady";
import usePollStore, { PollProps, PollStatsDtoProps } from "@/stores/PollStore";
import { isUndefined } from "lodash";

type PollListItemProps = {
  poll: PollProps;
  onClick?: () => void;
};

const PollListItem = ({ poll, onClick }: PollListItemProps) => {
  const pollStore = usePollStore();
  const contract = useContractReady(poll.address, PollContract.abi);
  const wallet = useWalletReady();
  const isExpired = new Date(poll.expiredAt) < new Date();
  const [stats, setStats] = useState<PollStatsDtoProps>();

  const handleClick = async () => {
    pollStore.setStats(stats);
    pollStore.setPoll(poll);
  };

  useEffect(() => {
    const run = async () => {
      if (contract) {
        const stats = await contract?.getStats(
          wallet?.account || ethers.constants.AddressZero
        );
        setStats(stats);
      }
    };

    run();

    return () => {
      contract?.off("PollClosed", () => {}, []).off("Voted", () => {}, []);
    };
  }, [contract, wallet?.account]);

  return (
    <Card
      className="mb-4 cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:gap-4">
          {poll.cover && (
            <img
              src={poll.cover}
              alt={poll.title}
              className="w-full h-48 md:w-32 md:h-24 object-cover rounded-lg mb-4 md:mb-0"
            />
          )}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 md:gap-0">
              <h3 className="text-lg font-bold">{poll.title}</h3>
              {isExpired ? (
                <div className="flex items-center gap-1 text-xs text-red-500">
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
                  {poll.isEnableDonations && (
                    <div className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                      <Wallet className="w-3 h-3" /> ETH
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm my-2">{poll.description}</p>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>{poll.votes} votes</span>
              {poll.isEnableDonations && (
                <>
                  <span>•</span>
                  <span>0 ETH donated</span>
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
