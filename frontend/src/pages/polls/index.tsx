import React, { useEffect, useState } from "react";
import usePollController from "@/controllers/poll_controller";
import PollListItem from "@/components/poll_list_item";
import PollDetail from "@/components/poll_detail";
import usePollStore from "@/stores/PollStore";

const Polls = () => {
  const [showDonateModal, setShowDonateModal] = useState(false);
  // const [donationAmount, setDonationAmount] = useState("");
  const { polls } = usePollController(1);
  const pollStore = usePollStore();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {/* <img
            className="w-1/3"
            src={
              "https://i.ibb.co/RPSGb84/Kakao-Talk-Photo-2024-12-13-18-50-11.png"
            }
          /> */}
          ChainVote.D
        </h1>
        {/* {!.contract && (
          <Button onClick={handleConnectWallet}>Connect Wallet</Button>
        )} */}
        {/* <GoogleLogin /> */}
      </div>

      {pollStore.poll ? (
        <PollDetail onBack={() => pollStore.setPoll(null)} />
      ) : (
        polls &&
        polls.map((poll) => (
          <PollListItem key={poll.id} poll={poll} onClick={null} />
        ))
      )}

      {/* {pollStore.poll.isEnabledDonations && selectedOption && (
      )} */}
    </div>
  );
};

export default Polls;
