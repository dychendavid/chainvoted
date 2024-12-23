import React, { useState } from "react";
import usePollController from "@/controllers/poll_controller";
import PollListItem from "@/components/poll_list_item";
import PollDetail from "@/components/poll_detail";
import usePollStore from "@/stores/PollStore";
import { useWalletReady } from "@/hooks/useWalletReady";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoginButton from "@/components/google_login";
import useUserStore from "@/stores/userStore";

const Polls = () => {
  const userStore = useUserStore();
  const { polls } = usePollController(userStore.userId);
  const pollStore = usePollStore();
  const wallet = useWalletReady();
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");

  const handleConnectWallet = async () => {
    try {
      await wallet.connect();
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code == -32002) {
          setErrorTitle("MetaMask login");
          setError("MetaMask is waiting for your login");
        } else {
          setErrorTitle("MetaMask error");
          setError(e.message);
        }
      }
    }
  };

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
        <Button onClick={handleConnectWallet} disabled={wallet.isConnected}>
          {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
        </Button>
        <LoginButton />
      </div>
      {pollStore.poll ? (
        <PollDetail onBack={() => pollStore.setPoll(null)} />
      ) : (
        polls &&
        polls.map((poll) => (
          <PollListItem key={poll.id} poll={poll} onClick={null} />
        ))
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
    </div>
  );
};

export default Polls;
